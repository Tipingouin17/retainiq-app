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

  // Customers
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db!
        .select()
        .from(customers)
        .where(eq(customers.userId, ctx.user.id))
        .orderBy(desc(customers.createdAt));
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .select()
          .from(customers)
          .where(and(eq(customers.id, input.id), eq(customers.userId, ctx.user.id)));
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        return result[0];
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          companyName: z.string().optional(),
          mrr: z.string().optional(),
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
          healthScore: z.number().optional(),
          healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]).optional(),
          churnProbability: z.string().optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...updates } = input;
        const result = await db!
          .update(customers)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(customers.id, id), eq(customers.userId, ctx.user.id)))
          .returning();
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
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
              eq(healthScoreFactors.customerId, input.customerId),
              eq(healthScoreFactors.userId, ctx.user.id)
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
          weight: z.string().optional(),
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
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(healthScoreHistory)
          .where(
            and(
              eq(healthScoreHistory.customerId, input.customerId),
              eq(healthScoreHistory.userId, ctx.user.id)
            )
          )
          .orderBy(desc(healthScoreHistory.snapshotAt));
      }),
    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          healthScore: z.number(),
          healthStatus: z.enum(["healthy", "at_risk", "critical", "churned"]),
          churnProbability: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(healthScoreHistory)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            healthScore: input.healthScore,
            healthStatus: input.healthStatus,
            churnProbability: input.churnProbability ?? "0",
          })
          .returning();
        return result[0];
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
        const result = await db!
          .select()
          .from(playbooks)
          .where(and(eq(playbooks.id, input.id), eq(playbooks.userId, ctx.user.id)));
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
        return result[0];
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
          status: z.enum(["active", "paused", "archived", "draft"]).optional(),
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
            status: input.status ?? "draft",
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
          triggerType: z
            .enum([
              "health_score_drops_below",
              "health_score_rises_above",
              "churn_probability_exceeds",
              "no_login_for_days",
              "mrr_drops",
              "trial_ending_soon",
              "manual",
              "custom_event",
            ])
            .optional(),
          triggerThreshold: z.string().optional(),
          status: z.enum(["active", "paused", "archived", "draft"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...updates } = input;
        const result = await db!
          .update(playbooks)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(playbooks.id, id), eq(playbooks.userId, ctx.user.id)))
          .returning();
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Playbook not found" });
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
              eq(playbookSteps.playbookId, input.playbookId),
              eq(playbookSteps.userId, ctx.user.id)
            )
          )
          .orderBy(asc(playbookSteps.stepOrder));
      }),
    create: protectedProcedure
      .input(
        z.object({
          playbookId: z.number(),
          stepOrder: z.number().optional(),
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
          delayDays: z.number().optional(),
          isEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(playbookSteps)
          .values({
            userId: ctx.user.id,
            playbookId: input.playbookId,
            stepOrder: input.stepOrder ?? 0,
            stepType: input.stepType,
            stepName: input.stepName,
            config: input.config,
            delayDays: input.delayDays ?? 0,
            isEnabled: input.isEnabled ?? true,
          })
          .returning();
        return result[0];
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          stepOrder: z.number().optional(),
          stepType: z
            .enum([
              "send_email",
              "create_task",
              "send_slack_message",
              "add_tag",
              "update_health_status",
              "webhook",
              "wait_days",
            ])
            .optional(),
          stepName: z.string().min(1).optional(),
          config: z.string().optional(),
          delayDays: z.number().optional(),
          isEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...updates } = input;
        const result = await db!
          .update(playbookSteps)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, ctx.user.id)))
          .returning();
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Step not found" });
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
      .input(z.object({ playbookId: z.number().optional(), customerId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(playbookRuns.userId, ctx.user.id)];
        if (input.playbookId) conditions.push(eq(playbookRuns.playbookId, input.playbookId));
        if (input.customerId) conditions.push(eq(playbookRuns.customerId, input.customerId));
        return db!
          .select()
          .from(playbookRuns)
          .where(and(...conditions))
          .orderBy(desc(playbookRuns.createdAt));
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
            status: "pending",
            triggerSnapshot: input.triggerSnapshot,
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
      .input(z.object({ customerId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        return db!
          .select()
          .from(customerEvents)
          .where(
            and(
              eq(customerEvents.customerId, input.customerId),
              eq(customerEvents.userId, ctx.user.id)
            )
          )
          .orderBy(desc(customerEvents.occurredAt));
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
            and(eq(customerEvents.id, input.id), eq(customerEvents.userId, ctx.user.id))
          );
        return { success: true };
      }),
  }),

  // Tasks
  tasks: router({
    list: protectedProcedure
      .input(z.object({ customerId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(tasks.userId, ctx.user.id)];
        if (input.customerId) conditions.push(eq(tasks.customerId, input.customerId));
        return db!
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.createdAt));
      }),
    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          playbookRunId: z.number().optional(),
          title: z.string().min(1),
          description: z.string().optional(),
          status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          dueAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(tasks)
          .values({
            userId: ctx.user.id,
            customerId: input.customerId,
            playbookRunId: input.playbookRunId,
            title: input.title,
            description: input.description,
            status: input.status ?? "open",
            priority: input.priority ?? "medium",
            dueAt: input.dueAt,
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
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...updates } = input;
        const result = await db!
          .update(tasks)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.user.id)))
          .returning();
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
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
        z.object({
          customerId: z.number().optional(),
          unreadOnly: z.boolean().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        const conditions = [eq(alerts.userId, ctx.user.id)];
        if (input.customerId) conditions.push(eq(alerts.customerId, input.customerId));
        if (input.unreadOnly) conditions.push(eq(alerts.isRead, false));
        return db!
          .select()
          .from(alerts)
          .where(and(...conditions))
          .orderBy(desc(alerts.createdAt));
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
          severity: z.enum(["info", "warning", "critical"]).optional(),
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
            severity: input.severity ?? "warning",
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
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
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
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Alert not found" });
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
          status: z.enum(["active", "inactive", "error", "pending_auth"]).optional(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          tokenExpiresAt: z.date().optional(),
          webhookUrl: z.string().optional(),
          webhookSecret: z.string().optional(),
          config: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(integrations)
          .values({
            userId: ctx.user.id,
            provider: input.provider,
            status: input.status ?? "pending_auth",
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            tokenExpiresAt: input.tokenExpiresAt,
            webhookUrl: input.webhookUrl,
            webhookSecret: input.webhookSecret,
            config: input.config,
          })
          .returning();
        return result[0];
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["active", "inactive", "error", "pending_auth"]).optional(),
          accessToken: z.string().optional(),
          refreshToken: z.string().optional(),
          tokenExpiresAt: z.date().optional(),
          webhookUrl: z.string().optional(),
          webhookSecret: z.string().optional(),
          config: z.string().optional(),
          lastSyncAt: z.date().optional(),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const { id, ...updates } = input;
        const result = await db!
          .update(integrations)
          .set({ ...updates, updatedAt: new Date() })
          .where(and(eq(integrations.id, id), eq(integrations.userId, ctx.user.id)))
          .returning();
        if (!result[0])
          throw new TRPCError({ code: "NOT_FOUND", message: "Integration not found" });
        return result[0];
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        await db!
          .delete(integrations)
          .where(and(eq(integrations.id, input.id), eq(integrations.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Scoring Rules
  scoringRules: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      return db!
        .select()
        .from(scoringRules)
        .where(eq(scoringRules.userId, ctx.user.id))
        .orderBy(asc(scoringRules.createdAt));
    }),
    create: protectedProcedure
      .input(
        z.object({
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
          ruleName: z.string().min(1),
          description: z.string().optional(),
          weight: z.string().optional(),
          isEnabled: z.boolean().optional(),
          config: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        const result = await db!
          .insert(scoringRules)
          .values({
            userId: ctx.user.id,
            factorType: input.factorType,
            ruleName: input.ruleName,
            description: input.description,
            weight: input.weight ?? "1",
            isEnabled: input.isEnabled ?? true,
            config: input.config,
          })
          .returning();
        return result[0];
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          ruleName: z.string().min(1).optional(),
          description: z.string