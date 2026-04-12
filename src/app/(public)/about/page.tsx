import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Good Soil Harvest — who we are, why we write, and how we make it.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <span className="text-5xl block mb-4">🌱</span>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">About Good Soil Harvest</h1>
      </div>

      <div className="prose text-[var(--foreground)]">

        <h2>The Name</h2>
        <p>
          The name comes from the Parable of the Sower. Seeds scattered on rocky ground, among thorns,
          on the path — none of them take. But seeds that fall on good soil produce a harvest:
          thirty, sixty, a hundredfold.
        </p>
        <p>
          Good soil is prepared ground. It takes work to get there — clearing out the noise,
          pulling out what doesn&apos;t belong, turning things over until something good can grow.
          That&apos;s the idea behind this site: the right ideas, landing in the right minds, at
          the right time.
        </p>

        <h2>Who&apos;s Behind This</h2>
        <p>
          Good Soil Harvest was founded by Chris, a software developer, author, and someone who
          spent most of his adult life as an atheist. That changed after an experience he
          couldn&apos;t explain away — one that set him on a path toward faith and a much deeper
          curiosity about the world.
        </p>
        <p>
          That journey became a book: <strong><em>Rediscovering Imago Dei — Bridging Reason
          and Redemption</em></strong>, written for skeptics and deep thinkers who wrestle with
          the question of whether God exists. The book explores the fine-tuning of the universe,
          the information encoded in DNA, the connections across world religions, the psychology
          of belief, and the ethical vision of the Sermon on the Mount — weaving together science,
          philosophy, and faith into an honest argument that a creator makes the most sense.
        </p>
        <p>
          Good Soil Harvest grew out of the same impulse. The five topics covered here — faith,
          finance, psychology, philosophy, and science — are the same threads explored in the book.
          The site is a place where those ideas keep growing, one article at a time.
        </p>

        <h2>What This Site Is</h2>
        <p>
          Good Soil Harvest publishes educational articles every day across five categories.
          Think of it like a personal learning feed — not the news, not opinion, just real
          ideas explained clearly. No bias, no clickbait. Topics you might never have encountered
          otherwise, laid out in a way that respects your intelligence.
        </p>
        <p>
          Each niche has its own voice:
        </p>
        <ul>
          <li><strong>Faith</strong> — grounded in Scripture and Christian theology, written with depth, not platitudes.</li>
          <li><strong>Finance</strong> — practical, values-based, honest about trade-offs. Real data, no hype.</li>
          <li><strong>Psychology</strong> — research-backed explorations of human behavior and growth.</li>
          <li><strong>Philosophy</strong> — rigorous, truth-seeking. Ideas explored on their own terms.</li>
          <li><strong>Science</strong> — curious, accurate, and awe-driven. The universe is worth understanding.</li>
        </ul>

        <h2>How Articles Are Made</h2>
        <p>
          We believe in transparency. Articles on Good Soil Harvest are drafted with the
          help of artificial intelligence and reviewed by a human editor before publication.
          AI helps us publish consistently and cover a wide range of topics. The human review
          ensures accuracy, tone, and editorial quality. Every citation is checked. Every claim
          is vetted. If something isn&apos;t right, it doesn&apos;t go live.
        </p>
        <p>
          This approach lets us put out substantive, well-researched content every single day
          without sacrificing quality. We think that&apos;s a good trade.
        </p>

        <h2>Why It Exists</h2>
        <p>
          Honestly? Two reasons.
        </p>
        <p>
          First, because the world needs more places where people can learn without being sold
          to, yelled at, or manipulated. Good Soil Harvest is an attempt to build that — a quiet
          corner of the internet where the goal is understanding, not engagement metrics.
        </p>
        <p>
          Second, because building something useful matters. In a world where the economy is
          shifting fast, creating real value for real people is one of the best things you can do.
          This site is built to be useful, sustainable, and worth your time.
        </p>

        <hr />

        <p>
          Good Soil Harvest is operated by Good Soil Harvest LLC. If you want to reach us,
          use the <Link href="/contact">contact page</Link> or
          email <a href="mailto:goodsoilharvest@proton.me">goodsoilharvest@proton.me</a>.
        </p>

      </div>
    </div>
  );
}
