import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSuggestions, getLikedPosts, getViewedPosts } from "@/lib/suggestions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const isPaid = session.user.subscriptionStatus === "ACTIVE";

  // Load everything in parallel
  const [suggestions, liked, history, totalPosts, sub] = await Promise.all([
    isPaid ? getSuggestions(userId) : Promise.resolve([]),
    isPaid ? getLikedPosts(userId)  : Promise.resolve([]),
    isPaid ? getViewedPosts(userId) : Promise.resolve([]),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.subscription.findUnique({ where: { userId }, select: { trialEnd: true } }),
  ]);

  const browse = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, description: true,
      niche: true, isPremium: true, isDeepRoots: true, publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  const plan = session.user.subscriptionPlan as string | null | undefined;
  const trialEnd = sub?.trialEnd ?? null;

  return (
    <DashboardClient
      userId={userId}
      plan={plan ?? null}
      isPaid={isPaid}
      suggestions={suggestions}
      liked={liked}
      history={history}
      browse={browse}
      totalPosts={totalPosts}
      trialEnd={trialEnd ? trialEnd.toISOString() : null}
    />
  );
}
