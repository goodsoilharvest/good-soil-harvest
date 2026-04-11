import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.AGENT_API_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) return false;
  return true;
}

// GET existing titles so the daily blog run can dedupe without touching
// the Documents folder (which trips macOS TCC on launchd jobs).
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [posts, drafts] = await Promise.all([
    prisma.post.findMany({ select: { title: true, niche: true } }),
    prisma.agentDraft.findMany({ select: { title: true, niche: true } }),
  ]);

  return NextResponse.json({ posts, drafts });
}

// Agents POST drafts here with a shared secret in the Authorization header
// Header: Authorization: Bearer <AGENT_API_SECRET>
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, content, niche, isPremium, isDeepRoots, agentName, notes, featuredImage, references } = body;

  if (!title || !content || !niche || !agentName) {
    return NextResponse.json({ error: "Missing required fields: title, content, niche, agentName" }, { status: 400 });
  }

  const validNiches = ["faith", "finance", "psychology", "philosophy", "science"];
  if (!validNiches.includes(niche)) {
    return NextResponse.json({ error: `Invalid niche. Must be one of: ${validNiches.join(", ")}` }, { status: 400 });
  }

  const draft = await prisma.agentDraft.create({
    data: {
      title,
      description: description ?? "",
      content,
      niche,
      isPremium: isPremium ?? false,
      isDeepRoots: isDeepRoots ?? false,
      featuredImage: featuredImage ?? null,
      references: references ?? null,
      agentName,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ ok: true, draftId: draft.id }, { status: 201 });
}
