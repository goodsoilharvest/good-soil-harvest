import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "About Good Soil Harvest — who we are, why we write, and how we make it.",
};

const PARALLAX_IMG = "https://www.goodsoilharvest.com/api/img/site/about-parallax-1776003032.jpg";

export default function AboutPage() {
  return (
    <>
      {/* ── Parallax Hero ──────────────────────────────────── */}
      <section
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${PARALLAX_IMG})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[var(--color-soil-900)]/70" />

        <div className="relative z-10 text-center px-4 py-20">
          <span className="text-6xl block mb-5">🌱</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            About Good Soil Harvest
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
            The right ideas, landing in the right minds, at the right time.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

          {/* The Name */}
          <section className="text-center mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-5">The Name</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              The name comes from the Parable of the Sower. Seeds scattered on rocky ground,
              among thorns, on the path — none of them take. But seeds that fall on good soil
              produce a harvest: thirty, sixty, a hundredfold.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Good soil is prepared ground. It takes work to get there — clearing out the noise,
              pulling out what doesn&apos;t belong, turning things over until something good can grow.
            </p>
          </section>

          <hr className="border-[var(--border)] mb-16" />

          {/* Who's Behind This */}
          <section className="text-center mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-5">Who&apos;s Behind This</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              Good Soil Harvest was founded by Christopher J McElwain, a software developer,
              author, and someone who spent most of his adult life as an atheist. That changed
              after an experience he couldn&apos;t explain away — one that set him on a path toward
              faith and a much deeper curiosity about the world.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              That journey became a book:{" "}
              <a
                href="https://www.amazon.com/Rediscovering-Imago-Dei-Bridging-Redemption-ebook/dp/B0DSL4DXPF"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-sage-500)] hover:text-[var(--color-harvest-500)] underline transition-colors"
              >
                <strong><em>Rediscovering Imago Dei — Bridging Reason and Redemption</em></strong>
              </a>, written for skeptics and deep thinkers who wrestle with
              the question of whether God exists. The book explores the fine-tuning of the
              universe, the information encoded in DNA, the connections across world religions,
              the psychology of belief, and the ethical vision of the Sermon on the Mount —
              weaving together science, philosophy, and faith into an honest argument that a
              creator makes the most sense.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Good Soil Harvest grew out of the same impulse. The five topics covered here —
              faith, finance, psychology, philosophy, and science — are the same threads explored
              in the book. The site is a place where those ideas keep growing, one article at a time.
            </p>
          </section>

          <hr className="border-[var(--border)] mb-16" />

          {/* What This Site Is */}
          <section className="text-center mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-5">What This Site Is</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              Good Soil Harvest publishes educational articles every day across five categories.
              Think of it like a personal learning feed — not the news, not opinion, just real
              ideas explained clearly. No bias, no clickbait. Topics you might never have
              encountered otherwise, laid out in a way that respects your intelligence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mt-8 mb-4">
              {[
                { name: "Faith", desc: "Grounded in Scripture and Christian theology, written with depth, not platitudes." },
                { name: "Finance", desc: "Practical, values-based, honest about trade-offs. Real data, no hype." },
                { name: "Psychology", desc: "Research-backed explorations of human behavior and growth." },
                { name: "Philosophy", desc: "Rigorous, truth-seeking. Ideas explored on their own terms." },
                { name: "Science", desc: "Curious, accurate, and awe-driven. The universe is worth understanding." },
              ].map((niche) => (
                <div key={niche.name} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="font-serif font-bold text-[var(--foreground)] mb-1">{niche.name}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{niche.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-[var(--border)] mb-16" />

          {/* How Articles Are Made */}
          <section className="text-center mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-5">How Articles Are Made</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              We believe in transparency. Articles on Good Soil Harvest are drafted with the
              help of artificial intelligence and reviewed by a human editor before publication.
              AI helps us publish consistently and cover a wide range of topics. The human review
              ensures accuracy, tone, and editorial quality. Every citation is checked. Every
              claim is vetted. If something isn&apos;t right, it doesn&apos;t go live.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              This approach lets us put out substantive, well-researched content every single
              day without sacrificing quality. We think that&apos;s a good trade.
            </p>
          </section>

          <hr className="border-[var(--border)] mb-16" />

          {/* Why It Exists */}
          <section className="text-center mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-5">Why It Exists</h2>
            <p className="text-[var(--text-muted)] leading-relaxed mb-4">
              First, because the world needs more places where people can learn without being
              sold to, yelled at, or manipulated. Good Soil Harvest is an attempt to build
              that — a quiet corner of the internet where the goal is understanding, not
              engagement metrics.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Second, because building something useful matters. In a world where the economy
              is shifting fast, creating real value for real people is one of the best things
              you can do. This site is built to be useful, sustainable, and worth your time.
            </p>
          </section>

          {/* CTA */}
          <div className="text-center pt-4 pb-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-block px-8 py-3.5 rounded-full bg-[var(--color-sage-600)] hover:bg-[var(--color-sage-500)] font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/blog"
              className="inline-block px-8 py-3.5 rounded-full bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] font-semibold text-[var(--color-soil-900)] transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Start Reading
            </Link>
          </div>

          <hr className="border-[var(--border)] mb-8" />

          {/* Contact */}
          <p className="text-center text-sm text-[var(--text-muted)]">
            Good Soil Harvest is operated by Good Soil Harvest LLC. Questions?{" "}
            <Link href="/contact" className="text-[var(--color-sage-500)] hover:underline">Contact us</Link> or
            email <a href="mailto:goodsoilharvest@proton.me" className="text-[var(--color-sage-500)] hover:underline">goodsoilharvest@proton.me</a>.
          </p>

        </div>
      </div>
    </>
  );
}
