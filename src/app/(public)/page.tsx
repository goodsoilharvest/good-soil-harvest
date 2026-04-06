import Link from "next/link";
import { niches, siteConfig } from "@/lib/config";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const SEEDS = [
  { left: "8%",  delay: "0.0s", dur: "9s",  size: 5 },
  { left: "19%", delay: "2.8s", dur: "11s", size: 3 },
  { left: "31%", delay: "5.2s", dur: "8.5s",size: 4 },
  { left: "44%", delay: "1.5s", dur: "10s", size: 3 },
  { left: "57%", delay: "4.0s", dur: "9.5s",size: 5 },
  { left: "68%", delay: "0.8s", dur: "12s", size: 3 },
  { left: "79%", delay: "6.5s", dur: "9s",  size: 4 },
  { left: "90%", delay: "3.3s", dur: "11s", size: 3 },
];

// Sprouts positioned to "catch" seeds. delay = seed delay + ~dur*0.88
const SPROUTS = [
  { left: "8%",  delay: "8.0s",  dur: "3.5s" },
  { left: "31%", delay: "12.7s", dur: "3s"   },
  { left: "44%", delay: "10.3s", dur: "4s"   },
  { left: "57%", delay: "12.4s", dur: "3.5s" },
  { left: "79%", delay: "14.4s", dur: "3s"   },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-soil-900)] text-white min-h-[92vh] flex flex-col">

        {/* Growth ring background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="glow" cx="50%" cy="38%" r="55%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="50%" cy="38%" r="15%" fill="none" stroke="#d4af37" strokeWidth="0.6" />
            <circle cx="50%" cy="38%" r="26%" fill="none" stroke="#82a06a" strokeWidth="0.4" />
            <circle cx="50%" cy="38%" r="39%" fill="none" stroke="#d4af37" strokeWidth="0.3" />
            <circle cx="50%" cy="38%" r="54%" fill="none" stroke="#82a06a" strokeWidth="0.25" />
            <ellipse cx="50%" cy="38%" rx="35%" ry="24%" fill="url(#glow)" />
          </svg>
        </div>

        {/* Radial warm glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(ellipse 65% 55% at 50% 36%, rgba(191,155,40,0.09) 0%, transparent 70%)" }} />

        {/* Falling seeds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {SEEDS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[var(--color-harvest-400)]"
              style={{
                left: s.left,
                top: "-8px",
                width: s.size,
                height: s.size,
                ["--fall-distance" as string]: "80vh",
                animation: `seedFall ${s.dur} ${s.delay} ease-in infinite`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Soil strip with wavy edge + sprouts */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none" aria-hidden style={{ height: 140 }}>
          {/* Wavy soil SVG */}
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" width="100%" height="100%"
            xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
            <path
              d="M0,68 C80,48 160,82 240,64 C320,46 400,78 480,60 C560,42 640,72 720,58 C800,44 880,74 960,56 C1040,38 1120,70 1200,54 C1280,38 1360,62 1440,50 L1440,140 L0,140 Z"
              fill="var(--color-soil-800)"
              fillOpacity="0.95"
            />
            {/* Roots spreading sideways under soil */}
            {SPROUTS.map((sp, i) => {
              const x = parseFloat(sp.left) / 100 * 1440;
              return (
                <g key={i} style={{ transformOrigin: `${x}px 70px` }}>
                  <path
                    d={`M${x},68 Q${x - 30},82 ${x - 55},90`}
                    fill="none" stroke="var(--color-sage-400)" strokeWidth="1.2"
                    strokeDasharray="60" strokeDashoffset="60"
                    style={{
                      animation: `rootSpread 1.4s ${sp.delay} ease-out forwards`,
                      opacity: 0,
                    }}
                  />
                  <path
                    d={`M${x},68 Q${x + 28},80 ${x + 50},92`}
                    fill="none" stroke="var(--color-sage-400)" strokeWidth="1"
                    strokeDasharray="60" strokeDashoffset="60"
                    style={{
                      animation: `rootSpread 1.2s calc(${sp.delay} + 0.2s) ease-out forwards`,
                      opacity: 0,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Sprout stems + leaves growing upward */}
          {SPROUTS.map((sp, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: sp.left, bottom: 70, transform: "translateX(-50%)" }}
            >
              {/* Stem */}
              <div
                className="mx-auto bg-[var(--color-sage-500)] rounded-full"
                style={{
                  width: 2,
                  height: 28,
                  transformOrigin: "bottom center",
                  transform: "scaleY(0)",
                  animation: `sproutGrow ${sp.dur} ${sp.delay} ease-out forwards`,
                  opacity: 0,
                }}
              />
              {/* Left leaf */}
              <div
                className="absolute"
                style={{
                  bottom: 14,
                  left: -10,
                  width: 12,
                  height: 8,
                  background: "var(--color-sage-400)",
                  borderRadius: "50% 0 50% 50%",
                  transformOrigin: "right center",
                  transform: "scale(0) rotate(-45deg)",
                  opacity: 0,
                  animation: `leafUnfurl 1s calc(${sp.delay} + 0.8s) ease-out forwards`,
                }}
              />
              {/* Right leaf */}
              <div
                className="absolute"
                style={{
                  bottom: 18,
                  right: -10,
                  width: 10,
                  height: 7,
                  background: "var(--color-sage-500)",
                  borderRadius: "0 50% 50% 50%",
                  transformOrigin: "left center",
                  transform: "scale(0) rotate(45deg)",
                  opacity: 0,
                  animation: `leafUnfurl 0.9s calc(${sp.delay} + 1.1s) ease-out forwards`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center w-full">
          <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-24 text-center w-full">
            <p className="animate-fade-in text-[var(--color-harvest-400)] font-semibold text-xs uppercase tracking-[0.25em] mb-6">
              Think Deeply. Live Well.
            </p>
            <h1 className="animate-fade-in-up delay-100 font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Ideas That{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--color-harvest-400) 0%, var(--color-sage-400) 55%, var(--color-harvest-400) 100%)",
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
                className="px-8 py-3.5 rounded-full bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] font-semibold text-[var(--color-soil-900)] transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Start Reading
              </Link>
              <Link
                href="/about"
                className="px-8 py-3.5 rounded-full border border-white/20 hover:border-white/50 font-semibold text-white/80 hover:text-white transition-all duration-200 hover:bg-white/5"
              >
                Our Story
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-44 left-1/2 -translate-x-1/2 animate-float-med opacity-30">
              <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
                <rect x="1" y="1" width="18" height="30" rx="9" stroke="white" strokeWidth="1.5" />
                <rect x="9" y="7" width="2" height="6" rx="1" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Cover ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--color-soil-800)]">
        <div className="max-w-[var(--max-w-content)] mx-auto">
          <RevealOnScroll className="text-center mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
              What We Cover
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Five areas of thought — faith, money, mind, ideas, and science.
            </p>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {niches.map((niche, i) => (
              <RevealOnScroll key={niche.slug} delay={(i % 4 + 1) as 1 | 2 | 3 | 4}>
                <Link
                  href={`/niches/${niche.slug}`}
                  className="group relative flex flex-col items-center text-center p-7 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--color-harvest-500)]/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full"
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(191,155,40,0.12), transparent 70%)" }} />

                  {/* Icon circle */}
                  <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-5 text-3xl
                    bg-white/8 border border-white/10 group-hover:border-[var(--color-harvest-400)]/40
                    group-hover:scale-110 transition-all duration-300">
                    {niche.icon}
                  </div>

                  <h3 className="relative z-10 font-serif text-xl font-bold text-white group-hover:text-[var(--color-harvest-400)] mb-3 transition-colors duration-200">
                    {niche.title}
                  </h3>
                  <p className="relative z-10 text-sm text-white/55 leading-relaxed flex-1">
                    {niche.description}
                  </p>
                  <span className="relative z-10 mt-5 text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-400)] group-hover:text-[var(--color-harvest-400)] transition-colors duration-200">
                    Explore →
                  </span>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-[var(--color-soil-900)]">
        <RevealOnScroll className="max-w-2xl mx-auto text-center">
          <span className="text-5xl block mb-5 animate-float-slow">🌾</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-5">
            For the Curious and the Rooted
          </h2>
          <p className="text-white/60 leading-relaxed mb-8 text-lg">
            Good Soil Harvest is for people who want to think bigger — about
            faith, money, the mind, the great ideas, and the world being
            discovered. Plant good seeds. Think good thoughts. Grow.
          </p>
          <Link
            href="/about"
            className="inline-block px-7 py-3 rounded-full border border-white/20 text-white font-semibold hover:border-[var(--color-harvest-400)]/60 hover:bg-white/5 transition-all duration-200 hover:scale-105"
          >
            Meet Us
          </Link>
        </RevealOnScroll>
      </section>
    </>
  );
}
