// ONE-TIME UTILITY — delete after use
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SECRET = process.env.AGENT_API_SECRET;

export async function GET(req: NextRequest) {
  if (req.headers.get("x-secret") !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (req.headers.get("x-secret") !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email, password } = (await req.json()) as { email: string; password?: string };

  const data: Record<string, unknown> = { role: "ADMIN" };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { email },
    data,
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
