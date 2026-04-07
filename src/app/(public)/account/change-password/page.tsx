"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StrengthBar({ password }: { password: string }) {
  const rules = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = rules.filter(Boolean).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : "bg-[var(--border)]"}`}
          />
        ))}
      </div>
      <p className={`text-xs ${score < 2 ? "text-red-500" : score < 4 ? "text-yellow-600" : "text-green-600"}`}>
        {labels[score - 1] ?? "Too short"}
      </p>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    const pwErrors: string[] = [];
    if (next.length < 8)             pwErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(next))         pwErrors.push("one uppercase letter");
    if (!/[0-9]/.test(next))         pwErrors.push("one number");
    if (!/[^A-Za-z0-9]/.test(next)) pwErrors.push("one special character");
    if (pwErrors.length) {
      setError(`Password must contain: ${pwErrors.join(", ")}.`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/account"), 2000);
    } else {
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">✓</div>
          <h1 className="font-serif text-2xl font-bold text-[var(--foreground)]">Password updated</h1>
          <p className="text-sm text-[var(--text-muted)]">Taking you back to your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-7">
          <Link href="/account" className="text-sm text-[var(--text-muted)] hover:underline">
            ← Back to account
          </Link>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-7">
          Change password
        </h1>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-400)] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-400)] text-sm"
            />
            <StrengthBar password={next} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sage-400)] text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
