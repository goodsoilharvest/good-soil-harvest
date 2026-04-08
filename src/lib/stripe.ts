import Stripe from "stripe";

// Lazy singleton — avoids throwing at module load time if env vars aren't set yet
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2025-03-31.basil" });
  }
  return _stripe;
}

// Keep named export for backwards compat — resolved at call time, not import time
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  SEEDLING: {
    name: "Seedling",
    price: 4.99,
    get priceId() { return process.env.STRIPE_PRICE_SEEDLING ?? ""; },
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
    get priceId() { return process.env.STRIPE_PRICE_DEEP_ROOTS ?? ""; },
    description: "Everything in Seedling, plus exclusive content and real-world resources",
    features: [
      "Everything in Seedling",
      "Exclusive Deep Roots posts (twice a month)",
      "AI-powered search — ask anything, surface the exact articles you need",
      "Early access to new features",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Derive plan from a Stripe price ID — works even after portal plan changes */
export function planFromPriceId(priceId: string): PlanKey | null {
  if (priceId === process.env.STRIPE_PRICE_SEEDLING)   return "SEEDLING";
  if (priceId === process.env.STRIPE_PRICE_DEEP_ROOTS) return "DEEP_ROOTS";
  return null;
}
