import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count } from "drizzle-orm";
import Stripe from "stripe";
import {
  subscriptions,
  customers,
  healthScoreConfigs,
  customerHealthSnapshots,
  customerEvents,
  playbooks,
  playbookActions,
  playbookRuns,
  playbookRunActionLogs,
  tasks,
  integrations,
  alerts,
  npsResponses,
  retentionMetrics,
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
        healthStatus: z
          .enum(["healthy", "at_risk", "churned", "new"])
          .optional(),
        search: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "healthScore", "mrr", "name", "lastActiveAt"])
          .default("createdAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { page, pageSize, healthStatus, sortBy, sortDir } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(customers.userId, ctx.user.id)];
      if (healthStatus) {
        conditions.push(eq(customers.healthStatus, healthStatus));
      }

      const orderCol =
        sortBy === "healthScore"
          ? customers.healthScore
          : sortBy === "mrr"
          ? customers.mrr
          : sortBy === "name"
          ? customers.name
          : sortBy === "lastActiveAt"
          ? customers.lastActiveAt
          : customers.createdAt;

      const rows = await db
        .select()
        .from(customers)
        .where(and(...conditions))
        .orderBy(sortDir === "asc" ? asc(orderCol) : desc(orderCol))
        .limit(pageSize)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(customers)
        .where(and(...conditions));

      return {
        customers: rows,
        total: Number(total),
        page,
        pageSize,
      };
    }),

  get: protectedProcedure
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
        mrr: z.number().min(0).default(0),
        plan: z.string().max(255).optional(),
        externalId: z.string().max(255).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
        signedUpAt: z.date().optional(),
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
        throw new TRPCError({
          code: "CONFLICT",
          message: "A customer with this email already exists",
        });
      }

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
          tags: input.tags ?? null,
          notes: input.notes ?? null,
          signedUpAt: input.signedUpAt ?? new Date(),
          healthStatus: "new",
          healthScore: 50,
          churnRisk: "0",
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
        plan: z.string().max(255).optional(),
        healthStatus: z.enum(["healthy", "at_risk", "churned", "new"]).optional(),
        healthScore: z.number().int().min(0).max(100).optional(),
        churnRisk: z.number().min(0).max(1).optional(),
        tags: z.string().optional(),
        notes: z.string().optional(),
        lastActiveAt: z.date().optional(),
        churndAt: z.date().optional(),
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
      if (input.mrr !== undefined) updateData.mrr = String(input.mrr);
      if (input.plan !== undefined) updateData.plan = input.plan;
      if (input.healthStatus !== undefined) updateData.healthStatus = input.healthStatus;
      if (input.healthScore !== undefined) updateData.healthScore = input.healthScore;
      if (input.churnRisk !== undefined) updateData.churnRisk = String(input.churnRisk);
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.lastActiveAt !== undefined) updateData.lastActiveAt = input.lastActiveAt;
      if (input.churndAt !== undefined) updateData.churndAt = input.churndAt;

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

  getHealthHistory: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        limit: z.number().int().positive().max(90).default(30),
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

      const snapshots = await db
        .select()
        .from(customerHealthSnapshots)
        .where(
          and(
            eq(customerHealthSnapshots.customerId, input.customerId),
            eq(customerHealthSnapshots.userId, ctx.user.id)
          )
        )
        .orderBy(desc(customerHealthSnapshots.snapshotAt))
        .limit(input.limit);

      return snapshots;
    }),

  getEvents: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
        eventType: z.string().optional(),
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

      const offset = (input.page - 1) * input.pageSize;
      const events = await db
        .select()
        .from(customerEvents)
        .where(and(...conditions))
        .orderBy(desc(customerEvents.occurredAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(customerEvents)
        .where(and(...conditions));

      return { events, total: Number(total), page: input.page, pageSize: input.pageSize };
    }),

  trackEvent: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        eventType: z.string().min(1).max(255),
        eventSource: z.string().max(255).optional(),
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
      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
      }

      const [event] = await db
        .insert(customerEvents)
        .values({
          customerId: input.customerId,
          userId: ctx.user.id,
          eventType: input.eventType,
          eventSource: input.eventSource ?? null,
          properties: input.properties ? JSON.stringify(input.properties) : null,
          occurredAt: input.occurredAt ?? new Date(),
        })
        .returning();

      await db
        .update(customers)
        .set({ lastActiveAt: input.occurredAt ?? new Date(), updatedAt: new Date() })
        .where(eq(customers.id, input.customerId));

      return event;
    }),

  recalculateHealth: protectedProcedure
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

      const configs = await db
        .select()
        .from(healthScoreConfigs)
        .where(
          and(
            eq(healthScoreConfigs.userId, ctx.user.id),
            eq(healthScoreConfigs.isActive, true)
          )
        );

      const recentEvents = await db
        .select()
        .from(customerEvents)
        .where(
          and(
            eq(customerEvents.customerId, input.customerId),
            gte(customerEvents.occurredAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        );

      const npsRows = await db
        .select()
        .from(npsResponses)
        .where(eq(npsResponses.customerId, input.customerId))
        .orderBy(desc(npsResponses.respondedAt))
        .limit(1);

      let scoreBreakdown: Record<string, number> = {};
      let totalWeight = 0;
      let weightedScore = 0;

      const daysSinceActive = customer.lastActiveAt
        ? Math.floor((Date.now() - customer.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (configs.length === 0) {
        const loginScore = Math.max(0, 100 - daysSinceActive * 3);
        const eventScore = Math.min(100, recentEvents.length * 5);
        const npsScore =
          npsRows.length > 0 ? Math.round((npsRows[0].score / 10) * 100) : 50;
        weightedScore = loginScore * 0.4 + eventScore * 0.3 + npsScore * 0.3;
        scoreBreakdown = { login_frequency: loginScore, product_usage: eventScore, nps_score: npsScore };
        totalWeight = 1;
      } else {
        for (const config of configs) {
          let factorScore = 50;
          const weight = config.weight;
          const good = config.thresholdGood ? Number(config.thresholdGood) : null;
          const bad = config.thresholdBad ? Number(config.thresholdBad) : null;

          if (config.factorType === "login_frequency") {
            factorScore = Math.max(0, 100 - daysSinceActive * 3);
            if (good !== null && daysSinceActive <= good) factorScore = 100;
            if (bad !== null && daysSinceActive >= bad) factorScore = 0;
          } else if (config.factorType === "product_usage" || config.factorType === "api_calls") {
            factorScore = Math.min(100, recentEvents.length * 5);
            if (good !== null && recentEvents.length >= good) factorScore = 100;
            if (bad !== null && recentEvents.length <= bad) factorScore = Math.min(factorScore, 20);
          } else if (config.factorType === "nps_score") {
            factorScore =
              npsRows.length > 0 ? Math.round((npsRows[0].score / 10) * 100) : 50;
          } else if (config.factorType === "payment_history") {
            factorScore = customer.churndAt ? 0 : 80;
          } else {
            factorScore = 50;
          }

          scoreBreakdown[config.factorType] = factorScore;
          weightedScore += factorScore * weight;
          totalWeight += weight;
        }
      }

      const finalScore =
        totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
      const churnRisk = parseFloat(((100 - finalScore) / 100).toFixed(4));
      const healthStatus =
        finalScore >= 70
          ? "healthy"
          : finalScore >= 40
          ? "at_risk"
          : customer.churndAt
          ? "churned"
          : "at_risk";

      const [updatedCustomer] = await db
        .update(customers)
        .set({
          healthScore: finalScore,
          churnRisk: String(churnRisk),
          healthStatus,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, input.customerId))
        .returning();

      await db.insert(customerHealthSnapshots).values({
        customerId: input.customerId,
        userId: ctx.user.id,
        healthScore: finalScore,
        churnRisk: String(churnRisk),
        healthStatus,
        scoreBreakdown: JSON.stringify(scoreBreakdown),
        snapshotAt: new Date(),
      });

      return updatedCustomer;
    }),
});

