import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, lt, gte, lte, isNull, or, sql } from "drizzle-orm";
import {
  users,
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
  integrations,
} from "../drizzle/schema";
import type {
  Subscription,
  NewSubscription,
  Customer,
  NewCustomer,
  HealthScoreConfig,
  NewHealthScoreConfig,
  HealthScoreHistory,
  NewHealthScoreHistory,
  CustomerEvent,
  NewCustomerEvent,
  Feature,
  NewFeature,
  CustomerFeatureUsage,
  NewCustomerFeatureUsage,
  Playbook,
  NewPlaybook,
  PlaybookStep,
  NewPlaybookStep,
  PlaybookExecution,
  NewPlaybookExecution,
  PlaybookStepExecution,
  NewPlaybookStepExecution,
  Task,
  NewTask,
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

// ─── Core User Functions (DO NOT MODIFY) ─────────────────────────────────────

export async function upsertUser(clerkId: string, email: string, name: string, avatarUrl?: string) {
  const db = await getDb();
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing.length > 0) {
    const updated = await db
      .update(users)
      .set({ email, name, avatarUrl, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId))
      .returning();
    return updated[0];
  }
  const inserted = await db
    .insert(users)
    .values({ clerkId, email, name, avatarUrl })
    .returning();
  return inserted[0];
}

export async function getUserByOpenId(clerkId: string) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return result[0] ?? null;
}

// ─── Subscription Helpers ─────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] ?? null;
}

export async function createSubscription(data: NewSubscription): Promise<Subscription> {
  const db = await getDb();
  const result = await db.insert(subscriptions).values(data).returning();
  return result[0];
}

export async function updateSubscription(
  id: number,
  data: Partial<Omit<Subscription, "id" | "createdAt">>
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function upsertSubscriptionByUserId(
  userId: number,
  data: Partial<NewSubscription>
): Promise<Subscription> {
  const db = await getDb();
  const existing = await getSubscriptionByUserId(userId);
  if (existing) {
    const updated = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, existing.id))
      .returning();
    return updated[0];
  }
  const inserted = await db
    .insert(subscriptions)
    .values({ userId, ...data } as NewSubscription)
    .returning();
  return inserted[0];
}

// ─── Customer Helpers ─────────────────────────────────────────────────────────

export async function getCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isActive, true)))
    .orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByExternalId(externalId: string, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.externalId, externalId), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByEmail(email: string, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.email, email), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createCustomer(data: NewCustomer): Promise<Customer> {
  const db = await getDb();
  const result = await db.insert(customers).values(data).returning();
  return result[0];
}

export async function updateCustomer(
  id: number,
  userId: number,
  data: Partial<Omit<Customer, "id" | "userId" | "createdAt">>
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function softDeleteCustomer(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .update(customers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result.length > 0;
}

export async function getAtRiskCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        eq(customers.isActive, true),
        or(
          eq(customers.healthStatus, "at_risk"),
          eq(customers.healthStatus, "critical")
        )
      )
    )
    .orderBy(asc(customers.healthScore));
}

export async function getChurnedCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        eq(customers.healthStatus, "churned")
      )
    )
    .orderBy(desc(customers.updatedAt));
}

export async function getCustomersWithUpcomingRenewals(
  userId: number,
  withinDays: number = 30
): Promise<Customer[]> {
  const db = await getDb();
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + withinDays);
  return db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        eq(customers.isActive, true),
        gte(customers.renewalDate, now),
        lte(customers.renewalDate, future)
      )
    )
    .orderBy(asc(customers.renewalDate));
}

export async function updateCustomerHealthScore(
  id: number,
  userId: number,
  score: number,
  healthStatus: "healthy" | "at_risk" | "critical" | "churned",
  churnRiskScore: string
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .update(customers)
    .set({
      healthScore: score,
      healthStatus,
      churnRiskScore,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function updateCustomerLastActivity(
  id: number,
  userId: number,
  activityType: "login" | "activity"
): Promise<void> {
  const db = await getDb();
  const now = new Date();
  const updateData: Partial<Customer> =
    activityType === "login"
      ? { lastLoginAt: now, lastActivityAt: now, updatedAt: now }
      : { lastActivityAt: now, updatedAt: now };
  await db
    .update(customers)
    .set(updateData)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
}

export async function getCustomerCountByHealthStatus(
  userId: number
): Promise<Record<string, number>> {
  const db = await getDb();
  const result = await db
    .select({
      healthStatus: customers.healthStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isActive, true)))
    .groupBy(customers.healthStatus);
  return result.reduce(
    (acc, row) => {
      acc[row.healthStatus] = row.count;
      return acc;
    },
    {} as Record<string, number>
  );
}

export async function getTotalMrrByUserId(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ total: sql<string>`coalesce(sum(mrr), 0)` })
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isActive, true)));
  return parseFloat(result[0]?.total ?? "0");
}

