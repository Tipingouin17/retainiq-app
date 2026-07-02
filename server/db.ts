import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, lte, gte, isNull, isNotNull } from "drizzle-orm";
import {
  users,
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
  type Subscription,
  type NewSubscription,
  type Customer,
  type NewCustomer,
  type HealthScoreConfig,
  type NewHealthScoreConfig,
  type CustomerHealthSnapshot,
  type NewCustomerHealthSnapshot,
  type CustomerEvent,
  type NewCustomerEvent,
  type Playbook,
  type NewPlaybook,
  type PlaybookAction,
  type NewPlaybookAction,
  type PlaybookRun,
  type NewPlaybookRun,
  type PlaybookRunActionLog,
  type NewPlaybookRunActionLog,
  type Task,
  type NewTask,
  type Integration,
  type NewIntegration,
  type Alert,
  type NewAlert,
  type NpsResponse,
  type NewNpsResponse,
  type RetentionMetric,
  type NewRetentionMetric,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function upsertUser(clerkId: string, email: string, name: string, avatarUrl?: string) {
  const db = await getDb();
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing.length > 0) {
    await db
      .update(users)
      .set({ email, name, avatarUrl: avatarUrl ?? null, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId));
    return existing[0];
  }
  const inserted = await db
    .insert(users)
    .values({ clerkId, email, name, avatarUrl: avatarUrl ?? null })
    .returning();
  return inserted[0];
}

export async function getUserByOpenId(clerkId: string) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return result[0] ?? null;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

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

export async function upsertSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Omit<NewSubscription, "id" | "createdAt" | "updatedAt">
): Promise<Subscription> {
  const db = await getDb();
  const existing = await getSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
  if (existing) {
    const updated = await updateSubscription(existing.id, data);
    return updated!;
  }
  return createSubscription(data);
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function getCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getCustomerByExternalId(userId: number, externalId: string): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.externalId, externalId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByEmail(userId: number, email: string): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.email, email)))
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
  data: Partial<Omit<Customer, "id" | "createdAt">>
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteCustomer(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.delete(customers).where(eq(customers.id, id)).returning();
  return result.length > 0;
}

export async function getAtRiskCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.healthStatus, "at_risk")))
    .orderBy(asc(customers.healthScore));
}

export async function getChurnedCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.healthStatus, "churned")))
    .orderBy(desc(customers.churndAt));
}

export async function getCustomerCountByUserId(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, userId));
  return result.length;
}

// ─── Health Score Configs ─────────────────────────────────────────────────────

export async function getHealthScoreConfigsByUserId(userId: number): Promise<HealthScoreConfig[]> {
  const db = await getDb();
  return db
    .select()
    .from(healthScoreConfigs)
    .where(eq(healthScoreConfigs.userId, userId))
    .orderBy(asc(healthScoreConfigs.factorType));
}

export async function getActiveHealthScoreConfigsByUserId(userId: number): Promise<HealthScoreConfig[]> {
  const db = await getDb();
  return db
    .select()
    .from(healthScoreConfigs)
    .where(and(eq(healthScoreConfigs.userId, userId), eq(healthScoreConfigs.isActive, true)))
    .orderBy(asc(healthScoreConfigs.factorType));
}

