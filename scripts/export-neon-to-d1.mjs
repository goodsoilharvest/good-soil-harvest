#!/usr/bin/env node
// ============================================================================
// Neon → D1 export script
// ============================================================================
// Reads from Neon Postgres, emits a SQLite-compatible .sql file with INSERTs
// matching the D1 schema in migrations/0001_init.sql.
//
// Usage:
//   node scripts/export-neon-to-d1.mjs > neon_export.sql
//
// Then apply to D1:
//   wrangler d1 execute good-soil-harvest --remote --file=neon_export.sql
//
// Requires: DATABASE_URL set in env (point at Neon prod or a Neon branch).
// Read-only; safe to run against prod Neon.
// ============================================================================

import { Client } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set. Source .env first.");
  process.exit(1);
}

// Postgres → SQLite conversion notes per column:
// - String/text → quoted, escape single quotes by doubling
// - Boolean → 0 or 1 (CHECK constraints in D1 enforce this)
// - DateTime → ISO 8601 quoted string. Postgres returns Date objects via pg.
// - null → SQL NULL
// - Enums → quoted text values (already match D1 CHECK lists)
function sqlEscape(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return "NULL";
    return String(v);
  }
  if (v instanceof Date) return `'${v.toISOString().replace("T", " ").slice(0, 19)}'`;
  // Strings + everything else
  return `'${String(v).replace(/'/g, "''")}'`;
}

// Mapping: Postgres table → SQLite table + column rename map.
// Prisma defaults to camelCase column names with @@map override; for this
// schema there are no @@map directives, so columns are camelCase. We need
// snake_case for D1.
const TABLES = [
  {
    pg: "User",
    sqlite: "users",
    cols: {
      id: "id",
      email: "email",
      passwordHash: "password_hash",
      role: "role",
      emailVerified: "email_verified",
      verifyToken: "verify_token",
      verifyTokenExp: "verify_token_exp",
      resetToken: "reset_token",
      resetTokenExp: "reset_token_exp",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  {
    pg: "Session",
    sqlite: "sessions",
    cols: {
      id: "id",
      userId: "user_id",
      token: "token",
      expiresAt: "expires_at",
      createdAt: "created_at",
    },
  },
  {
    pg: "Subscription",
    sqlite: "subscriptions",
    cols: {
      id: "id",
      userId: "user_id",
      stripeCustomerId: "stripe_customer_id",
      stripeSubscriptionId: "stripe_subscription_id",
      status: "status",
      plan: "plan",
      currentPeriodEnd: "current_period_end",
      trialEnd: "trial_end",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  {
    pg: "Post",
    sqlite: "posts",
    cols: {
      id: "id",
      slug: "slug",
      title: "title",
      description: "description",
      content: "content",
      niche: "niche",
      isPremium: "is_premium",
      isDeepRoots: "is_deep_roots",
      featuredImage: "featured_image",
      references: "refs",          // SQLite reserved word → renamed
      status: "status",
      publishedAt: "published_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  {
    pg: "PostLike",
    sqlite: "post_likes",
    cols: { id: "id", userId: "user_id", postId: "post_id", likedAt: "liked_at" },
  },
  {
    pg: "PostView",
    sqlite: "post_views",
    cols: { id: "id", userId: "user_id", postId: "post_id", viewedAt: "viewed_at" },
  },
  {
    pg: "AgentDraft",
    sqlite: "agent_drafts",
    cols: {
      id: "id",
      title: "title",
      description: "description",
      content: "content",
      niche: "niche",
      isPremium: "is_premium",
      isDeepRoots: "is_deep_roots",
      featuredImage: "featured_image",
      references: "refs",
      agentName: "agent_name",
      notes: "notes",
      status: "status",
      reviewedAt: "reviewed_at",
      reviewedBy: "reviewed_by",
      createdAt: "created_at",
    },
  },
  {
    pg: "Feedback",
    sqlite: "feedback",
    cols: {
      id: "id",
      userId: "user_id",
      email: "email",
      message: "message",
      type: "type",
      status: "status",
      aiSummary: "ai_summary",
      aiPriority: "ai_priority",
      aiTags: "ai_tags",
      aiTriagedAt: "ai_triaged_at",
      userAgent: "user_agent",
      pageUrl: "page_url",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  {
    pg: "TrialClaim",
    sqlite: "trial_claims",
    cols: { id: "id", email: "email", claimedAt: "claimed_at" },
  },
  {
    pg: "RateLimit",
    sqlite: "rate_limits",
    cols: { key: "key", count: "count", windowStart: "window_start" },
  },
  {
    pg: "WebhookEvent",
    sqlite: "webhook_events",
    cols: {
      stripeEventId: "stripe_event_id",
      eventType: "event_type",
      processedAt: "processed_at",
    },
  },
  {
    pg: "PushSubscription",
    sqlite: "push_subscriptions",
    cols: {
      id: "id",
      userId: "user_id",
      endpoint: "endpoint",
      p256dh: "p256dh",
      auth: "auth",
      niches: "niches",
      emailDigest: "email_digest",
      createdAt: "created_at",
    },
  },
  {
    pg: "AiSearchLog",
    sqlite: "ai_search_logs",
    cols: {
      id: "id",
      userId: "user_id",
      inputTokens: "input_tokens",
      outputTokens: "output_tokens",
      createdAt: "created_at",
    },
  },
  {
    pg: "AffiliateLink",
    sqlite: "affiliate_links",
    cols: {
      id: "id",
      postId: "post_id",
      label: "label",
      url: "url",
      provider: "provider",
      createdAt: "created_at",
    },
  },
];

const log = (s) => process.stderr.write(s + "\n");

async function main() {
  const client = new Client(url);
  await client.connect();

  console.log("-- Generated by scripts/export-neon-to-d1.mjs");
  console.log(`-- Source: ${url.replace(/:[^:@]*@/, ":***@")}`);
  console.log(`-- Generated at: ${new Date().toISOString()}`);
  console.log("PRAGMA foreign_keys = OFF;");
  console.log("BEGIN TRANSACTION;");

  for (const tbl of TABLES) {
    const colsPg = Object.keys(tbl.cols);
    const colsSqlite = Object.values(tbl.cols);
    const quotedPgCols = colsPg.map((c) => `"${c}"`).join(", ");
    log(`Exporting ${tbl.pg} → ${tbl.sqlite} ...`);
    let cursor;
    try {
      cursor = await client.query(`SELECT ${quotedPgCols} FROM "${tbl.pg}"`);
    } catch (e) {
      log(`  ! ${tbl.pg} query failed: ${e.message}. Skipping.`);
      continue;
    }
    if (!cursor.rows.length) { log(`  (empty)`); continue; }

    console.log(`-- ${tbl.sqlite}: ${cursor.rows.length} row(s)`);
    for (const row of cursor.rows) {
      const values = colsPg.map((c) => sqlEscape(row[c])).join(", ");
      console.log(`INSERT INTO "${tbl.sqlite}" (${colsSqlite.map((c) => `"${c}"`).join(", ")}) VALUES (${values});`);
    }
  }

  console.log("COMMIT;");
  console.log("PRAGMA foreign_keys = ON;");
  await client.end();
  log("Done.");
}

main().catch((e) => {
  log("EXPORT FAILED: " + (e.stack || e.message));
  process.exit(1);
});
