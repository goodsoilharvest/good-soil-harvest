import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2">Disclaimer</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: April 2026</p>
      <div className="prose text-[var(--foreground)]">
        <p>
          The content on Good Soil Harvest is for informational and educational purposes only.
          Nothing on this site constitutes professional financial, legal, medical, or
          psychological advice. Always consult a qualified professional before making
          decisions based on information you read here.
        </p>
        <h2>Financial Content</h2>
        <p>
          Articles about personal finance and economics are for general education only.
          We are not licensed financial advisors. Nothing we publish should be taken as
          investment advice.
        </p>
        <h2>Faith and Opinion</h2>
        <p>
          Content on faith, philosophy, and related topics reflects the views of the
          authors and is not intended to represent any denomination or institution.
        </p>
        <h2>Accuracy</h2>
        <p>
          We strive to publish accurate, well-researched content. If you believe something
          we've published is incorrect, please let us know through our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
