/**
 * update-post-images.mjs
 * Generates a featured image for every published post that lacks one.
 * Uses Claude Haiku to write a specific visual prompt, Together AI (Flux Schnell)
 * to render it, then uploads the result to Vercel Blob for permanent storage.
 *
 * Usage:
 *   node scripts/update-post-images.mjs
 *   node scripts/update-post-images.mjs --regenerate   # wipe + redo all
 *
 * Together AI: black-forest-labs/FLUX.1-schnell  (~$0.0027/image)
 * Claude Haiku: ~$0.0001/post for prompt generation
 * Vercel Blob:  ~$0.023/GB (100 images ≈ 20 MB ≈ $0.0005)
 *
 * Rate-limited to 1 image/second.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env ──────────────────────────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const eqIdx = line.indexOf("=");
    if (eqIdx < 0) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {}

const TOGETHER_KEY  = process.env.TOGETHER_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const BLOB_TOKEN    = process.env.BLOB_READ_WRITE_TOKEN;
const DATABASE_URL  = process.env.DATABASE_URL;

if (!TOGETHER_KEY)  { console.error("ERROR: TOGETHER_API_KEY env var is required.");       process.exit(1); }
if (!ANTHROPIC_KEY) { console.error("ERROR: ANTHROPIC_API_KEY env var is required.");       process.exit(1); }
if (!BLOB_TOKEN)    { console.error("ERROR: BLOB_READ_WRITE_TOKEN env var is required.\n  Get it from: Vercel Dashboard → Storage → Blob → your store → .env.local"); process.exit(1); }
if (!DATABASE_URL)  { console.error("ERROR: DATABASE_URL env var is required.");             process.exit(1); }

const { neon }   = await import("@neondatabase/serverless");
const { put }    = await import("@vercel/blob");
const sql = neon(DATABASE_URL);

const REGENERATE = process.argv.includes("--regenerate");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Step 1: Ask Claude Haiku for a specific visual prompt ──────────────────
async function buildVisualPrompt(title, description) {
  const body = JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    system:
      "You write concise image prompts for an AI image generator. " +
      "Given a blog post title and description, output ONE sentence (max 30 words) " +
      "that describes a specific, photorealistic editorial photograph that visually represents the post's core idea. " +
      "No generic scenes. Be concrete and specific. Output ONLY the prompt sentence, nothing else.",
    messages: [{ role: "user", content: `Title: ${title}\nDescription: ${description}` }],
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.content?.[0]?.text?.trim() || `Editorial photograph illustrating "${title}"`;
}

// ── Step 2: Generate image with Together AI (returns base64) ───────────────
async function generateImageB64(visualPrompt) {
  const prompt = `${visualPrompt}, photorealistic, editorial blog photo, high quality, professional photography`;

  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOGETHER_KEY}`,
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt,
      width: 1216,
      height: 832,
      steps: 4,
      n: 1,
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429 || text.includes("rate")) throw new Error(`Rate limited (${res.status})`);
    throw new Error(`Together AI ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  return b64 ?? null;
}

// ── Step 3: Upload to Vercel Blob, return /api/img/... path ───────────────
async function uploadToBlob(b64, slug) {
  const buffer = Buffer.from(b64, "base64");
  const pathname = `post-images/${slug}.jpg`;
  await put(pathname, buffer, {
    access: "private",
    contentType: "image/jpeg",
    token: BLOB_TOKEN,
    addRandomSuffix: false,
  });
  // Return the internal proxy path — Next.js serves this via /api/img/[...path]
  return `/api/img/${pathname}`;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (REGENERATE) {
    console.log("--regenerate: wiping all featuredImage values…");
    await sql`UPDATE "Post" SET "featuredImage" = NULL WHERE status = 'PUBLISHED'`;
    console.log("Done. Will now regenerate all images.\n");
  }

  const posts = await sql`
    SELECT id, slug, title, description, niche
    FROM "Post"
    WHERE status = 'PUBLISHED' AND "featuredImage" IS NULL
    ORDER BY "publishedAt" DESC
  `;

  if (posts.length === 0) {
    console.log("No posts need images. All done!");
    return;
  }

  console.log(`Found ${posts.length} posts without images. Generating…\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    try {
      const visualPrompt = await buildVisualPrompt(post.title, post.description ?? "");
      const b64 = await generateImageB64(visualPrompt);

      if (!b64) {
        console.log(`  SKIP  [${post.niche}] ${post.title} — no image data returned`);
        failed++;
      } else {
        const blobUrl = await uploadToBlob(b64, post.slug);
        await sql`UPDATE "Post" SET "featuredImage" = ${blobUrl} WHERE id = ${post.id}`;
        console.log(`  OK    [${post.niche}] ${post.title}`);
        success++;
      }
    } catch (err) {
      console.error(`  FAIL  [${post.niche}] ${post.title} — ${err.message}`);
      failed++;
    }

    await sleep(1200);
  }

  console.log(`\nDone. ${success} updated, ${failed} skipped/failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
