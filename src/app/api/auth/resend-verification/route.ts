import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    // Don't reveal whether account exists
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const exp = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken: token, verifyTokenExp: exp },
  });

  await sendVerificationEmail(email, token);
  return NextResponse.json({ ok: true });
}
