import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { niches } from "@/lib/config";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { auth } from "@/auth";
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
  });

  if (!post) notFound();

  const niche = nicheMap[post.niche];

  // ── Access control ─────────────────────────────────────────────────────────
  // Free posts: visible to all
  // isPremium posts: requires SEEDLING or DEEP_ROOTS active subscription
  // isDeepRoots posts: requires DEEP_ROOTS active subscription
  let accessGranted = true;

  if (post.isPremium || post.isDeepRoots) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      accessGranted = false;
    } else {
      const sub = await prisma.subscription.findUnique({ where: { userId } });
      const isActive = sub?.status === "ACTIVE";
      const isDeepRoots = sub?.plan === "DEEP_ROOTS";
      const isSeedlingOrAbove = isActive && (sub?.plan === "SEEDLING" || isDeepRoots);

      if (post.isDeepRoots && !isDeepRoots) accessGranted = false;
      else if (post.isPremium && !isSeedlingOrAbove) accessGranted = false;
    }
  }

  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
        <Link href="/blog" className="hover:text-[var(--foreground)] transition-colors">
          Blog
        </Link>
        <span className="opacity-40">›</span>
        <Link href={`/niches/${post.niche}`} className="hover:text-[var(--foreground)] transition-colors">
          {niche?.title ?? post.niche}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <Link href={`/niches/${post.niche}`}>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-500)] hover:text-[var(--color-harvest-500)] transition-colors">
            {niche?.icon} {niche?.title ?? post.niche}
          </span>
        </Link>
        {post.isDeepRoots && (
          <span className="ml-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-harvest-500)] border border-[var(--color-harvest-300)] rounded-full px-2 py-0.5">
            Deep Roots
          </span>
        )}
        {post.isPremium && !post.isDeepRoots && (
          <span className="ml-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-500)] border border-[var(--color-sage-300)] rounded-full px-2 py-0.5">
            Premium
          </span>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] mt-3 mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-[var(--text-muted)] leading-relaxed border-l-2 border-[var(--color-harvest-500)] pl-4">
          {post.description}
        </p>
        <p className="text-sm text-[var(--text-muted)] opacity-50 mt-5">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </p>
      </header>

      <hr className="border-[var(--border)] mb-10" />

      {/* Content or paywall */}
      {accessGranted ? (
        <>
          <article className="prose text-[var(--foreground)]">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </article>

</>
      ) : (
        <Paywall isDeepRoots={post.isDeepRoots} />
      )}
    </div>
  );
}

function Paywall({ isDeepRoots }: { isDeepRoots: boolean }) {
  const requiredPlan = isDeepRoots ? "Deep Roots" : "Seedling";
  const planHref = isDeepRoots ? "/pricing#deep-roots" : "/pricing#seedling";

  return (
    <div className="text-center py-16 px-6">
      {/* Blurred teaser line */}
      <div className="relative mb-10 overflow-hidden rounded-xl">
        <div className="blur-sm select-none pointer-events-none space-y-3 px-4 py-6 bg-[var(--surface-muted)]">
          <div className="h-4 bg-[var(--border)] rounded w-full" />
          <div className="h-4 bg-[var(--border)] rounded w-5/6 mx-auto" />
          <div className="h-4 bg-[var(--border)] rounded w-4/6 mx-auto" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]" />
      </div>

      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-harvest-100)] mb-5">
        <span className="text-2xl">🌱</span>
      </div>

      <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-3">
        {isDeepRoots ? "Deep Roots Exclusive" : "Premium Content"}
      </h2>
      <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8">
        This article is available to <strong>{requiredPlan}</strong> members.
        {isDeepRoots
          ? " Upgrade to go deeper — exclusive posts, a book discount, and more."
          : " Join to unlock all premium articles across every category."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={planHref}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
        >
          See plans →
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-semibold hover:border-[var(--color-sage-400)] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
