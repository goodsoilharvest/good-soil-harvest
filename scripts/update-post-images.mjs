/**
 * update-post-images.mjs
 * Generates a featured image for every published post that lacks one,
 * using Together AI (Flux Schnell). Stores the returned CDN URL in the DB.
 *
 * Usage:
 *   TOGETHER_API_KEY=<your_key> node scripts/update-post-images.mjs
 *
 * Together AI free model: black-forest-labs/FLUX.1-schnell-Free (~$0 while credits last)
 * Paid fallback:          black-forest-labs/FLUX.1-schnell     (~$0.0013/image)
 *
 * Rate-limited to 1 request/second.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Load .env
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

const TOGETHER_KEY = process.env.TOGETHER_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!TOGETHER_KEY) {
  console.error("ERROR: TOGETHER_API_KEY env var is required.");
  console.error("Get a free key at https://together.ai");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL env var is required.");
  process.exit(1);
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(DATABASE_URL);

// Niche → descriptive style hint for better prompts
const NICHE_STYLE = {
  faith:      "peaceful church interior with warm golden light, spiritual atmosphere, soft bokeh",
  finance:    "clean minimal financial concept, coins or growth chart, professional, warm tones",
  psychology: "calm contemplative mood, soft light, human silhouette or abstract mind concept",
  philosophy: "ancient books and candle light, philosophical atmosphere, moody dramatic lighting",
  science:    "modern laboratory or technology concept, clean scientific aesthetic, blue tones",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateImage(prompt) {
  const body = JSON.stringify({
    model: "black-forest-labs/FLUX.1-schnell",
    prompt,
    width: 1216,
    height: 832,
    steps: 4,
    n: 1,
    response_format: "url",
  });

  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOGETHER_KEY}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    // Try paid model if free is rate-limited
    if (res.status === 429 || text.includes("rate")) {
      throw new Error(`Rate limited (${res.status})`);
    }
    throw new Error(`Together AI ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.data?.[0]?.url ?? null;
}

async function main() {
  // Fetch posts without images
  const posts = await sql`
    SELECT id, title, niche
    FROM "Post"
    WHERE status = 'PUBLISHED' AND "featuredImage" IS NULL
    ORDER BY "publishedAt" DESC
  `;

  if (posts.length === 0) {
    console.log("No posts need images. All done!");
    return;
  }

  console.log(`Found ${posts.length} posts without images. Generating with Together AI (Flux Schnell)...\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    const nicheStyle = NICHE_STYLE[post.niche] ?? "nature landscape, beautiful photography";

    // Build a focused prompt: descriptive but short (Flux Schnell likes concise prompts)
    const titleClean = post.title.replace(/[^a-zA-Z0-9 ,]/g, "").slice(0, 60);
    const prompt = `${nicheStyle}, editorial blog photo for article titled "${titleClean}", high quality, photorealistic`;

    try {
      const imageUrl = await generateImage(prompt);
      if (!imageUrl) {
        console.log(`  SKIP  [${post.niche}] ${post.title} — no URL returned`);
        failed++;
      } else {
        await sql`UPDATE "Post" SET "featuredImage" = ${imageUrl} WHERE id = ${post.id}`;
        console.log(`  OK    [${post.niche}] ${post.title}`);
        success++;
      }
    } catch (err) {
      console.error(`  FAIL  [${post.niche}] ${post.title} — ${err.message}`);
      failed++;
    }

    await sleep(1200); // ~50 req/min, well within Together AI limits
  }

  console.log(`\nDone. ${success} updated, ${failed} skipped/failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
