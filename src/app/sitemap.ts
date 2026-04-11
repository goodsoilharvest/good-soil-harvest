import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE = "https://www.goodsoilharvest.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/niches/faith`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/niches/finance`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/niches/psychology`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/niches/philosophy`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/niches/science`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, publishedAt: true, updatedAt: true },
    });
    const postRoutes: MetadataRoute.Sitemap = posts.map(p => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...postRoutes];
  } catch {
    // If DB is unreachable, still return static routes
    return staticRoutes;
  }
}
