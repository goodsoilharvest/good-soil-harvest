"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

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

    // Auto sign-in after registration
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in manually.");
      router.push(`/sign-in?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.push(redirect);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🌱</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2">
            Create your account
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Free to join. Upgrade to a membership anytime.
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
                Password <span className="text-[var(--text-muted)] font-normal">(min 8 characters)</span>
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{" "}
          <Link
            href={`/sign-in?redirect=${encodeURIComponent(redirect)}`}
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
