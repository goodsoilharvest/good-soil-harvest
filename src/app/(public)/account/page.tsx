import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?redirect=/account");

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <AccountClient
      email={session.user.email ?? ""}
      plan={sub?.plan ?? null}
      status={sub?.status ?? "FREE"}
      currentPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
      bookDiscountCode={
        sub?.plan === "DEEP_ROOTS" && sub?.status === "ACTIVE"
          ? (process.env.DEEP_ROOTS_BOOK_CODE ?? null)
          : null
      }
    />
  );
}
