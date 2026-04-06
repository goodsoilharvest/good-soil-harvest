import Link from "next/link";
import { niches, siteConfig } from "@/lib/config";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-soil-900)] text-white min-h-[90vh] flex items-center">

        {/* Organic SVG background */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none select-none" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Organic circles / growth rings */}
            <circle cx="50%" cy="42%" r="18%" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <circle cx="50%" cy="42%" r="28%" fill="none" stroke="#82a06a" strokeWidth="0.4" />
            <circle cx="50%" cy="42%" r="40%" fill="none" stroke="#d4af37" strokeWidth="0.3" />
            <circle cx="50%" cy="42%" r="55%" fill="none" stroke="#82a06a" strokeWidth="0.3" />
            <circle cx="50%" cy="42%" r="72%" fill="none" stroke="#d4af37" strokeWidth="0.2" />
            {/* Subtle root lines */}
            <path d="M50%,58% Q44%,70% 36%,85%" fill="none" stroke="#82a06a" strokeWidth="0.6" />
            <path d="M50%,58% Q53%,72% 58%,88%" fill="none" stroke="#82a06a" strokeWidth="0.5" />
            <path d="M50%,58% Q48%,68% 42%,76% Q38%,82% 32%,95%" fill="none" stroke="#d4af37" strokeWidth="0.4" />
            <path d="M50%,58% Q55%,66% 62%,74% Q67%,80% 70%,94%" fill="none" stroke="#d4af37" strokeWidth="0.4" />
            {/* Glow */}
            <ellipse cx="50%" cy="40%" rx="35%" ry="25%" fill="url(#glow)" />
          </svg>
        </div>

        {/* Floating seed particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {[
            { left: "15%",  delay: "0s",   dur: "12s", size: "5px"  },
            { left: "28%",  delay: "2.5s", dur: "15s", size: "3px"  },
            { left: "42%",  delay: "5s",   dur: "11s", size: "4px"  },
            { left: "58%",  delay: "1.2s", dur: "14s", size: "3px"  },
            { left: "70%",  delay: "3.8s", dur: "13s", size: "5px"  },
            { left: "83%",  delay: "6.5s", dur: "10s", size: "3px"  },
            { left: "8%",   delay: "4s",   dur: "16s", size: "4px"  },
            { left: "92%",  delay: "7s",   dur: "12s", size: "3px"  },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[var(--color-harvest-400)] opacity-30"
              style={{
                left: p.left,
                top: "-10px",
                width: p.size,
                height: p.size,
                animation: `seedFall ${p.dur} ${p.delay} ease-in infinite`,
              }}
            />
          ))}
        </div>

        {/* Radial glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(191,155,40,0.08) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-10 max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-24 text-center w-full">
          <p className="animate-fade-in text-[var(--color-harvest-400)] font-semibold text-xs uppercase tracking-[0.25em] mb-6">
            Think Deeply. Live Well.
          </p>
          <h1 className="animate-fade-in-up delay-100 font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
            Ideas That{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, var(--color-harvest-400) 0%, var(--color-sage-400) 60%, var(--color-harvest-400) 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 6s ease infinite",
              }}
            >
              Take Root
            </span>
          </h1>
          <p className="animate-fade-in-up delay-200 text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blog"
              className="group px-8 py-3.5 rounded-full bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] font-semibold text-[var(--color-soil-900)] transition-all hover:scale-105 hover:shadow-lg hover:shadow-harvest-500/20"
            >
              Start Reading
            </Link>
            <Link
              href="/about"
              className="px-8 py-3.5 rounded-full border border-white/20 hover:border-white/50 font-semibold text-white/80 hover:text-white transition-all hover:bg-white/5"
            >
              Our Story
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-med opacity-40">
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="18" height="30" rx="9" stroke="white" strokeWidth="1.5" />
              <rect x="9" y="7" width="2" height="6" rx="1" fill="white" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── What We Cover ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--surface-muted)]">
        <div className="max-w-[var(--max-w-content)] mx-auto">
          <RevealOnScroll className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-3">
              What We Cover
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Five areas of thought — faith, money, mind, ideas, and science.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {niches.map((niche, i) => (
              <RevealOnScroll key={niche.slug} delay={(i % 4) + 1 as 1 | 2 | 3 | 4}>
                <Link
                  href={`/niches/${niche.slug}`}
                  className="group flex flex-col bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--color-sage-400)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <span className="text-4xl block mb-4 group-hover:animate-float-slow">{niche.icon}</span>
                  <h3 className="font-serif text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--color-sage-500)] mb-2 transition-colors">
                    {niche.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                    {niche.description}
                  </p>
                  <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-sage-500)] group-hover:text-[var(--color-harvest-500)] transition-colors">
                    Explore →
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--surface-subtle)]">
        <RevealOnScroll className="max-w-2xl mx-auto text-center">
          <span className="text-5xl block mb-5 animate-float-slow">🌾</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            For the Curious and the Rooted
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-8 text-lg">
            Good Soil Harvest is for people who want to think bigger — about
            faith, money, the mind, the great ideas, and the world being
            discovered. Plant good seeds. Think good thoughts. Grow.
          </p>
          <Link
            href="/about"
            className="inline-block px-7 py-3 rounded-full bg-[var(--color-soil-800)] text-white font-semibold hover:bg-[var(--color-soil-700)] transition-all hover:scale-105 hover:shadow-md"
          >
            Meet Us
          </Link>
        </RevealOnScroll>
      </section>
    </>
  );
}
