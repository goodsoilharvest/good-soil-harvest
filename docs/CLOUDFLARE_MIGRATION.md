# Good Soil Harvest — Vercel+Neon → Cloudflare Migration Plan

> Status: planning. Not started. Targeted for when Chris has a quiet weekend.
> Principle: move in phases, always with a rollback path, never big-bang.

## Why migrate

- **Vercel**: approaching 75% of free-tier image optimization transformations (5,000/mo). Will eventually force a paid plan.
- **Neon**: nudging toward Scale plan ($19/mo) for production readiness.
- **Long-term scale**: thousands of blog posts + subscribers eventually. Firebase Blaze has unpredictable costs; CF has predictable tiered pricing.
- **Stack consolidation**: Chris already lives on Cloudflare — Mission Control, Compass, Maximus, DNS. Reducing vendor count.

## Target stack

| Layer | From | To |
|---|---|---|
| Hosting | Vercel | **Cloudflare Pages** (`@cloudflare/next-on-pages`) |
| Database | Neon Postgres | **Cloudflare D1** (SQLite) |
| Auth | NextAuth + Prisma adapter | **Custom session cookies + bcrypt** (Compass pattern) |
| Image storage | Vercel Blob | **Cloudflare R2** (zero egress fees) |
| Image optimization | Vercel Image Opt | **In-house**: pre-compress at upload + `unoptimized: true` for `next/image` |
| DNS | Cloudflare | **Cloudflare** (no change) |
| Email (Resend) | Resend | **Resend** (no change; works on edge) |
| Stripe | Stripe | **Stripe** (webhook handler becomes a Worker route) |
| Push notifications | `web-push` (Node) | **Web Crypto-native** (Compass has this working) |

## Scale headroom

Confirmed CF free-tier handles:
- **10K+ blog posts** (100-500 MB in D1; free tier is 5 GB)
- **10K visitors/day × 5 pageviews** = 150K reads/day (free is 5M)
- **50K post views/day** = 50K writes (free is 100K)

Paid tier at $5/mo flat supports 500K+ active users. Vs Firebase: easily $200-500/mo at same load.

## Phased plan

### Phase 0 — Prep (manual, 30 min)

**Your steps:**
1. Back up Neon: `pg_dump` from the Neon console → save the dump file locally
2. Export current Vercel env vars (Settings → Environment Variables) → save to a password manager note
3. Export current Vercel blob file listing (if any critical images not in the repo)
4. Decide: keep the Cloudflare account goodsoilharvest.com already uses, or bundle into personal whysharon account? (Recommend: keep on current account unless moving to personal for simpler billing)

**Claude's steps:**
- Audit the 42 API routes: identify Node-only dependencies (filesystem, crypto.randomBytes usage, etc.)
- Produce a "routes compatibility report" — which will need edits for edge runtime

### Phase 1 — Hosting only (move off Vercel, keep Neon) — ~6-8 hrs

Goal: get the site running on Cloudflare Pages with the existing Neon database. Smallest possible change.

**Claude's work:**
1. Create `wrangler.toml` at repo root with Pages config
2. Install `@cloudflare/next-on-pages`
3. Add `pages:build` + `pages:deploy` scripts to `package.json`
4. Configure Prisma to use the **neon-serverless** driver over HTTP (already imported via `@prisma/adapter-neon` + `@neondatabase/serverless`) — this is the key enabler for edge runtime
5. Set every API route to `export const runtime = 'edge'`
6. Swap `web-push` → a Web Crypto–native implementation (port from Compass)
7. Audit `@vercel/blob` usage — keep it temporarily, migrate in Phase 3
8. Move `@vercel/analytics` → Cloudflare Web Analytics (CF has its own, free)
9. Deploy preview build to `<branch>.goodsoilharvest.pages.dev`
10. Side-by-side test: both Vercel and Pages build from the same branch

**Your manual steps:**
1. Create Cloudflare Pages project in dash → connect GitHub repo → configure build settings (`npm run pages:build`, output dir `.vercel/output/static`)
2. Add all env vars to Pages project (secrets): `DATABASE_URL`, `STRIPE_*`, `RESEND_API_KEY`, etc.
3. Smoke test the preview URL on your phone:
   - Home page loads
   - Sign-in flow (magic link email → verify → session cookie)
   - Blog post loads
   - Pricing page + Stripe checkout (test mode)
   - Admin routes gated correctly
4. **DNS cutover** (~5 min, reversible):
   - CF DNS: flip A/CNAME from Vercel to Pages
   - Propagation is instant on CF
   - Vercel keeps serving for 24-48 hrs via DNS TTL fallback; rollback = flip DNS back
5. Monitor for 48 hrs. Keep Vercel project alive 7 days as rollback.
6. Delete Vercel project once stable.

**Risks in this phase:**
- Next.js 15 edge runtime incompatibilities (~15% chance; will cost 1-2 hrs debugging per issue)
- Prisma + neon-serverless over HTTP has slightly different query semantics — most queries fine, edge cases need testing
- Middleware / ISR behavior differs; revalidation patterns may need adjustment

**Stop here if happy with result.** This alone gets you off Vercel Image Optimization (already doing `unoptimized: true` or removing from `next.config.js`). You're now paying $0 on Cloudflare + $0 on Neon free tier. Phase 2 is optional.

