import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count, avg } from "drizzle-orm";
import Stripe from "stripe";
import {
  subscriptions,
  customers,
  healthScoreFactors,
  healthScoreHistory,
  playbooks,
  playbookSteps,
  playbookRuns,
  playbookStepRuns,
  customerEvents,
  tasks,
  alerts,
  integrations,
  scoringRules,
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
        healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]).optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "mrr", "healthScore", "name"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }).default({})
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { page, pageSize, healthStatus, search, sortBy, sortOrder } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(customers.userId, ctx.user.id)];
      if (healthStatus) {
        conditions.push(eq(customers.healthStatus, healthStatus));
      }
      if (search) {
        conditions.push(
          sql`(${customers.name} ILIKE ${"%" + search + "%"} OR ${customers.email} ILIKE ${"%" + search + "%"} OR ${customers.companyName} ILIKE ${"%" + search + "%"})`
        );
      }

      const orderCol =
        sortBy === "mrr"
          ? customers.mrr
          : sortBy === "healthScore"
          ? customers.healthScore
          : sortBy === "name"
          ? customers.name
          : customers.createdAt;

      const orderFn = sortOrder === "asc" ? asc(orderCol) : desc(orderCol);

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(customers)
          .where(and(...conditions))
          .orderBy(orderFn)
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: count() })
          .from(customers)
          .where(and(...conditions)),
      ]);

      return {
        customers: rows,
        total: totalResult[0]?.count ?? 0,
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
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      return customer;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        companyName: z.string().max(255).optional(),
        mrr: z.number().min(0).default(0),
        plan: z.string().max(100).optional(),
        externalId: z.string().max(255).optional(),
        notes: z.string().optional(),
        tags: z.string().optional(),
        trialEndsAt: z.date().optional(),
        subscribedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [created] = await db
        .insert(customers)
        .values({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          companyName: input.companyName ?? null,
          mrr: String(input.mrr),
          plan: input.plan ?? null,
          externalId: input.externalId ?? null,
          notes: input.notes ?? null,
          tags: input.tags ?? null,
          trialEndsAt: input.trialEndsAt ?? null,
          subscribedAt: input.subscribedAt ?? null,
          healthStatus: "healthy",
          healthScore: 100,
          churnProbability: "0",
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
        mrr: z.number().min(0).optional(),
        plan: z.string().max(100).optional(),
        notes: z.string().optional(),
        tags: z.string().optional(),
        healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]).optional(),
        healthScore: z.number().int().min(0).max(100).optional(),
        churnProbability: z.number().min(0).max(1).optional(),
        lastActiveAt: z.date().optional(),
        churnedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, mrr, churnProbability, ...rest } = input;
      const [existing] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, id), eq(customers.userId, ctx.user.id)))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
      if (mrr !== undefined) updateData.mrr = String(mrr);
      if (churnProbability !== undefined) updateData.churnProbability = String(churnProbability);

      const [updated] = await db
        .update(customers)
        .set(updateData)
        .where(and(eq(customers.id, id), eq(customers.userId, ctx.user.id)))
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
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      await db
        .delete(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));
      return { success: true };
    }),

  getHealthHistory: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        days: z.number().int().positive().max(365).default(30),
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
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      return db
        .select()
        .from(healthScoreHistory)
        .where(
          and(
            eq(healthScoreHistory.customerId, input.customerId),
            eq(healthScoreHistory.userId, ctx.user.id),
            gte(healthScoreHistory.snapshotAt, since)
          )
        )
        .orderBy(asc(healthScoreHistory.snapshotAt));
    }),

  getHealthFactors: protectedProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      return db
        .select()
        .from(healthScoreFactors)
        .where(
          and(
            eq(healthScoreFactors.customerId, input.customerId),
            eq(healthScoreFactors.userId, ctx.user.id)
          )
        )
        .orderBy(desc(healthScoreFactors.scoredAt));
    }),

  recalculateHealthScore: protectedProcedure
    .input(z.object({ customerId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .limit(1);
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const factors = await db
        .select()
        .from(healthScoreFactors)
        .where(
          and(
            eq(healthScoreFactors.customerId, input.customerId),
            eq(healthScoreFactors.userId, ctx.user.id)
          )
        );

      let newScore = 100;
      if (factors.length > 0) {
        let totalWeight = 0;
        let weightedSum = 0;
        for (const f of factors) {
          const value = parseFloat(String(f.value));
          const weight = parseFloat(String(f.weight));
          weightedSum += value * weight;
          totalWeight += weight;
        }
        newScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;
        newScore = Math.max(0, Math.min(100, newScore));
      }

      const churnProb = newScore < 30 ? 0.8 : newScore < 50 ? 0.5 : newScore < 70 ? 0.2 : 0.05;
      const healthStatus =
        newScore >= 80 ? "healthy" : newScore >= 60 ? "at_risk" : newScore >= 40 ? "critical" : "churned";

      const [updated] = await db
        .update(customers)
        .set({
          healthScore: newScore,
          churnProbability: String(churnProb),
          healthStatus,
          updatedAt: new Date(),
        })
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)))
        .returning();

      await db.insert(healthScoreHistory).values({
        userId: ctx.user.id,
        customerId: input.customerId,
        healthScore: newScore,
        healthStatus,
        churnProbability: String(churnProb),
        snapshotAt: new Date(),
      });

      return updated;
    }),

  upsertHealthFactor: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        factorType: z.enum([
          "product_usage",
          "support_tickets",
          "payment_history",
          "engagement",
          "nps",
          "feature_adoption",
          "login_frequency",
          "custom",
        ]),
        factorName: z.string().min(1).max(255),
        value: z.number().min(0).max(100),
        weight: z.number().min(0).max(10).default(1),
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
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const [inserted] = await db
        .insert(healthScoreFactors)
        .values({
          userId: ctx.user.id,
          customerId: input.customerId,
          factorType: input.factorType,
          factorName: input.factorName,
          value: String(input.value),
          weight: String(input.weight),
          scoredAt: new Date(),
        })
        .returning();

      return inserted;
    }),

  trackEvent: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        eventType: z.enum([
          "login",
          "feature_used",
          "support_ticket_opened",
          "support_ticket_resolved",
          "payment_succeeded",
          "payment_failed",
          "nps_submitted",
          "onboarding_completed",
          "integration_connected",
          "export_performed",
          "custom",
        ]),
        eventName: z.string().min(1).max(255),
        properties: z.record(z.unknown()).optional(),
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
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const [event] = await db
        .insert(customerEvents)
        .values({
          userId: ctx.user.id,
          customerId: input.customerId,
          eventType: input.eventType,
          eventName: input.eventName,
          properties: input.properties ? JSON.stringify(input.properties) : null,
          occurredAt: input.occurredAt ?? new Date(),
        })
        .returning();

      await db
        .update(customers)
        .set({ lastActiveAt: input.occurredAt ?? new Date(), updatedAt: new Date() })
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)));

      return event;
    }),

  getEvents: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        eventType: z
          .enum([
            "login",
            "feature_used",
            "support_ticket_opened",
            "support_ticket_resolved",
            "payment_succeeded",
            "payment_failed",
            "nps_submitted",
            "onboarding_completed",
            "integration_connected",
            "export_performed",
            "custom",
          ])
          .optional(),
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
      if (!customer) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });

      const { page, pageSize, eventType } = input;
      const offset = (page - 1) * pageSize;
      const conditions = [
        eq(customerEvents.customerId, input.customerId),
        eq(customerEvents.userId, ctx.user.id),
      ];
      if (eventType) conditions.push(eq(customerEvents.eventType, eventType));

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(customerEvents)
          .where(and(...conditions))
          .orderBy(desc(customerEvents.occurredAt))
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: count() })
          .from(customerEvents)
          .where(and(...conditions)),
      ]);

      return { events: rows, total: totalResult[0]?.count ?? 0, page, pageSize };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [totalResult, healthyResult, atRiskResult, criticalResult, churnedResult, mrrResult, avgHealthResult] =
      await Promise.all([
        db.select({ count: count() }).from(customers).where(eq(customers.userId, ctx.user.id)),
        db
          .select({ count: count() })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "healthy"))),
        db
          .select({ count: count() })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "at_risk"))),
        db
          .select({ count: count() })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "critical"))),
        db
          .select({ count: count() })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), eq(customers.healthStatus, "churned"))),
        db
          .select({ total: sql<string>`SUM(${customers.mrr})` })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), sql`${customers.healthStatus} != 'churned'`)),
        db
          .select({ avg: avg(customers.healthScore) })
          .from(customers)
          .where(and(eq(customers.userId, ctx.user.id), sql`${customers.healthStatus} != 'churned'`)),
      ]);

    return {
      total: totalResult[0]?.count ?? 0,
      healthy: healthyResult[0]?.count ?? 0,
      atRisk: atRiskResult[0]?.count ?? 0,
      critical: criticalResult[0]?.count ?? 0,
      churned: churnedResult[0]?.count ?? 0,
      totalMrr: parseFloat(mrrResult[0]?.total ?? "0"),
      averageHealthScore: parseFloat(String(avgHealthResult[0]?.avg ?? "0")),
    };
  }),
});

