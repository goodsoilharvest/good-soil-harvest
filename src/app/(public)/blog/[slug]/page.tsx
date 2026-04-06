import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { niches } from "@/lib/config";
import Link from "next/link";
import type { Metadata } from "next";

const nicheMap = Object.fromEntries(niches.map((n) => [n.slug, n]));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { affiliateLinks: true },
  });

  if (!post) notFound();

  const niche = nicheMap[post.niche];

  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
        <Link href="/blog" className="hover:text-[var(--foreground)] transition-colors">Blog</Link>
        <span>›</span>
        <Link href={`/niches/${post.niche}`} className="hover:text-[var(--foreground)] transition-colors">
          {niche?.title ?? post.niche}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <Link href={`/niches/${post.niche}`}>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-600)] hover:underline">
            {niche?.icon} {niche?.title ?? post.niche}
          </span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] mt-3 mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed">{post.description}</p>
        <p className="text-sm text-[var(--text-muted)] opacity-60 mt-4">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : ""}
        </p>
      </header>

      <hr className="border-[var(--border)] mb-10" />

      {/* Content */}
      <div
        className="prose text-[var(--foreground)]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Affiliate links */}
      {post.affiliateLinks.length > 0 && (
        <aside className="mt-12 p-5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-[var(--text-muted)] mb-3">
            Mentioned in this post
          </h3>
          <ul className="space-y-2">
            {post.affiliateLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-[var(--color-sage-600)] hover:text-[var(--color-harvest-600)] underline text-sm transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--text-muted)] opacity-60 mt-3">
            This post may contain affiliate links.{" "}
            <Link href="/affiliate-disclosure" className="underline">Read our disclosure.</Link>
          </p>
        </aside>
      )}
    </div>
  );
}
