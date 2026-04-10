"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type FeedbackType = "BUG" | "FEATURE" | "COMMENT" | "QUESTION";

export function FeedbackWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("COMMENT");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // ALL hooks must be called unconditionally and in the same order on every
  // render — early returns before hooks cause React error #310.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Hide entirely for non-authenticated users and admin users (after all hooks)
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (status !== "authenticated" || role === "ADMIN") return null;

  async function submit() {
    if (!message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          type,
          pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMessage("");
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, 1800);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't send feedback. Try again.");
      }
    } catch (e) {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-sage-600)] text-white text-sm font-semibold shadow-lg hover:bg-[var(--color-sage-700)] hover:scale-105 transition-all"
      >
        <span>💬</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[var(--foreground)]">Send feedback</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Bug? Feature idea? Just thoughts? We read everything.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--foreground)] text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">✓</div>
                <p className="font-semibold text-[var(--color-sage-700)]">Thank you!</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">We'll review and follow up if needed.</p>
              </div>
            ) : (
              <>
                {/* Type selector */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {(
                    [
                      { v: "BUG", label: "🐛 Bug" },
                      { v: "FEATURE", label: "✨ Idea" },
                      { v: "COMMENT", label: "💭 Comment" },
                      { v: "QUESTION", label: "❓ Question" },
                    ] as { v: FeedbackType; label: string }[]
                  ).map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setType(opt.v)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors border-2 ${
                        type === opt.v
                          ? "border-[var(--color-sage-500)] text-[var(--color-sage-700)] bg-transparent"
                          : "border-transparent bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    type === "BUG"
                      ? "What went wrong? What were you trying to do?"
                      : type === "FEATURE"
                      ? "What would you like to see added?"
                      : "Tell us what's on your mind…"
                  }
                  rows={5}
                  maxLength={4000}
                  className="w-full p-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-400)] resize-none"
                />

                <div className="flex items-center justify-between mt-1 mb-3">
                  <span className="text-xs text-[var(--text-muted)]">{message.length}/4000</span>
                </div>

                {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

                <div className="flex gap-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={submitting || !message.trim()}
                    className="flex-1 py-2.5 rounded-lg bg-[var(--color-sage-600)] text-white text-sm font-semibold hover:bg-[var(--color-sage-700)] disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
