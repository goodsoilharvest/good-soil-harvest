"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? null;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // If they came from a plan selection, go straight to Stripe
    if (plan && (plan === "SEEDLING" || plan === "DEEP_ROOTS")) {
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (checkout.status === 403) {
        // Email not verified — send them to verify first
        router.push(`/verify-email?email=${encodeURIComponent(email)}&plan=${plan}`);
        return;
      }
      const data = await checkout.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    }

    router.push("/account");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌱</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {plan
              ? "Sign in to continue to payment."
              : "Sign in to access your Good Soil membership."}
          </p>
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
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          {"Don't have an account? "}
          <Link
            href={plan ? `/register?plan=${plan}` : "/pricing"}
            className="text-[var(--color-sage-600)] hover:underline font-medium"
          >
            {plan ? "Create one first" : "See membership plans"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