---

### Phase 2 — Database to D1 (optional, ~10-14 hrs)

Goal: escape Neon entirely; go full Cloudflare.

**Claude's work:**
1. Generate SQLite-compatible schema from `prisma/schema.prisma`:
   - Postgres enums → TEXT columns with CHECK constraints
   - `DateTime` → TEXT (ISO 8601 strings)
   - `cuid()` → a helper function
   - `@unique` → UNIQUE indexes
   - `onDelete: Cascade` → native SQLite FK with `ON DELETE CASCADE`
2. Write migration 0001 in `migrations/` (D1 format)
3. Export Neon data via `pg_dump`, convert to SQLite INSERT statements (a script)
4. Decision point: **keep Prisma with the `@prisma/adapter-d1` (preview)** OR **drop Prisma, use raw D1 queries** (Compass pattern)
   - If Chris picks "drop Prisma": port all 42 routes to raw queries (~8 hrs)
   - If Chris picks "keep Prisma": use the preview D1 adapter (~2 hrs, some rough edges)
5. Update NextAuth Prisma adapter → custom session cookies (Compass pattern) — ~4 hrs
6. All queries/mutations tested against staging D1 before prod cutover

**Your manual steps:**
1. `wrangler d1 create good-soil-harvest` in the project's CF account
2. Paste the `database_id` into `wrangler.toml`
3. Apply migrations locally, then: `wrangler d1 migrations apply good-soil-harvest --remote`
4. Run the data-migration script to populate from Neon dump: `wrangler d1 execute good-soil-harvest --remote --file=neon_export.sql`
5. Update `DATABASE_URL` in CF Pages → point to D1 (or remove if going raw queries)
6. Redeploy preview; smoke-test:
   - Sign-in (existing users' bcrypt hashes carry over — bcrypt works in edge runtime)
   - Stripe webhook receives + writes correctly
   - Post views, likes, feedback — all the write paths
7. Cut over prod. Keep Neon alive 14 days as rollback.
8. Delete Neon project.

**Risks in this phase:**
- Schema conversion gotchas (enums, cascades, datetime comparison) — have a test suite for each model
- Prisma D1 adapter is still preview; some relations or includes may fail
- NextAuth removal requires careful session flow testing — sign-out, session refresh, admin-role gating

---

### Phase 3 — Images + storage (optional, ~3-4 hrs)

Goal: kill the Vercel Blob dependency.

**Claude's work:**
1. `@vercel/blob` → **Cloudflare R2**: replace upload + delete + list calls
2. R2 public URL pattern: either a bound R2 bucket served via Worker, OR a custom domain on R2
3. Pre-compress images at upload time using `sharp` (already a devDep): resize to max 1600px wide, generate WebP variant, store both
4. Update admin post-editor to use the new upload endpoint
5. `next.config.js`: `images.unoptimized = true` (if not already)

**Your manual steps:**
1. `wrangler r2 bucket create goodsoil-assets` in the CF account
2. Set public access policy (or set up a custom domain like `assets.goodsoilharvest.com`)
3. Migrate existing Vercel Blob images: dump list → download → upload to R2 (script)
4. Update any DB rows pointing to `*.vercel-storage.com` URLs → point to R2 URL

**Risks in this phase:**
- Images on existing blog posts need URL rewrites (script)
- Any hardcoded Vercel Blob URLs in MDX need updating

---

## Rollback strategy (all phases)

- Phase 1: flip DNS back to Vercel. Site resumes in <60 seconds.
- Phase 2: swap `DATABASE_URL` back to Neon, redeploy. Data loss = changes in the window between D1 writes and rollback; minimal if cutover is brief.
- Phase 3: update image URLs in DB back to Vercel Blob originals.

## Timeline (realistic)

- **Weekend 1**: Phase 0 + Phase 1 (get hosting moved). Vercel cost → $0.
- **Weekend 2**: Phase 2 (optional — get full CF native). Neon cost → $0.
- **Weekend 3 or later**: Phase 3 (when image quota matters).

You do NOT have to do all three. Phase 1 alone kills the Vercel pressure. Phases 2 + 3 are "nice to have" full-CF consolidation.

## Claude vs Chris — division of labor

| Task type | Owner |
|---|---|
| Code changes (worker.js, API routes, migrations, schema conversion) | Claude |
| Local test / preview deploy | Claude |
| Account creation on CF (R2 bucket, D1 DB) | Chris |
| Secret setting in CF dashboard | Chris |
| DNS cutover (this is on you — reversible decision point) | Chris |
| Data migration execution (pg_dump, restore) | Chris runs, Claude writes scripts |
| Domain/SSL verification after cutover | Chris |
| Deleting the old platforms (Vercel/Neon) | Chris (final irreversible step) |

## Before you start

Questions to answer:
1. Are there any Vercel-specific features the site relies on that I haven't accounted for? (Vercel Speed Insights, Vercel Cron Jobs, etc.)
2. Are there any post-IDs or URLs already published/indexed that would break with a DB migration? (Usually no — slug-based URLs survive; only internal IDs matter)
3. Timeline: which weekend works? Target a stretch with no other launches planned.
