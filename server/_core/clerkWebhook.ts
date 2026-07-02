/**
 * Clerk Webhook Handler
 *
 * Handles Clerk webhook events to keep the local users table in sync.
 * Supported events:
 *   - user.created  → upsert user row
 *   - user.updated  → update display name / email
 *   - user.deleted  → soft-delete or remove user row
 *
 * Setup:
 *   1. Add CLERK_WEBHOOK_SECRET to environment variables (from Clerk Dashboard → Webhooks).
 *   2. Register this route in server/_core/index.ts (already done).
 *   3. In the Clerk Dashboard, create a webhook endpoint pointing to
 *      https://<your-domain>/api/webhooks/clerk and subscribe to
 *      user.created, user.updated, user.deleted.
 */

import type { Request, Response } from "express";
import { Webhook } from "svix";
import { ENV } from "./env";
import * as db from "../db";

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: Array<{ email_address: string; id: string }>;
  primary_email_address_id: string | null;
  image_url: string | null;
  created_at: number;
  updated_at: number;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

export async function handleClerkWebhook(req: Request, res: Response) {
  const webhookSecret = ENV.clerkWebhookSecret;

  if (!webhookSecret) {
    console.error("[ClerkWebhook] CLERK_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  // Verify the webhook signature using svix
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;
  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    // req.body must be the raw Buffer — ensure express.raw() is used for this route
    const payload =
      typeof req.body === "string"
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString("utf8")
          : JSON.stringify(req.body);

    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("[ClerkWebhook] Signature verification failed:", err);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = event;
  console.log(`[ClerkWebhook] Received event: ${type} for user ${data.id}`);

  try {
    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id
      );
      const displayName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
        primaryEmail?.email_address ||
        data.id;

      await db.upsertUser({
        clerkUserId: data.id,
        name: displayName,
        loginMethod: "clerk",
        lastSignedIn: new Date(data.updated_at),
      });

      console.log(
        `[ClerkWebhook] Upserted user ${data.id} (${displayName}) via ${type}`
      );
    } else if (type === "user.deleted") {
      // Soft-delete: mark the user as inactive rather than hard-deleting
      // to preserve referential integrity with other tables.
      await db.deleteUserByClerkId(data.id);
      console.log(`[ClerkWebhook] Deleted user ${data.id}`);
    } else {
      console.log(`[ClerkWebhook] Unhandled event type: ${type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`[ClerkWebhook] Error processing ${type}:`, err);
    return res.status(500).json({ error: "Internal error processing webhook" });
  }
}
