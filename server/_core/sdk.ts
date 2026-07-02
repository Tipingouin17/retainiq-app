// Clerk backend auth helper
// Replaces the old Manus OAuth SDK
import { createClerkClient } from "@clerk/express";
import { ENV } from "./env";

export const clerkClient = createClerkClient({
  secretKey: ENV.clerkSecretKey,
});
