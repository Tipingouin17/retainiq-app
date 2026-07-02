```typescript
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
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
import Stripe from "stripe";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return { user: ctx.user };
    }),
    logout: protectedProcedure.mutation(async () => {
      return { success: true };
    }),
  }),

  // Subscription / payments
  payments: router({
    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      const rows = await db!
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      return rows[0] ?? null;
    }),

    createCheckout: protectedProcedure
      .input(z.object({ priceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const session = await stripe.checkout.sessions.create({
          customer_email: ctx.user.email!,
          line_items: [{ price: input.priceId, quantity: 1 }],
          mode: "subscription",
          success_url: `${process.env.VITE_APP_URL || "https://example.aibce.io"}/dashboard?success=true`,
          cancel_url: `${process.env.VITE_APP_URL || "https://example.aibce.io"}/pricing`,
        });
        return { url: session.url };
      }),

    createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      const rows = await db!
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);
      const sub = rows[0];
      if (!sub?.stripeCustomerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No subscription found" });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${process.env.VITE_APP_URL || "https://example.aibce.io"}/dashboard`,
      });
      return { url: session.url };
    }),
  }),

  // Customers
  customers: router({
    list: protectedProcedure
      .input(
        z
          .object({
            healthStatus: z
              .enum(["healthy", "at_risk", "critical", "churned"])
              .optional(),
            limit: z.number().min(1).max(200).optional().default(50),
            offset: z.number().min(0).optional().default(0),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(customers.userId, ctx.user.id)];
        if (input?.healthStatus) {
          conditions.push(eq(customers.healthStatus, input.healthStatus));
        }
        const rows = await db!
          .select()
          .from(customers)
          .where(and(...conditions))
          .orderBy(desc(customers.createdAt))
          .limit(input?.limit ?? 50)
          .offset(input?.offset ?? 0);
        return rows;
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const rows = await db!
          .select()
          .from(customers)
          .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)))
          .limit(1);
        if (!rows[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }
        return rows[0];
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          companyName: z.string().optional(),
          mrr: z.string().optional().default("0"),
          plan: z.string().optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
          externalId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(customers)
          .values({
            userId: ctx.user.id,
            name: input.name,
            email: input.email,
            companyName: input.companyName,
            mrr: input.mrr ?? "0",
            plan: input.plan,
            notes: input.notes,
            tags: input.tags,
            externalId: input.externalId,
          })
          .returning();
        return result[0];
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          companyName: z.string().optional(),
          mrr: z.string().optional(),
          plan: z.string().optional(),
          healthStatus: z
            .enum(["healthy", "at_risk", "critical", "churned"])
            .optional(),
          healthScore: z.number().min(0).max(100).optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...rest } = input;
        const result = await db!
          .update(customers)
          .set({ ...rest, updatedAt: new Date() })
          .where(and(eq(customers.id, id), eq(customers.userId, ctx.user.id)))
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(customers)
          .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Health Score Factors
  healthScoreFactors: router({
    list: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(healthScoreFactors)
          .where(
            and(
              eq(healthScoreFactors.userId, ctx.user.id),
              eq(healthScoreFactors.customerId, input.customerId)
            )
          )
          .orderBy(desc(healthScoreFactors.scoredAt));
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
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
          factorName: z.string().min(1),
          value: z.string(),
          weight: z.string().optional().default("1"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(healthScoreFactors)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            factorType: input.factorType,
            factorName: input.factorName,
            value: input.value,
            weight: input.weight ?? "1",
          })
          .returning();
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(healthScoreFactors)
          .where(
            and(
              eq(healthScoreFactors.id, input.id),
              eq(healthScoreFactors.userId, ctx.user.id)
            )
          );
        return { success: true };
      }),
  }),

  // Health Score History
  healthScoreHistory: router({
    list: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          limit: z.number().min(1).max(100).optional().default(30),
        })
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(healthScoreHistory)
          .where(
            and(
              eq(healthScoreHistory.userId, ctx.user.id),
              eq(healthScoreHistory.customerId, input.customerId)
            )
          )
          .orderBy(desc(healthScoreHistory.snapshotAt))
          .limit(input.limit);
      }),
  }),

  // Playbooks
  playbooks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db!
        .select()
        .from(playbooks)
        .where(eq(playbooks.userId, ctx.user.id))
        .orderBy(desc(playbooks.createdAt));
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const rows = await db!
          .select()
          .from(playbooks)
          .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)))
          .limit(1);
        if (!rows[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
        }
        return rows[0];
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
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
          triggerThreshold: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(playbooks)
          .values({
            userId: ctx.user.id,
            name: input.name,
            description: input.description,
            triggerType: input.triggerType,
            triggerThreshold: input.triggerThreshold,
          })
          .returning();
        return result[0];
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          description: z.string().optional(),
          status: z.enum(["active", "paused", "archived", "draft"]).optional(),
          triggerThreshold: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...rest } = input;
        const result = await db!
          .update(playbooks)
          .set({ ...rest, updatedAt: new Date() })
          .where(and(eq(playbooks.id, id), eq(playbooks.userId, ctx.user.id)))
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
        }
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(playbooks)
          .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Playbook Steps
  playbookSteps: router({
    list: protectedProcedure
      .input(z.object({ playbookId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(playbookSteps)
          .where(
            and(
              eq(playbookSteps.userId, ctx.user.id),
              eq(playbookSteps.playbookId, input.playbookId)
            )
          )
          .orderBy(asc(playbookSteps.stepOrder));
      }),

    create: protectedProcedure
      .input(
        z.object({
          playbookId: z.number(),
          stepOrder: z.number().optional().default(0),
          stepType: z.enum([
            "send_email",
            "create_task",
            "send_slack_message",
            "add_tag",
            "update_health_status",
            "webhook",
            "wait_days",
          ]),
          stepName: z.string().min(1),
          config: z.string(),
          delayDays: z.number().optional().default(0),
          isEnabled: z.boolean().optional().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(playbookSteps)
          .values({
            userId: ctx.user.id,
            playbookId: input.playbookId,
            stepOrder: input.stepOrder,
            stepType: input.stepType,
            stepName: input.stepName,
            config: input.config,
            delayDays: input.delayDays,
            isEnabled: input.isEnabled,
          })
          .returning();
        return result[0];
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          stepName: z.string().min(1).optional(),
          config: z.string().optional(),
          stepOrder: z.number().optional(),
          delayDays: z.number().optional(),
          isEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...rest } = input;
        const result = await db!
          .update(playbookSteps)
          .set({ ...rest, updatedAt: new Date() })
          .where(
            and(eq(playbookSteps.id, id), eq(playbookSteps.userId, ctx.user.id))
          )
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });
        }
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(playbookSteps)
          .where(
            and(eq(playbookSteps.id, input.id), eq(playbookSteps.userId, ctx.user.id))
          );
        return { success: true };
      }),
  }),

  // Playbook Runs
  playbookRuns: router({
    list: protectedProcedure
      .input(
        z
          .object({
            playbookId: z.number().optional(),
            customerId: z.number().optional(),
            limit: z.number().min(1).max(100).optional().default(20),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(playbookRuns.userId, ctx.user.id)];
        if (input?.playbookId) {
          conditions.push(eq(playbookRuns.playbookId, input.playbookId));
        }
        if (input?.customerId) {
          conditions.push(eq(playbookRuns.customerId, input.customerId));
        }
        return db!
          .select()
          .from(playbookRuns)
          .where(and(...conditions))
          .orderBy(desc(playbookRuns.createdAt))
          .limit(input?.limit ?? 20);
      }),

    create: protectedProcedure
      .input(
        z.object({
          playbookId: z.number(),
          customerId: z.number(),
          triggerSnapshot: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(playbookRuns)
          .values({
            userId: ctx.user.id,
            playbookId: input.playbookId,
            customerId: input.customerId,
            triggerSnapshot: input.triggerSnapshot,
            startedAt: new Date(),
          })
          .returning();
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(playbookRuns)
          .where(
            and(eq(playbookRuns.id, input.id), eq(playbookRuns.userId, ctx.user.id))
          );
        return { success: true };
      }),
  }),

  // Customer Events
  customerEvents: router({
    list: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          limit: z.number().min(1).max(100).optional().default(50),
        })
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(customerEvents)
          .where(
            and(
              eq(customerEvents.userId, ctx.user.id),
              eq(customerEvents.customerId, input.customerId)
            )
          )
          .orderBy(desc(customerEvents.occurredAt))
          .limit(input.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
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
          eventName: z.string().min(1),
          properties: z.string().optional(),
          occurredAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(customerEvents)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            eventType: input.eventType,
            eventName: input.eventName,
            properties: input.properties,
            occurredAt: input.occurredAt ?? new Date(),
          })
          .returning();
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(customerEvents)
          .where(
            and(
              eq(customerEvents.id, input.id),
              eq(customerEvents.userId, ctx.user.id)
            )
          );
        return { success: true };
      }),
  }),

  // Tasks
  tasks: router({
    list: protectedProcedure
      .input(
        z
          .object({
            customerId: z.number().optional(),
            status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
            limit: z.number().min(1).max(100).optional().default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(tasks.userId, ctx.user.id)];
        if (input?.customerId) {
          conditions.push(eq(tasks.customerId, input.customerId));
        }
        if (input?.status) {
          conditions.push(eq(tasks.status, input.status));
        }
        return db!
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.createdAt))
          .limit(input?.limit ?? 50);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
          dueAt: z.date().optional(),
          playbookRunId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(tasks)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            title: input.title,
            description: input.description,
            priority: input.priority,
            dueAt: input.dueAt,
            playbookRunId: input.playbookRunId,
          })
          .returning();
        return result[0];
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          dueAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...rest } = input;
        const completedAt =
          input.status === "completed" ? new Date() : undefined;
        const result = await db!
          .update(tasks)
          .set({ ...rest, ...(completedAt ? { completedAt } : {}), updatedAt: new Date() })
          .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.user.id)))
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        }
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(tasks)
          .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Alerts
  alerts: router({
    list: protectedProcedure
      .input(
        z
          .object({
            customerId: z.number().optional(),
            isRead: z.boolean().optional(),
            isDismissed: z.boolean().optional(),
            limit: z.number().min(1).max(100).optional().default(50),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(alerts.userId, ctx.user.id)];
        if (input?.customerId !== undefined) {
          conditions.push(eq(alerts.customerId, input.customerId));
        }
        if (input?.isRead !== undefined) {
          conditions.push(eq(alerts.isRead, input.isRead));
        }
        if (input?.isDismissed !== undefined) {
          conditions.push(eq(alerts.isDismissed, input.isDismissed));
        }
        return db!
          .select()
          .from(alerts)
          .where(and(...conditions))
          .orderBy(desc(alerts.createdAt))
          .limit(input?.limit ?? 50);
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          alertType: z.enum([
            "churn_risk",
            "health_score_drop",
            "payment_failed",
            "trial_expiring",
            "no_activity",
            "playbook_failed",
          ]),
          severity: z.enum(["info", "warning", "critical"]).optional().default("warning"),
          title: z.string().min(1),
          message: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(alerts)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            alertType: input.alertType,
            severity: input.severity,
            title: input.title,
            message: input.message,
          })
          .returning();
        return result[0];
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .update(alerts)
          .set({ isRead: true, readAt: new Date() })
          .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.user.id)))
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
        }
        return result[0];
      }),

    dismiss: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .update(alerts)
          .set({ isDismissed: true, dismissedAt: new Date() })
          .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.user.id)))
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
        }
        return result[0];
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(alerts)
          .where(and(eq(alerts.id, input.id), eq(alerts.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Integrations
  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db!
        .select()
        .from(integrations)
        .where(eq(integrations.userId, ctx.user.id))
        .orderBy(desc(integrations.createdAt));
    }),

    create: protectedProcedure
      .input(
        z.object({
          provider: z.enum([
            "stripe",
            "intercom",
            "hubspot",
            "slack",
            "segment",
            "mixpanel",
            "amplitude",
            "zapier",
            "webhook",
          ]),
          config: z.string().optional(),
          webhookUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(integrations)
          .values({
            userId: ctx.user.id,
            provider: input.provider,
            config: input.config,
            webhookUrl: input.webhookUrl,
          })
          .returning();
        return result[0];
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z
            .enum(["active", "inactive", "error", "pending_auth"])
            .optional(),
          config: z.string().optional(),
          webhookUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...rest } = input;
        const result = await db!
          .update(integrations)
          .set({ ...rest, updatedAt: new Date() })
          .where(
            and(eq(integrations.id, id), eq(integrations.userId, ctx.user.id))
          )
          .returning();
        if (!result[0]) {
          throw new TRPCError({ code