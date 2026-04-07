import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = (await req.json()) as { postId?: string };
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const userId = session.user.id;

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.postLike.create({ data: { userId, postId } });
    return NextResponse.json({ liked: true });
  }
}
