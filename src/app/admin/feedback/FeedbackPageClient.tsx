"use client";

import { useState, useEffect, useMemo } from "react";

type FeedbackItem = {
  id: string;
  email: string | null;
  message: string;
  type: "BUG" | "FEATURE" | "COMMENT" | "QUESTION";
  status: "NEW" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
  aiSummary: string | null;
  aiPriority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;
  aiTags: string | null;
  aiTriagedAt: string | null;
  pageUrl: string | null;
  createdAt: string;
};

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/40",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  LOW: "bg-white/10 text-white/60 border-white/20",
};
const TYPE_ICONS: Record<string, string> = {
  BUG: "🐛",
  FEATURE: "✨",
  COMMENT: "💭",
  QUESTION: "❓",
};
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  TRIAGED: "Triaged",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export default function FeedbackPageClient() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [triaging, setTriaging] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "untriaged">("open");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/feedback");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  async function triage() {
    setTriaging(true);
    setError("");
    try {
      const res = await fetch("/api/admin/feedback/triage", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Triage failed");
      } else {
        await load();
      }
    } catch (e) {
      setError("Network error");
    } finally {
      setTriaging(false);
    }
  }

  async function setStatus(id: string, status: FeedbackItem["status"]) {
    await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setItems(items.map(i => (i.id === id ? { ...i, status } : i)));
  }

  useEffect(() => {
    load();
  }, []);

  // Auto-triage if there are untriaged items on first load
  useEffect(() => {
    if (!loading && items.some(i => !i.aiTriagedAt) && !triaging) {
      triage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === "open") {
      list = list.filter(i => i.status !== "RESOLVED" && i.status !== "DISMISSED");
    } else if (filter === "untriaged") {
      list = list.filter(i => !i.aiTriagedAt);
    }
    list.sort((a, b) => {
      const pa = a.aiPriority ? PRIORITY_ORDER[a.aiPriority] : 99;
      const pb = b.aiPriority ? PRIORITY_ORDER[b.aiPriority] : 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [items, filter]);

  const untriagedCount = items.filter(i => !i.aiTriagedAt).length;

  return (
    <div className="text-white">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">Feedback</h1>
          <p className="text-sm text-white/60 mt-1">
            User reports, feature requests, and comments. AI-prioritized.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {untriagedCount > 0 && (
            <button
              onClick={triage}
              disabled={triaging}
              className="px-4 py-2 rounded-lg bg-[var(--color-harvest-500)] text-[var(--color-soil-900)] text-sm font-semibold hover:bg-[var(--color-harvest-400)] transition-colors disabled:opacity-50"
            >
              {triaging ? "Triaging…" : `Triage ${untriagedCount} new`}
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-white/20 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/10">
        {(["open", "all", "untriaged"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              filter === f
                ? "border-[var(--color-harvest-400)] text-white"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {f === "open" ? "Open" : f === "all" ? "All" : `Untriaged${untriagedCount ? ` (${untriagedCount})` : ""}`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-white/40 py-12 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 py-12 text-center">No feedback {filter === "open" ? "open" : filter === "untriaged" ? "untriaged" : "yet"}.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const tags = item.aiTags ? item.aiTags.split(",").filter(Boolean) : [];
            return (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{TYPE_ICONS[item.type]}</span>
                    {item.aiPriority && (
                      <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[item.aiPriority]}`}>
                        {item.aiPriority}
                      </span>
                    )}
                    {tags.map(tag => (
                      <span key={tag} className="text-xs text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/40 shrink-0">
                    {new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>

                {item.aiSummary && (
                  <p className="text-sm font-semibold text-white/90 mb-2">{item.aiSummary}</p>
                )}

                <p className="text-sm text-white/70 whitespace-pre-wrap mb-3">{item.message}</p>

                <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-white/40">
                  <div className="flex items-center gap-3">
                    {item.email && <span>{item.email}</span>}
                    {item.pageUrl && <span>• {item.pageUrl}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={e => setStatus(item.id, e.target.value as FeedbackItem["status"])}
                      className="bg-white/5 border border-white/15 rounded text-xs text-white/80 px-2 py-1 focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-[var(--color-soil-800)]">{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
