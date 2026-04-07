import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "SEEDLING" | "DEEP_ROOTS" | undefined;
      const customerId = session.customer as string;
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

      if (!userId || !subscriptionId) break;

      // Get period end from the first subscription item
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = periodEndFromSub(stripeSub);

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: "ACTIVE",
          plan: plan ?? "SEEDLING",
          currentPeriodEnd: periodEnd,
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: "ACTIVE",
          plan: plan ?? "SEEDLING",
          currentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const plan = sub.metadata?.plan as "SEEDLING" | "DEEP_ROOTS" | undefined;
      const status = stripeStatusToDb(sub.status);
      const periodEnd = periodEndFromSub(sub);

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          currentPeriodEnd: periodEnd,
          ...(plan ? { plan } : {}),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELED", plan: null, currentPeriodEnd: null },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (subscriptionId) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);
      if (subscriptionId) {
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: periodEndFromSub(stripeSub),
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// current_period_end moved to SubscriptionItem in newer Stripe API
function periodEndFromSub(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0];
  if (!item) return null;
  const ts = (item as Stripe.SubscriptionItem & { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000) : null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const sub = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
  if (!sub) return null;
  return typeof sub === "string" ? sub : sub.id;
}

function stripeStatusToDb(status: Stripe.Subscription["status"]) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED" as const;
    default:
      return "FREE" as const;
  }
}
