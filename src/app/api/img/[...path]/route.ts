import { NextRequest, NextResponse } from "next/server";

// Derives the Vercel Blob store hostname from the token.
// Token format: vercel_blob_rw_{storeId}_{secret}
function blobHost(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  const prefix = "vercel_blob_rw_";
  const storeId = token.startsWith(prefix)
    ? token.slice(prefix.length).split("_")[0].toLowerCase()
    : "";
  return `${storeId}.private.blob.vercel-storage.com`;
}

// Lock the proxy down to known image prefixes + safe path segments + image
// extensions. Without this, anyone on the public internet can enumerate any
// object in the blob store via this endpoint.
const ALLOWED_PREFIXES = new Set(["site", "blog", "post-images"]);
const SEGMENT_RE = /^[a-zA-Z0-9_.-]+$/;
const EXT_RE = /\.(webp|jpg|jpeg|png|gif|avif)$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return new NextResponse("Storage not configured", { status: 503 });
  }

  if (
    path.length < 2 ||
    !ALLOWED_PREFIXES.has(path[0]) ||
    path.some((s) => s === ".." || !SEGMENT_RE.test(s))
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const pathname = path.join("/");
  if (!EXT_RE.test(pathname)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const blobUrl = `https://${blobHost()}/${pathname}`;

  const upstream = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!upstream.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      // Cache aggressively — images are content-addressed by slug and never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
