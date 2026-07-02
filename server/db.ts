import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, lt, gt, gte, lte, sql } from "drizzle-orm";
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
  type Subscription,
  type NewSubscription,
  type Customer,
  type NewCustomer,
  type HealthScoreFactor,
  type NewHealthScoreFactor,
  type HealthScoreHistory,
  type NewHealthScoreHistory,
  type Playbook,
  type NewPlaybook,
  type PlaybookStep,
  type NewPlaybookStep,
  type PlaybookRun,
  type NewPlaybookRun,
  type PlaybookStepRun,
  type NewPlaybookStepRun,
  type CustomerEvent,
  type NewCustomerEvent,
  type Task,
  type NewTask,
  type Alert,
  type NewAlert,
  type Integration,
  type NewIntegration,
  type ScoringRule,
  type NewScoringRule,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  }
  return db;
}

export async function upsertUser(clerkId: string, email: string, name: string, imageUrl?: string) {
  const db = await getDb();
  const existing = await db!
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    const updated = await db!
      .update(schema.users)
      .set({ email, name, imageUrl, updatedAt: new Date() })
      .where(eq(schema.users.clerkId, clerkId))
      .returning();
    return updated[0];
  } else {
    const inserted = await db!
      .insert(schema.users)
      .values({ clerkId, email, name, imageUrl })
      .returning();
    return inserted[0];
  }
}

export async function getUserByOpenId(clerkId: string) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, clerkId))
    .limit(1);
  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export async function getSubscriptionByUserId(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
  return result[0] ?? null;
}

export async function createSubscription(data: NewSubscription): Promise<Subscription> {
  const db = await getDb();
  const result = await db!.insert(subscriptions).values(data).returning();
  return result[0];
}