// ─── Feature Router (alias for customer — required by dashboard) ──────────────
const featureRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]).optional(),
        search: z.string().optional(),
      }).default({})
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { page, pageSize, healthStatus, search } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(customers.userId, ctx.user.id)];
      if (healthStatus) conditions.push(eq(customers.healthStatus, healthStatus));
      if (search) {
        conditions.push(
          sql`(${customers.name} ILIKE ${"%" + search + "%"} OR ${customers.email} ILIKE ${"%" + search + "%"})`
        );
      }

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(customers)
          .where(and(...conditions))
          .orderBy(desc(customers.createdAt))
          .limit(pageSize)
          .offset(offset),
        db.select({ count: count() }).from(customers).where(and(...conditions)),
      ]);

      return { customers: rows, total: totalResult[0]?.count ?? 0, page, pageSize };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        companyName: z.string().max(255).optional(),
        mrr: z.number().min(0).default(0),
        plan: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [created] = await db
        .insert(customers)
        .values({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          companyName: input.companyName ?? null,
          mrr: String(input.mrr),
          plan: input.plan ?? null,
          healthStatus: "healthy",
          healthScore: 100,
          churnProbability: "0",
        })
        .returning();
      return created;
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
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      await db
        .delete(customers)
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));
      return { success: true };
    }),
});

