"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { niches } from "@/lib/config";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(publishedAt: Date | null): boolean {
  if (!publishedAt) return false;
  return Date.now() - new Date(publishedAt).getTime() < SEVEN_DAYS_MS;
}

type Post = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  niche: string;
  isPremium: boolean;
  isDeepRoots: boolean;
  publishedAt: Date | null;
  featuredImage: string | null;
};

const nicheMap = Object.fromEntries(niches.map((n) => [n.slug, n]));

type TierFilter = "all" | "free" | "premium" | "deep-roots";
type SortOption = "newest" | "oldest";

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState<string>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let result = posts;

    // Category filter
    if (category !== "all") {
      result = result.filter((p) => p.niche === category);
    }

    // Tier filter
    if (tier === "free") {
      result = result.filter((p) => !p.isPremium && !p.isDeepRoots);
    } else if (tier === "premium") {
      result = result.filter((p) => p.isPremium && !p.isDeepRoots);
    } else if (tier === "deep-roots") {
      result = result.filter((p) => p.isDeepRoots);
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return sort === "newest" ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [posts, category, tier, sort]);

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-400)]"
        >
          <option value="all">All Topics</option>
          {niches.map((n) => (
            <option key={n.slug} value={n.slug}>{n.icon} {n.title}</option>
          ))}
        </select>

        {/* Tier */}
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as TierFilter)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-400)]"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="premium">🌱 Seedling</option>
          <option value="deep-roots">🌾 Deep Roots</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-400)]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Result count */}
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[var(--text-muted)]">No articles match these filters.</p>
          <button
            onClick={() => { setCategory("all"); setTier("all"); setSort("newest"); }}
            className="mt-3 text-sm text-[var(--color-sage-600)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => {
            const niche = nicheMap[post.niche];
            const fresh = isNew(post.publishedAt);
            return (
              <article
                key={post.id}
                className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--color-sage-400)] transition-colors shadow-sm"
              >
                {post.featuredImage ? (
                  <div className="relative w-full h-44 overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full" style={{ background: `var(--color-${niche?.color ?? "sage"}-500)` }} />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/niches/${post.niche}`}>
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-sage-600)] hover:underline">
                        {niche?.title ?? post.niche}
                      </span>
                    </Link>
                    {fresh && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">NEW</span>
                    )}
                    {post.isDeepRoots && (
                      <span className="text-xs font-semibold text-[var(--color-harvest-600)] border border-[var(--color-harvest-300)] rounded-full px-2 py-0.5">
                        🌾 Deep Roots
                      </span>
                    )}
                    {post.isPremium && !post.isDeepRoots && (
                      <span className="text-xs font-semibold text-[var(--color-sage-600)] border border-[var(--color-sage-300)] rounded-full px-2 py-0.5">
                        🌱 Premium
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-lg font-bold text-[var(--foreground)] mt-1 mb-2 leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[var(--color-sage-600)] transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3">{post.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-3 opacity-60">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
