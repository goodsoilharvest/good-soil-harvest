import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
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

  // Idempotency: if we've already processed this event, acknowledge and stop.
  // Stripe retries on 5xx and occasionally sends duplicates even on 2xx,
  // so double-processing has to be impossible, not just unlikely.
  try {
    await prisma.webhookEvent.create({
      data: { stripeEventId: event.id, eventType: event.type },
    });
  } catch (err) {
    // Unique constraint violation = already seen. Return 200 so Stripe stops retrying.
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Any other error — log but continue, so a transient DB blip doesn't lose the event
    console.error("[webhooks/stripe] idempotency insert failed:", err);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      let userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "SEEDLING" | "DEEP_ROOTS" | undefined;
      const customerId = session.customer as string;
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

      if (!subscriptionId) break;

      // Fallback: if userId missing from metadata, look up by customer email
      if (!userId) {
        const customer = await stripe.customers.retrieve(customerId);
        const email = "deleted" in customer ? null : customer.email;
        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          userId = user?.id;
        }
      }

      if (!userId) break;

      // Get period end and trial end from the subscription
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      const periodEnd = periodEndFromSub(stripeSub);
      const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: "ACTIVE",
          plan: plan ?? "SEEDLING",
          currentPeriodEnd: periodEnd,
          trialEnd,
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: "ACTIVE",
          plan: plan ?? "SEEDLING",
          currentPeriodEnd: periodEnd,
          trialEnd,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      // Derive plan from price ID — metadata.plan is NOT updated by Stripe portal changes
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan = planFromPriceId(priceId) ?? (sub.metadata?.plan as "SEEDLING" | "DEEP_ROOTS" | undefined);
      const status = stripeStatusToDb(sub.status);
      const periodEnd = periodEndFromSub(sub);
      const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status,
          currentPeriodEnd: periodEnd,
          trialEnd,
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
