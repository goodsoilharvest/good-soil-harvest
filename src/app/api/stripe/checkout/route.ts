import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, PLANS, assertStripeUrl, type PlanKey } from "@/lib/stripe";
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

    // ADMIN users get free Deep Roots access — refuse to take their money
    if (user?.role === "ADMIN") {
      return NextResponse.json(
        { error: "admin_comp", message: "Admin accounts have free Deep Roots access" },
        { status: 403 }
      );
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

    // ── Already has an active subscription? Tell client to use the portal flow ──
    // (Plan changes need Stripe's confirmation UI for transparency around proration.)
    if (
      existingSub?.stripeSubscriptionId &&
      (existingSub.status === "ACTIVE" || existingSub.status === "PAST_DUE")
    ) {
      return NextResponse.json(
        { error: "use_portal", message: "Use /api/stripe/upgrade-portal for plan changes" },
        { status: 409 }
      );
    }

    // ── No existing subscription → create Checkout session (first time) ─────
    let customerId = existingSub?.stripeCustomerId;
    if (!customerId) {
      // Avoid duplicate customers — search for an existing one by email first
      const existing = await stripe.customers.list({ email: session.user.email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        // Update metadata so it links to this user
        await stripe.customers.update(customerId, {
          metadata: { userId: session.user.id! },
        });
      } else {
        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: { userId: session.user.id! },
        });
        customerId = customer.id;
      }
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXTAUTH_URL ??
      "https://goodsoilharvest.com";

    // Check if this email has already used a free trial (even if the prior account was deleted)
    const emailLower = session.user.email.toLowerCase();
    const priorClaim = await prisma.trialClaim.findUnique({ where: { email: emailLower } });
    const grantTrial = !priorClaim;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: session.user.id!, plan, trialGranted: grantTrial ? "1" : "0" },
      subscription_data: {
        ...(grantTrial ? { trial_period_days: 7 } : {}),
        metadata: { userId: session.user.id!, plan },
      },
    });

    // Record the claim now so even if they cancel checkout halfway, repeated attempts don't get
    // trial-granted infinitely. The webhook will mark it on actual subscription creation too.
    if (grantTrial) {
      try {
        await prisma.trialClaim.create({ data: { email: emailLower } });
      } catch {
        // race — already exists, fine
      }
    }

    return NextResponse.json({ url: assertStripeUrl(checkoutSession.url) });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
