import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, lt, gte, lte, isNull, isNotNull, sql } from "drizzle-orm";
import {
  users,
  subscriptions,
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
} from "../drizzle/schema";
import type {
  Subscription,
  NewSubscription,
  Customer,
  NewCustomer,
  CustomerHealthScore,
  NewCustomerHealthScore,
  CustomerEvent,
  NewCustomerEvent,
  ChurnPrediction,
  NewChurnPrediction,
  Playbook,
  NewPlaybook,
  PlaybookStep,
  NewPlaybookStep,
  PlaybookRun,
  NewPlaybookRun,
  PlaybookStepExecution,
  NewPlaybookStepExecution,
  CustomerSegment,
  NewCustomerSegment,
  CustomerSegmentMembership,
  NewCustomerSegmentMembership,
  Alert,
  NewAlert,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function upsertUser(data: {
  openId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}): Promise<typeof users.$inferSelect> {
  const db = await getDb();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.openId, data.openId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(users)
      .set({
        email: data.email,
        name: data.name ?? existing[0].name,
        avatarUrl: data.avatarUrl ?? existing[0].avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.openId, data.openId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      openId: data.openId,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
    })
    .returning();
  return created;
}

export async function getUserByOpenId(
  openId: string
): Promise<typeof users.$inferSelect | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0] ?? null;
}

// ─── Subscription Helpers ────────────────────────────────────────────────────

export async function getSubscriptionByUserId(
  userId: number
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] ?? null;
}

export async function createSubscription(
  data: NewSubscription
): Promise<Subscription> {
  const db = await getDb();
  const [created] = await db.insert(subscriptions).values(data).returning();
  return created;
}

export async function updateSubscription(
  id: number,
  data: Partial<Omit<Subscription, "id" | "createdAt">>
): Promise<Subscription> {
  const db = await getDb();
  const [updated] = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();
  return updated;
}

export async function upsertSubscriptionByUserId(
  userId: number,
  data: Omit<NewSubscription, "userId">
): Promise<Subscription> {
  const db = await getDb();
  const existing = await getSubscriptionByUserId(userId);
  if (existing) {
    return updateSubscription(existing.id, data);
  }
  return createSubscription({ ...data, userId });
}

// ─── Customer Helpers ────────────────────────────────────────────────────────

export async function getCustomersByUserId(
  userId: number,
  options?: {
    limit?: number;
    offset?: number;
    healthStatus?: "healthy" | "at_risk" | "critical" | "churned";
    churnRisk?: "low" | "medium" | "high" | "critical";
    isChurned?: boolean;
  }
): Promise<Customer[]> {
  const db = await getDb();
  const conditions = [eq(customers.userId, userId)];

  if (options?.healthStatus !== undefined) {
    conditions.push(eq(customers.healthStatus, options.healthStatus));
  }
  if (options?.churnRisk !== undefined) {
    conditions.push(eq(customers.churnRisk, options.churnRisk));
  }
  if (options?.isChurned !== undefined) {
    conditions.push(eq(customers.isChurned, options.isChurned));
  }

  return db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(desc(customers.createdAt))
    .limit(options?.limit ?? 100)
    .offset(options?.offset ?? 0);
}

export async function getCustomerById(
  id: number,
  userId: number
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByEmail(
  email: string,
  userId: number
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.email, email), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByExternalId(
  externalId: string,
  userId: number
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(
      and(eq(customers.externalId, externalId), eq(customers.userId, userId))
    )
    .limit(1);
  return result[0] ?? null;
}

export async function createCustomer(data: NewCustomer): Promise<Customer> {
  const db = await getDb();
  const [created] = await db.insert(customers).values(data).returning();
  return created;
}

export async function updateCustomer(
  id: number,
  userId: number,
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<Customer> {
  const db = await getDb();
  const [updated] = await db
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return updated;
}

export async function deleteCustomer(
  id: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
}

export async function getCustomerCount(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function getAtRiskCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        eq(customers.isChurned, false),
        sql`${customers.churnRisk} IN ('medium', 'high', 'critical')`
      )
    )
    .orderBy(desc(customers.churnRiskScore));
}

export async function getChurnedCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isChurned, true)))
    .orderBy(desc(customers.churnedAt));
}

export async function getTotalMrr(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ total: sql<string>`COALESCE(SUM(${customers.mrr}), 0)` })
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isChurned, false)));
  return parseFloat(result[0]?.total ?? "0");
}

// ─── Customer Health Score Helpers ──────────────────────────────────────────

