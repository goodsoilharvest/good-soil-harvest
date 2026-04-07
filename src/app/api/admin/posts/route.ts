import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, content, niche, isPremium, status } = await req.json();

  if (!title || !niche) {
    return NextResponse.json({ error: "Title and niche are required" }, { status: 400 });
  }

  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const slug = `${base}-${Date.now()}`;

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      description: description ?? "",
      content: content ?? "",
      niche,
      isPremium: isPremium ?? false,
      status: status ?? "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ id: post.id });
}
