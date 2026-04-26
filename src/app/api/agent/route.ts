import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbRun, createId, nowISO } from "@/lib/db";
import { notifyNewPosts } from "@/lib/push";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.AGENT_API_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) return false;
  return true;
}

// GET existing titles so the daily blog run can dedupe.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [posts, drafts] = await Promise.all([
    dbAll<{ title: string; niche: string }>(`SELECT title, niche FROM posts`),
    dbAll<{ title: string; niche: string }>(`SELECT title, niche FROM agent_drafts`),
  ]);

  return NextResponse.json({ posts, drafts });
}

// Agents POST drafts here with a shared secret in the Authorization header.
// Header: Authorization: Bearer <AGENT_API_SECRET>
//
// Auto-publish: agent submissions go straight to a PUBLISHED post and the
// matching agent_draft row is created in APPROVED state for audit. Admin
// can still retroactively edit tier/content via /admin/posts/[id].
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

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const uniqueSlug = `${slug}-${Date.now()}`;

  const draftId = createId();
  const postId = createId();
  const now = nowISO();
  const desc = description ?? "";
  const premiumBit = isPremium ? 1 : 0;
  const deepRootsBit = isDeepRoots ? 1 : 0;

  await dbRun(
    `INSERT INTO agent_drafts
       (id, title, description, content, niche, is_premium, is_deep_roots, featured_image, refs, agent_name, notes, status, reviewed_at, reviewed_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, 'auto-publish', ?)`,
    draftId, title, desc, content, niche,
    premiumBit, deepRootsBit,
    featuredImage ?? null, references ?? null, agentName, notes ?? null, now, now,
  );

  await dbRun(
    `INSERT INTO posts
       (id, slug, title, description, content, niche, is_premium, is_deep_roots, status, published_at, featured_image, refs, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?, ?, ?)`,
    postId, uniqueSlug, title, desc, content, niche,
    premiumBit, deepRootsBit,
    now, featuredImage ?? null, references ?? null, now, now,
  );

  notifyNewPosts({
    posts: [{ title, niche, slug: uniqueSlug }],
  }).catch((err) => console.error("[agent/auto-publish] push notify failed:", err));

  return NextResponse.json({ ok: true, draftId, postId, slug: uniqueSlug }, { status: 201 });
}
