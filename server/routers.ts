import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc, gte, lte, sql, like, or, inArray } from "drizzle-orm";
import Stripe from "stripe";
import {
  customers,
  customerHealthScores,
  customerEvents,
  churnPredictions,
  playbooks,
  playbookSteps,
  playbookRuns,
  playbookStepExecutions,
  customerSegments,
  customerSegmentMemberships,
  alerts,
  alertRules,
  subscriptions,
} from "../drizzle/schema";

// ─── Stripe Payments Router ───────────────────────────────────────────────────
const paymentsRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const appUrl = process.env.VITE_APP_URL || "https://example.aibce.io";
      const session = await stripe.checkout.sessions.create({
        customer_email: ctx.user.email ?? undefined,
        line_items: [{ price: input.priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${appUrl}/dashboard?checkout=success`,
        cancel_url: `${appUrl}/pricing?checkout=cancelled`,
        metadata: { userId: String(ctx.user.id) },
      });
      return { url: session.url };
    }),
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? null;
  }),
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const appUrl = process.env.VITE_APP_URL || "https://example.aibce.io";
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    if (!sub[0]?.stripeCustomerId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No active subscription found" });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub[0].stripeCustomerId,
      return_url: `${appUrl}/dashboard`,
    });
    return { url: portalSession.url };
  }),
});

// ─── Customer Router ──────────────────────────────────────────────────────────
const customerRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        search: z.string().optional(),
        healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]).optional(),
        churnRisk: z.enum(["low", "medium", "high", "critical"]).optional(),
        isChurned: z.boolean().optional(),
        sortBy: z.enum(["createdAt", "name", "mrr", "healthScore", "lastActiveAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(customers.userId, ctx.user.id)];

      if (input?.search) {
        conditions.push(
          or(
            like(customers.name, `%${input.search}%`),
            like(customers.email, `%${input.search}%`),
            like(customers.companyName, `%${input.search}%`)
          ) as any
        );
      }

      if (input?.healthStatus) {
        conditions.push(eq(customers.healthStatus, input.healthStatus));
      }

      if (input?.churnRisk) {
        conditions.push(eq(customers.churnRisk, input.churnRisk));
      }

      if (input?.isChurned !== undefined) {
        conditions.push(eq(customers.isChurned, input.isChurned));
      }

      const sortColumn = input?.sortBy ?? "createdAt";
      const sortOrder = input?.sortOrder ?? "desc";

      const columnMap: Record<string, any> = {
        createdAt: customers.createdAt,
        name: customers.name,
        mrr: customers.mrr,
        healthScore: customers.healthScore,
        lastActiveAt: customers.lastActiveAt,
      };

      const orderFn = sortOrder === "asc" ? asc : desc;

      const [rows, countResult] = await Promise.all([
        db
          .select()
          .from(customers)
          .where(and(...conditions))
          .orderBy(orderFn(columnMap[sortColumn]))
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(customers)
          .where(and(...conditions)),
      ]);

      return {
        customers: rows,
        total: Number(countResult[0]?.count ?? 0),
        page,
        pageSize,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      return customer;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        companyName: z.string().max(255).optional(),
        companyDomain: z.string().max(255).optional(),
        mrr: z.number().min(0).optional(),
        planName: z.string().max(255).optional(),
        externalId: z.string().max(255).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        subscribedAt: z.date().optional(),
        trialStartedAt: z.date().optional(),
        trialEndedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.email, input.email), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A customer with this email already exists" });
      }

      const [created] = await db
        .insert(customers)
        .values({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          companyName: input.companyName,
          companyDomain: input.companyDomain,
          mrr: input.mrr?.toString() ?? "0",
          planName: input.planName,
          externalId: input.externalId,
          tags: input.tags ?? [],
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          subscribedAt: input.subscribedAt,
          trialStartedAt: input.trialStartedAt,
          trialEndedAt: input.trialEndedAt,
          healthStatus: "healthy",
          healthScore: 100,
          churnRisk: "low",
          churnRiskScore: "0",
          isChurned: false,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional(),
        companyName: z.string().max(255).optional(),
        companyDomain: z.string().max(255).optional(),
        mrr: z.number().min(0).optional(),
        planName: z.string().max(255).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        lastActiveAt: z.date().optional(),
        subscribedAt: z.date().optional(),
        trialStartedAt: z.date().optional(),
        trialEndedAt: z.date().optional(),
        avatarUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const updateData: Partial<typeof customers.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.companyName !== undefined) updateData.companyName = input.companyName;
      if (input.companyDomain !== undefined) updateData.companyDomain = input.companyDomain;
      if (input.mrr !== undefined) updateData.mrr = input.mrr.toString();
      if (input.planName !== undefined) updateData.planName = input.planName;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.metadata !== undefined) updateData.metadata = JSON.stringify(input.metadata);
      if (input.lastActiveAt !== undefined) updateData.lastActiveAt = input.lastActiveAt;
      if (input.subscribedAt !== undefined) updateData.subscribedAt = input.subscribedAt;
      if (input.trialStartedAt !== undefined) updateData.trialStartedAt = input.trialStartedAt;
      if (input.trialEndedAt !== undefined) updateData.trialEndedAt = input.trialEndedAt;
      if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;

      const [updated] = await db
        .update(customers)
        .set(updateData)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      await db
        .delete(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));

      return { success: true };
    }),

  markChurned: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        churnReason: z.string().optional(),
        churnedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [updated] = await db
        .update(customers)
        .set({
          isChurned: true,
          churnedAt: input.churnedAt ?? new Date(),
          churnReason: input.churnReason ?? null,
          healthStatus: "churned",
          healthScore: 0,
          churnRisk: "critical",
          updatedAt: new Date(),
        })
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
        .returning();

      return updated;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [total, healthy, atRisk, critical, churned, mrrResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(eq(customers.userId, ctx.user.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "healthy"))),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "at_risk"))),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "critical"))),
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(eq(customers.userId, ctx.user.id), eq(customers.isChurned, true))),
      db
        .select({ totalMrr: sql<number>`sum(cast(mrr as numeric))` })
        .from(customers)
        .where(and(eq(customers.userId, ctx.user.id), eq(customers.isChurned, false))),
    ]);

    return {
      total: Number(total[0]?.count ?? 0),
      healthy: Number(healthy[0]?.count ?? 0),
      atRisk: Number(atRisk[0]?.count ?? 0),
      critical: Number(critical[0]?.count ?? 0),
      churned: Number(churned[0]?.count ?? 0),
      totalMrr: Number(mrrResult[0]?.totalMrr ?? 0),
    };
  }),
});

// ─── Health Score Router ──────────────────────────────────────────────────────
const healthScoreRouter = router({
  getForCustomer: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        limit: z.number().int().positive().max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const scores = await db
        .select()
        .from(customerHealthScores)
        .where(
          and(
            eq(customerHealthScores.customerId, input.customerId),
            eq(customerHealthScores.userId, ctx.user.id)
          )
        )
        .orderBy(desc(customerHealthScores.computedAt))
        .limit(input.limit);

      return scores;
    }),

  compute: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        engagementScore: z.number().int().min(0).max(100),
        usageScore: z.number().int().min(0).max(100),
        supportScore: z.number().int().min(0).max(100),
        paymentScore: z.number().int().min(0).max(100),
        npsScore: z.number().int().min(0).max(10).optional(),
        loginFrequency: z.number().int().min(0).optional(),
        featureAdoptionRate: z.number().min(0).max(100).optional(),
        supportTicketsLast30Days: z.number().int().min(0).optional(),
        daysUntilRenewal: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const overallScore = Math.round(
        input.engagementScore * 0.3 +
          input.usageScore * 0.3 +
          input.supportScore * 0.2 +
          input.paymentScore * 0.2
      );

      const [healthScore] = await db
        .insert(customerHealthScores)
        .values({
          customerId: input.customerId,
          userId: ctx.user.id,
          overallScore,
          engagementScore: input.engagementScore,
          usageScore: input.usageScore,
          supportScore: input.supportScore,
          paymentScore: input.paymentScore,
          npsScore: input.npsScore ?? null,
          loginFrequency: input.loginFrequency ?? 0,
          featureAdoptionRate: input.featureAdoptionRate?.toString() ?? "0",
          supportTicketsLast30Days: input.supportTicketsLast30Days ?? 0,
          daysUntilRenewal: input.daysUntilRenewal ?? null,
          scoringVersion: "1.0",
          computedAt: new Date(),
        })
        .returning();

      let healthStatus: "healthy" | "at_risk" | "critical" | "churned" = "healthy";
      if (overallScore >= 70) healthStatus = "healthy";
      else if (overallScore >= 40) healthStatus = "at_risk";
      else healthStatus = "critical";

      await db
        .update(customers)
        .set({
          healthScore: overallScore,
          healthStatus,
          updatedAt: new Date(),
        })
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)));

      return healthScore;
    }),

  getLatest: protectedProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [latest] = await db
        .select()
        .from(customerHealthScores)
        .where(
          and(
            eq(customerHealthScores.customerId, input.customerId),
            eq(customerHealthScores.userId, ctx.user.id)
          )
        )
        .orderBy(desc(customerHealthScores.computedAt))
        .limit(1);

      return latest ?? null;
    }),
});

// ─── Events Router ────────────────────────────────────────────────────────────
const eventsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        eventType: z.string().optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().min(0).default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const conditions = [
        eq(customerEvents.customerId, input.customerId),
        eq(customerEvents.userId, ctx.user.id),
      ];

      if (input.eventType) {
        conditions.push(eq(customerEvents.eventType, input.eventType));
      }

      if (input.startDate) {
        conditions.push(gte(customerEvents.occurredAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(customerEvents.occurredAt, input.endDate));
      }

      const [events, countResult] = await Promise.all([
        db
          .select()
          .from(customerEvents)
          .where(and(...conditions))
          .orderBy(desc(customerEvents.occurredAt))
          .limit(input.limit)
          .offset(input.offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(customerEvents)
          .where(and(...conditions)),
      ]);

      return {
        events,
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  track: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        eventType: z.string().min(1).max(255),
        eventName: z.string().min(1).max(255),
        properties: z.record(z.any()).optional(),
        source: z.string().max(100).optional(),
        sessionId: z.string().max(255).optional(),
        occurredAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [event] = await db
        .insert(customerEvents)
        .values({
          customerId: input.customerId,
          userId: ctx.user.id,
          eventType: input.eventType,
          eventName: input.eventName,
          properties: input.properties ? JSON.stringify(input.properties) : null,
          source: input.source ?? "api",
          sessionId: input.sessionId ?? null,
          occurredAt: input.occurredAt ?? new Date(),
        })
        .returning();

      await db
        .update(customers)
        .set({ lastActiveAt: new Date(), updatedAt: new Date() })
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)));

      return event;
    }),

  getEventTypes: protectedProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const types = await db
        .selectDistinct({ eventType: customerEvents.eventType })
        .from(customerEvents)
        .where(
          and(
            eq(customerEvents.customerId, input.customerId),
            eq(customerEvents.userId, ctx.user.id)
          )
        )
        .orderBy(asc(customerEvents.eventType));

      return types.map((t) => t.eventType);
    }),
});

// ─── Churn Prediction Router ──────────────────────────────────────────────────
const churnRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
        isActioned: z.boolean().optional(),
        limit: z.number().int().positive().max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [eq(churnPredictions.userId, ctx.user.id)];

      if (input?.riskLevel) {
        conditions.push(eq(churnPredictions.riskLevel, input.riskLevel));
      }

      if (input?.isActioned !== undefined) {
        conditions.push(eq(churnPredictions.isActioned, input.isActioned));
      }

      const [predictions, countResult] = await Promise.all([
        db
          .select()
          .from(churnPredictions)
          .where(and(...conditions))
          .orderBy(desc(churnPredictions.createdAt))
          .limit(input?.limit ?? 20)
          .offset(input?.offset ?? 0),
        db
          .select({ count: sql<number>`count(*)` })
          .from(churnPredictions)
          .where(and(...conditions)),
      ]);

      return {
        predictions,
        total: Number(countResult[0]?.count ?? 0),
      };
    }),

  getForCustomer: protectedProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const predictions = await db
        .select()
        .from(churnPredictions)
        .where(
          and(
            eq(churnPredictions.customerId, input.customerId),
            eq(churnPredictions.userId, ctx.user.id)
          )
        )
        .orderBy(desc(churnPredictions.createdAt))
        .limit(10);

      return predictions;
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        riskLevel: z.enum(["low", "medium", "high", "critical"]),
        riskScore: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        predictedChurnDate: z.date().optional(),
        primaryRiskFactor: z.string().max(255).optional(),
        riskFactors: z.array(z.string()).optional(),
        recommendations: z.array(z.string()).optional(),
        modelVersion: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [customer] = await db
        .select()
        .from(customers)
        .where(
          and(
            eq(customers.id, input.customerId),
            eq(customers.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [prediction] = await db
        .insert(churnPredictions)
        .values({
          userId: ctx.user.id,
          customerId: input.customerId,
          riskLevel: input.riskLevel,
          riskScore: String(input.riskScore),
          confidence: String(input.confidence),
          predictedChurnDate: input.predictedChurnDate ?? null,
          primaryRiskFactor: input.primaryRiskFactor ?? null,
          riskFactors: input.riskFactors ? JSON.stringify(input.riskFactors) : null,
          recommendations: input.recommendations ? JSON.stringify(input.recommendations) : null,
          modelVersion: input.modelVersion ?? "1.0",
        })
        .$returningId();

      return { id: prediction.id };
    }),
});

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ?? null),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      ctx.resHeaders.append("Set-Cookie", "session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
      return { ok: true };
    }),
  }),
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