// ─── Playbooks Router ─────────────────────────────────────────────────────────
const playbooksRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "archived", "draft"]).optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
      }).default({})
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { page, pageSize, status } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(playbooks.userId, ctx.user.id)];
      if (status) conditions.push(eq(playbooks.status, status));

      const [rows, totalResult] = await Promise.all([
        db
          .select()
          .from(playbooks)
          .where(and(...conditions))
          .orderBy(desc(playbooks.createdAt))
          .limit(pageSize)
          .offset(offset),
        db.select({ count: count() }).from(playbooks).where(and(...conditions)),
      ]);

      return { playbooks: rows, total: totalResult[0]?.count ?? 0, page, pageSize };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [playbook] = await db
        .select()
        .from(playbooks)
        .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)))
        .limit(1);
      if (!playbook) throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });

      const steps = await db
        .select()
        .from(playbookSteps)
        .where(and(eq(playbookSteps.playbookId, input.id), eq(playbookSteps.userId, ctx.user.id)))
        .orderBy(asc(playbookSteps.stepOrder));

      return { ...playbook, steps };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        triggerType: z.enum([
          "health_score_drops_below",
          "health_score_rises_above",
          "churn_probability_exceeds",
          "no_login_for_days",
          "mrr_drops",
          "trial_ending_soon",
          "manual",
          "custom_event",
        ]),
        triggerThreshold: z.number().optional(),
        status: z.enum(["active", "paused", "archived", "draft"]).default("draft"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [created] = await db
        .insert(playbooks)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description ?? null,
          triggerType: input.triggerType,
          triggerThreshold: input.triggerThreshold !== undefined ? String(input.triggerThreshold) : null,
          status: input.status,
          runCount: 0,
        })
        .returning();
      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.