/**
 * update-post-images.mjs
 * Fetches a relevant Unsplash image for every published post that lacks one.
 *
 * Usage:
 *   UNSPLASH_ACCESS_KEY=<your_key> node scripts/update-post-images.mjs
 *
 * Unsplash free tier: 5,000 req/hr. 100 posts = 100 requests — well within limits.
 * Rate-limited to 1 request/second to be a good citizen.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env from .env if not already set
const envPath = resolve(process.cwd(), ".env");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {}

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!UNSPLASH_KEY) {
  console.error("ERROR: UNSPLASH_ACCESS_KEY env var is required.");
  console.error("Get a free key at https://unsplash.com/developers");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL env var is required.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const adapter = new PrismaNeon(sql);
const prisma = new PrismaClient({ adapter });

// Niche → search query that reliably returns great images
const NICHE_QUERIES = {
  faith: "church light spiritual",
  finance: "money finance savings",
  psychology: "mind meditation calm",
  philosophy: "books thinking wisdom",
  science: "science laboratory research",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchUnsplashImage(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Unsplash ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!data.results?.length) return null;

  // Pick a random result from first 5 to add variety
  const pick = data.results[Math.floor(Math.random() * Math.min(5, data.results.length))];
  return pick.urls.regular; // 1080px wide, CDN-optimized
}

async function main() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", featuredImage: null },
    select: { id: true, title: true, niche: true },
    orderBy: { publishedAt: "desc" },
  });

  if (posts.length === 0) {
    console.log("No posts need images. All done!");
    return;
  }

  console.log(`Found ${posts.length} posts without images. Fetching from Unsplash...\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    // Build query: niche default + first 3 meaningful words from title
    const titleWords = post.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter((w) => w.length > 3)
      .slice(0, 3)
      .join(" ");
    const nicheQuery = NICHE_QUERIES[post.niche] ?? post.niche;
    const query = titleWords ? `${titleWords} ${nicheQuery}` : nicheQuery;

    try {
      const imageUrl = await fetchUnsplashImage(query);
      if (!imageUrl) {
        // Fall back to niche-only query
        const fallback = await fetchUnsplashImage(nicheQuery);
        if (!fallback) {
          console.log(`  SKIP  [${post.niche}] ${post.title} — no results`);
          failed++;
          await sleep(1000);
          continue;
        }
        await prisma.post.update({ where: { id: post.id }, data: { featuredImage: fallback } });
        console.log(`  OK    [${post.niche}] ${post.title} (fallback query)`);
      } else {
        await prisma.post.update({ where: { id: post.id }, data: { featuredImage: imageUrl } });
        console.log(`  OK    [${post.niche}] ${post.title}`);
      }
      success++;
    } catch (err) {
      console.error(`  FAIL  [${post.niche}] ${post.title} — ${err.message}`);
      failed++;
    }

    // 1 req/sec to respect Unsplash rate limits
    await sleep(1000);
  }

  console.log(`\nDone. ${success} updated, ${failed} skipped/failed.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
