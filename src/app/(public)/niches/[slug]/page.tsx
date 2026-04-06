import { prisma } from "@/lib/prisma";
import { niches } from "@/lib/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const niche = niches.find((n) => n.slug === slug);
  if (!niche) return {};
  return { title: niche.title, description: niche.description };
}

export default async function NichePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const niche = niches.find((n) => n.slug === slug);
  if (!niche) notFound();

  const posts = await prisma.post.findMany({
    where: { niche: niche.slug as "faith" | "finance" | "psychology" | "philosophy" | "science", status: "PUBLISHED", isPremium: false },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-14">
      {/* Niche header */}
      <div className="mb-12">
        <span className="text-5xl block mb-4">{niche.icon}</span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">{niche.title}</h1>
        <p className="mt-2 text-lg text-[var(--text-muted)] max-w-xl">{niche.description}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-[var(--text-muted)]">No posts yet in this topic — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--color-sage-400)] transition-colors shadow-sm"
            >
              <h2 className="font-serif text-xl font-bold text-[var(--foreground)] mb-2 leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-[var(--color-sage-600)] transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">{post.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)] opacity-60">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                </p>
                <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-[var(--color-sage-600)] hover:text-[var(--color-harvest-600)] transition-colors">
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
