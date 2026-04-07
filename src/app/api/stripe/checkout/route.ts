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

    // Block unverified accounts from subscribing
    const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
    if (user && !user.emailVerified) {
      return NextResponse.json(
        { error: "unverified", email: session.user.email },
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

    // Find or create Stripe customer
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id! },
    });

    let customerId = subscription?.stripeCustomerId;

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
      success_url: `${origin}/account?upgraded=1`,
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
