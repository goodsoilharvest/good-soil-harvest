import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: PlanKey };
  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = PLANS[plan].priceId;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price ID not configured" },
      { status: 500 }
    );
  }

  // Find or create Stripe customer
  let subscription = await prisma.subscription.findUnique({
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

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "https://goodsoilharvest.com";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/account?upgraded=1`,
    cancel_url: `${origin}/pricing`,
    // Store userId + plan in session metadata (accessible on checkout.session.completed)
    metadata: { userId: session.user.id!, plan },
    subscription_data: {
      metadata: { userId: session.user.id!, plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
