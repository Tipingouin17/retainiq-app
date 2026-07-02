import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count, avg, isNull, isNotNull, or, ne } from "drizzle-orm";
import Stripe from "stripe";
import {
  subscriptions,
  customers,
  healthScoreConfigs,
  healthScoreHistory,
  customerEvents,
  features,
  customerFeatureUsage,
  playbooks,
  playbookSteps,
  playbookExecutions,
  playbookStepExecutions,
  tasks,
  alerts,
} from "../drizzle/schema";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
    };
  }),
  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),
});

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
        churnRiskLevel: z.enum(["low", "medium", "high", "very_high"]).optional(),
        search: z.string().optional(),
        sortBy: z.enum(["createdAt", "healthScore", "mrr", "lastActivityAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { page, pageSize, healthStatus, churnRiskLevel, search } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(customers.userId, ctx.user.id), eq(customers.isActive, true)];

      if (healthStatus) {
        conditions.push(eq(customers.healthStatus, healthStatus));
      }
      if (churnRiskLevel) {
        conditions.push(eq(customers.churnRiskLevel, churnRiskLevel));
      }

      const sortColumn =
        input.sortBy === "healthScore"
          ? customers.healthScore
          : input.sortBy === "mrr"
          ? customers.mrr
          : input.sortBy === "lastActivityAt"
          ? customers.lastActivityAt
          : customers.createdAt;

      const orderFn = input.sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      const [rows, totalRows] = await Promise.all([
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

      const filteredRows = search
        ? rows.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.email.toLowerCase().includes(search.toLowerCase()) ||
              (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()))
          )
        : rows;

      return {
        customers: filteredRows,
        total: totalRows[0]?.count ?? 0,
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
        domain: z.string().max(255).optional(),
        mrr: z.number().min(0).default(0),
        planName: z.string().max(255).optional(),
        contractStartDate: z.date().optional(),
        contractEndDate: z.date().optional(),
        renewalDate: z.date().optional(),
        npsScore: z.number().int().min(0).max(10).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
        externalId: z.string().max(255).optional(),
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
        throw new TRPCError({ code: "CONFLICT", message: "Customer with this email already exists" });
      }

      const [newCustomer] = await db
        .insert(customers)
        .values({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          companyName: input.companyName,
          domain: input.domain,
          mrr: String(input.mrr),
          planName: input.planName,
          contractStartDate: input.contractStartDate,
          contractEndDate: input.contractEndDate,
          renewalDate: input.renewalDate,
          npsScore: input.npsScore,
          tags: input.tags,
          notes: input.notes,
          externalId: input.externalId,
          healthStatus: "healthy",
          healthScore: 100,
          churnRiskLevel: "low",
          churnRiskScore: "0",
          isActive: true,
        })
        .returning();

      return newCustomer;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional(),
        companyName: z.string().max(255).optional(),
        domain: z.string().max(255).optional(),
        mrr: z.number().min(0).optional(),
        planName: z.string().max(255).optional(),
        contractStartDate: z.date().optional(),
        contractEndDate: z.date().optional(),
        renewalDate: z.date().optional(),
        npsScore: z.number().int().min(0).max(10).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
        externalId: z.string().max(255).optional(),
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
      if (input.domain !== undefined) updateData.domain = input.domain;
      if (input.mrr !== undefined) updateData.mrr = String(input.mrr);
      if (input.planName !== undefined) updateData.planName = input.planName;
      if (input.contractStartDate !== undefined) updateData.contractStartDate = input.contractStartDate;
      if (input.contractEndDate !== undefined) updateData.contractEndDate = input.contractEndDate;
      if (input.renewalDate !== undefined) updateData.renewalDate = input.renewalDate;
      if (input.npsScore !== undefined) updateData.npsScore = input.npsScore;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.externalId !== undefined) updateData.externalId = input.externalId;

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
        .update(customers)
        .set({ isActive: false, updatedAt: new Date() })
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

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const history = await db
        .select()
        .from(healthScoreHistory)
        .where(
          and(
            eq(healthScoreHistory.customerId, input.customerId),
            eq(healthScoreHistory.userId, ctx.user.id),
            gte(healthScoreHistory.scoredAt, since)
          )
        )
        .orderBy(asc(healthScoreHistory.scoredAt));

      return history;
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

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [config] = await db
        .select()
        .from(healthScoreConfigs)
        .where(and(eq(healthScoreConfigs.userId, ctx.user.id), eq(healthScoreConfigs.isDefault, true)))
        .limit(1);

      const weights = config ?? {
        loginFrequencyWeight: 25,
        featureAdoptionWeight: 25,
        supportTicketWeight: 20,
        npsWeight: 15,
        paymentHealthWeight: 15,
        loginFrequencyThresholdDays: 7,
        featureAdoptionMinFeatures: 3,
        supportTicketThreshold: 3,
      };

      const now = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - weights.loginFrequencyThresholdDays);

      const recentEvents = await db
        .select()
        .from(customerEvents)
        .where(
          and(
            eq(customerEvents.customerId, input.customerId),
            eq(customerEvents.userId, ctx.user.id),
            gte(customerEvents.occurredAt, thresholdDate)
          )
        );

      const loginEvents = recentEvents.filter((e) => e.eventType === "login");
      const supportEvents = recentEvents.filter((e) => e.eventType === "support_ticket");

      const featureUsageRows = await db
        .select()
        .from(customerFeatureUsage)
        .where(
          and(
            eq(customerFeatureUsage.customerId, input.customerId),
            eq(customerFeatureUsage.userId, ctx.user.id)
          )
        );

      const adoptedFeatures = featureUsageRows.filter((f) => f.usageCount > 0).length;

      const loginScore =
        loginEvents.length > 0
          ? Math.min(100, (loginEvents.length / weights.loginFrequencyThresholdDays) * 7 * 100)
          : 0;

      const featureScore =
        adoptedFeatures >= weights.featureAdoptionMinFeatures
          ? 100
          : (adoptedFeatures / Math.max(1, weights.featureAdoptionMinFeatures)) * 100;

      const supportScore =
        supportEvents.length === 0
          ? 100
          : supportEvents.length <= weights.supportTicketThreshold
          ? Math.max(0, 100 - supportEvents.length * 20)
          : 0;

      const npsScore = customer.npsScore !== null ? (customer.npsScore / 10) * 100 : 70;

      const paymentHealthScore = 100;

      const totalScore = Math.round(
        (loginScore * weights.loginFrequencyWeight +
          featureScore * weights.featureAdoptionWeight +
          supportScore * weights.supportTicketWeight +
          npsScore * weights.npsWeight +
          paymentHealthScore * weights.paymentHealthWeight) /
          100
      );

      const clampedScore = Math.max(0, Math.min(100, totalScore));

      let healthStatus: "healthy" | "at_risk" | "critical" | "churned" = "healthy";
      let churnRiskLevel: "low" | "medium" | "high" | "very_high" = "low";

      if (clampedScore >= 75) {
        healthStatus = "healthy";
        churnRiskLevel = "low";
      } else if (clampedScore >= 50) {
        healthStatus = "at_risk";
        churnRiskLevel = "medium";
      } else if (clampedScore >= 25) {
        healthStatus = "critical";
        churnRiskLevel = "high";
      } else {
        healthStatus = "critical";
        churnRiskLevel = "very_high";
      }

      const churnRiskScore = ((100 - clampedScore) / 100) * 100;

      await db
        .update(customers)
        .set({
          healthScore: clampedScore,
          healthStatus,
          churnRiskLevel,
          churnRiskScore: String(churnRiskScore.toFixed(2)),
          updatedAt: new Date(),
        })
        .where(and(eq(customers.id, input.customerId), eq(customers.userId, ctx.user.id)));

      await db.insert(healthScoreHistory).values({
        customerId: input.customerId,
        userId: ctx.user.id,
        score: clampedScore,
        healthStatus,
        churnRiskScore: String(churnRiskScore.toFixed(2)),
        loginFrequencyScore: Math.round(loginScore),
        featureAdoptionScore: Math.round(featureScore),
        supportTicketScore: Math.round(supportScore),
        npsScore: Math.round(npsScore),
        paymentHealthScore: Math.round(paymentHealthScore),
        scoredAt: now,
      });

      return {
        healthScore: clampedScore,
        healthStatus,
        churnRiskLevel,
        churnRiskScore,
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allCustomers = await db
      .select()
      .from(customers)
      .where(and(eq(customers.userId, ctx.user.id), eq(customers.isActive, true)));

    const total = allCustomers.length;
    const healthy = allCustomers.filter((c) => c.healthStatus === "healthy").length;
    const atRisk = allCustomers.filter((c) => c.healthStatus === "at_risk").length;
    const critical = allCustomers.filter((c) => c.healthStatus === "critical").length;
    const churned = allCustomers.filter((c) => c.healthStatus === "churned").length;

    const totalMrr = allCustomers.reduce((sum, c) => sum + parseFloat(String(c.mrr ?? "0")), 0);
    const avgHealthScore =
      total > 0 ? Math.round(allCustomers.reduce((sum, c) => sum + c.healthScore, 0) / total) : 0;

    const highRisk = allCustomers.filter(
      (c) => c.churnRiskLevel === "high" || c.churnRiskLevel === "very_high"
    ).length;

    const mrrAtRisk = allCustomers
      .filter((c) => c.churnRiskLevel === "high" || c.churnRiskLevel === "very_high")
      .reduce((sum, c) => sum + parseFloat(String(c.mrr ?? "0")), 0);

    return {
      total,
      healthy,
      atRisk,
      critical,
      churned,
      totalMrr,
      avgHealthScore,
      highRisk,
      mrrAtRisk,
    };
  }),
});