export async function updateSubscription(
  id: number,
  data: Partial<Omit<NewSubscription, "id" | "userId" | "createdAt">>
): Promise<Subscription | null> {
  const db = await getDb();
  const result = await db!
    .update(subscriptions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(subscriptions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function upsertSubscriptionByUserId(
  userId: number,
  data: Omit<NewSubscription, "userId" | "createdAt" | "updatedAt">
): Promise<Subscription> {
  const db = await getDb();
  const existing = await getSubscriptionByUserId(userId);
  if (existing) {
    const updated = await db!
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return updated[0];
  }
  const inserted = await db!
    .insert(subscriptions)
    .values({ ...data, userId })
    .returning();
  return inserted[0];
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function getCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db!
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: number, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByEmail(email: string, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(customers)
    .where(and(eq(customers.email, email), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getCustomerByExternalId(externalId: string, userId: number): Promise<Customer | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(customers)
    .where(and(eq(customers.externalId, externalId), eq(customers.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getAtRiskCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db!
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, userId),
        sql`${customers.healthStatus} IN ('at_risk', 'critical')`
      )
    )
    .orderBy(asc(customers.healthScore));
}

export async function getChurnedCustomers(userId: number): Promise<Customer[]> {
  const db = await getDb();
  return db!
    .select()
    .from(customers)
    .where(and(eq(customers.userId, userId), eq(customers.healthStatus, "churned")))
    .orderBy(desc(customers.churnedAt));
}

export async function createCustomer(data: NewCustomer): Promise<Customer> {
  const db = await getDb();
  const result = await db!.insert(customers).values(data).returning();
  return result[0];
}

export async function updateCustomer(
  id: number,
  userId: number,
  data: Partial<Omit<NewCustomer, "id" | "userId" | "createdAt">>
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db!
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function updateCustomerHealthScore(
  id: number,
  userId: number,
  healthScore: number,
  healthStatus: Customer["healthStatus"],
  churnProbability: string
): Promise<Customer | null> {
  const db = await getDb();
  const result = await db!
    .update(customers)
    .set({ healthScore, healthStatus, churnProbability, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteCustomer(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db!
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result.length > 0;
}

export async function getCustomerCountByUserId(userId: number): Promise<number> {
  const db = await getDb();
  const result = await db!
    .select({ count: sql<number>`count(*)::int` })
    .from(customers)
    .where(eq(customers.userId, userId));
  return result[0]?.count ?? 0;
}

export async function getTotalMrrByUserId(userId: number): Promise<string> {
  const db = await getDb();
  const result = await db!
    .select({ total: sql<string>`COALESCE(SUM(${customers.mrr}), 0)::text` })
    .from(customers)
    .where(and(eq(customers.userId, userId), sql`${customers.healthStatus} != 'churned'`));
  return result[0]?.total ?? "0";
}

// ---------------------------------------------------------------------------
// Health Score Factors
// ---------------------------------------------------------------------------

export async function getHealthScoreFactorsByCustomerId(
  customerId: number,
  userId: number
): Promise<HealthScoreFactor[]> {
  const db = await getDb();
  return db!
    .select()
    .from(healthScoreFactors)
    .where(
      and(
        eq(healthScoreFactors.customerId, customerId),
        eq(healthScoreFactors.userId, userId)
      )
    )
    .orderBy(desc(healthScoreFactors.scoredAt));
}

export async function getLatestHealthScoreFactorsByCustomerId(
  customerId: number,
  userId: number
): Promise<HealthScoreFactor[]> {
  const db = await getDb();
  return db!
    .select()
    .from(healthScoreFactors)
    .where(
      and(
        eq(healthScoreFactors.customerId, customerId),
        eq(healthScoreFactors.userId, userId)
      )
    )
    .orderBy(desc(healthScoreFactors.scoredAt))
    .limit(20);
}

export async function createHealthScoreFactor(data: NewHealthScoreFactor): Promise<HealthScoreFactor> {
  const db = await getDb();
  const result = await db!.insert(healthScoreFactors).values(data).returning();
  return result[0];
}

export async function createHealthScoreFactorsBatch(data: NewHealthScoreFactor[]): Promise<HealthScoreFactor[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  return db!.insert(healthScoreFactors).values(data).returning();
}

export async function deleteHealthScoreFactorsByCustomerId(
  customerId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  await db!
    .delete(healthScoreFactors)
    .where(
      and(
        eq(healthScoreFactors.customerId, customerId),
        eq(healthScoreFactors.userId, userId)
      )
    );
}

// ---------------------------------------------------------------------------
// Health Score History
// ---------------------------------------------------------------------------

export async function getHealthScoreHistoryByCustomerId(
  customerId: number,
  userId: number,
  limit = 90
): Promise<HealthScoreHistory[]> {
  const db = await getDb();
  return db!
    .select()
    .from(healthScoreHistory)
    .where(
      and(
        eq(healthScoreHistory.customerId, customerId),
        eq(healthScoreHistory.userId, userId)
      )
    )
    .orderBy(desc(healthScoreHistory.snapshotAt))
    .limit(limit);
}

export async function createHealthScoreHistorySnapshot(data: NewHealthScoreHistory): Promise<HealthScoreHistory> {
  const db = await getDb();
  const result = await db!.insert(healthScoreHistory).values(data).returning();
  return result[0];
}

export async function createHealthScoreHistoryBatch(data: NewHealthScoreHistory[]): Promise<HealthScoreHistory[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  return db!.insert(healthScoreHistory).values(data).returning();
}

export async function getLatestHealthScoreSnapshot(
  customerId: number,
  userId: number
): Promise<HealthScoreHistory | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(healthScoreHistory)
    .where(
      and(
        eq(healthScoreHistory.customerId, customerId),
        eq(healthScoreHistory.userId, userId)
      )
    )
    .orderBy(desc(healthScoreHistory.snapshotAt))
    .limit(1);
  return result[0] ?? null;
}

// ---------------------------------------------------------------------------
// Playbooks
// ---------------------------------------------------------------------------

export async function getPlaybooksByUserId(userId: number): Promise<Playbook[]> {
  const db = await getDb();
  return db!
    .select()
    .from(playbooks)
    .where(eq(playbooks.userId, userId))
    .orderBy(desc(playbooks.createdAt));
}

export async function getPlaybookById(id: number, userId: number): Promise<Playbook | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(playbooks)
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getActivePlaybooksByUserId(userId: number): Promise<Playbook[]> {
  const db = await getDb();
  return db!
    .select()
    .from(playbooks)
    .where(and(eq(playbooks.userId, userId), eq(playbooks.status, "active")))
    .orderBy(asc(playbooks.name));
}

export async function createPlaybook(data: NewPlaybook): Promise<Playbook> {
  const db = await getDb();
  const result = await db!.insert(playbooks).values(data).returning();
  return result[0];
}

export async function updatePlaybook(
  id: number,
  userId: number,
  data: Partial<Omit<NewPlaybook, "id" | "userId" | "createdAt">>
): Promise<Playbook | null> {
  const db = await getDb();
  const result = await db!
    .update(playbooks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function incrementPlaybookRunCount(id: number, userId: number): Promise<void> {
  const db = await getDb();
  await db!
    .update(playbooks)
    .set({
      runCount: sql`${playbooks.runCount} + 1`,
      lastRunAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)));
}

export async function deletePlaybook(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db!
    .delete(playbooks)
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)))
    .returning();
  return result.length > 0;
}

// ---------------------------------------------------------------------------
// Playbook Steps
// ---------------------------------------------------------------------------

export async function getPlaybookStepsByPlaybookId(
  playbookId: number,
  userId: number
): Promise<PlaybookStep[]> {
  const db = await getDb();
  return db!
    .select()
    .from(playbookSteps)
    .where(
      and(
        eq(playbookSteps.playbookId, playbookId),
        eq(playbookSteps.userId, userId)
      )
    )
    .orderBy(asc(playbookSteps.stepOrder));
}

export async function getPlaybookStepById(id: number, userId: number): Promise<PlaybookStep | null> {
  const db = await getDb();
  const result = await db!
    .select()
    .from(playbookSteps)
    .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createPlaybookStep(data: NewPlaybookStep): Promise<PlaybookStep> {
  const db = await getDb();
  const result = await db!.insert(playbookSteps).values(data).returning();
  return result[0];
}

export async function createPlaybookStepsBatch(data: NewPlaybookStep[]): Promise<PlaybookStep[]> {
  if (data.length === 0) return [];
  const db = await getDb();
  return db!.insert(playbookSteps).values(data).returning();
}

export async function updatePlaybookStep(
  id: number,
  userId: number,
  data: Partial<Omit<NewPlaybookStep, "id" | "userId" | "playbookId" | "createdAt">>
): Promise<PlaybookStep | null> {
  const db = await getDb();
  const result = await db!
    .update(playbookSteps)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deletePlaybookStep(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  const result = await db!
    .delete(playbookSteps)
    .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, userId)))