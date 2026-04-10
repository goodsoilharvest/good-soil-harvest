"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const planLabels: Record<string, { name: string; price: string; icon: string }> = {
  SEEDLING:   { name: "Seedling",   price: "$4.99/mo", icon: "🌱" },
  DEEP_ROOTS: { name: "Deep Roots", price: "$9.99/mo", icon: "🌾" },
};

type PasswordStrength = { ok: boolean; label: string; color: string };

function checkPassword(pw: string): { rules: { label: string; met: boolean }[]; strength: PasswordStrength } {
  const rules = [
    { label: "At least 8 characters",   met: pw.length >= 8 },
    { label: "One uppercase letter",     met: /[A-Z]/.test(pw) },
    { label: "One number",               met: /[0-9]/.test(pw) },
    { label: "One special character",    met: /[^A-Za-z0-9]/.test(pw) },
  ];
  const passed = rules.filter(r => r.met).length;
  const strength: PasswordStrength =
    passed <= 1 ? { ok: false, label: "Weak",   color: "bg-red-400" } :
    passed === 2 ? { ok: false, label: "Fair",   color: "bg-yellow-400" } :
    passed === 3 ? { ok: false, label: "Good",   color: "bg-[var(--color-sage-400)]" } :
                   { ok: true,  label: "Strong", color: "bg-[var(--color-sage-600)]" };
  return { rules, strength };
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? null;

  const [email, setEmail]                 = useState("");
  const [emailTouched, setEmailTouched]   = useState(false);
  const [password, setPassword]           = useState("");
  const [pwTouched, setPwTouched]         = useState(false);
  const [confirm, setConfirm]             = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);

  const emailValid = validateEmail(email);
  const { rules, strength } = checkPassword(password);
  const allRulesMet = rules.every(r => r.met);
  const passwordsMatch = password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid || !allRulesMet || !passwordsMatch) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Email already exists — bounce them to sign-in with a friendly message
      if (data.error === "account_exists") {
        const signInUrl = plan ? `/sign-in?plan=${plan}&existing=1` : "/sign-in?existing=1";
        router.push(`${signInUrl}&email=${encodeURIComponent(email)}`);
        return;
      }
      setError(data.message ?? data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Account created but sign-in failed. Please sign in.");
      router.push(plan ? `/sign-in?plan=${plan}` : "/sign-in");
      return;
    }

    // Always send to verify-email first — checkout blocks unverified accounts
    router.push(`/verify-email?email=${encodeURIComponent(email)}${plan ? `&plan=${plan}` : ""}`);
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
              Signing up for{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {selectedPlan.icon} {selectedPlan.name} — {selectedPlan.price}
              </span>
              . Payment info comes next.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Free to join. Upgrade anytime.</p>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                required
                autoFocus
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface)] focus:outline-none text-sm transition-colors
                  ${emailTouched && !emailValid
                    ? "border-red-400 focus:border-red-400"
                    : "border-[var(--border)] focus:border-[var(--color-sage-400)]"
                  }`}
              />
              {emailTouched && !emailValid && (
                <p className="text-xs text-red-500 mt-1">Enter a valid email address (e.g. name@example.com)</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setPwTouched(true)}
                required
                placeholder="Min 8 chars, mixed case, number, symbol"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--color-sage-400)] text-sm transition-colors"
              />

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${strength.color}`}
                        style={{ width: `${(rules.filter(r => r.met).length / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${strength.ok ? "text-[var(--color-sage-600)]" : "text-[var(--text-muted)]"}`}>
                      {strength.label}
                    </span>
                  </div>

                  {pwTouched && (
                    <ul className="space-y-1">
                      {rules.map(rule => (
                        <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.met ? "text-[var(--color-sage-600)]" : "text-[var(--text-muted)]"}`}>
                          <span>{rule.met ? "✓" : "○"}</span>
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onBlur={() => setConfirmTouched(true)}
                required
                placeholder="Re-enter your password"
                className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface)] focus:outline-none text-sm transition-colors
                  ${confirmTouched && confirm.length > 0 && !passwordsMatch
                    ? "border-red-400 focus:border-red-400"
                    : "border-[var(--border)] focus:border-[var(--color-sage-400)]"
                  }`}
              />
              {confirmTouched && confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmTouched && confirm.length > 0 && passwordsMatch && (
                <p className="text-xs text-[var(--color-sage-600)] mt-1">✓ Passwords match</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !emailValid || !allRulesMet || !passwordsMatch}
              className="w-full py-3 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-40"
            >
              {loading
                ? "Creating account…"
                : selectedPlan
                  ? "Create account & continue to payment"
                  : "Create account"}
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
