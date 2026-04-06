import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { niches } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "All posts from Good Soil Harvest — faith, finance, psychology, philosophy, and science.",
};

const nicheMap = Object.fromEntries(niches.map((n) => [n.slug, n]));

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", isPremium: false },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">All Posts</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Faith, finance, psychology, philosophy, and science.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-[var(--text-muted)]">No posts yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const niche = nicheMap[post.niche];
            return (
              <article
                key={post.id}
                className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--color-sage-400)] transition-colors shadow-sm"
              >
                <div className="h-2 w-full" style={{ background: `var(--color-${niche?.color ?? "sage"}-500)` }} />
                <div className="p-5">
                  <Link href={`/niches/${post.niche}`}>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-sage-600)] hover:underline">
                      {niche?.title ?? post.niche}
                    </span>
                  </Link>
                  <h2 className="font-serif text-lg font-bold text-[var(--foreground)] mt-1 mb-2 leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[var(--color-sage-600)] transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3">{post.description}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-3 opacity-60">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
