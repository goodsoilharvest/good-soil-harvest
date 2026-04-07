import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Looks up the logged-in user's email in Stripe, finds their active subscription,
// and syncs it to the DB. Useful when checkout completed but webhook missed userId.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find Stripe customer by email
  const customers = await stripe.customers.list({ email: session.user.email, limit: 5 });
  if (!customers.data.length) {
    return NextResponse.json({ error: "No Stripe customer found for this email" }, { status: 404 });
  }

  // Use the most recent customer
  const customer = customers.data[0];

  // Find their active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "active",
    limit: 1,
  });

  if (!subscriptions.data.length) {
    return NextResponse.json({ error: "No active subscription found in Stripe" }, { status: 404 });
  }

  const stripeSub = subscriptions.data[0];
  const plan = (stripeSub.metadata?.plan as "SEEDLING" | "DEEP_ROOTS") ?? "SEEDLING";
  const periodEnd = stripeSub.items?.data?.[0]
    ? new Date((stripeSub.items.data[0] as { current_period_end?: number }).current_period_end! * 1000)
    : null;

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSub.id,
      status: "ACTIVE",
      plan,
      currentPeriodEnd: periodEnd,
    },
    update: {
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSub.id,
      status: "ACTIVE",
      plan,
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ ok: true, plan });
}
