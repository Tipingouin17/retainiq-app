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

export const churnRiskLevelEnum = pgEnum("churn_risk_level", [
  "low",
  "medium",
  "high",
  "very_high",
]);

export const playbookStatusEnum = pgEnum("playbook_status", [
  "draft",
  "active",
  "paused",
  "archived",
]);

export const playbookActionTypeEnum = pgEnum("playbook_action_type", [
  "send_email",
  "create_task",
  "send_in_app_message",
  "trigger_webhook",
  "assign_csm",
  "schedule_call",
]);

export const playbookTriggerTypeEnum = pgEnum("playbook_trigger_type", [
  "health_score_drops_below",
  "no_login_days",
  "feature_not_used_days",
  "mrr_at_risk",
  "manual",
  "renewal_approaching",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "open",
  "in_progress",
  "completed",
  "dismissed",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "login",
  "feature_used",
  "api_call",
  "support_ticket",
  "billing_event",
  "custom",
]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  avatarUrl: varchar("avatarUrl", { length: 255 }),
  mrr: numeric("mrr", { precision: 12, scale: 2 }).default("0"),
  planName: varchar("planName", { length: 255 }),
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  renewalDate: timestamp("renewalDate"),
  healthStatus: customerHealthStatusEnum("healthStatus").default("healthy").notNull(),
  healthScore: integer("healthScore").default(100).notNull(),
  churnRiskLevel: churnRiskLevelEnum("churnRiskLevel").default("low").notNull(),
  churnRiskScore: numeric("churnRiskScore", { precision: 5, scale: 2 }).default("0"),
  lastActivityAt: timestamp("lastActivityAt"),
  lastLoginAt: timestamp("lastLoginAt"),
  totalLogins: integer("totalLogins").default(0).notNull(),
  npsScore: integer("npsScore"),
  tags: text("tags"),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const healthScoreConfigs = pgTable("health_score_configs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  loginFrequencyWeight: integer("loginFrequencyWeight").default(25).notNull(),
  featureAdoptionWeight: integer("featureAdoptionWeight").default(25).notNull(),
  supportTicketWeight: integer("supportTicketWeight").default(20).notNull(),
  npsWeight: integer("npsWeight").default(15).notNull(),
  paymentHealthWeight: integer("paymentHealthWeight").default(15).notNull(),
  loginFrequencyThresholdDays: integer("loginFrequencyThresholdDays").default(7).notNull(),
  featureAdoptionMinFeatures: integer("featureAdoptionMinFeatures").default(3).notNull(),
  supportTicketThreshold: integer("supportTicketThreshold").default(3).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type HealthScoreConfig = typeof healthScoreConfigs.$inferSelect;
export type NewHealthScoreConfig = typeof healthScoreConfigs.$inferInsert;

export const healthScoreHistory = pgTable("health_score_history", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  score: integer("score").notNull(),
  healthStatus: customerHealthStatusEnum("healthStatus").notNull(),
  churnRiskScore: numeric("churnRiskScore", { precision: 5, scale: 2 }),
  loginFrequencyScore: integer("loginFrequencyScore"),
  featureAdoptionScore: integer("featureAdoptionScore"),
  supportTicketScore: integer("supportTicketScore"),
  npsScore: integer("npsScore"),
  paymentHealthScore: integer("paymentHealthScore"),
  scoredAt: timestamp("scoredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HealthScoreHistory = typeof healthScoreHistory.$inferSelect;
export type NewHealthScoreHistory = typeof healthScoreHistory.$inferInsert;

export const customerEvents = pgTable("customer_events", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  eventType: eventTypeEnum("eventType").notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  properties: text("properties"),
  source: varchar("source", { length: 255 }),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerEvent = typeof customerEvents.$inferSelect;
export type NewCustomerEvent = typeof customerEvents.$inferInsert;

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  eventKey: varchar("eventKey", { length: 255 }).notNull(),
  isCritical: boolean("isCritical").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;

export const customerFeatureUsage = pgTable("customer_feature_usage", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  featureId: integer("featureId").notNull(),
  userId: integer("userId").notNull(),
  usageCount: integer("usageCount").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  firstUsedAt: timestamp("firstUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CustomerFeatureUsage = typeof customerFeatureUsage.$inferSelect;
export type NewCustomerFeatureUsage = typeof customerFeatureUsage.$inferInsert;

export const playbooks = pgTable("playbooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: playbookStatusEnum("status").default("draft").notNull(),
  triggerType: playbookTriggerTypeEnum("triggerType").notNull(),
  triggerValue: numeric("triggerValue", { precision: 10, scale: 2 }),
  triggerUnit: varchar("triggerUnit", { length: 100 }),
  targetHealthStatus: customerHealthStatusEnum("targetHealthStatus"),
  targetChurnRiskLevel: churnRiskLevelEnum("targetChurnRiskLevel"),
  runCount: integer("runCount").default(0).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  isAutomated: boolean("isAutomated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Playbook = typeof playbooks.$inferSelect;
export type NewPlaybook = typeof playbooks.$inferInsert;

export const playbookSteps = pgTable("playbook_steps", {
  id: serial("id").primaryKey(),
  playbookId: integer("playbookId").notNull(),
  userId: integer("userId").notNull(),
  stepOrder: integer("stepOrder").notNull(),
  actionType: playbookActionTypeEnum("actionType").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  delayDays: integer("delayDays").default(0).notNull(),
  emailSubject: varchar("emailSubject", { length: 500 }),
  emailBody: text("emailBody"),
  taskTitle: varchar("taskTitle", { length: 255 }),
  taskDescription: text("taskDescription"),
  taskDueDays: integer("taskDueDays"),
  webhookUrl: varchar("webhookUrl", { length: 1000 }),
  webhookPayload: text("webhookPayload"),
  messageContent: text("messageContent"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookStep = typeof playbookSteps.$inferSelect;
export type NewPlaybookStep = typeof playbookSteps.$inferInsert;

export const playbookExecutions = pgTable("playbook_executions", {
  id: serial("id").primaryKey(),
  playbookId: integer("playbookId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  status: varchar("status", { length: 50 }).default("in_progress").notNull(),
  currentStepOrder: integer("currentStepOrder").default(1).notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  failedAt: timestamp("failedAt"),
  failureReason: text("failureReason"),
  triggerReason: text("triggerReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookExecution = typeof playbookExecutions.$inferSelect;
export type NewPlaybookExecution = typeof playbookExecutions.$inferInsert;

export const playbookStepExecutions = pgTable("playbook_step_executions", {
  id: serial("id").primaryKey(),
  playbookExecutionId: integer("playbookExecutionId").notNull(),
  playbookStepId: integer("playbookStepId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  executedAt: timestamp("executedAt"),
  failureReason: text("failureReason"),
  resultPayload: text("resultPayload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookStepExecution = typeof playbookStepExecutions.$inferSelect;
export type NewPlaybookStepExecution = typeof playbookStepExecutions.$inferInsert;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  assignedToUserId: integer("assignedToUserId"),
  playbookStepExecutionId: integer("playbookStepExecutionId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("open").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  isDismissed: boolean("isDismissed").default(false).notNull(),
  readAt: timestamp("readAt"),
  dismissedAt: timestamp("dismissedAt"),
  relatedEntityType: varchar("relatedEntityType", { length: 100 }),
  relatedEntityId: integer("relatedEntityId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  provider: varchar("provider", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("inactive").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  apiKey: varchar("apiKey", { length:
