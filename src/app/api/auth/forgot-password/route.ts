import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawEmail = body.email as string | undefined;

  if (!rawEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();

  // Rate limit per email AND per IP to prevent email bombing
  const emailLimit = await rateLimit({
    action: "forgot-password",
    identifier: email,
    max: 3,
    windowSeconds: 60 * 15, // 15 minutes
  });
  if (!emailLimit.ok) {
    return NextResponse.json({ ok: true }); // Silent drop, don't leak
  }
  const ipLimit = await rateLimit({
    action: "forgot-password-ip",
    identifier: getClientIp(req),
    max: 10,
    windowSeconds: 60 * 15,
  });
  if (!ipLimit.ok) {
    return NextResponse.json({ ok: true }); // Silent drop
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return ok — never reveal whether the email exists
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = randomUUID();
  const exp = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExp: exp },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error("[forgot-password] email send failed", err);
  }

  return NextResponse.json({ ok: true });
}
