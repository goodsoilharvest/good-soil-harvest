import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verify-email?error=missing", req.url));
  }

  const user = await prisma.user.findUnique({ where: { verifyToken: token } });

  if (!user) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid", req.url));
  }

  if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?error=expired", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
  });

  // Fire and forget welcome email
  sendWelcomeEmail(user.email).catch(console.error);

  return NextResponse.redirect(new URL("/verify-email?success=1", req.url));
}
