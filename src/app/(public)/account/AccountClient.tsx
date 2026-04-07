"use client";

import { useState, useEffect, Suspense } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type Props = {
  userId: string;
  email: string;
  memberSince: string | null;
  plan: "SEEDLING" | "DEEP_ROOTS" | null;
  status: string;
  currentPeriodEnd: string | null;
  bookDiscountCode: string | null;
};

const planInfo = {
  SEEDLING: {
    label: "Seedling", icon: "🌱", price: "$4.99/mo",
    color: "text-[var(--color-sage-700)]",
    border: "border-[var(--color-sage-200)]",
    bg: "bg-[var(--color-sage-50)]",
  },
  DEEP_ROOTS: {
    label: "Deep Roots", icon: "🌾", price: "$9.99/mo",
    color: "text-[var(--color-harvest-700)]",
    border: "border-[var(--color-harvest-200)]",
    bg: "bg-[var(--color-harvest-50)]",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function AccountContent({ userId, email, memberSince, plan, status, currentPeriodEnd, bookDiscountCode }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgraded = searchParams.get("upgraded") === "1";

  const checkout = searchParams.get("checkout");

  const [portalLoading, setPortalLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const isActive = status === "ACTIVE";
  const info = plan ? planInfo[plan] : null;

  // Auto-fire Stripe checkout after post-verification auto-login
  useEffect(() => {
    if (!checkout) return;
    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: checkout }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) window.location.href = data.url;
        else router.replace("/pricing");
      })
      .catch(() => router.replace("/pricing"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync when landing from a successful Stripe checkout
  useEffect(() => {
    if (upgraded && !isActive) {
      setSyncing(true);
      fetch("/api/account/sync-stripe", { method: "POST" })
        .then(r => r.json())
        .then(data => {
          if (data.ok) {
            // Strip ?upgraded=1 and reload fresh from server
            router.replace("/account");
          } else {
            setSyncMsg("Subscription not found in Stripe yet — try refreshing in a moment.");
            setSyncing(false);
          }
        })
        .catch(() => { setSyncing(false); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function manualSync() {
    setSyncing(true);
    setSyncMsg(null);
    const res = await fetch("/api/account/sync-stripe", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      router.replace("/account");
    } else {
      setSyncMsg(data.error ?? "No active Stripe subscription found for this email.");
      setSyncing(false);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setPortalLoading(false);
  }

  async function upgradeToDeepRoots() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "DEEP_ROOTS" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  function copyCode() {
    if (!bookDiscountCode) return;
    navigator.clipboard.writeText(bookDiscountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-5">

      {/* Success / syncing banner */}
      {upgraded && syncing && (
        <div className="rounded-xl bg-[var(--color-sage-50)] border border-[var(--color-sage-200)] px-5 py-4 text-sm text-[var(--color-sage-700)] font-medium flex items-center gap-2">
          <span className="animate-spin">⟳</span> Confirming your membership…
        </div>
      )}
      {upgraded && !syncing && isActive && (
        <div className="rounded-xl bg-[var(--color-sage-50)] border border-[var(--color-sage-200)] px-5 py-4 text-sm text-[var(--color-sage-700)] font-medium">
          Welcome! Your {info?.label} membership is active. Enjoy the content.
        </div>
      )}

      {/* Header */}
      <div className="pb-2">
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Your Account</h1>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Email</span>
            <span className="font-medium text-[var(--foreground)]">{email}</span>
          </div>
          {memberSince && (
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Member since</span>
              <span className="font-medium text-[var(--foreground)]">
                {new Date(memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
        <div className="pt-1 border-t border-[var(--border)]">
          <Link
            href="/account/change-password"
            className="text-sm text-[var(--color-sage-600)] hover:underline"
          >
            Change password →
          </Link>
        </div>
      </Section>

      {/* Membership */}
      <Section title="Membership">
        {isActive && info ? (
          <>
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${info.border} ${info.bg}`}>
              <span className="text-4xl">{info.icon}</span>
              <div className="flex-1">
                <p className={`font-bold text-lg ${info.color}`}>{info.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{info.price}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            {currentPeriodEnd && (
              <p className="text-xs text-[var(--text-muted)]">
                Renews {new Date(currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="text-sm text-[var(--color-sage-600)] hover:underline disabled:opacity-50"
            >
              {portalLoading ? "Loading…" : "Manage billing, cancel, or update payment →"}
            </button>
          </>
        ) : status === "PAST_DUE" ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-red-600">Payment past due — access is paused.</p>
            <p className="text-sm text-[var(--text-muted)]">Update your payment method to restore access.</p>
            <button
              onClick={openPortal}
              disabled={portalLoading}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              {portalLoading ? "Loading…" : "Fix payment method"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Free plan</p>
                <p className="text-sm text-[var(--text-muted)]">Upgrade to unlock all premium content.</p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
              >
                See plans
              </Link>
            </div>
            <div className="pt-1 border-t border-[var(--border)]">
              <button
                onClick={manualSync}
                disabled={syncing}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--color-sage-600)] hover:underline disabled:opacity-50 transition-colors"
              >
                {syncing ? "Checking Stripe…" : "Already subscribed? Restore your membership →"}
              </button>
              {syncMsg && <p className="text-xs mt-1.5 text-[var(--color-sage-600)]">{syncMsg}</p>}
            </div>
          </div>
        )}
      </Section>

      {/* Deep Roots perks */}
      {isActive && plan === "DEEP_ROOTS" && (
        <Section title="Deep Roots Perks">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">📖</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--foreground)] mb-1">60% Off the Good Soil Book</p>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Your discount covers printing — you get it at cost.
                </p>
                {bookDiscountCode ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="bg-[var(--color-harvest-50)] border border-[var(--color-harvest-200)] text-[var(--color-harvest-800)] font-mono font-bold text-sm px-4 py-2 rounded-lg tracking-widest">
                      {bookDiscountCode}
                    </code>
                    <button onClick={copyCode} className="text-xs text-[var(--color-sage-600)] hover:underline">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] italic">Book coming soon — your code will appear here.</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-2xl mt-0.5">🌾</span>
              <div>
                <p className="font-semibold text-[var(--foreground)] mb-1">Exclusive Deep Roots Posts</p>
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Deeper dives published twice a month, only for Deep Roots members.
                </p>
                <Link href="/blog?tier=deep-roots" className="text-sm text-[var(--color-harvest-600)] hover:underline font-medium">
                  Browse Deep Roots posts →
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 opacity-60">
              <span className="text-2xl mt-0.5">✨</span>
              <div>
                <p className="font-semibold text-[var(--foreground)] mb-1">More coming soon</p>
                <p className="text-sm text-[var(--text-muted)]">Courses, reflection guides, and community resources.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Upgrade nudge for Seedling members */}
      {isActive && plan === "SEEDLING" && (
        <div className="rounded-2xl border border-[var(--color-harvest-200)] bg-[var(--color-harvest-50)] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-[var(--color-harvest-800)] mb-1">🌾 Unlock Deep Roots</p>
            <p className="text-sm text-[var(--color-harvest-700)]">
              Exclusive posts twice a month, 60% off the Good Soil book, and early access to new features.
            </p>
          </div>
          <button
            onClick={upgradeToDeepRoots}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
          >
            Upgrade — $9.99/mo
          </button>
        </div>
      )}

      {/* Account actions */}
      <Section title="Account">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/change-password"
            className="text-sm text-[var(--foreground)] hover:text-[var(--color-sage-600)] transition-colors"
          >
            Change password
          </Link>
          <span className="hidden sm:block text-[var(--border)]">·</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </Section>

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
