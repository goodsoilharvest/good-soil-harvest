"use client";

import { useState, useEffect, Suspense, useRef } from "react";
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
  trialEnd: string | null;
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

const QUICK_PROMPTS = [
  "living with more purpose",
  "managing money and anxiety",
  "faith and doubt",
  "understanding human behavior",
  "ideas that changed history",
];

function DiscoverTab({ browse }: { browse: Post[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      setResults(data.posts ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(query);
  }

  function handleQuickPrompt(prompt: string) {
    setQuery(prompt);
    search(prompt);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* Search box */}
      <div className="mb-10">
        <p className="font-serif text-2xl font-bold text-[var(--foreground)] mb-1">
          What&apos;s taking root in your mind?
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Tell us what you&apos;re curious about and we&apos;ll find the right articles for you.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. &quot;how to think about death&quot; or &quot;building wealth slowly&quot;"
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--color-sage-400)] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors disabled:opacity-40 shrink-0"
          >
            {loading ? "…" : "Ask →"}
          </button>
        </form>

        {/* Quick prompts */}
        {!searched && (
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleQuickPrompt(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-sage-400)] hover:text-[var(--foreground)] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-10">
          <span className="text-2xl animate-pulse">🌱</span>
          <p className="text-[var(--text-muted)] text-sm">Searching the soil…</p>
        </div>
      )}

      {/* AI results */}
      {!loading && results !== null && (
        <>
          {results.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[var(--text-muted)] text-sm mb-4">No close matches — try rephrasing your question.</p>
              <button
                onClick={() => { setResults(null); setSearched(false); setQuery(""); }}
                className="text-sm text-[var(--color-sage-600)] hover:underline"
              >
                ← Start over
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-semibold">Best matches</p>
                <button
                  onClick={() => { setResults(null); setSearched(false); setQuery(""); }}
                  className="text-xs text-[var(--color-sage-600)] hover:underline"
                >
                  ← New search
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {results.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* Browse all (shown before first search) */}
      {!searched && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">or browse all articles</span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {browse.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        </>
      )}
    </div>
  );
}

const TABS_PAID = ["For You", "Saved", "History", "Discover"] as const;

function trialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const ms = new Date(trialEnd).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function DashboardContent({ userId, plan, isPaid, suggestions, liked, history, browse, totalPosts, trialEnd }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const upgraded = searchParams.get("upgraded") === "1";
  const checkout  = searchParams.get("checkout");

  const tabs = isPaid ? TABS_PAID : (["Discover"] as const);
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
  const daysLeft = trialDaysLeft(trialEnd);

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
      {/* Trial countdown banner */}
      {isPaid && daysLeft !== null && daysLeft > 0 && !welcomed && (
        <div className="mb-6 rounded-xl bg-[var(--color-harvest-50)] border border-[var(--color-harvest-200)] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-[var(--color-harvest-700)]">
            🌱 Free trial — <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</span>. Your card won&apos;t be charged until the trial ends.
          </p>
          <Link href="/pricing" className="text-xs font-semibold text-[var(--color-harvest-700)] border border-[var(--color-harvest-400)] rounded-lg px-3 py-1.5 hover:bg-[var(--color-harvest-100)] transition-colors">
            Upgrade now →
          </Link>
        </div>
      )}
      {isPaid && daysLeft === 0 && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-amber-800">
            ⏰ Your free trial has ended — your membership is now active.
          </p>
          <Link href="/account" className="text-xs font-semibold text-amber-700 hover:underline">
            Manage billing →
          </Link>
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
            {isPaid ? "Your Reading Profile" : "Discover"}
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

      {/* Tab bar — paid only (free users go straight to Discover) */}
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
      {(!isPaid || tab === "Discover") && <DiscoverTab browse={browse} />}

      {isPaid && tab === "For You" && (
        suggestions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📖</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">Start reading to get suggestions</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">As you read and save articles, we&apos;ll learn what you like and surface more of it.</p>
            <button onClick={() => setTab("Discover")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
              Discover articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map(p => <PostCard key={p.id} post={p} />)}
            <div className="sm:col-span-2 lg:col-span-3 text-center pt-2">
              <button onClick={() => setTab("Discover")} className="text-sm text-[var(--color-sage-600)] hover:underline">
                Browse all {totalPosts} articles →
              </button>
            </div>
          </div>
        )
      )}

      {isPaid && tab === "Saved" && (
        liked.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔖</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">Nothing saved yet</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">Hit the bookmark on any article to save it here.</p>
            <button onClick={() => setTab("Discover")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
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
            <button onClick={() => setTab("Discover")} className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors">
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
