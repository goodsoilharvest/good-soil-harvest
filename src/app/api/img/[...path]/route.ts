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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return new NextResponse("Storage not configured", { status: 503 });
  }

  const pathname = path.join("/");
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
