import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../drizzle/schema";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
import {
  users,
  customers,
  healthScoreConfigs,
  churnPredictions,
  playbooks,
  playbookSteps,
  playbookRuns,
  integrations,
} from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (db) return db;

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    connect_timeout: 10,
  });

  await client.connect();
  db = drizzle(client, { schema });
  return db;
}

export type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

// ─── Customer Helpers ────────────────────────────────────────────────────────

export async function getCustomersByUserId(userId: string) {
  const db = await getDb();
  return db!
    .select()
    .from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.createdAt));
}

export async function getCustomerById(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)));
  return result[0] || null;
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const db = await getDb();
  const result = await db!.insert(customers).values(data).returning();
  return result[0];
}

export async function updateCustomer(
  id: string,
  userId: string,
  data: Partial<typeof customers.$inferInsert>
) {
  const db = await getDb();
  const result = await db!
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] || null;
}

export async function deleteCustomer(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .returning();
  return result[0] || null;
}

// ─── Health Score Config Helpers ─────────────────────────────────────────────

export async function getHealthScoreConfigByUserId(userId: string) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(healthScoreConfigs)
    .where(eq(healthScoreConfigs.userId, userId));
  return result[0] || null;
}

export async function upsertHealthScoreConfig(
  userId: string,
  data: Partial<typeof healthScoreConfigs.$inferInsert>
) {
  const db = await getDb();
  const existing = await getHealthScoreConfigByUserId(userId);
  if (existing) {
    const result = await db!
      .update(healthScoreConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(healthScoreConfigs.userId, userId))
      .returning();
    return result[0];
  } else {
    const result = await db!
      .insert(healthScoreConfigs)
      .values({ userId, ...data } as typeof healthScoreConfigs.$inferInsert)
      .returning();
    return result[0];
  }
}

// ─── Churn Prediction Helpers ─────────────────────────────────────────────────

export async function getChurnPredictionsByUserId(userId: string) {
  const db = await getDb();
  return db!
    .select()
    .from(churnPredictions)
    .where(eq(churnPredictions.userId, userId))
    .orderBy(desc(churnPredictions.predictedAt));
}

export async function getChurnPredictionByCustomerId(
  customerId: string,
  userId: string
) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(churnPredictions)
    .where(
      and(
        eq(churnPredictions.customerId, customerId),
        eq(churnPredictions.userId, userId)
      )
    )
    .orderBy(desc(churnPredictions.predictedAt));
  return result[0] || null;
}

export async function createChurnPrediction(
  data: typeof churnPredictions.$inferInsert
) {
  const db = await getDb();
  const result = await db!.insert(churnPredictions).values(data).returning();
  return result[0];
}

// ─── Playbook Helpers ─────────────────────────────────────────────────────────

export async function getPlaybooksByUserId(userId: string) {
  const db = await getDb();
  return db!
    .select()
    .from(playbooks)
    .where(eq(playbooks.userId, userId))
    .orderBy(desc(playbooks.createdAt));
}

export async function getPlaybookById(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(playbooks)
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)));
  return result[0] || null;
}

export async function createPlaybook(data: typeof playbooks.$inferInsert) {
  const db = await getDb();
  const result = await db!.insert(playbooks).values(data).returning();
  return result[0];
}

export async function updatePlaybook(
  id: string,
  userId: string,
  data: Partial<typeof playbooks.$inferInsert>
) {
  const db = await getDb();
  const result = await db!
    .update(playbooks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)))
    .returning();
  return result[0] || null;
}

export async function deletePlaybook(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .delete(playbooks)
    .where(and(eq(playbooks.id, id), eq(playbooks.userId, userId)))
    .returning();
  return result[0] || null;
}

// ─── Playbook Step Helpers ────────────────────────────────────────────────────

export async function getPlaybookStepsByPlaybookId(
  playbookId: string,
  userId: string
) {
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

export async function createPlaybookStep(
  data: typeof playbookSteps.$inferInsert
) {
  const db = await getDb();
  const result = await db!.insert(playbookSteps).values(data).returning();
  return result[0];
}

export async function updatePlaybookStep(
  id: string,
  userId: string,
  data: Partial<typeof playbookSteps.$inferInsert>
) {
  const db = await getDb();
  const result = await db!
    .update(playbookSteps)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, userId)))
    .returning();
  return result[0] || null;
}

export async function deletePlaybookStep(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .delete(playbookSteps)
    .where(and(eq(playbookSteps.id, id), eq(playbookSteps.userId, userId)))
    .returning();
  return result[0] || null;
}

// ─── Playbook Run Helpers ─────────────────────────────────────────────────────

export async function getPlaybookRunsByUserId(userId: string) {
  const db = await getDb();
  return db!
    .select()
    .from(playbookRuns)
    .where(eq(playbookRuns.userId, userId))
    .orderBy(desc(playbookRuns.startedAt));
}

export async function getPlaybookRunsByPlaybookId(
  playbookId: string,
  userId: string
) {
  const db = await getDb();
  return db!
    .select()
    .from(playbookRuns)
    .where(
      and(
        eq(playbookRuns.playbookId, playbookId),
        eq(playbookRuns.userId, userId)
      )
    )
    .orderBy(desc(playbookRuns.startedAt));
}

export async function createPlaybookRun(data: typeof playbookRuns.$inferInsert) {
  const db = await getDb();
  const result = await db!.insert(playbookRuns).values(data).returning();
  return result[0];
}

export async function updatePlaybookRun(
  id: string,
  userId: string,
  data: Partial<typeof playbookRuns.$inferInsert>
) {
  const db = await getDb();
  const result = await db!
    .update(playbookRuns)
    .set({ ...data })
    .where(and(eq(playbookRuns.id, id), eq(playbookRuns.userId, userId)))
    .returning();
  return result[0] || null;
}

// ─── Integration Helpers ──────────────────────────────────────────────────────

export async function getIntegrationsByUserId(userId: string) {
  const db = await getDb();
  return db!
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .orderBy(desc(integrations.createdAt));
}

export async function getIntegrationById(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .select()
    .from(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.userId, userId)));
  return result[0] || null;
}

export async function createIntegration(
  data: typeof integrations.$inferInsert
) {
  const db = await getDb();
  const result = await db!.insert(integrations).values(data).returning();
  return result[0];
}

export async function updateIntegration(
  id: string,
  userId: string,
  data: Partial<typeof integrations.$inferInsert>
) {
  const db = await getDb();
  const result = await db!
    .update(integrations)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
    .returning();
  return result[0] || null;
}

export async function deleteIntegration(id: string, userId: string) {
  const db = await getDb();
  const result = await db!
    .delete(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.userId, userId)))
    .returning();
  return result[0] || null;
}

export default getDb;
