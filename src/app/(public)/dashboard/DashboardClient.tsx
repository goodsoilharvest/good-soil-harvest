"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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

function trialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const ms = new Date(trialEnd).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

const QUICK_PROMPTS = [
  "living with more purpose",
  "managing money and anxiety",
  "faith and doubt",
  "understanding human behavior",
  "ideas that changed history",
];

type Tab = "For You" | "Saved" | "History";

function DashboardContent({ userId, plan, isPaid, suggestions, liked, history, browse, totalPosts, trialEnd }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const upgraded = searchParams.get("upgraded") === "1";
  const checkout  = searchParams.get("checkout");
  const welcomed  = searchParams.get("welcomed") === "1";

  const [tab, setTab] = useState<Tab>("For You");
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // AI search state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const planLabel = plan === "DEEP_ROOTS" ? "🌾 Deep Roots" : plan === "SEEDLING" ? "🌱 Seedling" : null;
  const daysLeft = trialDaysLeft(trialEnd);

  // Auto-fire Stripe checkout
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

  // Auto-sync after Stripe payment
  useEffect(() => {
    if (!upgraded || syncDone) return;
    setSyncing(true);
    fetch("/api/account/sync-stripe", { method: "POST" })
      .then(r => r.json())
      .then(d => { setSyncing(false); setSyncDone(true); if (d.ok) router.replace("/dashboard?welcomed=1"); })
      .catch(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearching(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      setSearchResults(data.posts ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchResults(null);
    setQuery("");
    inputRef.current?.focus();
  }

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

  // What to show in the content area
  const showSearch = searchResults !== null || searching;
  let tabPosts: Post[] = [];
  let tabEmpty = false;
  let tabEmptyIcon = "📖";
  let tabEmptyTitle = "";
  let tabEmptyBody = "";

  if (!showSearch && isPaid) {
    if (tab === "For You") {
      tabPosts = suggestions;
      tabEmpty = suggestions.length === 0;
      tabEmptyIcon = "📖";
      tabEmptyTitle = "Start reading to get suggestions";
      tabEmptyBody = "As you read and save articles, we'll learn what you like and surface more of it.";
    } else if (tab === "Saved") {
      tabPosts = liked;
      tabEmpty = liked.length === 0;
      tabEmptyIcon = "🔖";
      tabEmptyTitle = "Nothing saved yet";
      tabEmptyBody = "Hit the bookmark on any article to save it here.";
    } else if (tab === "History") {
      tabPosts = history;
      tabEmpty = history.length === 0;
      tabEmptyIcon = "📚";
      tabEmptyTitle = "No reading history yet";
      tabEmptyBody = "Articles you read will appear here.";
    }
  }

  return (
    <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-10">

      {/* Sync spinner */}
      {upgraded && syncing && (
        <div className="mb-6 rounded-xl bg-[var(--color-sage-50)] border border-[var(--color-sage-200)] px-5 py-4 text-sm text-[var(--color-sage-700)] flex items-center gap-2">
          <span className="animate-spin inline-block">⟳</span> Activating your membership…
        </div>
      )}

      {/* Welcome banner */}
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

      {/* Trial countdown */}
      {isPaid && daysLeft !== null && daysLeft > 0 && !welcomed && (
        <div className="mb-6 rounded-xl bg-[var(--color-harvest-50)] border border-[var(--color-harvest-200)] px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm font-semibold text-[var(--color-harvest-700)]">
            🌱 Free trial — <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</span>. No charge until the trial ends.
          </p>
          <Link href="/pricing" className="text-xs font-semibold text-[var(--color-harvest-700)] border border-[var(--color-harvest-400)] rounded-lg px-3 py-1.5 hover:bg-[var(--color-harvest-100)] transition-colors">
            Upgrade now →
          </Link>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">
            {isPaid ? "My Feed" : "Discover"}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isPaid
              ? `${totalPosts} articles across 5 topics`
              : `${totalPosts} articles — upgrade for personalized suggestions`}
          </p>
        </div>
        <Link href="/account" className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
          ⚙ Account settings
        </Link>
      </div>

      {/* Upgrade CTA for free users */}
      {!isPaid && (
        <div className="mb-8 rounded-2xl border-2 border-dashed border-[var(--color-sage-300)] bg-[var(--color-sage-50)] p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1">
            <p className="font-semibold text-[var(--foreground)] mb-1">🌱 Unlock your personal reading profile</p>
            <p className="text-sm text-[var(--text-muted)]">
              Get articles picked for you, save posts, track your history, and more. 7-day free trial.
            </p>
          </div>
          <Link href="/pricing" className="shrink-0 px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors">
            Try free for 7 days
          </Link>
        </div>
      )}

      {/* ── AI Search bar (always visible) ── */}
      <div className="mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">✨</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What's taking root in your mind today?"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:border-[var(--color-sage-400)] transition-colors"
            />
          </div>
          {searchResults !== null ? (
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
            >
              ✕ Clear
            </button>
          ) : (
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-sage-500)] text-white font-semibold text-sm hover:bg-[var(--color-sage-600)] transition-colors disabled:opacity-40 shrink-0"
            >
              {searching ? "…" : "Ask"}
            </button>
          )}
        </form>

        {/* Quick prompts — only before first search */}
        {!searchResults && !searching && (
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setQuery(p); runSearch(p); }}
                className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-sage-400)] hover:text-[var(--foreground)] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs (paid users only, hidden during search) ── */}
      {isPaid && !showSearch && (
        <div className="flex gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
          {(["For You", "Saved", "History"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors -mb-px border-b-2 ${
                tab === t
                  ? "border-[var(--color-sage-500)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t}
              {t === "Saved" && liked.length > 0 && (
                <span className="ml-1.5 text-xs bg-[var(--color-sage-100)] text-[var(--color-sage-700)] rounded-full px-1.5 py-0.5">{liked.length}</span>
              )}
              {t === "History" && history.length > 0 && (
                <span className="ml-1.5 text-xs bg-[var(--color-sage-100)] text-[var(--color-sage-700)] rounded-full px-1.5 py-0.5">{history.length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Content area ── */}

      {/* AI search results */}
      {searching && (
        <div className="flex items-center gap-3 py-10">
          <span className="text-2xl animate-pulse">🌱</span>
          <p className="text-[var(--text-muted)] text-sm">Searching the soil…</p>
        </div>
      )}

      {!searching && searchResults !== null && (
        searchResults.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[var(--text-muted)] text-sm">No close matches — try rephrasing your question.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-4">Best matches for &ldquo;{query}&rdquo;</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchResults.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </>
        )
      )}

      {/* Tab content (paid) */}
      {!showSearch && isPaid && (
        tabEmpty ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">{tabEmptyIcon}</p>
            <p className="font-serif text-xl font-bold text-[var(--foreground)] mb-2">{tabEmptyTitle}</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">{tabEmptyBody}</p>
            {tab === "For You" && (
              <p className="text-sm text-[var(--text-muted)]">Use the search bar above to find something to read.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tabPosts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )
      )}

      {/* Browse all (free users, no search active) */}
      {!showSearch && !isPaid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {browse.map(p => <PostCard key={p.id} post={p} />)}
        </div>
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
