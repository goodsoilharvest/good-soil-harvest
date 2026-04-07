import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, content, niche, isPremium, isDeepRoots, status } = await req.json();

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

  // Auto-premium rule: if isPremium not explicitly provided, mark 2 of every 5
  // posts as premium (positions 3 and 5 in each batch of 5 = index % 5 ∈ {2,4}).
  let markPremium = isPremium ?? false;
  if (isPremium === undefined || isPremium === null) {
    const total = await prisma.post.count();
    markPremium = total % 5 === 2 || total % 5 === 4;
  }

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      description: description ?? "",
      content: content ?? "",
      niche,
      isPremium: markPremium,
      isDeepRoots: isDeepRoots ?? false,
      status: status ?? "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ id: post.id });
}
