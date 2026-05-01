-- Add completed_at to webhook_events so we can distinguish a row that was
-- inserted but whose handler crashed (still NULL) from one that finished
-- (set to nowISO()). The Stripe handler treats existing rows as fully-done
-- duplicates only when completed_at IS NOT NULL; otherwise it re-runs the
-- handler (all ops are idempotent UPSERT/UPDATE).
ALTER TABLE webhook_events ADD COLUMN completed_at TEXT;
