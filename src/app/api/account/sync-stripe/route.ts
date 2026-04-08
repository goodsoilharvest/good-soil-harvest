import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Looks up the logged-in user's Stripe subscription (active OR trialing)
// and syncs it to the DB. Called after checkout completes.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await stripe.customers.list({ email: session.user.email, limit: 5 });
  if (!customers.data.length) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const customer = customers.data[0];

  // Check active subscriptions first, then trialing
  let stripeSub = null;
  for (const status of ["active", "trialing"] as const) {
    const subs = await stripe.subscriptions.list({ customer: customer.id, status, limit: 1 });
    if (subs.data.length) { stripeSub = subs.data[0]; break; }
  }

  if (!stripeSub) {
    return NextResponse.json({ error: "No active or trialing subscription found" }, { status: 404 });
  }

  const priceId = stripeSub.items?.data?.[0]?.price.id ?? "";
  const plan = planFromPriceId(priceId) ?? (stripeSub.metadata?.plan as "SEEDLING" | "DEEP_ROOTS") ?? "SEEDLING";
  const item = stripeSub.items?.data?.[0] as { current_period_end?: number } | undefined;
  const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;
  const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSub.id,
      status: "ACTIVE",
      plan,
      currentPeriodEnd: periodEnd,
      trialEnd,
    },
    update: {
      stripeCustomerId: customer.id,
      stripeSubscriptionId: stripeSub.id,
      status: "ACTIVE",
      plan,
      currentPeriodEnd: periodEnd,
      trialEnd,
    },
  });

  return NextResponse.json({ ok: true, plan, trialEnd });
}
