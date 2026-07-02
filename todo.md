
## Phase 2 Features

- [x] Add Clerk webhook endpoint (POST /api/webhooks/clerk) using svix for signature verification
- [x] Handle user.created event: upsert user row into DB using clerkUserId
- [x] Add CLERK_WEBHOOK_SECRET env var to template and scaffold_engine.py
- [x] Wire menudirect-app Dashboard with real menu management tRPC procedures
- [x] Add menuItems table to drizzle schema (id, name, description, price, category, available)
- [x] Add CRUD tRPC procedures for menu items (list, create, update, delete)
- [x] Build Dashboard UI with menu item table, add/edit/delete modals
- [x] Test full scaffold flow end-to-end (InvoiceAI triggered, approved, built to live status)

## Phase 2 Bug Fixes

- [x] Fix CLERK_SECRET_KEY not set in agent-runner Cloud Run service
- [x] Fix svix not in template_snapshot pnpm-lock.yaml (regenerated snapshot)
- [x] Fix asyncpg UnboundLocalError from local import shadowing module-level import
- [x] Fix Clerk allowed_origins for aibce-menudirect.vercel.app and Cloud Run frontend URL
- [x] Fix Temporal WorkflowIDReusePolicy ALLOW_DUPLICATE for retry builds (backend revision 00110-t87)
- [x] Verify InvoiceAI scaffold deploys successfully with new agent-runner build (pnpm install fix)
- [x] Fix admin.py signal mismatch: qa_approved/qa_rejected → human_approval (backend revision 00120-8nj)
- [x] Fix _build_package_json in scaffold_engine.py to include all Clerk/svix/cmdk packages (agent-runner 00088-j8w)
- [x] Fix invoiceai-app package.json directly to unblock current Vercel build
- [x] InvoiceAI Temporal workflow completed successfully (workflow status: Completed)
- [x] Set up Clerk webhook in Clerk Dashboard and add CLERK_WEBHOOK_SECRET to menudirect-app Vercel env
  (Clerk Dashboard → Webhooks → endpoint: https://aibce-menudirect.vercel.app/api/webhooks/clerk, user.created event)
