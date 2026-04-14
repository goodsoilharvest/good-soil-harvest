import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    "mailto:goodsoilharvest@proton.me",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

interface NotifyNewPostsOpts {
  posts: Array<{ title: string; niche: string; slug: string }>;
}

/**
 * Send batched push notifications for newly published posts.
 * Groups by user's subscribed niches and sends ONE notification per user
 * summarizing all matching new articles.
 */
export async function notifyNewPosts({ posts }: NotifyNewPostsOpts) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE || posts.length === 0) return;

  const nicheSet = new Set(posts.map((p) => p.niche));

  // Find all push subscriptions that care about at least one of these niches
  const allSubs = await prisma.pushSubscription.findMany({
    where: { niches: { not: "" } },
  });

  for (const sub of allSubs) {
    const userNiches = sub.niches.split(",").filter(Boolean);
    const matchingPosts = posts.filter((p) => userNiches.includes(p.niche));
    if (matchingPosts.length === 0) continue;

    // Build a single batched notification
    const nicheNames = [...new Set(matchingPosts.map((p) => p.niche))];
    const body =
      matchingPosts.length === 1
        ? matchingPosts[0].title
        : `${matchingPosts.length} new articles in ${nicheNames.join(", ")}`;

    const payload = JSON.stringify({
      title: "Good Soil Harvest",
      body,
      icon: "/icon-192x192.png",
      tag: `gsh-daily-${new Date().toISOString().slice(0, 10)}`,
      url: matchingPosts.length === 1 ? `/blog/${matchingPosts[0].slug}` : "/dashboard",
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    } catch (err: unknown) {
      // 410 Gone = subscription expired, clean it up
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        console.error(`[push] failed for sub ${sub.id}:`, err);
      }
    }
  }
}
