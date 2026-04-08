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

  return (
    <AccountClient
      userId={session.user.id}
      email={session.user.email ?? ""}
      memberSince={user?.createdAt?.toISOString() ?? null}
      plan={sub?.plan ?? null}
      status={sub?.status ?? "FREE"}
      currentPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
    />
  );
}
