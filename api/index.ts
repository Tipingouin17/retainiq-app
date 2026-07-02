// Vercel serverless function entry point
// This file is compiled by @vercel/node and serves as the Express app handler

import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Clerk middleware — attaches auth state to every request
app.use(clerkMiddleware());

registerStorageProxy(app);
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static files from dist/public (built by vite)
// In Vercel, the static files are included via vercel.json includeFiles
const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  app.use("*", (_req, res) => {
    res.status(503).json({ error: "Frontend not built. Run npm run build first." });
  });
}

export default app;
