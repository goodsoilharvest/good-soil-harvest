"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Draft = {
  id: string;
  title: string;
  description: string;
  content: string;
  niche: string;
  isPremium: boolean;
  isDeepRoots: boolean;
  featuredImage: string | null;
  references: string | null;
  agentName: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

type Tier = "free" | "seedling" | "deep_roots";

const nicheLabel: Record<string, string> = {
  faith: "Faith",
  finance: "Finance",
  psychology: "Psychology",
  philosophy: "Philosophy",
  science: "Science & Tech",
};

function getTier(isPremium: boolean, isDeepRoots: boolean): Tier {
  if (isDeepRoots) return "deep_roots";
  if (isPremium) return "seedling";
  return "free";
}

function fromTier(tier: Tier): { isPremium: boolean; isDeepRoots: boolean } {
  switch (tier) {
    case "deep_roots": return { isPremium: true, isDeepRoots: true };
    case "seedling": return { isPremium: true, isDeepRoots: false };
    default: return { isPremium: false, isDeepRoots: false };
  }
}

const tierConfig: Record<Tier, { label: string; color: string; bg: string }> = {
  free: { label: "Free", color: "text-white/70", bg: "bg-white/10" },
  seedling: { label: "Seedling", color: "text-emerald-400", bg: "bg-emerald-900/30" },
  deep_roots: { label: "Deep Roots", color: "text-amber-400", bg: "bg-amber-900/30" },
};

export default function DraftReviewClient({
  draft,
  adminEmail,
}: {
  draft: Draft;
  adminEmail: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [content, setContent] = useState(draft.content);
  const [tier, setTier] = useState<Tier>(getTier(draft.isPremium, draft.isDeepRoots));
  const [loading, setLoading] = useState<string | null>(null);

  async function submitAction(action: "approve" | "reject" | "edit") {
    setLoading(action);
    const { isPremium, isDeepRoots } = fromTier(tier);
    const res = await fetch(`/api/admin/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, title, description, content, isPremium, isDeepRoots }),
    });

    if (res.ok) {
      router.push("/admin/drafts");
      router.refresh();
    } else {
      alert("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const isPending = draft.status === "PENDING";
  const tc = tierConfig[tier];

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/drafts"
          className="text-sm text-[var(--color-sage-600)] hover:underline"
        >
          ← Back to Drafts
        </Link>
        <span className="text-[var(--color-soil-300)]">·</span>
        <span className="text-xs text-[var(--color-soil-500)]">
          Written by {draft.agentName} · {new Date(draft.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Featured image preview */}
          {draft.featuredImage && (
            <div className="bg-[var(--color-soil-800)] rounded-xl overflow-hidden border border-white/10">
              <div className="relative w-full h-56">
                <Image
                  src={draft.featuredImage}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 66vw"
                />
              </div>
              <div className="px-4 py-2 text-xs text-white/40 truncate">
                {draft.featuredImage}
              </div>
            </div>
          )}

          <div className="bg-[var(--color-soil-800)] rounded-xl p-6 border border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!isPending}
              className="w-full font-serif text-2xl font-bold text-white bg-transparent border-none outline-none focus:bg-white/5 rounded px-1 -mx-1 transition-colors disabled:cursor-default"
            />
          </div>

          <div className="bg-[var(--color-soil-800)] rounded-xl p-6 border border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-1">
              Description / Excerpt
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isPending}
              rows={3}
              className="w-full text-sm text-white/80 bg-transparent border-none outline-none resize-none focus:bg-white/5 rounded px-1 -mx-1 transition-colors disabled:cursor-default"
            />
          </div>

          <div className="bg-[var(--color-soil-800)] rounded-xl p-6 border border-white/10">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-2">
              Content (MDX)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!isPending}
              rows={30}
              className="w-full text-sm font-mono text-white/90 bg-[var(--color-soil-900)] rounded-lg p-4 border border-white/10 focus:outline-none focus:border-white/30 resize-y disabled:cursor-default"
            />
          </div>

          {/* References */}
          {draft.references && (
            <div className="bg-[var(--color-soil-800)] rounded-xl p-6 border border-white/10">
              <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-soil-500)] mb-2">
                References / Sources
              </label>
              <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-mono bg-[var(--color-soil-900)] rounded-lg p-4 border border-white/10">
                {draft.references}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Meta */}
          <div className="bg-[var(--color-soil-800)] rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold text-white mb-3 text-sm">
              Post Settings
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-white/50">Niche</span>
                <p className="font-medium text-white">
                  {nicheLabel[draft.niche] ?? draft.niche}
                </p>
              </div>
              <div>
                <span className="text-white/50 block mb-1.5">Tier</span>
                <div className="flex gap-1.5">
                  {(["free", "seedling", "deep_roots"] as Tier[]).map((t) => {
                    const c = tierConfig[t];
                    const active = tier === t;
                    return (
                      <button
                        key={t}
                        onClick={() => isPending && setTier(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          active
                            ? `${c.bg} ${c.color} ring-1 ring-current`
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                        } ${!isPending ? "opacity-50 cursor-default" : "cursor-pointer"}`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="text-white/50">Status</span>
                <p className="font-medium text-white">{draft.status}</p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-[var(--color-soil-800)] rounded-xl p-5 border border-white/10">
            <h3 className="font-semibold text-white mb-3 text-sm">Checklist</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className={draft.featuredImage ? "text-green-400" : "text-red-400"}>
                  {draft.featuredImage ? "✓" : "✗"}
                </span>
                <span className="text-white/70">Featured image</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={draft.references ? "text-green-400" : "text-red-400"}>
                  {draft.references ? "✓" : "✗"}
                </span>
                <span className="text-white/70">References / sources</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={description.length > 20 ? "text-green-400" : "text-yellow-400"}>
                  {description.length > 20 ? "✓" : "!"}
                </span>
                <span className="text-white/70">Description</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${tc.color}`}>●</span>
                <span className="text-white/70">Tier: <span className={tc.color}>{tc.label}</span></span>
              </div>
            </div>
          </div>

          {/* Agent notes */}
          {draft.notes && (
            <div className="bg-[var(--color-soil-800)] rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold text-white mb-2 text-sm">
                Agent Notes
              </h3>
              <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                {draft.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="bg-[var(--color-soil-800)] rounded-xl p-5 border border-white/10 space-y-2">
              <h3 className="font-semibold text-white mb-3 text-sm">
                Actions
              </h3>
              <button
                onClick={() => submitAction("approve")}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading === "approve" ? "Approving…" : "Approve & Publish"}
              </button>
              <button
                onClick={() => submitAction("edit")}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg bg-[var(--color-sage-600)] text-white text-sm font-semibold hover:bg-[var(--color-sage-700)] transition-colors disabled:opacity-50"
              >
                {loading === "edit" ? "Saving…" : "Approve with Edits"}
              </button>
              <button
                onClick={() => submitAction("reject")}
                disabled={!!loading}
                className="w-full py-2.5 rounded-lg border border-red-700/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                {loading === "reject" ? "Rejecting…" : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
