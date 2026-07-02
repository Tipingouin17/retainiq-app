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
  "churned",
  "new",
]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  mrr: numeric("mrr", { precision: 10, scale: 2 }).notNull().default("0"),
  plan: varchar("plan", { length: 255 }),
  healthStatus: customerHealthStatusEnum("healthStatus").notNull().default("new"),
  healthScore: integer("healthScore").notNull().default(50),
  churnRisk: numeric("churnRisk", { precision: 5, scale: 4 }).notNull().default("0"),
  lastActiveAt: timestamp("lastActiveAt"),
  signedUpAt: timestamp("signedUpAt"),
  churndAt: timestamp("churndAt"),
  tags: text("tags"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const healthScoreFactorTypeEnum = pgEnum("health_score_factor_type", [
  "product_usage",
  "support_tickets",
  "nps_score",
  "payment_history",
  "feature_adoption",
  "login_frequency",
  "api_calls",
  "custom",
]);

export const healthScoreConfigs = pgTable("health_score_configs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  factorType: healthScoreFactorTypeEnum("factorType").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  weight: integer("weight").notNull().default(10),
  isActive: boolean("isActive").notNull().default(true),
  thresholdGood: numeric("thresholdGood", { precision: 10, scale: 2 }),
  thresholdBad: numeric("thresholdBad", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type HealthScoreConfig = typeof healthScoreConfigs.$inferSelect;
export type NewHealthScoreConfig = typeof healthScoreConfigs.$inferInsert;

export const customerHealthSnapshots = pgTable("customer_health_snapshots", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  healthScore: integer("healthScore").notNull(),
  churnRisk: numeric("churnRisk", { precision: 5, scale: 4 }).notNull(),
  healthStatus: customerHealthStatusEnum("healthStatus").notNull(),
  scoreBreakdown: text("scoreBreakdown"),
  snapshotAt: timestamp("snapshotAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerHealthSnapshot = typeof customerHealthSnapshots.$inferSelect;
export type NewCustomerHealthSnapshot = typeof customerHealthSnapshots.$inferInsert;

export const customerEvents = pgTable("customer_events", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  eventSource: varchar("eventSource", { length: 255 }),
  properties: text("properties"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerEvent = typeof customerEvents.$inferSelect;
export type NewCustomerEvent = typeof customerEvents.$inferInsert;

export const playbookTriggerTypeEnum = pgEnum("playbook_trigger_type", [
  "health_score_drops_below",
  "health_score_rises_above",
  "churn_risk_exceeds",
  "no_login_days",
  "mrr_change",
  "manual",
  "customer_created",
  "event_occurred",
]);

export const playbookStatusEnum = pgEnum("playbook_status", [
  "active",
  "inactive",
  "draft",
]);

export const playbooks = pgTable("playbooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: playbookTriggerTypeEnum("triggerType").notNull(),
  triggerValue: numeric("triggerValue", { precision: 10, scale: 2 }),
  triggerEventType: varchar("triggerEventType", { length: 255 }),
  status: playbookStatusEnum("status").notNull().default("draft"),
  runCount: integer("runCount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Playbook = typeof playbooks.$inferSelect;
export type NewPlaybook = typeof playbooks.$inferInsert;

export const playbookActionTypeEnum = pgEnum("playbook_action_type", [
  "send_email",
  "create_task",
  "send_slack_notification",
  "add_tag",
  "remove_tag",
  "update_health_status",
  "webhook",
  "wait_days",
]);

export const playbookActions = pgTable("playbook_actions", {
  id: serial("id").primaryKey(),
  playbookId: integer("playbookId").notNull(),
  userId: integer("userId").notNull(),
  actionType: playbookActionTypeEnum("actionType").notNull(),
  actionOrder: integer("actionOrder").notNull().default(0),
  config: text("config").notNull(),
  delayDays: integer("delayDays").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookAction = typeof playbookActions.$inferSelect;
export type NewPlaybookAction = typeof playbookActions.$inferInsert;

export const playbookRunStatusEnum = pgEnum("playbook_run_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export const playbookRuns = pgTable("playbook_runs", {
  id: serial("id").primaryKey(),
  playbookId: integer("playbookId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  status: playbookRunStatusEnum("status").notNull().default("pending"),
  currentActionOrder: integer("currentActionOrder").notNull().default(0),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookRun = typeof playbookRuns.$inferSelect;
export type NewPlaybookRun = typeof playbookRuns.$inferInsert;

export const playbookRunActionLogs = pgTable("playbook_run_action_logs", {
  id: serial("id").primaryKey(),
  playbookRunId: integer("playbookRunId").notNull(),
  playbookActionId: integer("playbookActionId").notNull(),
  userId: integer("userId").notNull(),
  status: playbookRunStatusEnum("status").notNull().default("pending"),
  executedAt: timestamp("executedAt"),
  resultPayload: text("resultPayload"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlaybookRunActionLog = typeof playbookRunActionLogs.$inferSelect;
export type NewPlaybookRunActionLog = typeof playbookRunActionLogs.$inferInsert;

export const taskStatusEnum = pgEnum("task_status", [
  "open",
  "in_progress",
  "completed",
  "dismissed",
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
  customerId: integer("customerId"),
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

export const integrationProviderEnum = pgEnum("integration_provider", [
  "stripe",
  "intercom",
  "hubspot",
  "slack",
  "segment",
  "mixpanel",
  "amplitude",
  "custom_webhook",
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "connected",
  "disconnected",
  "error",
  "pending",
]);

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  status: integrationStatusEnum("status").notNull().default("pending"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  webhookSecret: varchar("webhookSecret", { length: 255 }),
  externalWorkspaceId: varchar("externalWorkspaceId", { length: 255 }),
  config: text("config"),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export const alertTypeEnum = pgEnum("alert_type", [
  "churn_risk_spike",
  "health_score_drop",
  "no_activity",
  "mrr_drop",
  "payment_failed",
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
  customerId: integer("customerId"),
  alertType: alertTypeEnum("alertType").notNull(),
  severity: alertSeverityEnum("severity").notNull().default("warning"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  resolvedAt: timestamp("resolvedAt"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export const npsResponses = pgTable("nps_responses", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  surveySource: varchar("surveySource", { length: 255 }),
  respondedAt: timestamp("respondedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NpsResponse = typeof npsResponses.$inferSelect;
export type NewNpsResponse = typeof npsResponses.$inferInsert;

export const retentionMetricsPeriodEnum = pgEnum("retention_metrics_period", [
  "daily",
  "weekly",
  "monthly",
]);

export const retentionMetrics = pgTable("retention_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  period: retentionMetricsPeriodEnum("period").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  totalCustomers: integer("totalCustomers").notNull().default(0),
  healthyCount: integer("healthyCount").notNull().default(0),
  atRiskCount: integer("atRiskCount").notNull().default(0),
  churnedCount: integer("churnedCount").notNull().default(0),
  newCount: integer("newCount").notNull().default(0),
  totalMrr: numeric("totalMrr", { precision: 12, scale: 2 }).notNull().default("0"),
  churnedMrr: numeric("churnedMrr", { precision: 12, scale: 2 }).notNull().default("0"),
  averageHealthScore: numeric("averageHealthScore", { precision: 5, scale: 2 }).notNull().default("0"),
  churnRate: numeric("churnRate", { precision: 5, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RetentionMetric = typeof retentionMetrics.$inferSelect;
export type NewRetentionMetric = typeof retentionMetrics.$inferInsert;
