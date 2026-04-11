import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawEmail = body.email as string | undefined;
  if (!rawEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const email = rawEmail.trim().toLowerCase();

  // Rate limit: 3 resends per 10 minutes per email (prevent email bombing)
  const limit = await rateLimit({
    action: "resend-verification",
    identifier: email,
    max: 3,
    windowSeconds: 60 * 10,
  });
  if (!limit.ok) {
    return NextResponse.json({ ok: true }); // Silent drop, don't leak rate limit status
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true }); // Don't reveal whether account exists
  }

  const code = generateCode();
  const exp = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken: code, verifyTokenExp: exp },
  });

  await sendVerificationEmail(email, code);
  return NextResponse.json({ ok: true });
}
