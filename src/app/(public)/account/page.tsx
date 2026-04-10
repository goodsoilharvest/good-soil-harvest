import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect=/account");

  const [user, sub] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const isAdmin = user?.role === "ADMIN";

  return (
    <AccountClient
      userId={session.user.id}
      email={session.user.email ?? ""}
      memberSince={user?.createdAt?.toISOString() ?? null}
      plan={isAdmin ? "DEEP_ROOTS" : (sub?.plan ?? null)}
      status={isAdmin ? "ACTIVE" : (sub?.status ?? "FREE")}
      currentPeriodEnd={isAdmin ? null : (sub?.currentPeriodEnd?.toISOString() ?? null)}
      trialEnd={isAdmin ? null : (sub?.trialEnd?.toISOString() ?? null)}
      isAdmin={isAdmin}
    />
  );
}
