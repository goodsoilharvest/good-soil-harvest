import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.feedback.findMany({
    orderBy: [
      { aiPriority: "asc" }, // CRITICAL < HIGH < MEDIUM < LOW alphabetically — we sort properly client-side
      { createdAt: "desc" },
    ],
    take: 200,
  });

  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  await prisma.feedback.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ok: true });
}
