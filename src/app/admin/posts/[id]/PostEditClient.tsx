"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  niche: string;
  isPremium: boolean;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
};

const nicheOptions = [
  { value: "faith", label: "Faith" },
  { value: "finance", label: "Finance" },
  { value: "psychology", label: "Psychology" },
  { value: "philosophy", label: "Philosophy" },
  { value: "science", label: "Science & Tech" },
];

const statusOptions = [
  "DRAFT",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
  "REJECTED",
];

const statusColors: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-700",
  APPROVED:  "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-700",
  ARCHIVED:  "bg-yellow-100 text-yellow-700",
};

export default function PostEditClient({ post }: { post: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [content, setContent] = useState(post.content);
  const [niche, setNiche] = useState(post.niche);
  const [isPremium, setIsPremium] = useState(post.isPremium);
  const [status, setStatus] = useState(post.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);

  function markDirty() {
    if (!dirty) setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content, niche, isPremium, status }),
    });
    if (res.ok) {
      setDirty(false);
      router.refresh();
    } else {
      alert("Save failed. Please try again.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/posts");
      router.refresh();
    } else {
      alert("Delete failed.");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="text-sm text-[var(--color-sage-600)] hover:underline"
          >
            ← Back to Posts
          </Link>
          <span className="text-[var(--color-soil-300)]">·</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[post.status]}`}>
            {post.status}
          </span>
          {dirty && (
            <span className="text-xs text-[var(--color-harvest-600)] font-medium">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {post.status === "PUBLISHED" && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-sage-600)] hover:underline px-3 py-2"
            >
              View live ↗
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty(); }}
              className="w-full font-serif text-2xl font-bold text-[var(--color-soil-800)] bg-transparent border-none outline-none focus:bg-[var(--color-sage-50)] rounded px-1 -mx-1 transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
              Description / Excerpt
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty(); }}
              rows={3}
              className="w-full text-sm text-[var(--color-soil-700)] bg-transparent border-none outline-none resize-none focus:bg-[var(--color-sage-50)] rounded px-1 -mx-1 transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-2">
              Content (MDX)
            </label>
            <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); markDirty(); }}
              rows={35}
              className="w-full text-sm font-mono text-[var(--color-soil-800)] bg-[var(--color-parchment)] rounded-lg p-4 border border-[var(--color-sage-100)] focus:outline-none focus:border-[var(--color-sage-400)] resize-y"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-sage-100)]">
            <h3 className="font-semibold text-[var(--color-soil-800)] mb-4 text-sm">
              Post Settings
            </h3>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); markDirty(); }}
                  className="w-full text-sm text-[var(--color-soil-800)] bg-white border border-[var(--color-sage-200)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-sage-400)]"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>

              {/* Niche */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
                  Niche
                </label>
                <select
                  value={niche}
                  onChange={(e) => { setNiche(e.target.value); markDirty(); }}
                  className="w-full text-sm text-[var(--color-soil-800)] bg-white border border-[var(--color-sage-200)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-sage-400)]"
                >
                  {nicheOptions.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              {/* Premium toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-soil-600)]">Premium</span>
                <button
                  onClick={() => { setIsPremium(!isPremium); markDirty(); }}
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                    isPremium ? "bg-[var(--color-harvest-500)]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isPremium ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-[var(--color-sage-50)] rounded-xl p-5 border border-[var(--color-sage-200)]">
            <h3 className="font-semibold text-[var(--color-soil-800)] mb-3 text-sm">Info</h3>
            <div className="space-y-2 text-xs text-[var(--color-soil-500)]">
              <div>
                <span className="font-medium">Slug:</span>{" "}
                <span className="font-mono break-all">{post.slug}</span>
              </div>
              {post.publishedAt && (
                <div>
                  <span className="font-medium">Published:</span>{" "}
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </div>
              )}
              <div>
                <span className="font-medium">Updated:</span>{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
            <h3 className="font-semibold text-red-700 mb-3 text-sm">Danger Zone</h3>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete Post"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
