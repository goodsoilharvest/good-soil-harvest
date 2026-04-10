"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  trialEnd: string | null;
};

function trialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const ms = new Date(trialEnd).getTime() - Date.now();
  if (ms <= 0) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

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

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setDeleteConfirm(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleDelete() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/?deleted=1" });
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete account. Please try again.");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <span>⚙ Account</span>
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-10">
          <Link
            href="/account/change-password"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            🔑 Change password
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            💬 Contact / Support
          </Link>
          <div className="border-t border-[var(--border)] my-1" />
          <Link
            href="/terms"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/disclaimer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            Disclaimer
          </Link>
          <div className="border-t border-[var(--border)] my-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            ↩ Sign out
          </button>
          <div className="border-t border-[var(--border)] my-1" />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50"
          >
            {deleting ? "Deleting…" : deleteConfirm ? "⚠ Click again to confirm permanent deletion" : "🗑 Delete account"}
          </button>
        </div>
      )}
    </div>
  );
}

function AccountContent({ userId, email, memberSince, plan, status, currentPeriodEnd, trialEnd }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgraded = searchParams.get("upgraded") === "1";
  const checkout = searchParams.get("checkout");
  const syncOnReturn = searchParams.get("sync") === "1";

  const [portalLoading, setPortalLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const isActive = status === "ACTIVE";
  const info = plan ? planInfo[plan] : null;
  const daysLeft = trialDaysLeft(trialEnd);
  const onTrial = daysLeft !== null && daysLeft > 0;

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

  // After Stripe checkout (new subscription)
  useEffect(() => {
    if (upgraded && !isActive) {
      setSyncing(true);
      fetch("/api/account/sync-stripe", { method: "POST" })
        .then(r => r.json())
        .then(data => {
          if (data.ok) router.replace("/account");
          else { setSyncMsg("Subscription not found in Stripe yet — try refreshing in a moment."); setSyncing(false); }
        })
        .catch(() => setSyncing(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After returning from Stripe portal (plan change, cancel, etc.)
  useEffect(() => {
    if (!syncOnReturn) return;
    setSyncing(true);
    fetch("/api/account/sync-stripe", { method: "POST" })
      .then(() => router.replace("/account"))
      .catch(() => router.replace("/account"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function manualSync() {
    setSyncing(true); setSyncMsg(null);
    const res = await fetch("/api/account/sync-stripe", { method: "POST" });
    const data = await res.json();
    if (res.ok) router.replace("/account");
    else { setSyncMsg(data.error ?? "No active Stripe subscription found for this email."); setSyncing(false); }
  }

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setPortalLoading(false);
  }

  async function upgradeToDeepRoots() {
    // Existing subscriber → Stripe portal with proration preview
    // No subscription → fresh checkout
    const endpoint = isActive ? "/api/stripe/upgrade-portal" : "/api/stripe/checkout";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "DEEP_ROOTS" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  if (checkout || syncOnReturn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">🌱</div>
          <p className="text-[var(--text-muted)] text-sm">
            {syncOnReturn ? "Updating your membership…" : "Taking you to checkout…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 space-y-5">

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

      {/* Header with back link */}
      <div className="pb-2 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Your Account</h1>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
        >
          ← My Feed
        </Link>
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
            {onTrial && (
              <div className="rounded-xl bg-[var(--color-harvest-50)] border border-[var(--color-harvest-200)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--color-harvest-800)] mb-0.5">
                  ⏰ Free trial — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                </p>
                <p className="text-xs text-[var(--color-harvest-700)]">
                  No charge until {trialEnd ? new Date(trialEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "your trial ends"}.
                  After that, ${info?.price ?? "9.99"}/month will be charged automatically. You can cancel any time before then to avoid the charge.
                </p>
              </div>
            )}
            {currentPeriodEnd && (
              <p className="text-xs text-[var(--text-muted)]">
                {onTrial ? "First charge" : "Renews"} {new Date(currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
              <span className="text-2xl mt-0.5">✨</span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--foreground)] mb-1">AI-Powered Search</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Ask anything and our AI surfaces the exact articles for what&apos;s on your mind — exclusive to Deep Roots.
                </p>
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
              <span className="text-2xl mt-0.5">🚀</span>
              <div>
                <p className="font-semibold text-[var(--foreground)] mb-1">Early Access</p>
                <p className="text-sm text-[var(--text-muted)]">First to see new features and content drops.</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Upgrade nudge for Seedling */}
      {isActive && plan === "SEEDLING" && (
        <div className="rounded-2xl border border-[var(--color-harvest-200)] bg-[var(--color-harvest-50)] p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-[var(--color-harvest-800)] mb-1">🌾 Unlock Deep Roots</p>
            <p className="text-sm text-[var(--color-harvest-700)]">
              Exclusive posts twice a month, AI-powered search, and early access to new features.
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

      {/* Account dropdown */}
      <Section title="More">
        <AccountDropdown />
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