// ─── Health Score Config Router ───────────────────────────────────────────────
const healthScoreRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db
      .select()
      .from(healthScoreConfigs)
      .where(eq(healthScoreConfigs.userId, ctx.user.id))
      .orderBy(asc(healthScoreConfigs.factorType));
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive().optional(),
        factorType: z.enum([
          "product_usage",
          "support_tickets",
          "nps_score",
          "payment_history",
          "feature_adoption",
          "login_frequency",
          "api_calls",
          "custom",
        ]),
        label: z.string().min(1).max(255),
        weight: z.number().int().min(1).max(100),
        isActive: z.boolean().default(true),
        thresholdGood: z.number().optional(),
        thresholdBad: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (input.id) {
        const [existing] = await db
          .select()
          .from(healthScoreConfigs)
          .where(
            and(
              eq(healthScoreConfigs.id, input.id),
              eq(healthScoreConfigs.userId, ctx.user.id)
            )
          )
          .limit(1);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Config not found" });
        }

        const [updated] = await db
          .update(healthScoreConfigs)
          .set({
            factorType: input.factorType,
            label: input.label,
            weight: input.weight,
            isActive: input.isActive,
            thresholdGood: input.thresholdGood !== undefined ? String(input.thresholdGood) : null,
            thresholdBad: input.thresholdBad !== undefined ? String(input.thresholdBad) : null,
            updatedAt: new Date(),
          })
          .where(eq(healthScoreConfigs.id, input.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(healthScoreConfigs)
        .values({
          userId: ctx.user.id,
          factorType: input.factorType,
          label: input.label,
          weight: input.weight,
          isActive: input.isActive,
          thresholdGood: input.thresholdGood !== undefined ? String(input.thresholdGood) : null,
          thresholdBad: input.thresholdBad !== undefined ? String(input.thresholdBad) : null,
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
        .from(healthScoreConfigs)
        .where(
          and(
            eq(healthScoreConfigs.id, input.id),
            eq(healthScoreConfigs.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Config not found" });
      }

      await db
        .delete(healthScoreConfigs)
        .where(
          and(
            eq(healthScoreConfigs.id, input.id),
            eq(healthScoreConfigs.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),
});

// ─── Playbook Router ──────────────────────────────────────────────────────────
const playbookRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "inactive", "draft"]).optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const conditions = [eq(playbooks.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(playbooks.status, input.status));
      }

      const offset = (input.page - 1) * input.pageSize;
      const rows = await db
        .select()
        .from(playbooks)
        .where(and(...conditions))
        .orderBy(desc(playbooks.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(playbooks)
        .where(and(...conditions));

      return { playbooks: rows, total: Number(total), page: input.page, pageSize: input.pageSize };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [playbook] = await db
        .select()
        .from(playbooks)
        .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)))
        .limit(1);
      if (!playbook) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
      }

      const actions = await db
        .select()
        .from(playbookActions)
        .where(eq(playbookActions.playbookId, input.id))
        .orderBy(asc(playbookActions.actionOrder));

      return { ...playbook, actions };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        triggerType: z.enum([
          "health_score_drops_below",
          "health_score_rises_above",
          "churn_risk_exceeds",
          "no_login_days",
          "mrr_change",
          "manual",
          "customer_created",
          "event_occurred",
        ]),
        triggerValue: z.number().optional(),
        triggerEventType: z.string().max(255).optional(),
        status: z.enum(["active", "inactive", "draft"]).default("draft"),
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
          triggerValue: input.triggerValue !== undefined ? String(input.triggerValue) : null,
          triggerEventType: input.triggerEventType ?? null,
          status: input.status,
        })
        .returning();

      return created;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        triggerType: z
          .enum([
            "health_score_drops_below",
            "health_score_rises_above",
            "churn_risk_exceeds",
            "no_login_days",
            "mrr_change",
            "manual",
            "customer_created",
            "event_occurred",
          ])
          .optional(),
        triggerValue: z.number().optional(),
        triggerEventType: z.string().max(255).optional(),
        status: z.enum(["active", "inactive", "draft"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select()
        .from(playbooks)
        .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
      }

      const updateData: Partial<typeof playbooks.$inferInsert> = { updatedAt: new Date