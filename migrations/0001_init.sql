-- ============================================================================
-- Good Soil Harvest — D1 (SQLite) initial schema
-- ============================================================================
-- Generated from prisma/schema.prisma. Conversion notes:
--
-- * Postgres ENUMs → TEXT with CHECK constraints. Same set of allowed values.
-- * cuid() generation moves to app code (createId() helper). Application MUST
--   provide id at INSERT time (no auto-cuid in SQLite).
-- * DateTime → TEXT (ISO 8601). Defaults use datetime('now') which produces
--   "YYYY-MM-DD HH:MM:SS" — Prisma D1 adapter accepts both formats.
-- * @updatedAt: Prisma updates this in-app on every mutation. SQLite has no
--   native equivalent — application layer is responsible. Triggers below
--   handle the common cases for safety.
-- * Boolean → INTEGER (0/1) with CHECK to keep values clean.
-- * Foreign keys are declared but only enforced when `PRAGMA foreign_keys=ON`
--   is set per session. D1 doesn't persist PRAGMAs across calls. Treat FKs as
--   advisory + clean up orphans manually on cascading deletes.
--
-- Apply with:
--   wrangler d1 migrations apply good-soil-harvest --remote
-- After Phase 2 export script imports data:
--   wrangler d1 execute good-soil-harvest --remote --file=neon_export.sql
-- ============================================================================

-- ─── Users + Auth ─────────────────────────────────────────────────────────────

CREATE TABLE users (
  id              TEXT PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,
  role            TEXT NOT NULL DEFAULT 'SUBSCRIBER' CHECK (role IN ('ADMIN','SUBSCRIBER','READER')),
  email_verified  INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0,1)),
  verify_token    TEXT UNIQUE,
  verify_token_exp TEXT,
  reset_token     TEXT UNIQUE,
  reset_token_exp TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER users_updated_at AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ─── Subscriptions ────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                     TEXT PRIMARY KEY,
  user_id                TEXT UNIQUE NOT NULL,
  stripe_customer_id     TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status                 TEXT NOT NULL DEFAULT 'FREE' CHECK (status IN ('FREE','ACTIVE','PAST_DUE','CANCELED')),
  plan                   TEXT CHECK (plan IS NULL OR plan IN ('SEEDLING','DEEP_ROOTS')),
  current_period_end     TEXT,
  trial_end              TEXT,
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at             TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER subscriptions_updated_at AFTER UPDATE ON subscriptions
BEGIN
  UPDATE subscriptions SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ─── Content / Posts ──────────────────────────────────────────────────────────

CREATE TABLE posts (
  id              TEXT PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  content         TEXT NOT NULL,                   -- MDX
  niche           TEXT NOT NULL CHECK (niche IN ('faith','finance','psychology','philosophy','science')),
  is_premium      INTEGER NOT NULL DEFAULT 0 CHECK (is_premium IN (0,1)),
  is_deep_roots   INTEGER NOT NULL DEFAULT 0 CHECK (is_deep_roots IN (0,1)),
  featured_image  TEXT,
  refs            TEXT,                            -- "references" reserved by SQLite, renamed
  status          TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','APPROVED','PUBLISHED','REJECTED','ARCHIVED')),
  published_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_niche ON posts(niche);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);

CREATE TRIGGER posts_updated_at AFTER UPDATE ON posts
BEGIN
  UPDATE posts SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ─── Engagement ──────────────────────────────────────────────────────────────

CREATE TABLE post_likes (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL,
  post_id   TEXT NOT NULL,
  liked_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);

CREATE TABLE post_views (
  id        TEXT PRIMARY KEY,
  user_id   TEXT NOT NULL,
  post_id   TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE (user_id, post_id)
);

CREATE INDEX idx_post_views_post ON post_views(post_id);

-- ─── Agent Draft Pipeline ────────────────────────────────────────────────────

CREATE TABLE agent_drafts (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  content         TEXT NOT NULL,
  niche           TEXT NOT NULL CHECK (niche IN ('faith','finance','psychology','philosophy','science')),
  is_premium      INTEGER NOT NULL DEFAULT 0 CHECK (is_premium IN (0,1)),
  is_deep_roots   INTEGER NOT NULL DEFAULT 0 CHECK (is_deep_roots IN (0,1)),
  featured_image  TEXT,
  refs            TEXT,
  agent_name      TEXT NOT NULL,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','EDITED')),
  reviewed_at     TEXT,
  reviewed_by     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_agent_drafts_status ON agent_drafts(status);

-- ─── Feedback (with AI triage) ───────────────────────────────────────────────

CREATE TABLE feedback (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  email         TEXT,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'COMMENT' CHECK (type IN ('BUG','FEATURE','COMMENT','QUESTION')),
  status        TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','TRIAGED','IN_PROGRESS','RESOLVED','DISMISSED')),
  ai_summary    TEXT,
  ai_priority   TEXT CHECK (ai_priority IS NULL OR ai_priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  ai_tags       TEXT,
  ai_triaged_at TEXT,
  user_agent    TEXT,
  page_url      TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_priority ON feedback(ai_priority);

CREATE TRIGGER feedback_updated_at AFTER UPDATE ON feedback
BEGIN
  UPDATE feedback SET updated_at = datetime('now') WHERE id = OLD.id;
END;

-- ─── Trial abuse prevention ──────────────────────────────────────────────────

CREATE TABLE trial_claims (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  claimed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Rate limiting ───────────────────────────────────────────────────────────

CREATE TABLE rate_limits (
  key           TEXT PRIMARY KEY,
  count         INTEGER NOT NULL DEFAULT 0,
  window_start  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- ─── Stripe webhook idempotency ──────────────────────────────────────────────

CREATE TABLE webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type      TEXT NOT NULL,
  processed_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_webhook_events_processed ON webhook_events(processed_at);

-- ─── Push notification subscriptions ─────────────────────────────────────────

CREATE TABLE push_subscriptions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  endpoint      TEXT UNIQUE NOT NULL,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  niches        TEXT NOT NULL DEFAULT '',
  email_digest  INTEGER NOT NULL DEFAULT 0 CHECK (email_digest IN (0,1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_push_subs_user ON push_subscriptions(user_id);

-- ─── AI search usage ─────────────────────────────────────────────────────────

CREATE TABLE ai_search_logs (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  input_tokens  INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_search_logs_user ON ai_search_logs(user_id);

-- ─── Affiliate links ─────────────────────────────────────────────────────────

CREATE TABLE affiliate_links (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  provider    TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_affiliate_links_post ON affiliate_links(post_id);
