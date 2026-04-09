"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Draft = {
  id: string;
  title: string;
  description: string;
  content: string;
  niche: string;
  isPremium: boolean;
  agentName: string;
  notes: string | null;
  status: string;
  createdAt: string;
};

const nicheLabel: Record<string, string> = {
  faith: "Faith",
  finance: "Finance",
  psychology: "Psychology",
  philosophy: "Philosophy",
  science: "Science & Tech",
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
  const [isPremium, setIsPremium] = useState(draft.isPremium);
  const [loading, setLoading] = useState<string | null>(null);

  async function submitAction(action: "approve" | "reject" | "edit") {
    setLoading(action);
    const res = await fetch(`/api/admin/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, title, description, content, isPremium }),
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
              <div className="flex items-center justify-between">
                <span className="text-white/50">Premium</span>
                <button
                  onClick={() => isPending && setIsPremium(!isPremium)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isPremium ? "bg-[var(--color-harvest-500)]" : "bg-white/20"
                  } ${!isPending ? "opacity-50 cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isPremium ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
              <div>
                <span className="text-white/50">Status</span>
                <p className="font-medium text-white">{draft.status}</p>
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
