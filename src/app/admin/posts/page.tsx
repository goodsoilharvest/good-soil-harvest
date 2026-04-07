import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { findDuplicates } from "@/lib/duplicates";

const nicheLabel: Record<string, string> = {
  faith: "Faith",
  finance: "Finance",
  psychology: "Psychology",
  philosophy: "Philosophy",
  science: "Science & Tech",
};

const statusColors: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-700",
  APPROVED:  "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-700",
  ARCHIVED:  "bg-yellow-100 text-yellow-700",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; niche?: string }>;
}) {
  const { status, niche } = await searchParams;

  const posts = await prisma.post.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(niche  ? { niche:  niche  as never } : {}),
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  // Compute duplicates across ALL posts (not just the filtered view) so
  // the flag shows up regardless of which filter tab you're on.
  const allPosts = await prisma.post.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "asc" },
  });
  const dupeMap = findDuplicates(allPosts);

  const counts = await prisma.post.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = posts.length;

  const statuses = ["PUBLISHED", "APPROVED", "DRAFT", "ARCHIVED", "REJECTED"];

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-soil-800)]">
            Posts
          </h1>
          <p className="text-[var(--color-soil-600)] mt-1">
            {total} {status ? status.toLowerCase() : "total"} posts
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-[var(--color-harvest-500)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/posts"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !status
              ? "bg-[var(--color-soil-800)] text-white"
              : "bg-white border border-[var(--color-sage-200)] text-[var(--color-soil-600)] hover:border-[var(--color-sage-400)]"
          }`}
        >
          All ({Object.values(countMap).reduce((a, b) => a + b, 0)})
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/posts?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? "bg-[var(--color-soil-800)] text-white"
                : "bg-white border border-[var(--color-sage-200)] text-[var(--color-soil-600)] hover:border-[var(--color-sage-400)]"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()} ({countMap[s] ?? 0})
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[var(--color-sage-100)]">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-[var(--color-soil-600)]">No posts found.</p>
          <Link href="/admin/posts/new" className="text-sm text-[var(--color-sage-600)] underline mt-2 inline-block">
            Create one
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => {
            const dupeTitle = dupeMap.get(post.id);
            return (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className={`flex items-center justify-between bg-white rounded-xl px-5 py-4 border transition-colors group ${
                  dupeTitle
                    ? "border-yellow-300 hover:border-yellow-400"
                    : "border-[var(--color-sage-100)] hover:border-[var(--color-sage-300)]"
                }`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-sage-600)]">
                      {nicheLabel[post.niche] ?? post.niche}
                    </span>
                    {post.isPremium && (
                      <span className="text-xs bg-[var(--color-harvest-100)] text-[var(--color-harvest-700)] px-2 py-0.5 rounded-full font-medium">
                        Premium
                      </span>
                    )}
                    {dupeTitle && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-0.5 rounded-full font-medium" title={`Similar to: "${dupeTitle}"`}>
                        ⚠ Possible duplicate
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-[var(--color-soil-800)] truncate group-hover:text-[var(--color-harvest-600)] transition-colors">
                    {post.title}
                  </h3>
                  {dupeTitle && (
                    <p className="text-xs text-yellow-700 mt-0.5 truncate">
                      Similar to: &ldquo;{dupeTitle}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-[var(--color-soil-400)] mt-0.5">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : `Updated ${new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColors[post.status]}`}>
                  {post.status}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
