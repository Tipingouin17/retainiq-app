#!/usr/bin/env node
/**
 * Vercel Output API build script
 *
 * Creates .vercel/output/ structure for deployment, bypassing @vercel/node
 * TypeScript compilation entirely. Uses esbuild to produce a fully-bundled
 * ESM function with a CJS shim for compatibility.
 */
import { execSync, spawnSync } from 'child_process';
import { mkdirSync, copyFileSync, writeFileSync, cpSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── Step 1: Build frontend with Vite ─────────────────────────────────────────
console.log('[build] Step 1: Building frontend with Vite...');
execSync('pnpm exec vite build', { cwd: ROOT, stdio: 'inherit' });

// ── Step 2: Build backend with esbuild (fully bundled, ESM + CJS shim) ───────
console.log('[build] Step 2: Building backend with esbuild...');
// Use spawnSync with array args to avoid shell quoting issues with the banner
const esbuildResult = spawnSync(
  'node_modules/.bin/esbuild',
  [
    'api/index.ts',
    '--platform=node',
    '--bundle',
    '--format=esm',
    // CJS shim: allows CJS packages (like dotenv) to use require() inside ESM bundle
    "--banner:js=import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    '--outfile=dist/api/index.js',
  ],
  { cwd: ROOT, stdio: 'inherit' }
);
if (esbuildResult.status !== 0) {
  console.error('[build] ❌ esbuild failed');
  process.exit(esbuildResult.status ?? 1);
}

// ── Step 3: Create Vercel Output API structure ────────────────────────────────
console.log('[build] Step 3: Creating Vercel Output API structure...');
const outputDir = join(ROOT, '.vercel', 'output');
const funcDir = join(outputDir, 'functions', 'api', 'server.func');

// Clean and recreate output directory
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true });
mkdirSync(funcDir, { recursive: true });
mkdirSync(join(outputDir, 'static'), { recursive: true });

// Copy static files (Vite frontend build)
const staticSrc = join(ROOT, 'dist', 'public');
if (existsSync(staticSrc)) {
  cpSync(staticSrc, join(outputDir, 'static'), { recursive: true });
  console.log('[build]   ✓ Static files copied from dist/public/');
} else {
  console.warn('[build]   ⚠ dist/public/ not found — static files skipped');
}

// Copy the bundled function
copyFileSync(join(ROOT, 'dist', 'api', 'index.js'), join(funcDir, 'index.js'));
console.log('[build]   ✓ Function bundle copied to .vercel/output/functions/api/server.func/');

// Write function runtime config
writeFileSync(
  join(funcDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: true,
      shouldAddSourcemapSupport: false,
    },
    null,
    2
  )
);
console.log('[build]   ✓ Function .vc-config.json written');

// Write output routes config
writeFileSync(
  join(outputDir, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // API routes → serverless function
        { src: '/api/(.*)', dest: '/api/server' },
        // Serve static files from .vercel/output/static/
        { handle: 'filesystem' },
        // SPA fallback → index.html
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2
  )
);
console.log('[build]   ✓ Output config.json written');

console.log('[build] ✅ Vercel Output API build complete!');
