import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  if (!user.verifyToken || user.verifyToken !== code.trim()) {
    return NextResponse.json({ error: "Incorrect code — check your email and try again" }, { status: 400 });
  }

  if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
    return NextResponse.json({ error: "Code expired — request a new one below" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
  });

  sendWelcomeEmail(user.email).catch(console.error);

  return NextResponse.json({ ok: true });
}
