import { NextRequest, NextResponse } from "next/server";
import { dbFirst, dbRun, createId, nowISO } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawEmail = body.email as string | undefined;
  const password = body.password as string | undefined;

  if (!rawEmail || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();

  const ipLimit = await rateLimit({
    action: "register",
    identifier: getClientIp(req),
    max: 5,
    windowSeconds: 60 * 60,
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: `Too many signup attempts. Try again in ${Math.ceil(ipLimit.retryAfterSeconds / 60)} minutes.` },
      { status: 429 }
    );
  }

  const pwErrors = [];
  if (password.length < 8)             pwErrors.push("at least 8 characters");
  if (!/[A-Z]/.test(password))         pwErrors.push("one uppercase letter");
  if (!/[0-9]/.test(password))         pwErrors.push("one number");
  if (!/[^A-Za-z0-9]/.test(password)) pwErrors.push("one special character");
  if (pwErrors.length) {
    return NextResponse.json(
      { error: `Password must contain: ${pwErrors.join(", ")}` },
      { status: 400 }
    );
  }

  const existing = await dbFirst<{ id: string }>(`SELECT id FROM users WHERE email = ?`, email);
  if (existing) {
    // Don't reveal account existence. Skip the insert silently — same response
    // shape as a fresh signup. Future: send a "someone tried to register with
    // your email" notice to the existing account.
    return NextResponse.json({ ok: true });
  }

  const passwordHash = await bcrypt.hash(password, 13);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expISO = new Date(Date.now() + 1000 * 60 * 30).toISOString().replace("T", " ").slice(0, 19);

  await dbRun(
    `INSERT INTO users (id, email, password_hash, role, email_verified, verify_token, verify_token_exp, created_at, updated_at)
     VALUES (?, ?, ?, 'SUBSCRIBER', 0, ?, ?, ?, ?)`,
    createId(), email, passwordHash, code, expISO, nowISO(), nowISO(),
  );

  sendVerificationEmail(email, code).catch(console.error);

  return NextResponse.json({ ok: true });
}
