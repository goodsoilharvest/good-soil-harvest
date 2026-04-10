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
  const userEmail = session.user.email?.toLowerCase() ?? null;

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

  // Record the email so this user cannot claim another free trial after deleting + re-signing up.
  // Survives the user record deletion below since TrialClaim is unrelated to User.
  if (userEmail) {
    try {
      await prisma.trialClaim.upsert({
        where: { email: userEmail },
        create: { email: userEmail },
        update: {}, // already recorded — no-op
      });
    } catch {
      // non-fatal — continue with deletion
    }
  }

  // Delete user — all related records (sessions, subscription, likes, views, search logs)
  // cascade automatically due to onDelete: Cascade in the Prisma schema
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
