import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, title, description, content, isPremium, isDeepRoots } = await req.json();

  const draft = await prisma.agentDraft.findUnique({ where: { id } });
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "reject") {
    await prisma.agentDraft.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: session.user?.email ?? "" },
    });
    return NextResponse.json({ ok: true });
  }

  // approve or edit — create a Post record
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const uniqueSlug = `${slug}-${Date.now()}`;

  await prisma.$transaction([
    prisma.post.create({
      data: {
        slug: uniqueSlug,
        title,
        description,
        content,
        niche: draft.niche,
        isPremium,
        isDeepRoots: isDeepRoots ?? false,
        status: "PUBLISHED",
        publishedAt: new Date(),
        featuredImage: draft.featuredImage ?? null,
        references: draft.references ?? null,
      },
    }),
    prisma.agentDraft.update({
      where: { id },
      data: {
        status: action === "edit" ? "EDITED" : "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: session.user?.email ?? "",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
