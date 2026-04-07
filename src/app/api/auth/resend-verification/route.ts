import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

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
