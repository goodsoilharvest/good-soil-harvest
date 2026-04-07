"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const planLabels: Record<string, { name: string; price: string; icon: string }> = {
  SEEDLING:   { name: "Seedling",   price: "$4.99/mo", icon: "🌱" },
  DEEP_ROOTS: { name: "Deep Roots", price: "$9.99/mo", icon: "🌾" },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? null;  // SEEDLING | DEEP_ROOTS | null

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1 — Create account
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // 2 — Auto sign-in
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
      router.push(plan ? `/sign-in?plan=${plan}` : "/sign-in");
      return;
    }

    // 3 — If a plan was selected, go straight to Stripe checkout
    if (plan && (plan === "SEEDLING" || plan === "DEEP_ROOTS")) {
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const checkoutData = await checkout.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
    }

    router.push("/account");
  }

  const selectedPlan = plan ? planLabels[plan] : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌱</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2">
            Create your account
          </h1>
          {selectedPlan ? (
            <p className="text-sm text-[var(--text-muted)]">
              You&apos;re signing up for{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {selectedPlan.icon} {selectedPlan.name} — {selectedPlan.price}
              </span>
              . Payment info comes next.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              Free to join. Upgrade to a membership anytime.
            </p>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--color-sage-400)] text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password{" "}
                <span className="text-[var(--text-muted)] font-normal">(min 8 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--color-sage-400)] text-sm transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-50 mt-2"
            >
              {loading
                ? selectedPlan ? "Creating account…" : "Creating account…"
                : selectedPlan ? `Create account & continue to payment` : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{" "}
          <Link
            href={plan ? `/sign-in?plan=${plan}` : "/sign-in"}
            className="text-[var(--color-sage-600)] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
