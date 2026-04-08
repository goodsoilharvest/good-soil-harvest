import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Block unverified accounts
    const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
    if (user && !user.emailVerified) {
      return NextResponse.json({ error: "unverified", email: session.user.email }, { status: 403 });
    }

    const { plan } = (await req.json()) as { plan: PlanKey };
    if (!PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PLANS[plan].priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price ID not configured — check STRIPE_PRICE_SEEDLING / STRIPE_PRICE_DEEP_ROOTS env vars" },
        { status: 500 }
      );
    }

    const existingSub = await prisma.subscription.findUnique({ where: { userId: session.user.id! } });

    // ── Already has an active subscription → update price in-place ──────────
    if (
      existingSub?.stripeSubscriptionId &&
      (existingSub.status === "ACTIVE" || existingSub.status === "PAST_DUE")
    ) {
      const stripeSub = await stripe.subscriptions.retrieve(existingSub.stripeSubscriptionId);
      const itemId = stripeSub.items.data[0]?.id;

      if (itemId) {
        const updated = await stripe.subscriptions.update(existingSub.stripeSubscriptionId, {
          items: [{ id: itemId, price: priceId }],
          proration_behavior: "always_invoice",
          metadata: { userId: session.user.id!, plan },
        });

        const trialEnd = updated.trial_end ? new Date(updated.trial_end * 1000) : null;
        const item = updated.items.data[0] as { current_period_end?: number } | undefined;
        const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000) : null;

        await prisma.subscription.update({
          where: { userId: session.user.id! },
          data: { plan, trialEnd, currentPeriodEnd: periodEnd },
        });

        // Return a special flag so the client knows no redirect is needed
        return NextResponse.json({ upgraded: true, plan });
      }
    }

    // ── No existing subscription → create Checkout session (first time) ─────
    let customerId = existingSub?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id! },
      });
      customerId = customer.id;
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXTAUTH_URL ??
      "https://goodsoilharvest.com";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: session.user.id!, plan },
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: session.user.id!, plan },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
