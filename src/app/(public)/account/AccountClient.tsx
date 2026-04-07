"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Props = {
  email: string;
  plan: "SEEDLING" | "DEEP_ROOTS" | null;
  status: string;
  currentPeriodEnd: string | null;
  bookDiscountCode: string | null;
};

const planLabels: Record<string, { label: string; icon: string; color: string }> = {
  SEEDLING:   { label: "Seedling",   icon: "🌱", color: "text-[var(--color-sage-700)]"    },
  DEEP_ROOTS: { label: "Deep Roots", icon: "🌾", color: "text-[var(--color-harvest-700)]" },
};

function UpgradeBanner({ plan }: { plan: string | null }) {
  const [loading, setLoading] = useState(false);

  if (plan === "DEEP_ROOTS") return null;

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "DEEP_ROOTS" }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-harvest-200)] bg-[var(--color-harvest-50)] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <p className="font-semibold text-[var(--color-harvest-800)] mb-1">
          🌾 Unlock Deep Roots
        </p>
        <p className="text-sm text-[var(--color-harvest-700)]">
          Exclusive posts twice a month, 60% off the Good Soil book, and early access to everything new.
        </p>
      </div>
      <button
        onClick={upgrade}
        disabled={loading}
        className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Upgrade — $9.99/mo"}
      </button>
    </div>
  );
}

function AccountContent({ email, plan, status, currentPeriodEnd, bookDiscountCode }: Props) {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";
  const [portalLoading, setPortalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isActive = status === "ACTIVE";
  const planInfo = plan ? planLabels[plan] : null;

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setPortalLoading(false);
  }

  function copyCode() {
    if (!bookDiscountCode) return;
    navigator.clipboard.writeText(bookDiscountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-6">
      {/* Success banner */}
      {upgraded && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-800 font-medium">
          Welcome! Your membership is active. Enjoy the content.
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Your Account</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{email}</p>
      </div>

      {/* Membership card */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4 text-sm uppercase tracking-wide">
          Membership
        </h2>

        {isActive && planInfo ? (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{planInfo.icon}</span>
              <div>
                <p className={`font-bold text-lg ${planInfo.color}`}>{planInfo.label}</p>
                {currentPeriodEnd && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Renews{" "}
                    {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="text-sm text-[var(--color-sage-600)] hover:underline disabled:opacity-50"
            >
              {portalLoading ? "Loading…" : "Manage billing →"}
            </button>
          </div>
        ) : status === "PAST_DUE" ? (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-red-600">Payment past due</p>
              <p className="text-sm text-[var(--text-muted)]">Please update your payment method to restore access.</p>
            </div>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {portalLoading ? "Loading…" : "Fix payment"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-[var(--foreground)]">Free</p>
              <p className="text-sm text-[var(--text-muted)]">Upgrade to unlock all premium content.</p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
            >
              See plans
            </Link>
          </div>
        )}
      </div>

      {/* Deep Roots perks */}
      {isActive && plan === "DEEP_ROOTS" && (
        <div className="bg-white rounded-2xl border border-[var(--color-harvest-200)] shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[var(--foreground)] text-sm uppercase tracking-wide">
            Deep Roots Perks
          </h2>

          {/* Book discount */}
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">📖</span>
            <div className="flex-1">
              <p className="font-semibold text-[var(--foreground)] mb-0.5">60% Off the Good Soil Book</p>
              <p className="text-sm text-[var(--text-muted)] mb-3">
                Your exclusive discount code — covers printing so you get it at cost.
              </p>
              {bookDiscountCode ? (
                <div className="flex items-center gap-3">
                  <code className="bg-[var(--color-harvest-50)] border border-[var(--color-harvest-200)] text-[var(--color-harvest-800)] font-mono font-bold text-sm px-4 py-2 rounded-lg tracking-widest">
                    {bookDiscountCode}
                  </code>
                  <button
                    onClick={copyCode}
                    className="text-xs text-[var(--color-sage-600)] hover:underline"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] italic">Book coming soon — code will appear here.</p>
              )}
            </div>
          </div>

          {/* Exclusive posts */}
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">🌾</span>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-0.5">Exclusive Deep Roots Posts</p>
              <p className="text-sm text-[var(--text-muted)] mb-3">
                Two new articles per month — deeper dives available only to Deep Roots members.
              </p>
              <Link
                href="/blog?tier=deep-roots"
                className="text-sm text-[var(--color-harvest-600)] hover:underline font-medium"
              >
                Browse Deep Roots posts →
              </Link>
            </div>
          </div>

          {/* Coming soon placeholder */}
          <div className="flex items-start gap-4 opacity-60">
            <span className="text-2xl mt-0.5">✨</span>
            <div>
              <p className="font-semibold text-[var(--foreground)] mb-0.5">More coming soon</p>
              <p className="text-sm text-[var(--text-muted)]">
                Courses, reflection guides, and community resources are in the works.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade banner for Seedling members */}
      {isActive && plan === "SEEDLING" && <UpgradeBanner plan={plan} />}

      {/* Sign out */}
      <div className="pt-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AccountClient(props: Props) {
  return (
    <Suspense>
      <AccountContent {...props} />
    </Suspense>
  );
}
