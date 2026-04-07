"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  niche: string;
  isPremium: boolean;
  isDeepRoots: boolean;
  publishedAt: Date | null;
};

type Props = {
  userId: string;
  plan: string | null;
  isPaid: boolean;
  suggestions: Post[];
  liked: Post[];
  history: Post[];
  browse: Post[];
  totalPosts: number;
};

const nicheColors: Record<string, string> = {
  faith:      "text-[var(--color-harvest-600)]",
  finance:    "text-emerald-600",
  psychology: "text-violet-600",
  philosophy: "text-blue-600",
  science:    "text-cyan-600",
};

const nicheLabels: Record<string, string> = {
  faith: "Faith", finance: "Finance", psychology: "Psychology",
  philosophy: "Philosophy", science: "Science & Tech",
};

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--color-sage-400)] transition-colors block"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${nicheColors[post.niche] ?? ""}`}>
          {nicheLabels[post.niche] ?? post.niche}
        </span>
        {post.isDeepRoots && (
          <span className="text-xs font-semibold text-[var(--color-harvest-600)] border border-[var(--color-harvest-300)] rounded-full px-2 py-0.5">🌾 Deep Roots</span>
        )}
        {post.isPremium && !post.isDeepRoots && (
          <span className="text-xs font-semibold text-[var(--color-sage-600)] border border-[var(--color-sage-300)] rounded-full px-2 py-0.5">🌱 Premium</span>
        )}
      </div>
      <h3 className="font-serif font-bold text-[var(--foreground)] leading-snug mb-2 group-hover:text-[var(--color-sage-600)] transition-colors">
        {post.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] line-clamp-2">{post.description}</p>
    </Link>
  );
}

const TABS_PAID = ["For You", "Saved", "History", "Browse"] as const;
const TABS_FREE = ["Browse"] as const;

function DashboardContent({ userId, plan, isPaid, suggestions, liked, history, browse, totalPosts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const upgraded = searchParams.get("upgraded") === "1";
  const checkout  = searchParams.get("checkout");

  const tabs = isPaid ? TABS_PAID : TABS_FREE;
  const [tab, setTab] = useState<string>(tabs[0]);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // Auto-fire Stripe checkout if coming from email verification
  useEffect(() => {
    if (!checkout) return;
    fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: checkout }),
    })
      .then(r => r.json())
      .then(d => { if (d.url) window.location.href = d.url; else router.replace("/pricing"); })
      .catch(() => router.replace("/pricing"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync subscription after Stripe payment
  useEffect(() => {
    if (!upgraded || syncDone) return;
    setSyncing(true);
    fetch("/api/account/sync-stripe", { method: "POST" })
      .then(r => r.json())
      .then(d => {
        setSyncing(false);
        setSyncDone(true);
        if (d.ok) router.replace("/dashboard?welcomed=1");
      })
      .catch(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const welcomed = searchParams.get("welcomed") === "1";
  const planLabel = plan === "DEEP_ROOTS" ? "🌾 Deep Roots" : plan === "SEEDLING" ? "🌱 Seedling" : null;

  // Show loading screen while auto-redirecting to Stripe
  if (checkout) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-pulse">🌱</div>
          <p className="text-[var(--text-muted)] text-sm">Taking you to checkout…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-10">

      {/* Welcome banner after payment */}
      {(upgraded && syncing) && (
        <div className="mb-6 rounded-xl bg-[var(--color-sage-50)] border border-[var(--color-sage-200)] px-5 py-4 text-sm text-[var(--color-sage-700)] flex items-center gap-2">
          <span className="animate-spin inline-block">⟳</span> Activating your membership…
        </div>
      )}
      {welcomed && planLabel && (
        <div className="mb-6 rounded-xl bg-[var(--color-sage-50)] border border-[var(--color-sage-200)] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-[var(--color-sage-700)]">
            🎉 Welcome! Your {planLabel} membership is active.
          </p>
          <Link href="/account" className="text-xs text-[var(--color-sage-600)] hover:underline font-medium">
            ⚙ Manage account & billing →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">
            {isPaid ? "Your Reading Profile" : "Browse"}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isPaid
              ? `${totalPosts} published articles across 5 topics`
              : `${totalPosts} articles — upgrade for personalized suggestions`}
          </p>
        </div>
        <Link
          href="/account"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
        >
          ⚙ Account settings
        </Link>
      </div>

      {/* Upgrade CTA for free users */}
      {!isPaid && (
        <div className="mb-8 rounded-2xl border-2 border-dashed border-[var(--color-sage-300)] bg-[var(--color-sage-50)] p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1">
            <p className="font-semibold text-[var(--foreground)] mb-1">🌱 Unlock your personal reading profile</p>
            <p className="text-sm text-[var(--text-muted)]">
              Get a "For You" tab with articles picked for you, save posts, track your history, and more. 7-day free trial.
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors"
          >
            Try free for 7 days
          </Link>
        </div>
      )}

      {/* Tab bar */}
      {isPaid && (
        <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors -mb-px border-b-2 ${
                tab === t
                  ? "border-[var(--color-sage-500)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t}
              {t === "Saved" && liked.length > 0 && (
                <span className="ml-1.5 text-xs bg-[var(--color-sage-100)] text-[var(--color-sage-700)] rounded-full px-1.5 py-0.5">
                  {liked.length}
                </span>
              )}
              {t === "History" && history.length > 0 && (
                <span className="ml-1.5 text-xs bg-[var(--color-sage-100)] text-[var(--color-sage-700)] rounded-full px-1.5 py-0.5">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {(!isPaid || tab === "Browse") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {browse.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {isPaid && tab === "For You" && (
        suggestions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📖</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">Start reading to get suggestions</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">As you read and save articles, we&apos;ll learn what you like and surface more of it.</p>
            <button onClick={() => setTab("Browse")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
              Browse all articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map(p => <PostCard key={p.id} post={p} />)}
            {suggestions.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3 text-center pt-2">
                <button onClick={() => setTab("Browse")} className="text-sm text-[var(--color-sage-600)] hover:underline">
                  Browse all {totalPosts} articles →
                </button>
              </div>
            )}
          </div>
        )
      )}

      {isPaid && tab === "Saved" && (
        liked.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔖</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">Nothing saved yet</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Hit the bookmark on any article to save it here.</p>
            <button onClick={() => setTab("Browse")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
              Find something to save
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liked.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )
      )}

      {isPaid && tab === "History" && (
        history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📚</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">No reading history yet</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Articles you read will appear here.</p>
            <button onClick={() => setTab("Browse")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
              Start reading
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {history.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )
      )}
    </div>
  );
}

export default function DashboardClient(props: Props) {
  return (
    <Suspense>
      <DashboardContent {...props} />
    </Suspense>
  );
}
