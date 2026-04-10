import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, PLANS, type PlanKey, planFromPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Plan upgrade entry point.
//
// Two paths depending on whether the user is in a free trial:
//
// 1) User IS in trial → bypass the Customer Portal and do a direct API update.
//    The trial is preserved, no charge happens, and the user gets the new
//    plan benefits immediately. Returns { ok: true, upgraded: true }.
//
// 2) User is NOT in trial → return a Customer Portal session URL deep-linked
//    to the "subscription update confirm" flow so the user sees Stripe's
//    proration math and explicit confirmation before any charge. Returns
//    { url }.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: PlanKey };
  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const targetPriceId = PLANS[plan].priceId;
  if (!targetPriceId) {
    return NextResponse.json({ error: "Stripe price ID not configured" }, { status: 500 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription?.stripeCustomerId || !subscription.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
  const itemId = stripeSub.items.data[0]?.id;
  if (!itemId) {
    return NextResponse.json({ error: "Subscription has no items" }, { status: 500 });
  }

  // Skip the upgrade if they're already on this plan
  const currentPriceId = stripeSub.items.data[0]?.price.id;
  if (currentPriceId === targetPriceId) {
    return NextResponse.json({ ok: true, alreadyOnPlan: true });
  }

  // ── Path 1: in trial → direct API update, preserve trial, no charge ──────
  const isInTrial =
    stripeSub.status === "trialing" ||
    (stripeSub.trial_end !== null && stripeSub.trial_end * 1000 > Date.now());

  if (isInTrial) {
    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [{ id: itemId, price: targetPriceId, quantity: 1 }],
      // Preserve the existing trial end — don't reset it, don't end it early
      trial_end: stripeSub.trial_end ?? undefined,
      // No proration during trial — they're not paying for anything yet
      proration_behavior: "none",
      metadata: { userId: session.user.id, plan },
    });

    // Sync our DB immediately (the webhook will also fire but this avoids any race)
    const newPlan = planFromPriceId(targetPriceId) ?? plan;
    const periodEnd =
      (updated.items.data[0] as { current_period_end?: number } | undefined)?.current_period_end ?? null;
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        plan: newPlan,
        trialEnd: updated.trial_end ? new Date(updated.trial_end * 1000) : null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      upgraded: true,
      trialPreserved: true,
      newPlan,
    });
  }

  // ── Path 2: not in trial → Customer Portal with proration confirmation ──
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "https://goodsoilharvest.com";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/account?sync=1`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: subscription.stripeSubscriptionId,
        items: [{ id: itemId, price: targetPriceId, quantity: 1 }],
      },
      after_completion: {
        type: "redirect",
        redirect: { return_url: `${origin}/account?sync=1` },
      },
    },
  });

  return NextResponse.json({ url: portalSession.url });
}