export async function getHealthScoreConfigById(id: number): Promise<HealthScoreConfig | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(healthScoreConfigs)
    .where(eq(healthScoreConfigs.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createHealthScoreConfig(data: NewHealthScoreConfig): Promise<HealthScoreConfig> {
  const db = await getDb();
  const result = await db.insert(healthScoreConfigs).values(data).returning();
  return result[0];
}

export async function updateHealthScoreConfig(
  id: number,
  data: Partial<Omit<HealthScoreConfig, "id" | "createdAt">>
): Promise<HealthScoreConfig | null> {
  const db = await getDb();
  const result = await db
    .update(healthScoreConfigs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(healthScoreConfigs.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteHealthScoreConfig(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(healthScoreConfigs)
    .where(eq(healthScoreConfigs.id, id))
    .returning();
  return result.length > 0;
}

// ─── Customer Health Snapshots ────────────────────────────────────────────────

export async function getHealthSnapshotsByCustomerId(
  customerId: number,
  limit = 30
): Promise<CustomerHealthSnapshot[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerHealthSnapshots)
    .where(eq(customerHealthSnapshots.customerId, customerId))
    .orderBy(desc(customerHealthSnapshots.snapshotAt))
    .limit(limit);
}

export async function getLatestHealthSnapshotByCustomerId(
  customerId: number
): Promise<CustomerHealthSnapshot | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(customerHealthSnapshots)
    .where(eq(customerHealthSnapshots.customerId, customerId))
    .orderBy(desc(customerHealthSnapshots.snapshotAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getHealthSnapshotsByUserId(
  userId: number,
  limit = 100
): Promise<CustomerHealthSnapshot[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerHealthSnapshots)
    .where(eq(customerHealthSnapshots.userId, userId))
    .orderBy(desc(customerHealthSnapshots.snapshotAt))
    .limit(limit);
}

export async function createHealthSnapshot(
  data: NewCustomerHealthSnapshot
): Promise<CustomerHealthSnapshot> {
  const db = await getDb();
  const result = await db.insert(customerHealthSnapshots).values(data).returning();
  return result[0];
}

// ─── Customer Events ──────────────────────────────────────────────────────────

export async function getCustomerEventsByCustomerId(
  customerId: number,
  limit = 50
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(eq(customerEvents.customerId, customerId))
    .orderBy(desc(customerEvents.occurredAt))
    .limit(limit);
}

export async function getCustomerEventsByUserId(
  userId: number,
  limit = 100
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(eq(customerEvents.userId, userId))
    .orderBy(desc(customerEvents.occurredAt))
    .limit(limit);
}

export async function getCustomerEventsByType(
  customerId: number,
  eventType: string
): Promise<CustomerEvent[]> {
  const db = await getDb();
  return db
    .select()
    .from(customerEvents)
    .where(
      and(eq(customerEvents.customerId, customerId), eq(customerEvents.eventType, eventType))
    )
    .orderBy(desc(customerEvents.occurredAt));
}

export async function createCustomerEvent(data: NewCustomerEvent): Promise<CustomerEvent> {
  const db = await getDb();
  const result = await db.insert(customerEvents).values(data).returning();
  return result[0];
}

export async function bulkCreateCustomerEvents(
  data: NewCustomerEvent[]
): Promise<CustomerEvent[]> {
  const db = await getDb();
  if (data.length === 0) return [];
  const result = await db.insert(customerEvents).values(data).returning();
  return result;
}

// ─── Playbooks ────────────────────────────────────────────────────────────────

export async function getPlaybooksByUserId(userId: number): Promise<Playbook[]> {
  const db = await getDb();
  return db
    .select()
    .from(playbooks)
    .where(eq(playbooks.userId, userId))
    .orderBy(desc(playbooks.createdAt));
}

export async function getActivePlaybooksByUserId(userId: number): Promise<Playbook[]> {
  const db = await getDb();
  return db
    .select()
    .from(playbooks)
    .where(and(eq(playbooks.userId, userId), eq(playbooks.status, "active")))
    .orderBy(desc(playbooks.createdAt));
}

export async function getPlaybookById(id: number): Promise<Playbook | null> {
  const db = await getDb();
  const result = await db.select().from(playbooks).where(eq(playbooks.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createPlaybook(data: NewPlaybook): Promise<Playbook> {
  const db = await getDb();
  const result = await db.insert(playbooks).values(data).returning();
  return result[0];
}

export async function updatePlaybook(
  id: number,
  data: Partial<Omit<Playbook, "id" | "createdAt">>
): Promise<Playbook | null> {
  const db = await getDb();
  const result = await db
    .update(playbooks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(playbooks.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deletePlaybook(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.delete(playbooks).where(eq(playbooks.id, id)).returning();
  return result.length > 0;
}

export async function incrementPlaybookRunCount(id: number): Promise<Playbook | null> {
  const db = await getDb();
  const existing = await getPlaybookById(id);
  if (!existing) return null;
  const result = await db
    .update(playbooks)
    .set({ runCount: existing.runCount + 1, updatedAt: new Date() })
    .where(eq(playbooks.id, id))
    .returning();
  return result[0] ?? null;
}

// ─── Playbook Actions ─────────────────────────────────────────────────────────

export async function getPlaybookActionsByPlaybookId(playbookId: number): Promise<PlaybookAction[]> {
  const db = await getDb();
  return db
    .select()
    .from(playbookActions)
    .where(eq(playbookActions.playbookId, playbookId))
    .orderBy(asc(playbookActions.actionOrder));
}

export async function getPlaybookActionById(id: number): Promise<PlaybookAction | null> {
  const db = await getDb();
  const result = await db
    .select()
    .from(playbookActions)
    .where(eq(playbookActions.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function createPlaybookAction(data: NewPlaybookAction): Promise<PlaybookAction> {
  const db = await getDb();
  const result = await db.insert(playbookActions).values(data).returning();
  return result[0];
}

export async function updatePlaybookAction(
  id: number,
  data: Partial<Omit<PlaybookAction, "id" | "createdAt">>
): Promise<PlaybookAction | null> {
  const db = await getDb();
  const result = await db
    .update(playbookActions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(playbookActions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deletePlaybookAction(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .delete(playbookActions)
    .where(eq(playbookActions.id, id))
    .returning();
  return result.length > 0;
}

export async function deletePlaybookActionsByPlaybookId(playbookId: number): Promise<boolean> {
  const db = await getDb();
  await db.delete(playbookActions).where(eq(playbookActions.playbookId, playbookId));
  return true;
}

// ─── Playbook Runs ────────────────────────────────────────────────────────────

export async function getPlaybookRunsByUserId(userId: number, limit = 50): Promise<PlaybookRun[]> {
  const db = await getDb();
  return db
    .select()
    .from(playbookRuns)