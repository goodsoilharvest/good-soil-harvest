import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = (await req.json()) as { query?: string };
  if (!query?.trim()) {
    return NextResponse.json({ posts: [] });
  }

  // Fetch all published post metadata
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, slug: true, title: true, description: true, niche: true, isPremium: true, isDeepRoots: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) return NextResponse.json({ posts: [] });

  // Build compact catalog for the prompt
  const catalog = posts
    .map((p, i) => `[${i}] ${p.title} (${p.niche}): ${p.description}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `You are a reading recommendation assistant for Good Soil Harvest, a thoughtful blog covering faith, finance, psychology, philosophy, and science.

A reader said: "${query.trim()}"

Here are the available articles (by index):
${catalog}

Return the indices of the 6 most relevant articles as a JSON array, most relevant first. Example: [4,12,0,7,22,5]
Return ONLY the JSON array, nothing else.`,
      },
    ],
  });

  let indices: number[] = [];
  try {
    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    indices = JSON.parse(text);
    if (!Array.isArray(indices)) indices = [];
  } catch {
    indices = [];
  }

  const results = indices
    .filter((i) => typeof i === "number" && i >= 0 && i < posts.length)
    .slice(0, 6)
    .map((i) => posts[i]);

  return NextResponse.json({ posts: results });
}
