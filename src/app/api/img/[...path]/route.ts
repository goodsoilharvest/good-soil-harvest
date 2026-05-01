import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Image proxy. Reads from the IMAGES R2 binding directly — no auth dance,
// no upstream fetch. Path validation locks the route to known prefixes +
// safe segments + image extensions only.
const ALLOWED_PREFIXES = new Set(["site", "blog", "post-images"]);
const SEGMENT_RE = /^[a-zA-Z0-9_.-]+$/;
const EXT_RE = /\.(webp|jpg|jpeg|png|gif|avif)$/i;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (
    path.length < 2 ||
    !ALLOWED_PREFIXES.has(path[0]) ||
    path.some((s) => s === ".." || !SEGMENT_RE.test(s))
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const key = path.join("/");
  if (!EXT_RE.test(key)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bucket = getCloudflareContext().env.IMG_BUCKET;
  const obj = await bucket.get(key);
  if (!obj) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType =
    obj.httpMetadata?.contentType ?? CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(obj.body, {
    headers: {
      "Content-Type": contentType,
      // Images are content-addressed by slug+timestamp and never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": obj.httpEtag,
    },
  });
}
