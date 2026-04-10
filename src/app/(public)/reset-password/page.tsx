"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const rules = [
    { ok: password.length >= 8, label: "8+ characters" },
    { ok: /[A-Z]/.test(password), label: "uppercase" },
    { ok: /[0-9]/.test(password), label: "number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "special character" },
  ];
  const allMet = rules.every(r => r.ok);
  const matches = password.length > 0 && password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allMet || !matches) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Couldn't reset password.");
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/sign-in"), 1500);
  }

  if (!token || !email) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-sm">
          <p className="font-serif text-2xl font-bold text-[var(--foreground)] mb-2">Invalid link</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            This password reset link is missing required information.
          </p>
          <Link href="/forgot-password" className="text-[var(--color-sage-600)] hover:underline">
            Request a new link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🔑</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2">
            Set a new password
          </h1>
          <p className="text-sm text-[var(--text-muted)]">For {email}</p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✓</div>
              <p className="font-semibold text-[var(--color-sage-700)]">Password updated</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Redirecting to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--color-sage-400)] text-sm transition-colors"
                />
                {password && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rules.map(r => (
                      <span
                        key={r.label}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          r.ok
                            ? "bg-[var(--color-sage-100)] text-[var(--color-sage-700)]"
                            : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                        }`}
                      >
                        {r.ok ? "✓" : "○"} {r.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--color-sage-400)] text-sm transition-colors"
                />
                {confirm && !matches && (
                  <p className="text-xs text-red-600 mt-1">Passwords don&apos;t match</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !allMet || !matches}
                className="w-full py-3 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-50"
              >
                {loading ? "Updating…" : "Set new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
