import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const exp = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "SUBSCRIBER",
      emailVerified: false,
      verifyToken: code,
      verifyTokenExp: exp,
    },
  });

  sendVerificationEmail(email, code).catch(console.error);

  return NextResponse.json({ ok: true });
}
