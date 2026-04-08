import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer — Good Soil Harvest",
  description: "Important disclaimers regarding the content published on Good Soil Harvest.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-2">Disclaimer</h1>
      <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: April 8, 2026</p>

      <div className="prose text-[var(--foreground)]">

        <p>
          The content published on goodsoilharvest.com is provided by Good Soil Harvest LLC
          for informational and educational purposes only. Please read this disclaimer carefully
          before relying on anything published here.
        </p>

        <h2>1. Not Professional Advice</h2>
        <p>
          Nothing on this Site constitutes or should be construed as professional financial,
          legal, medical, psychological, or therapeutic advice. Always seek the guidance of a
          licensed professional in the relevant field before making decisions based on anything
          you read here.
        </p>

        <h2>2. Financial Content</h2>
        <p>
          Articles discussing personal finance, economics, investing, or money management are
          for general educational purposes only. Good Soil Harvest LLC is not a licensed
          financial advisor, investment advisor, broker-dealer, or fiduciary. Nothing on this
          Site should be taken as a recommendation to buy, sell, or hold any investment or
          financial product. Past performance is not indicative of future results. Consult a
          qualified financial professional before making any financial decision.
        </p>

        <h2>3. Psychology and Mental Health</h2>
        <p>
          Content related to psychology, behavior, habits, mental health, and human nature is
          for educational purposes only. Good Soil Harvest LLC is not a licensed mental health
          provider, therapist, counselor, or psychologist. Nothing on this Site constitutes
          psychological counseling or therapeutic advice. If you are experiencing a mental health
          crisis, please contact a qualified professional or a crisis line such as the
          988 Suicide and Crisis Lifeline (call or text 988).
        </p>

        <h2>4. Faith and Religious Content</h2>
        <p>
          Content related to faith, theology, Scripture, and spiritual practice reflects the
          views of the authors and is offered as personal reflection and education. It does not
          represent the official position of any denomination, church, or religious institution.
          Good Soil Harvest LLC does not claim theological authority. Readers are encouraged to
          consult their own spiritual communities, pastors, or religious leaders on matters of
          faith.
        </p>

        <h2>5. Philosophy and Opinion</h2>
        <p>
          Philosophical content and opinion pieces reflect the perspectives of their authors.
          These should be engaged with critically and do not represent universal or settled truths.
        </p>

        <h2>6. Science and Technology</h2>
        <p>
          Science and technology articles aim to accurately represent current knowledge but may
          not reflect the most recent research or scientific consensus at all times. Good Soil
          Harvest LLC is not a scientific research institution. Content in this category should
          not substitute for peer-reviewed scientific literature or expert consultation.
        </p>

        <h2>7. AI-Generated Content</h2>
        <p>
          Some or all articles on this Site are written or substantially assisted by artificial
          intelligence (AI). While all AI-generated content is reviewed by a human editor before
          publication, AI systems can produce inaccuracies, outdated information, or content that
          appears plausible but is factually incorrect. We make no guarantee of the accuracy,
          completeness, or currency of AI-assisted content. If you believe something we have
          published is incorrect, please <Link href="/contact">contact us</Link> and we will
          review it promptly.
        </p>

        <h2>8. Accuracy and Corrections</h2>
        <p>
          We strive to publish accurate, thoughtful content. However, information may become
          outdated after publication and we make no warranty of accuracy or completeness.
          If you spot an error, please <Link href="/contact">let us know</Link>.
        </p>

        <h2>9. External Links</h2>
        <p>
          This Site may link to third-party websites for reference. We do not control those
          sites and are not responsible for their content or accuracy. Linking to an external
          site does not imply endorsement.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Good Soil Harvest LLC shall not be liable
          for any loss, damage, or harm arising from your reliance on content published on
          this Site. Use of this Site is at your own risk.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions? <Link href="/contact">Contact us</Link> or email{" "}
          <a href="mailto:goodsoilharvest@proton.me">goodsoilharvest@proton.me</a>.
        </p>

      </div>
    </div>
  );
}
