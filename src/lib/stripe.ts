import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});

export const PLANS = {
  SEEDLING: {
    name: "Seedling",
    price: 4.99,
    priceId: process.env.STRIPE_PRICE_SEEDLING!,
    description: "All premium posts, unlimited reading across every category",
    features: [
      "Unlimited access to all premium articles",
      "All 5 niches: Faith, Finance, Psychology, Philosophy, Science & Tech",
      "New posts delivered to your feed",
      "Support our ad-free mission",
    ],
  },
  DEEP_ROOTS: {
    name: "Deep Roots",
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_DEEP_ROOTS!,
    description: "Everything in Seedling, plus exclusive content and real-world resources",
    features: [
      "Everything in Seedling",
      "Exclusive Deep Roots posts (twice a month)",
      "60% off the Good Soil book — covers printing, yours at cost",
      "Early access to new features",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
