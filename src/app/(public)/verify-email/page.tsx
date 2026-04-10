"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const plan  = searchParams.get("plan")  ?? "";

  const [code, setCode] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [debug, setDebug] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function dbg(msg: string) {
    const t = new Date().toISOString().slice(11, 19);
    setDebug(prev => [...prev.slice(-9), `[${t}] ${msg}`]);
  }

  useEffect(() => {
    inputRef.current?.focus();
    dbg(`mounted ua=${navigator.userAgent.slice(0, 40)}`);
  }, []);

  function handleChange(val: string) {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    dbg(`change "${val.slice(0, 12)}" → "${cleaned}"`);
    setCode(cleaned);
    setError("");
    if (cleaned.length === 6) submitCode(cleaned);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const raw = e.clipboardData.getData("text") || "";
    dbg(`paste raw="${raw.slice(0, 20)}"`);
    // Don't preventDefault — let the native handler set value, then onChange catches it
  }

  async function submitCode(c: string) {
    if (c.length !== 6) return;
    setLoading(true);
    setError("");
    dbg(`submit ${c}`);

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: c }),
    });

    const data = await res.json();

    if (res.ok) {
      setVerified(true);
      const loginToken = data.loginToken as string | undefined;
      const params = new URLSearchParams({ email });
      if (loginToken) params.set("token", loginToken);
      if (plan) params.set("plan", plan);
      setTimeout(() => {
        window.location.href = `/api/auth/auto-login?${params}`;
      }, 1200);
    } else {
      setError(data.error ?? "Incorrect code. Please try again.");
      setCode("");
      inputRef.current?.focus();
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
    setCode("");
    setTimeout(() => inputRef.current?.focus(), 100);
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

  // Build the 6 visual slots from the current code string
  const slots = Array.from({ length: 6 }, (_, i) => code[i] ?? "");
  const focusedIndex = code.length < 6 ? code.length : 5;

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
          {/* Single hidden input behind 6 visual boxes — only reliable cross-browser approach */}
          <div
            className="relative mb-6"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Visual slots */}
            <div className="flex gap-2 justify-center pointer-events-none">
              {slots.map((digit, i) => {
                const isFocused = i === focusedIndex && document.activeElement === inputRef.current;
                return (
                  <div
                    key={i}
                    className={`w-11 h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-2 bg-[var(--surface)] text-[var(--foreground)] transition-colors
                      ${error
                        ? "border-red-400"
                        : digit
                          ? "border-[var(--color-sage-400)]"
                          : isFocused
                            ? "border-[var(--color-sage-400)]"
                            : "border-[var(--border)]"
                      }`}
                  >
                    {digit}
                  </div>
                );
              })}
            </div>

            {/* Real input — invisible but receives all events */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => handleChange(e.target.value)}
              onPaste={handlePaste}
              disabled={loading}
              autoFocus
              aria-label="Verification code"
              className="absolute inset-0 w-full h-full opacity-0 text-center cursor-text disabled:opacity-0"
              style={{ caretColor: "transparent" }}
            />
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

        {/* DEBUG PANEL — remove after iOS verified */}
        {debug.length > 0 && (
          <div className="mt-4 p-3 bg-black/80 text-white text-xs font-mono rounded-lg max-h-40 overflow-y-auto">
            <div className="opacity-50 mb-1">debug events:</div>
            {debug.map((d, i) => <div key={i}>{d}</div>)}
          </div>
        )}
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