export async function getLatestHealthScore(
  customerId: number,
  userId: number
): Promise<CustomerHealthScore | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customerHealthScores)
    .where(
      and(
        eq(customerHealthScores.customerId, customerId),
        eq(customerHealthScores.userId, userId)
      )
    )
    .orderBy(desc(customerHealthScores.computedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getHealthScoreHistory(
  customerId: number,
  userId: number,
  limit: number = 30
): Promise<CustomerHealthScore[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerHealthScores)
    .where(
      and(
        eq(customerHealthScores.customerId, customerId),
        eq(customerHealthScores.userId, userId)
      )
    )
    .orderBy(desc(customerHealthScores.computedAt))
    .limit(limit);
}

export async function createHealthScore(
  data: NewCustomerHealthScore
): Promise<CustomerHealthScore> {
  const db = await getDb();
  const [created] = await db
    .insert(customerHealthScores)
    .values(data)
    .returning();
  return created;
}

export async function getHealthScoresByUserId(
  userId: number
): Promise<CustomerHealthScore[]> {
  const db = await getDb();

  const subquery = db
    .select({
      customerId: customerHealthScores.customerId,
      maxComputedAt: sql<Date>`MAX(${customerHealthScores.computedAt})`.as(
        "maxComputedAt"
      ),
    })
    .from(customerHealthScores)
    .where(eq(customerHealthScores.userId, userId))
    .groupBy(customerHealthScores.customerId)
    .as("latest");

  return db
    .select({
      id: customerHealthScores.id,
      customerId: customerHealthScores.customerId,
      userId: customerHealthScores.userId,
      overallScore: customerHealthScores.overallScore,
      engagementScore: customerHealthScores.engagementScore,
      usageScore: customerHealthScores.usageScore,
      supportScore: customerHealthScores.supportScore,
      paymentScore: customerHealthScores.paymentScore,
      npsScore: customerHealthScores.npsScore,
      loginFrequency: customerHealthScores.loginFrequency,
      featureAdoptionRate: customerHealthScores.featureAdoptionRate,
      supportTicketsLast30Days:
        customerHealthScores.supportTicketsLast30Days,
      daysUntilRenewal: customerHealthScores.daysUntilRenewal,
      scoringVersion: customerHealthScores.scoringVersion,
      computedAt: customerHealthScores.computedAt,
      createdAt: customerHealthScores.createdAt,
    })
    .from(customerHealthScores)
    .innerJoin(
      subquery,
      and(
        eq(customerHealthScores.customerId, subquery.customerId),
        eq(customerHealthScores.computedAt, subquery.maxComputedAt)
      )
    )
    .where(eq(customerHealthScores.userId, userId));
}

// ─── Customer Event Helpers ──────────────────────────────────────────────────

export async function getCustomerEvents(
  customerId: number,
  userId: number,
  options?: { limit?: number; offset?: number; eventType?: string }
): Promise<CustomerEvent[]> {
  const db = await getDb();
  const conditions = [
    eq(customerEvents.customerId, customerId),
    eq(customerEvents.userId, userId),
  ];

  if (options?.eventType) {
    conditions.push(eq(customerEvents.eventType, options.eventType));
  }

  return db
    .select()
    .from(customerEvents)
    .where(and(...conditions))
    .orderBy(desc(customerEvents.occurredAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);
}

export async function createCustomerEvent(
  data: NewCustomerEvent
): Promise<CustomerEvent> {
  const db = await getDb();
  const [created] = await db.insert(customerEvents).values(data).returning();
  return created;
}

export async function bulkCreateCustomerEvents(
  data: NewCustomerEvent[]
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db.insert(customerEvents).values(data).returning();
}

export async function getRecentEventsByUserId(
  userId: number,
  limit: number = 50
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(eq(customerEvents.userId, userId))
    .orderBy(desc(customerEvents.occurredAt))
    .limit(limit);
}

export async function getEventCountByType(
  customerId: number,
  userId: number,
  eventType: string,
  since?: Date
): Promise<number> {
  const db = await getDb();
  const conditions = [
    eq(customerEvents.customerId, customerId),
    eq(customerEvents.userId, userId),
    eq(customerEvents.eventType, eventType),
  ];

  if (since) {
    conditions.push(gte(customerEvents.occurredAt, since));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(customerEvents)
    .where(and(...conditions));
  return Number(result[0]?.count ?? 0);
}

// ─── Churn Prediction Helpers ────────────────────────────────────────────────

export async function getLatestChurnPrediction(
  customerId: number,
  userId: number
): Promise<ChurnPrediction | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(churnPredictions)
    .where(
      and(
        eq(churnPredictions.customerId, customerId),
        eq(churnPredictions.userId, userId)
      )
    )
    .orderBy(desc(churnPredictions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getChurnPredictionsByUserId(
  userId: number,
  options?: {
    riskLevel?: "low" | "medium" | "high" | "critical";
    isActioned?: boolean;
    limit?: number;
  }
): Promise<ChurnPrediction[]> {
  const db = await getDb();
  const conditions = [eq(churnPredictions.userId, userId)];

  if (options?.riskLevel !== undefined) {
    conditions.push(eq(churnPredictions.riskLevel, options.riskLevel));
  }
  if (options?.isActioned !== undefined) {
    conditions.push(eq(churnPredictions.isActioned, options.isActioned));
  }

  return db
    .select()
    .from(churnPredictions)
    .where(and(...conditions))
    .orderBy(desc(churnPredictions.riskScore))
    .limit(options?.limit ?? 100);
}

export async function createChurnPrediction(
  data: NewChurnPrediction
): Promise<ChurnPrediction> {
  const db = await getDb();
  const [created] = await db
    .insert(churnPredictions)
    .values(data)
    .returning();
  return created;
}

export async function updateChurnPrediction(
  id: number,
  userId: number,
  data: Partial<Omit<ChurnPrediction, "id" | "createdAt">>
): Promise<ChurnPrediction> {
  const db = await getDb();
  const [updated] = await db
    .update(churnPredictions)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(churnPredictions.id, id), eq(churnPredictions.userId, userId))
    )
    .returning();
  return updated;
}

export async function markChurnPredictionActioned(
  id: number,
  userId: number
): Promise<ChurnPrediction> {
  const db = await getDb();
  const [updated] = await db
    .update(churnPredictions)
    .set({ isActioned: true, actionedAt: new Date()) }
  ])
  .where(eq(churnPredictions.id, id));

  return updated;
}
