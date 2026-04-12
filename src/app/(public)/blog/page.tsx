import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "All posts from Good Soil Harvest — faith, finance, psychology, philosophy, and science.",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [
      { isPremium: "asc" },   // free articles first
      { publishedAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      niche: true,
      isPremium: true,
      isDeepRoots: true,
      publishedAt: true,
      featuredImage: true,
    },
  });

  return (
    <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">All Posts</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Faith, finance, psychology, philosophy, and science.
        </p>
      </div>

      <BlogClient posts={posts} />
    </div>
  );
}
