import type { Metadata } from "next";

export const metadata: Metadata = { title: "Affiliate Disclosure" };

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: April 2026</p>
      <div className="prose text-[var(--foreground)]">
        <p>
          Good Soil Harvest participates in affiliate marketing programs. This means that
          when you click certain links on this site and make a purchase, we may earn a
          small commission — at no additional cost to you.
        </p>
        <h2>Amazon Associates</h2>
        <p>
          Good Soil Harvest LLC is a participant in the Amazon Services LLC Associates
          Program, an affiliate advertising program designed to provide a means for sites
          to earn advertising fees by advertising and linking to Amazon.com.
        </p>
        <h2>Our Promise</h2>
        <p>
          We only recommend products and resources we believe in. Affiliate relationships
          do not influence our editorial content — we don't write posts to sell products.
          We write posts because the topic is worth exploring, and if a relevant product
          exists, we'll link to it.
        </p>
        <h2>FTC Compliance</h2>
        <p>
          In accordance with FTC guidelines, affiliate links are disclosed within posts
          that contain them. The presence of an affiliate link is always noted.
        </p>
        <p>
          Questions? Contact us through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}
