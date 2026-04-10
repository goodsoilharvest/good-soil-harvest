import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rawEmail = body.email as string | undefined;

  if (!rawEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
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
