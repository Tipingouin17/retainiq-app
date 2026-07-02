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

export const playbookStatusEnum = pgEnum("playbook_status", [
  "draft",
  "active",
  "paused",
  "archived",
]);

export const playbookStepTypeEnum = pgEnum("playbook_step_type", [
  "email",
  "in_app_message",
  "task",
  "webhook",
  "wait",
]);

export const playbookRunStatusEnum = pgEnum("playbook_run_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export const churnRiskLevelEnum = pgEnum("churn_risk_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  externalId: varchar("externalId", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  companyDomain: varchar("companyDomain", { length: 255 }),
  mrr: numeric("mrr", { precision: 10, scale: 2 }).default("0"),
  planName: varchar("planName", { length: 255 }),
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndedAt: timestamp("trialEndedAt"),
  subscribedAt: timestamp("subscribedAt"),
  lastActiveAt: timestamp("lastActiveAt"),
  healthStatus: customerHealthStatusEnum("healthStatus").default("healthy").notNull(),
  healthScore: integer("healthScore").default(100).notNull(),
  churnRisk: churnRiskLevelEnum("churnRisk").default("low").notNull(),
  churnRiskScore: numeric("churnRiskScore", { precision: 5, scale: 2 }).default("0"),
  isChurned: boolean("isChurned").default(false).notNull(),
  churnedAt: timestamp("churnedAt"),
  churnReason: text("churnReason"),
  avatarUrl: varchar("avatarUrl", { length: 255 }),
  tags: text("tags").array(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export const customerHealthScores = pgTable("customer_health_scores", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  overallScore: integer("overallScore").notNull(),
  engagementScore: integer("engagementScore").notNull(),
  usageScore: integer("usageScore").notNull(),
  supportScore: integer("supportScore").notNull(),
  paymentScore: integer("paymentScore").notNull(),
  npsScore: integer("npsScore"),
  loginFrequency: integer("loginFrequency").default(0),
  featureAdoptionRate: numeric("featureAdoptionRate", { precision: 5, scale: 2 }).default("0"),
  supportTicketsLast30Days: integer("supportTicketsLast30Days").default(0),
  daysUntilRenewal: integer("daysUntilRenewal"),
  scoringVersion: varchar("scoringVersion", { length: 50 }).default("1.0").notNull(),
  computedAt: timestamp("computedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerHealthScore = typeof customerHealthScores.$inferSelect;
export type NewCustomerHealthScore = typeof customerHealthScores.$inferInsert;

export const customerEvents = pgTable("customer_events", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  properties: text("properties"),
  source: varchar("source", { length: 100 }).default("api"),
  sessionId: varchar("sessionId", { length: 255 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerEvent = typeof customerEvents.$inferSelect;
export type NewCustomerEvent = typeof customerEvents.$inferInsert;

export const churnPredictions = pgTable("churn_predictions", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  riskLevel: churnRiskLevelEnum("riskLevel").notNull(),
  riskScore: numeric("riskScore", { precision: 5, scale: 2 }).notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  predictedChurnDate: timestamp("predictedChurnDate"),
  primaryRiskFactor: varchar("primaryRiskFactor", { length: 255 }),
  riskFactors: text("riskFactors"),
  recommendations: text("recommendations"),
  modelVersion: varchar("modelVersion", { length: 50 }).default("1.0").notNull(),
  isActioned: boolean("isActioned").default(false).notNull(),
  actionedAt: timestamp("actionedAt"),
  didChurn: boolean("didChurn"),
  churnConfirmedAt: timestamp("churnConfirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ChurnPrediction = typeof churnPredictions.$inferSelect;
export type NewChurnPrediction = typeof churnPredictions.$inferInsert;

export const playbooks = pgTable("playbooks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: playbookStatusEnum("status").default("draft").notNull(),
  triggerType: varchar("triggerType", { length: 100 }).notNull(),
  triggerConditions: text("triggerConditions").notNull(),
  targetSegment: varchar("targetSegment", { length: 100 }),
  healthScoreThreshold: integer("healthScoreThreshold"),
  churnRiskThreshold: varchar("churnRiskThreshold", { length: 50 }),
  isTemplate: boolean("isTemplate").default(false).notNull(),
  timesTriggered: integer("timesTriggered").default(0).notNull(),
  timesCompleted: integer("timesCompleted").default(0).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
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
  stepType: playbookStepTypeEnum("stepType").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  delayDays: integer("delayDays").default(0).notNull(),
  delayHours: integer("delayHours").default(0).notNull(),
  emailSubject: varchar("emailSubject", { length: 255 }),
  emailBody: text("emailBody"),
  emailFromName: varchar("emailFromName", { length: 255 }),
  messageContent: text("messageContent"),
  taskTitle: varchar("taskTitle", { length: 255 }),
  taskAssigneeId: integer("taskAssigneeId"),
  webhookUrl: varchar("webhookUrl", { length: 255 }),
  webhookPayload: text("webhookPayload"),
  conditionLogic: text("conditionLogic"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookStep = typeof playbookSteps.$inferSelect;
export type NewPlaybookStep = typeof playbookSteps.$inferInsert;

export const playbookRuns = pgTable("playbook_runs", {
  id: serial("id").primaryKey(),
  playbookId: integer("playbookId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  status: playbookRunStatusEnum("status").default("pending").notNull(),
  triggeredBy: varchar("triggeredBy", { length: 100 }).default("system").notNull(),
  currentStepId: integer("currentStepId"),
  currentStepOrder: integer("currentStepOrder").default(0).notNull(),
  totalSteps: integer("totalSteps").notNull(),
  completedSteps: integer("completedSteps").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  failedAt: timestamp("failedAt"),
  failureReason: text("failureReason"),
  outcome: varchar("outcome", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookRun = typeof playbookRuns.$inferSelect;
export type NewPlaybookRun = typeof playbookRuns.$inferInsert;

export const playbookStepExecutions = pgTable("playbook_step_executions", {
  id: serial("id").primaryKey(),
  playbookRunId: integer("playbookRunId").notNull(),
  playbookStepId: integer("playbookStepId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  executedAt: timestamp("executedAt"),
  completedAt: timestamp("completedAt"),
  failedAt: timestamp("failedAt"),
  failureReason: text("failureReason"),
  emailMessageId: varchar("emailMessageId", { length: 255 }),
  emailOpenedAt: timestamp("emailOpenedAt"),
  emailClickedAt: timestamp("emailClickedAt"),
  responsePayload: text("responsePayload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlaybookStepExecution = typeof playbookStepExecutions.$inferSelect;
export type NewPlaybookStepExecution = typeof playbookStepExecutions.$inferInsert;

export const customerSegments = pgTable("customer_segments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  filterCriteria: text("filterCriteria").notNull(),
  color: varchar("color", { length: 50 }).default("#6366f1"),
  customerCount: integer("customerCount").default(0).notNull(),
  isSystem: boolean("isSystem").default(false).notNull(),
  lastComputedAt: timestamp("lastComputedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CustomerSegment = typeof customerSegments.$inferSelect;
export type NewCustomerSegment = typeof customerSegments.$inferInsert;

export const customerSegmentMemberships = pgTable("customer_segment_memberships", {
  id: serial("id").primaryKey(),
  segmentId: integer("segmentId").notNull(),
  customerId: integer("customerId").notNull(),
  userId: integer("userId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerSegmentMembership = typeof customerSegmentMemberships.$inferSelect;
export type NewCustomerSegmentMembership = typeof customerSegmentMemberships.$inferInsert;

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  customerId: integer("customerId").notNull(),
  alertType: varchar("alertType", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"),
  isRead: boolean("isRead").default(false).notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  readAt: timestamp("readAt"),
  resolvedAt: timestamp("resolvedAt"),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export const alertRules = pgTable("alert_rules", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  conditionType: varchar("conditionType", { length: 100 }).notNull(),
  conditionOperator: varchar("conditionOperator", { length: 50 }).notNull(),
  conditionValue: varchar("conditionValue", { length: 255 }).not
