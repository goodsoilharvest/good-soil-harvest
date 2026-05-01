import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Authenticated image upload — used by the daily blog cron and the
// Vercel Blob → R2 migration script. Bearer auth via AGENT_API_SECRET
// (same pattern as /api/agent + /api/admin/stats).
//
// Request: PUT /api/admin/img-upload?path=blog/<niche>/<slug>-<ts>.jpg
//   - body: raw image bytes
//   - content-type: image/jpeg | image/png | image/webp | image/gif | image/avif
// Response: { ok: true, key, url }

const ALLOWED_PREFIXES = new Set(["site", "blog", "post-images"]);
const SEGMENT_RE = /^[a-zA-Z0-9_.-]+$/;
const EXT_RE = /\.(webp|jpg|jpeg|png|gif|avif)$/i;
const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB ceiling

export async function PUT(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.AGENT_API_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path") ?? "";
  const segments = path.split("/").filter(Boolean);

  if (
    segments.length < 2 ||
    !ALLOWED_PREFIXES.has(segments[0]) ||
    segments.some((s) => s === ".." || !SEGMENT_RE.test(s)) ||
    !EXT_RE.test(path)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Bad content-type" }, { status: 400 });
  }

  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: `Bad size (${buf.byteLength} bytes; cap ${MAX_BYTES})` },
      { status: 400 }
    );
  }

  const key = segments.join("/");
  const bucket = getCloudflareContext().env.IMG_BUCKET;
  await bucket.put(key, buf, {
    httpMetadata: { contentType },
  });

  return NextResponse.json({
    ok: true,
    key,
    url: `https://goodsoilharvest.com/api/img/${key}`,
  });
}
