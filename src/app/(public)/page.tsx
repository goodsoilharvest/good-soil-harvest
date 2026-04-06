import Link from "next/link";
import { niches, siteConfig } from "@/lib/config";
import { getFeaturedPosts } from "@/lib/posts";

export default function HomePage() {
  const featured = getFeaturedPosts(3);

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-soil-800)] text-white py-20 px-4 sm:px-6">
        <div className="max-w-[var(--max-w-content)] mx-auto text-center">
          <p className="text-[var(--color-harvest-400)] font-semibold text-sm uppercase tracking-widest mb-4">
            Think Deeply. Live Well.
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Ideas That Take{" "}
            <span className="text-[var(--color-sage-400)]">Root</span>
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="px-8 py-3 rounded-full bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] font-semibold text-white transition-colors"
            >
              Start Reading
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 rounded-full border border-white/30 hover:border-white/60 font-semibold text-white transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Niche grid */}
      <section className="py-16 px-4 sm:px-6 bg-[var(--color-parchment)]">
        <div className="max-w-[var(--max-w-content)] mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center text-[var(--color-soil-800)] mb-3">
            What We Cover
          </h2>
          <p className="text-center text-[var(--color-soil-600)] mb-10 max-w-xl mx-auto">
            Five areas of thought — faith, money, mind, ideas, and science.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {niches.map((niche) => (
              <Link
                key={niche.slug}
                href={`/niches/${niche.slug}`}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-[var(--color-sage-100)] hover:border-[var(--color-sage-400)] transition-all"
              >
                <span className="text-4xl block mb-3">{niche.icon}</span>
                <h3 className="font-serif text-xl font-bold text-[var(--color-soil-800)] group-hover:text-[var(--color-sage-700)] mb-2 transition-colors">
                  {niche.title}
                </h3>
                <p className="text-sm text-[var(--color-soil-600)] leading-relaxed">
                  {niche.description}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-sage-600)] group-hover:text-[var(--color-harvest-600)] transition-colors">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured posts — only rendered once content exists */}
      {featured.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-[var(--max-w-content)] mx-auto">
            <h2 className="font-serif text-3xl font-bold text-[var(--color-soil-800)] mb-10">
              Latest Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[var(--color-sage-100)] transition-shadow"
                >
                  <div className="h-40 bg-[var(--color-sage-100)] flex items-center justify-center text-5xl">
                    {niches.find((n) => n.slug === post.niche)?.icon ?? "🌱"}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-sage-600)]">
                      {post.niche.replace(/-/g, " ")}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[var(--color-soil-800)] mt-1 mb-2 leading-snug">
                      <Link href={post.href} className="hover:text-[var(--color-sage-700)]">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[var(--color-soil-600)] line-clamp-2">
                      {post.description}
                    </p>
                    <p className="text-xs text-[var(--color-soil-600)]/60 mt-3">
                      {post.readingTime}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/blog"
                className="inline-block px-8 py-3 rounded-full border-2 border-[var(--color-sage-600)] text-[var(--color-sage-700)] font-semibold hover:bg-[var(--color-sage-600)] hover:text-white transition-colors"
              >
                View All Posts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="py-16 px-4 sm:px-6 bg-[var(--color-sage-50)]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-4xl block mb-4">🌾</span>
          <h2 className="font-serif text-3xl font-bold text-[var(--color-soil-800)] mb-4">
            For the Curious and the Rooted
          </h2>
          <p className="text-[var(--color-soil-700)] leading-relaxed mb-6">
            Good Soil Harvest is for people who want to think bigger — about
            faith, money, the mind, the great ideas, and the world being
            discovered. Plant good seeds. Think good thoughts. Grow.
          </p>
          <Link
            href="/about"
            className="inline-block px-6 py-2.5 rounded-full bg-[var(--color-soil-800)] text-white font-semibold hover:bg-[var(--color-soil-700)] transition-colors"
          >
            Meet Us
          </Link>
        </div>
      </section>
    </>
  );
}
