import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  db = drizzle(client, { schema });
  return db;
}

export type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export default getDb;