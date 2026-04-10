import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSuggestions, getLikedPosts, getViewedPosts } from "@/lib/suggestions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  // Always read user + subscription from DB — JWT token can be stale after sync
  const [user, sub] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, plan: true, trialEnd: true },
    }),
  ]);

  // ADMIN users get Deep Roots access automatically — no Stripe needed.
  // Owner comp accounts are common SaaS practice.
  const isAdmin = user?.role === "ADMIN";
  const isPaid = isAdmin || sub?.status === "ACTIVE";
  const isDeepRoots = isAdmin || (isPaid && sub?.plan === "DEEP_ROOTS");
  const plan = isAdmin ? "DEEP_ROOTS" : ((sub?.plan as string | null) ?? null);

  const [suggestions, liked, history, totalPosts] = await Promise.all([
    isPaid ? getSuggestions(userId) : Promise.resolve([]),
    isPaid ? getLikedPosts(userId)  : Promise.resolve([]),
    isPaid ? getViewedPosts(userId) : Promise.resolve([]),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
  ]);

  const browse = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, description: true,
      niche: true, isPremium: true, isDeepRoots: true, publishedAt: true,
      featuredImage: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  return (
    <DashboardClient
      userId={userId}
      plan={plan}
      isPaid={isPaid}
      isDeepRoots={isDeepRoots}
      suggestions={suggestions}
      liked={liked}
      history={history}
      browse={browse}
      totalPosts={totalPosts}
      trialEnd={sub?.trialEnd ? sub.trialEnd.toISOString() : null}
    />
  );
}
