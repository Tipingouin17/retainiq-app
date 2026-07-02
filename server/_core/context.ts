import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getAuth } from "@clerk/express";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    // getAuth reads the Clerk session from the Authorization header (Bearer token)
    // or from the __session cookie set by Clerk's frontend SDK.
    const auth = getAuth(opts.req);
    const clerkUserId = auth.userId;

    if (clerkUserId) {
      // Look up the user in our DB; auto-create if not yet synced via webhook
      let dbUser = await db.getUserByClerkId(clerkUserId);
      if (!dbUser) {
        // Lazy sync: create the user record on first authenticated request
        await db.upsertUser({
          clerkUserId,
          loginMethod: "clerk",
          lastSignedIn: new Date(),
        });
        dbUser = await db.getUserByClerkId(clerkUserId);
      } else {
        // Update lastSignedIn on each authenticated request (debounced in practice)
        await db.upsertUser({ clerkUserId, lastSignedIn: new Date() });
      }
      user = dbUser ?? null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
