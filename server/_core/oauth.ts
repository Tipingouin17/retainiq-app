// Clerk webhook handler for user sync
// Replaces the old Manus OAuth callback route
import type { Express, Request, Response } from "express";
import * as db from "../db";

export function registerOAuthRoutes(app: Express) {
  // Clerk webhook: sync user creation/deletion events to the local DB
  // Configure this endpoint in Clerk Dashboard → Webhooks
  app.post("/api/clerk/webhook", async (req: Request, res: Response) => {
    try {
      const event = req.body;
      if (!event || !event.type) {
        res.status(400).json({ error: "Invalid webhook payload" });
        return;
      }

      if (event.type === "user.created" || event.type === "user.updated") {
        const userData = event.data;
        const clerkUserId = userData.id as string;
        const email = (userData.email_addresses?.[0]?.email_address as string) ?? null;
        const firstName = (userData.first_name as string) ?? "";
        const lastName = (userData.last_name as string) ?? "";
        const name = [firstName, lastName].filter(Boolean).join(" ") || null;

        await db.upsertUser({
          clerkUserId,
          name,
          email,
          loginMethod: "clerk",
          lastSignedIn: new Date(),
        });
      } else if (event.type === "user.deleted") {
        // Optionally handle user deletion
        const clerkUserId = event.data?.id as string;
        if (clerkUserId) {
          await db.deleteUserByClerkId(clerkUserId);
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Clerk Webhook] Error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
