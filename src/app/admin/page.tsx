import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [pendingDrafts, publishedPosts, totalPosts] = await Promise.all([
    prisma.agentDraft.count({ where: { status: "PENDING" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count(),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[var(--color-soil-800)]">
          CMS Dashboard
        </h1>
        <p className="text-[var(--color-soil-600)] mt-1">
          Manage posts and review agent drafts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-sage-100)]">
          <p className="text-sm text-[var(--color-soil-500)] font-medium">Pending Drafts</p>
          <p className="font-serif text-4xl font-bold text-[var(--color-harvest-600)] mt-1">
            {pendingDrafts}
          </p>
          <Link href="/admin/drafts" className="text-sm text-[var(--color-sage-600)] hover:underline mt-2 inline-block">
            Review →
          </Link>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-sage-100)]">
          <p className="text-sm text-[var(--color-soil-500)] font-medium">Published Posts</p>
          <p className="font-serif text-4xl font-bold text-[var(--color-soil-800)] mt-1">
            {publishedPosts}
          </p>
          <Link href="/admin/posts" className="text-sm text-[var(--color-sage-600)] hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-sage-100)]">
          <p className="text-sm text-[var(--color-soil-500)] font-medium">Total Posts</p>
          <p className="font-serif text-4xl font-bold text-[var(--color-soil-800)] mt-1">
            {totalPosts}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
        <h2 className="font-semibold text-[var(--color-soil-800)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/drafts"
            className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-400)] transition-colors"
          >
            Review Drafts ({pendingDrafts})
          </Link>
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 rounded-lg border border-[var(--color-sage-300)] text-[var(--color-soil-700)] text-sm font-semibold hover:bg-[var(--color-sage-50)] transition-colors"
          >
            Write New Post
          </Link>
        </div>
      </div>
    </>
  );
}
