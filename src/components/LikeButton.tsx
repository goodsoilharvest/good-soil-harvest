"use client";

import { useState } from "react";

export function LikeButton({ postId, initialLiked }: { postId: string; initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const prev = liked;
    setLiked(!prev); // optimistic
    try {
      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) setLiked(prev); // revert on error
      else {
        const data = await res.json();
        setLiked(data.liked);
      }
    } catch {
      setLiked(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? "Remove bookmark" : "Save article"}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
        liked
          ? "border-[var(--color-harvest-400)] text-[var(--color-harvest-600)] bg-[var(--color-harvest-50)]"
          : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-sage-400)] hover:text-[var(--foreground)]"
      }`}
    >
      <span>{liked ? "🔖" : "🔖"}</span>
      <span>{liked ? "Saved" : "Save"}</span>
    </button>
  );
}