// ─── Health Score Config Helpers ──────────────────────────────────────────────

export async function getHealthScoreConfigsByUserId(userId: number): Promise<HealthScoreConfig[]> {
  const db = await getDb();
  return db
    .select()
    .from(healthScoreConfigs)
    .where(eq(healthScoreConfigs.userId, userId))
    .orderBy(desc(healthScoreConfigs.isDefault), asc(healthScoreConfigs.name));
}

export async function getDefaultHealthScoreConfig(userId: number): Promise<HealthScoreConfig | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(healthScoreConfigs)
    .where(and(eq(healthScoreConfigs.userId, userId), eq(healthScoreConfigs.isDefault, true)))
    .limit(1);
  return result[0] ?? null;
}

export async function getHealthScoreConfigById(id: number, userId: number): Promise<HealthScoreConfig | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(healthScoreConfigs)
    .where(and(eq(healthScoreConfigs.id, id), eq(healthScoreConfigs.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createHealthScoreConfig(data: NewHealthScoreConfig): Promise<HealthScoreConfig> {
  const db = await getDb();
  if (data.isDefault) {
    await db
      .update(healthScoreConfigs)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(healthScoreConfigs.userId, data.userId));
  }
  const result = await db.insert(healthScoreConfigs).values(data).returning();
  return result[0];
}

export async function updateHealthScoreConfig(
  id: number,
  userId: number,
  data: Partial<Omit<HealthScoreConfig, "id" | "userId" | "createdAt">>
): Promise<HealthScoreConfig | null> {
  const db = await getDb();
  if (data.isDefault) {
    await db
      .update(healthScoreConfigs)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(healthScoreConfigs.userId, userId), sql`${healthScoreConfigs.id} != ${id}`));
  }
  const result = await db
    .update(healthScoreConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(healthScoreConfigs.id, id), eq(healthScoreConfigs.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteHealthScoreConfig(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(healthScoreConfigs)
    .where(and(eq(healthScoreConfigs.id, id), eq(healthScoreConfigs.userId, userId)))
    .returning();
  return result.length > 0;
}

// ─── Health Score History Helpers ─────────────────────────────────────────────

export async function getHealthScoreHistoryByCustomerId(
  customerId: number,
  userId: number,
  limitRows: number = 90
): Promise<HealthScoreHistory[]> {
  const db = await getDb();
  return db
    .select()
    .from(healthScoreHistory)
    .where(and(eq(healthScoreHistory.customerId, customerId), eq(healthScoreHistory.userId, userId)))
    .orderBy(desc(healthScoreHistory.scoredAt))
    .limit(limitRows);
}

export async function createHealthScoreHistory(data: NewHealthScoreHistory): Promise<HealthScoreHistory> {
  const db = await getDb();
  const result = await db.insert(healthScoreHistory).values(data).returning();
  return result[0];
}

export async function getLatestHealthScoreForCustomer(
  customerId: number,
  userId: number
): Promise<HealthScoreHistory | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(healthScoreHistory)
    .where(and(eq(healthScoreHistory.customerId, customerId), eq(healthScoreHistory.userId, userId)))
    .orderBy(desc(healthScoreHistory.scoredAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getAverageHealthScoreByUserId(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ avg: sql<string>`coalesce(avg(${customers.healthScore}), 0)` })
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.isActive, true)));
  return parseFloat(result[0]?.avg ?? "0");
}

// ─── Customer Event Helpers ───────────────────────────────────────────────────

export async function getCustomerEvents(
  customerId: number,
  userId: number,
  limitRows: number = 50
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(and(eq(customerEvents.customerId, customerId), eq(customerEvents.userId, userId)))
    .orderBy(desc(customerEvents.occurredAt))
    .limit(limitRows);
}

export async function getCustomerEventsByType(
  customerId: number,
  userId: number,
  eventType: "login" | "feature_used" | "api_call" | "support_ticket" | "billing_event" | "custom"
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(
      and(
        eq(customerEvents.customerId, customerId),
        eq(customerEvents.userId, userId),
        eq(customerEvents.eventType, eventType)
      )
    )
    .orderBy(desc(customerEvents.occurredAt));
}

export async function createCustomerEvent(data: NewCustomerEvent): Promise<CustomerEvent> {
  const db = await getDb();
  const result = await db.insert(customerEvents).values(data).returning();
  return result[0];
}

export async function createCustomerEventsBatch(data: NewCustomerEvent[]): Promise<CustomerEvent[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  const result = await db.insert(customerEvents).values(data).returning();
  return result;
}

export async function getCustomerLoginCountSince(
  customerId: number,
  userId: number,
  since: Date
): Promise<number> {
  const db = await getDb();
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(customerEvents)
    .where(
      and(
        eq(customerEvents.customerId, customerId),
        eq(customerEvents.userId, userId),
