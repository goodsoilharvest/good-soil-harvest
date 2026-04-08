"use client";

import { useState } from "react";
import Link from "next/link";
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
};

const nicheMap = Object.fromEntries(niches.map((n) => [n.slug, n]));

const tabs = [
  { key: "all", label: "All" },
  ...niches.map((n) => ({ key: n.slug, label: n.shortTitle })),
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function BlogClient({ posts }: { posts: Post[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = activeTab === "all" ? posts : posts.filter((p) => p.niche === activeTab);

  return (
    <>
      {/* Topic tabs */}
      <div className="flex gap-1 flex-wrap mb-8 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[var(--color-sage-500)] text-[var(--color-sage-700)] bg-[var(--color-sage-50)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[var(--text-muted)]">No posts yet — check back soon.</p>
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
                <div className="h-2 w-full" style={{ background: `var(--color-${niche?.color ?? "sage"}-500)` }} />
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
