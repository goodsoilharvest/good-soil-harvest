import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Agents POST drafts here with a shared secret in the Authorization header
// Header: Authorization: Bearer <AGENT_API_SECRET>
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.AGENT_API_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, content, niche, isPremium, agentName, notes } = body;

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
      agentName,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ ok: true, draftId: draft.id }, { status: 201 });
}
