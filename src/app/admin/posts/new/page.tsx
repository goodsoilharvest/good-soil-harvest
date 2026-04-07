"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const nicheOptions = [
  { value: "faith", label: "Faith" },
  { value: "finance", label: "Finance" },
  { value: "psychology", label: "Psychology" },
  { value: "philosophy", label: "Philosophy" },
  { value: "science", label: "Science & Tech" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [niche, setNiche] = useState("faith");
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content, niche, isPremium, status }),
    });
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/admin/posts/${id}`);
    } else {
      alert("Failed to create post.");
      setSaving(false);
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
          <span className="text-sm font-semibold text-[var(--color-soil-800)]">New Post</span>
        </div>
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-white text-sm font-semibold hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-40"
        >
          {saving ? "Creating…" : "Create Post"}
        </button>
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title…"
              className="w-full font-serif text-2xl font-bold text-[var(--color-soil-800)] bg-transparent border-none outline-none placeholder:text-[var(--color-soil-300)] focus:bg-[var(--color-sage-50)] rounded px-1 -mx-1 transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
              Description / Excerpt
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description shown in post listings…"
              rows={3}
              className="w-full text-sm text-[var(--color-soil-700)] bg-transparent border-none outline-none resize-none placeholder:text-[var(--color-soil-300)] focus:bg-[var(--color-sage-50)] rounded px-1 -mx-1 transition-colors"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-sage-100)]">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-2">
              Content (MDX)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write markdown content here…"
              rows={35}
              className="w-full text-sm font-mono text-[var(--color-soil-800)] bg-[var(--color-parchment)] rounded-lg p-4 border border-[var(--color-sage-100)] focus:outline-none focus:border-[var(--color-sage-400)] resize-y placeholder:text-[var(--color-soil-300)]"
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm text-[var(--color-soil-800)] bg-white border border-[var(--color-sage-200)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-sage-400)]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
                  Niche
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full text-sm text-[var(--color-soil-800)] bg-white border border-[var(--color-sage-200)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--color-sage-400)]"
                >
                  {nicheOptions.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-soil-600)]">Premium</span>
                <button
                  onClick={() => setIsPremium(!isPremium)}
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
        </div>
      </div>
    </>
  );
}
