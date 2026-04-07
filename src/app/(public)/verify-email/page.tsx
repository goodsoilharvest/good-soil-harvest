"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const error = searchParams.get("error");
  const email = searchParams.get("email") ?? "";
  const plan = searchParams.get("plan") ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function resend() {
    if (!email) return;
    setResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
    setResending(false);
  }

  if (success) {
    const next = plan ? `/sign-in?plan=${plan}` : "/sign-in";
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center space-y-5">
          <span className="text-5xl block">✓</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Email verified!</h1>
          <p className="text-[var(--text-muted)]">
            {plan ? "Your account is active. Sign in to continue to payment." : "Your account is active. Sign in to get started."}
          </p>
          <Link
            href={next}
            className="inline-block px-8 py-3 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
          >
            {plan ? "Sign in & subscribe" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    const messages: Record<string, string> = {
      missing: "No verification token found in the link.",
      invalid: "This verification link is invalid or has already been used.",
      expired: "This link has expired. Request a new one below.",
    };
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-sm w-full text-center space-y-5">
          <span className="text-5xl block">✗</span>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Verification failed</h1>
          <p className="text-[var(--text-muted)]">{messages[error] ?? "Something went wrong."}</p>
          {email && !resent && (
            <button
              onClick={resend}
              disabled={resending}
              className="inline-block px-6 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:border-[var(--color-sage-400)] transition-colors disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          )}
          {resent && <p className="text-sm text-[var(--color-sage-600)]">New verification email sent — check your inbox.</p>}
          <div>
            <Link href="/sign-in" className="text-sm text-[var(--text-muted)] hover:underline">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  // Default: check your inbox
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center space-y-5">
        <span className="text-5xl block">✉️</span>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Check your inbox</h1>
        <p className="text-[var(--text-muted)]">
          We sent a verification link to <strong>{email || "your email"}</strong>.
          Click it to activate your account.
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {"Didn't get it? Check your spam folder, or "}
          {email ? (
            resent ? (
              <span className="text-[var(--color-sage-600)]">email resent!</span>
            ) : (
              <button
                onClick={resend}
                disabled={resending}
                className="text-[var(--color-sage-600)] hover:underline disabled:opacity-50"
              >
                {resending ? "sending…" : "resend it"}
              </button>
            )
          ) : (
            <Link href="/sign-in" className="text-[var(--color-sage-600)] hover:underline">sign in again</Link>
          )}
          .
        </p>
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
