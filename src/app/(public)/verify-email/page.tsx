"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const plan  = searchParams.get("plan")  ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleDigit(i: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    setError("");
    if (char && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== "")) submitCode(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      inputs.current[5]?.focus();
      submitCode(pasted);
    }
    e.preventDefault();
  }

  async function submitCode(code: string) {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (res.ok) {
      setVerified(true);

      // Build auto-login URL — server-side route signs user in and redirects
      // to /account?checkout=PLAN (which auto-fires Stripe) or just /account
      const loginToken = data.loginToken as string | undefined;
      const params = new URLSearchParams({ email });
      if (loginToken) params.set("token", loginToken);
      if (plan) params.set("plan", plan);

      setTimeout(() => {
        window.location.href = `/api/auth/auto-login?${params}`;
      }, 1200);
    } else {
      setError(data.error ?? "Incorrect code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      setLoading(false);
    }
  }

  async function resendCode() {
    setResending(true);
    setError("");
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
    setResending(false);
    setDigits(["", "", "", "", "", ""]);
    setTimeout(() => inputs.current[0]?.focus(), 100);
    setTimeout(() => setResent(false), 5000);
  }

  if (verified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Verified!</h1>
          <p className="text-[var(--text-muted)]">
            {plan ? "Taking you to payment…" : "Taking you to your account…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">✉️</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-2">
            Check your email
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[var(--foreground)]">{email || "your email"}</span>.
            Enter it below.
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-8">
          {/* 6-digit input */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                autoFocus={i === 0}
                className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none transition-colors disabled:opacity-50
                  ${error
                    ? "border-red-400 focus:border-red-400"
                    : d
                      ? "border-[var(--color-sage-400)]"
                      : "border-[var(--border)] focus:border-[var(--color-sage-400)]"
                  }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
          )}

          {loading && !error && (
            <p className="text-sm text-[var(--text-muted)] text-center mb-4">Verifying…</p>
          )}

          <p className="text-xs text-[var(--text-muted)] text-center">
            Code expires in 30 minutes.
          </p>
        </div>

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-[var(--text-muted)]">
            {"Didn't get it? Check your spam, or "}
            {resent ? (
              <span className="text-[var(--color-sage-600)] font-medium">new code sent!</span>
            ) : (
              <button
                onClick={resendCode}
                disabled={resending}
                className="text-[var(--color-sage-600)] hover:underline font-medium disabled:opacity-50"
              >
                {resending ? "sending…" : "send a new code"}
              </button>
            )}
          </p>
          <p className="text-sm">
            <Link href="/sign-in" className="text-[var(--text-muted)] hover:underline text-xs">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
