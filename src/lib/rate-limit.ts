import { prisma } from "@/lib/prisma";

// Simple DB-backed sliding-window rate limiter.
// Returns { ok: true } if request is allowed, or { ok: false, retryAfterSeconds }
// if the caller has exceeded the limit for this action+identifier.
//
// Works correctly across serverless invocations (unlike in-memory Maps)
// without needing Redis or external services. Fast enough for low-mid traffic
// — upgrade to Upstash Redis when traffic justifies it.
export async function rateLimit(opts: {
  action: string;           // e.g. "forgot-password", "register", "ai-search"
  identifier: string;       // e.g. user email, IP, user ID
  max: number;              // max requests per window
  windowSeconds: number;    // window length
}): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const key = `${opts.action}:${opts.identifier.toLowerCase()}`;
  const now = new Date();
  const windowMs = opts.windowSeconds * 1000;
  const windowCutoff = new Date(now.getTime() - windowMs);

  // Get current record if it exists
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowCutoff) {
    // No record, or the old window has expired — start fresh
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { ok: true };
  }

  // Within the current window
  if (existing.count >= opts.max) {
    const elapsed = now.getTime() - existing.windowStart.getTime();
    const retryAfterSeconds = Math.ceil((windowMs - elapsed) / 1000);
    return { ok: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { ok: true };
}

// Get a stable client identifier from the request.
// Prefers CF-Connecting-IP (Cloudflare) → X-Forwarded-For → X-Real-IP → "unknown"
export function getClientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
