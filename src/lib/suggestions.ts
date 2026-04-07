import { prisma } from "@/lib/prisma";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  niche: string;
  isPremium: boolean;
  isDeepRoots: boolean;
  publishedAt: Date | null;
};

const POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  niche: true,
  isPremium: true,
  isDeepRoots: true,
  publishedAt: true,
} as const;

/** Posts the user has liked, most recent first */
export async function getLikedPosts(userId: string): Promise<PostSummary[]> {
  const likes = await prisma.postLike.findMany({
    where: { userId },
    include: { post: { select: POST_SELECT } },
    orderBy: { likedAt: "desc" },
  });
  return likes.map((l) => l.post);
}

/** Posts the user has viewed, most recent first */
export async function getViewedPosts(userId: string, limit = 20): Promise<PostSummary[]> {
  const views = await prisma.postView.findMany({
    where: { userId },
    include: { post: { select: POST_SELECT } },
    orderBy: { viewedAt: "desc" },
    take: limit,
  });
  return views.map((v) => v.post);
}

/**
 * Personalised "For You" suggestions.
 * Weighs niches based on likes (×3) + recent views (×1),
 * then returns up to `limit` unread published posts sorted by that weight.
 * Falls back to latest posts when there's no history.
 */
export async function getSuggestions(userId: string, limit = 12): Promise<PostSummary[]> {
  const [likes, views] = await Promise.all([
    prisma.postLike.findMany({
      where: { userId },
      include: { post: { select: { niche: true, id: true } } },
    }),
    prisma.postView.findMany({
      where: { userId },
      include: { post: { select: { niche: true, id: true } } },
      orderBy: { viewedAt: "desc" },
      take: 50,
    }),
  ]);

  // Build niche weights
  const nicheWeights: Record<string, number> = {};
  for (const l of likes)  nicheWeights[l.post.niche] = (nicheWeights[l.post.niche] ?? 0) + 3;
  for (const v of views)  nicheWeights[v.post.niche] = (nicheWeights[v.post.niche] ?? 0) + 1;

  // IDs to exclude (already seen or liked)
  const seenIds = new Set([...likes.map((l) => l.postId), ...views.map((v) => v.postId)]);

  const unread = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: seenIds.size > 0 ? [...seenIds] : undefined },
    },
    select: POST_SELECT,
    orderBy: { publishedAt: "desc" },
  });

  if (Object.keys(nicheWeights).length === 0) return unread.slice(0, limit);

  // Sort by niche weight descending, then by date
  return unread
    .sort((a, b) => (nicheWeights[b.niche] ?? 0) - (nicheWeights[a.niche] ?? 0))
    .slice(0, limit);
}
