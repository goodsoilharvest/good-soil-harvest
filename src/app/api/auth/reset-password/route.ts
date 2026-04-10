import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = body.token as string | undefined;
  const rawEmail = body.email as string | undefined;
  const password = body.password as string | undefined;

  if (!token || !rawEmail || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Password rules — same as register
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

  const email = rawEmail.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.resetToken ||
    user.resetToken !== token ||
    !user.resetTokenExp ||
    user.resetTokenExp < new Date()
  ) {
    return NextResponse.json(
      { error: "This reset link has expired or is invalid. Request a new one." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExp: null,
      // Mark email verified — they proved access by clicking the link in their inbox
      emailVerified: true,
    },
  });

  return NextResponse.json({ ok: true });
}
