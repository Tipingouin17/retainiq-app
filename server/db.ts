import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

export async function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  db = drizzle(pool, { schema });
  return db;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

export { db };
export type Db = ReturnType<typeof drizzle>;