// ─── Feature Router (main entity for Dashboard compatibility) ─────────────────
const featureRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .select()
      .from(customers)
      .where(and(eq(customers.userId, ctx.user.id), eq(customers.isActive, true)))
      .orderBy(desc(customers.createdAt))
      .limit(50);

    return rows;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        companyName: z.string().max(255).optional(),
        mrr: z.number().min(0).default(0),
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
        throw new TRPCError({ code: "CONFLICT", message: "Customer with this email already exists" });
      }

      const [newCustomer] = await db
        .insert(customers)
        .values({
          userId: ctx.user.id,
          name: input.name,
          email: input.email,
          companyName: input.companyName,
          mrr: String(input.mrr),
          healthStatus: "healthy",
          healthScore: 100,
          churnRiskLevel: "low",
          churnRiskScore: "0",
          isActive: true,
        })
        .returning();

      return newCustomer;
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
        .update(customers)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));

      return { success: true };
    }),
});

// ─── Health Score Config Router ───────────────────────────────────────────────
const healthScoreConfigRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db
      .select()
      .from(healthScoreConfigs)
      .where(eq(healthScoreConfigs.userId, ctx.user.id))
      .orderBy(desc(healthScoreConfigs.createdAt));
  }),

  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [config] = await db
      .select()
      .from(healthScoreConfigs)
      .where(and(eq(healthScoreConfigs.userId, ctx.user.id), eq(healthScoreConfigs.isDefault, true)))
      .limit(1);

    return config ?? null;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        isDefault: z.boolean().default(false),
        loginFrequencyWeight: z.number().int().min(0).max(100).default(25),
        featureAdoptionWeight: z.number().int().min(0).max(100).default(25),
        supportTicketWeight: z.number().int().min(0).max(100).default(20),
        npsWeight: z.number().int().min(0).max(100).default(15),
        paymentHealthWeight: z.number().int().min(0).max(100).default(15),
        loginFrequencyThresholdDays: z.number().int().positive().default(7),
        featureAdoptionMinFeatures: z.number().int().positive().default(3),
        supportTicketThreshold: z.number().int().positive().default(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const totalWeight =
        input.loginFrequencyWeight +
        input.featureAdoptionWeight +
        input.supportTicketWeight +
        input.npsWeight +
        input.paymentHealthWeight;

      if (totalWeight !== 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Weights must sum to 100, got ${totalWeight}`,
        });
      }

      if (input.isDefault) {
        await db
          .update(healthScoreConfigs)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(eq(healthScoreConfigs.userId, ctx.user.id), eq(healthScoreConfigs.isDefault, true)));
      }

      const [config] = await db
        .insert(healthScoreConfigs)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();

      return config;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        isDefault: z.boolean().optional(),
        loginFrequencyWeight: z.number().int().min(0).max(100).optional(),
        featureAdoptionWeight: z.number().int().min(0).max(100).optional(),
        supportTicketWeight: z.number().int().min(0).max(100).optional(),
        npsWeight: z.number().int().min(0).max(100).optional(),
        paymentHealthWeight: z.number().int().min(0).max(100).optional(),
        loginFrequencyThresholdDays: z.number().int().positive().optional(),
        featureAdoptionMinFeatures: z.number().int().positive().optional(),
        supportTicketThreshold: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(healthScoreConfigs)
        .where(and(eq(healthScoreConfigs.id, input.id), eq(healthScoreConfigs.userId, ctx.user.id)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Health score config not found" });
      }

      if (input.isDefault) {
        await db
          .update(healthScoreConfigs)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(healthScoreConfigs.userId, ctx.user.id),
              eq(healthScoreConfigs.isDefault, true),
              ne(healthScoreConfigs.id, input.id)
            )
          );
      }

      const { id, ...updateFields } = input;

      const [updated] = await db
        .update(healthScoreConfigs)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(and(eq(healthScoreConfigs.id, input.id), eq(healthScoreConfigs.userId, ctx.user.id)))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] =