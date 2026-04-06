import Link from "next/link";
import { prisma } from "@/lib/prisma";

const nicheLabel: Record<string, string> = {
  faith: "Faith",
  finance: "Finance",
  psychology: "Psychology",
  philosophy: "Philosophy",
  science: "Science & Tech",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  EDITED: "bg-blue-100 text-blue-800",
};

export default async function DraftsPage() {
  const drafts = await prisma.agentDraft.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = drafts.filter((d) => d.status === "PENDING");
  const reviewed = drafts.filter((d) => d.status !== "PENDING");

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-soil-800)]">
            Agent Drafts
          </h1>
          <p className="text-[var(--color-soil-600)] mt-1">
            {pending.length} pending review
          </p>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center border border-[var(--color-sage-100)] mb-8">
          <span className="text-4xl block mb-3">✓</span>
          <p className="text-[var(--color-soil-600)]">All caught up — no drafts pending.</p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-10">
          <h2 className="font-semibold text-[var(--color-soil-700)] mb-3 uppercase text-xs tracking-widest">
            Pending Review
          </h2>
          <div className="space-y-3">
            {pending.map((draft) => (
              <Link
                key={draft.id}
                href={`/admin/drafts/${draft.id}`}
                className="block bg-white rounded-xl p-5 shadow-sm border border-[var(--color-harvest-200)] hover:border-[var(--color-harvest-400)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-sage-600)]">
                        {nicheLabel[draft.niche] ?? draft.niche}
                      </span>
                      {draft.isPremium && (
                        <span className="text-xs bg-[var(--color-harvest-100)] text-[var(--color-harvest-700)] px-2 py-0.5 rounded-full font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[var(--color-soil-800)] truncate">
                      {draft.title}
                    </h3>
                    <p className="text-sm text-[var(--color-soil-600)] mt-1 line-clamp-2">
                      {draft.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[draft.status]}`}>
                      {draft.status}
                    </span>
                    <p className="text-xs text-[var(--color-soil-400)] mt-2">
                      by {draft.agentName}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="font-semibold text-[var(--color-soil-700)] mb-3 uppercase text-xs tracking-widest">
            Previously Reviewed
          </h2>
          <div className="space-y-2">
            {reviewed.map((draft) => (
              <Link
                key={draft.id}
                href={`/admin/drafts/${draft.id}`}
                className="flex items-center justify-between bg-white rounded-xl px-5 py-3 border border-[var(--color-sage-100)] hover:border-[var(--color-sage-300)] transition-colors"
              >
                <span className="text-sm font-medium text-[var(--color-soil-700)] truncate">
                  {draft.title}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ml-4 ${statusColors[draft.status]}`}>
                  {draft.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
