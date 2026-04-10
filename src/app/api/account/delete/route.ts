import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Cancel any active Stripe subscription AND delete the customer record before deleting the user
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const stripe = getStripe();

  if (subscription?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch {
      // May already be canceled — continue
    }
  }

  if (subscription?.stripeCustomerId) {
    try {
      await stripe.customers.del(subscription.stripeCustomerId);
    } catch {
      // May already be deleted — continue
    }
  }

  // Delete user — all related records (sessions, subscription, likes, views, search logs)
  // cascade automatically due to onDelete: Cascade in the Prisma schema
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
