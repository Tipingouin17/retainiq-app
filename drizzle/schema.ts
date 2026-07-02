import { pgEnum, pgTable, serial, text, timestamp, varchar, boolean, decimal, integer, numeric } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * DO NOT modify this table — it is managed by the auth system.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Business-specific tables ─────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("trialing"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const customerHealthStatusEnum = pgEnum("customer_health_status", [
  "healthy",
  "at_risk",
  "critical",
  "churned",
]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  mrr: numeric("mrr", { precision: 10, scale: 2 }).notNull().default("0"),
  plan: varchar("plan", { length: 100 }),
  healthStatus: customerHealthStatusEnum("healthStatus").notNull().default("healthy"),
  healthScore: integer("healthScore").notNull().default(100),
  churnProbability: numeric("churnProbability", { precision: 5, scale: 4 }).notNull().default("0"),
  lastActiveAt: timestamp("lastActiveAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  subscribedAt: timestamp("subscribedAt"),
  churnedAt: timestamp("churnedAt"),
  externalId: varchar("externalId", { length: 255 }),
  notes: text("notes"),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const healthScoreFactorTypeEnum = pgEnum("health_score_factor_type", [
  "product_usage",
  "support_tickets",
  "payment_history",
  "engagement",
  "nps",
  "feature_adoption",
  "login_frequency",
  "custom",
]);

export const healthScoreFactors = pgTable("health_score_factors", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  factorType: healthScoreFactorTypeEnum("factorType").notNull(),
  factorName: varchar("factorName", { length: 255 }).notNull(),
  value: numeric("value", { precision: 10, scale: 4 }).notNull().default("0"),
  weight: numeric("weight", { precision: 5, scale: 4 }).notNull().default("1"),
  scoredAt: timestamp("scoredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthScoreFactor = typeof healthScoreFactors.$inferSelect;
export type NewHealthScoreFactor = typeof healthScoreFactors.$inferInsert;

export const healthScoreHistory = pgTable("health_score_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  healthScore: integer("healthScore").notNull(),
  healthStatus: customerHealthStatusEnum("healthStatus").notNull(),
  churnProbability: numeric("churnProbability", { precision: 5, scale: 4 }).notNull().default("0"),
  snapshotAt: timestamp("snapshotAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthScoreHistory = typeof healthScoreHistory.$inferSelect;
export type NewHealthScoreHistory = typeof healthScoreHistory.$inferInsert;

export const playbookTriggerTypeEnum = pgEnum("playbook_trigger_type", [
  "health_score_drops_below",
  "health_score_rises_above",
  "churn_probability_exceeds",
  "no_login_for_days",
  "mrr_drops",
  "trial_ending_soon",
  "manual",
  "custom_event",
]);

export const playbookStatusEnum = pgEnum("playbook_status", [
  "active",
  "paused",
  "archived",
  "draft",
]);

export const playbooks = pgTable("playbooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: playbookTriggerTypeEnum("triggerType").notNull(),
  triggerThreshold: numeric("triggerThreshold", { precision: 10, scale: 4 }),
  status: playbookStatusEnum("status").notNull().default("draft"),
  runCount: integer("runCount").notNull().default(0),
  lastRunAt: timestamp("lastRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Playbook = typeof playbooks.$inferSelect;
export type NewPlaybook = typeof playbooks.$inferInsert;

export const playbookStepTypeEnum = pgEnum("playbook_step_type", [
  "send_email",
  "create_task",
  "send_slack_message",
  "add_tag",
  "update_health_status",
  "webhook",
  "wait_days",
]);

export const playbookSteps = pgTable("playbook_steps", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  playbookId: integer("playbookId").notNull(),
  stepOrder: integer("stepOrder").notNull().default(0),
  stepType: playbookStepTypeEnum("stepType").notNull(),
  stepName: varchar("stepName", { length: 255 }).notNull(),
  config: text("config").notNull(),
  delayDays: integer("delayDays").notNull().default(0),
  isEnabled: boolean("isEnabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookStep = typeof playbookSteps.$inferSelect;
export type NewPlaybookStep = typeof playbookSteps.$inferInsert;

export const playbookRunStatusEnum = pgEnum("playbook_run_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export const playbookRuns = pgTable("playbook_runs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  playbookId: integer("playbookId").notNull(),
  customerId: integer("customerId").notNull(),
  status: playbookRunStatusEnum("status").notNull().default("pending"),
  currentStepId: integer("currentStepId"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  failureReason: text("failureReason"),
  triggerSnapshot: text("triggerSnapshot"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookRun = typeof playbookRuns.$inferSelect;
export type NewPlaybookRun = typeof playbookRuns.$inferInsert;

export const playbookStepRunStatusEnum = pgEnum("playbook_step_run_status", [
  "pending",
  "completed",
  "failed",
  "skipped",
]);

export const playbookStepRuns = pgTable("playbook_step_runs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  playbookRunId: integer("playbookRunId").notNull(),
  playbookStepId: integer("playbookStepId").notNull(),
  status: playbookStepRunStatusEnum("status").notNull().default("pending"),
  executedAt: timestamp("executedAt"),
  result: text("result"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlaybookStepRun = typeof playbookStepRuns.$inferSelect;
export type NewPlaybookStepRun = typeof playbookStepRuns.$inferInsert;

export const customerEventTypeEnum = pgEnum("customer_event_type", [
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
]);

export const customerEvents = pgTable("customer_events", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  eventType: customerEventTypeEnum("eventType").notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  properties: text("properties"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerEvent = typeof customerEvents.$inferSelect;
export type NewCustomerEvent = typeof customerEvents.$inferInsert;

export const taskStatusEnum = pgEnum("task_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  playbookRunId: integer("playbookRunId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("open"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const alertTypeEnum = pgEnum("alert_type", [
  "churn_risk",
  "health_score_drop",
  "payment_failed",
  "trial_expiring",
  "no_activity",
  "playbook_failed",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  alertType: alertTypeEnum("alertType").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("warning"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  isDismissed: boolean("isDismissed").notNull().default(false),
  readAt: timestamp("readAt"),
  dismissedAt: timestamp("dismissedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export const integrationProviderEnum = pgEnum("integration_provider", [
  "stripe",
  "intercom",
  "hubspot",
  "slack",
  "segment",
  "mixpanel",
  "amplitude",
  "zapier",
  "webhook",
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "active",
  "inactive",
  "error",
  "pending_auth",
]);

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  status: integrationStatusEnum("status").notNull().default("pending_auth"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  webhookUrl: varchar("webhookUrl", { length: 255 }),
  webhookSecret: varchar("webhookSecret", { length: 255 }),
  config: text("config"),
  lastSyncAt: timestamp("lastSyncAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export const scoringRules = pgTable("scoring_rules", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  factorType: healthScoreFactorTypeEnum("factorType").notNull(),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  description: text("description"),
  weight: numeric("weight", { precision: 5, scale: 4 }).notNull().default("1"),
  isEnabled: boolean("isEnabled").notNull().default(true),
  config: text("config").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ScoringRule = typeof scoringRules.$inferSelect;
export type NewScoringRule = typeof scoringRules.$inferInsert;
