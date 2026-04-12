import Link from "next/link";
import { redirect } from "next/navigation";
import { niches, siteConfig } from "@/lib/config";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { auth } from "@/auth";

const SEEDS = [
  { left: "8%",  delay: "0.0s", dur: "3.5s", size: 5 },
  { left: "19%", delay: "0.8s", dur: "4s",   size: 3 },
  { left: "31%", delay: "1.5s", dur: "3.2s", size: 4 },
  { left: "44%", delay: "0.4s", dur: "3.8s", size: 3 },
  { left: "57%", delay: "1.2s", dur: "3.5s", size: 5 },
  { left: "68%", delay: "0.2s", dur: "4.2s", size: 3 },
  { left: "79%", delay: "2.0s", dur: "3.4s", size: 4 },
  { left: "90%", delay: "1.0s", dur: "4s",   size: 3 },
];

// Sprouts positioned to "catch" seeds — appear shortly after seeds land
const SPROUTS = [
  { left: "8%",  delay: "3.0s", dur: "1.5s" },
  { left: "31%", delay: "4.2s", dur: "1.3s" },
  { left: "44%", delay: "3.6s", dur: "1.6s" },
  { left: "57%", delay: "4.0s", dur: "1.4s" },
  { left: "79%", delay: "4.8s", dur: "1.3s" },
];

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const isAuthed = false; // only reached by unauthenticated users

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white min-h-[92vh] flex flex-col">

        {/* Parallax tree background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url(https://www.goodsoilharvest.com/api/img/site/hero-tree-1776006148.jpg)" }}
          aria-hidden
        />

        {/* Dark overlay for text readability — heavier at bottom to blend into soil */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "linear-gradient(to bottom, rgba(30,15,6,0.55) 0%, rgba(30,15,6,0.4) 50%, rgba(30,15,6,0.75) 85%, rgba(46,26,10,0.95) 100%)" }} />

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

        {/* Soil strip with wavy edge + realistic sprouts */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none" aria-hidden style={{ height: 160 }}>
          {/* Wavy soil — blends with the darkened bottom of the tree image */}
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" width="100%" height="100%"
            xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
            <defs>
              <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3a2414" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#2e1a0a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="var(--color-soil-800)" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Main soil body */}
            <path
              d="M0,60 C60,45 120,72 200,55 C280,38 340,68 440,50 C540,32 620,62 720,48 C820,34 900,64 1000,46 C1100,28 1180,58 1280,44 C1360,34 1400,52 1440,42 L1440,160 L0,160 Z"
              fill="url(#soilGrad)"
            />
            {/* Subtle texture lines in soil */}
            <path d="M0,90 Q360,82 720,88 Q1080,94 1440,86" fill="none" stroke="#4a2e14" strokeWidth="0.8" opacity="0.4" />
            <path d="M0,110 Q300,104 600,112 Q900,118 1200,108 Q1380,104 1440,106" fill="none" stroke="#4a2e14" strokeWidth="0.6" opacity="0.3" />
            {/* Roots spreading from sprout positions */}
            {SPROUTS.map((sp, i) => {
              const x = parseFloat(sp.left) / 100 * 1440;
              return (
                <g key={i}>
                  <path
                    d={`M${x},55 Q${x - 25},72 ${x - 60},85 Q${x - 80},92 ${x - 95},100`}
                    fill="none" stroke="#5a3e28" strokeWidth="1.5"
                    strokeDasharray="100" strokeDashoffset="100"
                    style={{ animation: `rootSpread 2s ${sp.delay} ease-out forwards`, opacity: 0 }}
                  />
                  <path
                    d={`M${x},55 Q${x + 22},70 ${x + 55},82 Q${x + 75},90 ${x + 90},98`}
                    fill="none" stroke="#4a3020" strokeWidth="1.2"
                    strokeDasharray="100" strokeDashoffset="100"
                    style={{ animation: `rootSpread 1.8s calc(${sp.delay} + 0.3s) ease-out forwards`, opacity: 0 }}
                  />
                  {/* Thinner root tendrils */}
                  <path
                    d={`M${x - 40},78 Q${x - 55},88 ${x - 70},100`}
                    fill="none" stroke="#4a3020" strokeWidth="0.7"
                    strokeDasharray="40" strokeDashoffset="40"
                    style={{ animation: `rootSpread 1.2s calc(${sp.delay} + 0.8s) ease-out forwards`, opacity: 0 }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Realistic SVG sprouts growing above the soil line */}
          {SPROUTS.map((sp, i) => {
            const heights = [38, 32, 42, 35, 30];
            const h = heights[i % heights.length];
            return (
              <div
                key={i}
                className="absolute"
                style={{ left: sp.left, bottom: 98, transform: "translateX(-50%)" }}
              >
                <svg width="40" height={h + 20} viewBox={`0 0 40 ${h + 20}`} style={{
                  transformOrigin: "bottom center",
                  transform: "scaleY(0)",
                  animation: `sproutGrow ${sp.dur} ${sp.delay} ease-out forwards`,
                  opacity: 0,
                }}>
                  {/* Curved stem */}
                  <path
                    d={`M20,${h + 18} Q${18 + (i % 2 ? 3 : -3)},${h * 0.6} 20,4`}
                    fill="none" stroke="#4f6640" strokeWidth="2.5" strokeLinecap="round"
                  />
                  {/* Left leaf — teardrop shape */}
                  <ellipse cx="11" cy={h * 0.35} rx="8" ry="5"
                    transform={`rotate(-35 11 ${h * 0.35})`}
                    fill="#637f52" opacity="0.9"
                  />
                  <path
                    d={`M11,${h * 0.35 - 4} Q11,${h * 0.35} 11,${h * 0.35 + 4}`}
                    fill="none" stroke="#82a06a" strokeWidth="0.6" opacity="0.6"
                  />
                  {/* Right leaf — slightly different angle */}
                  <ellipse cx="29" cy={h * 0.5} rx="7" ry="4.5"
                    transform={`rotate(30 29 ${h * 0.5})`}
                    fill="#4f6640" opacity="0.85"
                  />
                  <path
                    d={`M29,${h * 0.5 - 3.5} Q29,${h * 0.5} 29,${h * 0.5 + 3.5}`}
                    fill="none" stroke="#82a06a" strokeWidth="0.5" opacity="0.5"
                  />
                  {/* Top bud / unfurling leaf */}
                  <ellipse cx="20" cy="6" rx="4" ry="6"
                    fill="#82a06a" opacity="0.9"
                  />
                </svg>
              </div>
            );
          })}
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

      {/* ── Parallax divider ──────────────────────────────── */}
      <section className="relative h-[40vh] min-h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url(https://www.goodsoilharvest.com/api/img/site/home-parallax-1776003048.jpg)" }}
        />
        <div className="absolute inset-0 bg-[var(--color-soil-900)]/60" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <p className="font-serif text-2xl sm:text-3xl font-bold text-white/90 max-w-2xl leading-relaxed drop-shadow-lg">
            &ldquo;But the seed falling on good soil refers to someone who hears the word and
            understands it.&rdquo;
            <span className="block text-base font-sans font-normal text-white/50 mt-3">Matthew 13:23</span>
          </p>
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

      {/* ── Membership / Personalized Profile teaser (unauthenticated only) ── */}
      {!isAuthed && (
        <section className="py-24 px-4 sm:px-6 bg-[var(--color-soil-800)]">
          <div className="max-w-[var(--max-w-content)] mx-auto">
            <RevealOnScroll className="text-center mb-16">
              <p className="text-[var(--color-harvest-400)] text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                Membership
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Own Corner of Good Soil
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto text-lg leading-relaxed">
                Members get a personalized reading experience — articles chosen for you,
                saved reads, and a home page that gets smarter the more you explore.
                Free trial included. No commitment.
              </p>
            </RevealOnScroll>

            {/* Personalized profile preview placeholder */}
            <RevealOnScroll className="mb-16">
              <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-sage-500)] flex items-center justify-center text-sm font-bold text-white">J</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Your reading profile</p>
                    <p className="text-xs text-white/40">Personalized just for you</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tab: "For You", icon: "✨", desc: "Articles picked based on what you read and save" },
                    { tab: "Saved",   icon: "🔖", desc: "Your bookmarked reads in one place" },
                    { tab: "History", icon: "📖", desc: "Everything you've read, easy to revisit" },
                  ].map((item) => (
                    <div key={item.tab} className="rounded-xl bg-white/5 border border-white/8 p-4 text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="text-sm font-semibold text-white mb-1">{item.tab}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-5 text-center">
                  <p className="text-xs text-white/30 italic">Sign up to see your personalized feed in action</p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Pricing cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Free */}
              <RevealOnScroll delay={1}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col h-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Free</p>
                  <p className="font-serif text-3xl font-bold text-white mb-1">$0</p>
                  <p className="text-white/40 text-sm mb-6">Forever free</p>
                  <ul className="space-y-2.5 text-sm text-white/70 flex-1 mb-8">
                    {["Browse all free articles", "All 5 topic categories", "No account required"].map(f => (
                      <li key={f} className="flex items-start gap-2"><span className="text-[var(--color-sage-400)] mt-0.5">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/blog" className="block text-center py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-semibold hover:bg-white/10 transition-colors">
                    Start reading
                  </Link>
                </div>
              </RevealOnScroll>

              {/* Seedling — highlighted */}
              <RevealOnScroll delay={2}>
                <div className="rounded-2xl border-2 border-[var(--color-harvest-500)] bg-[var(--color-harvest-500)]/10 p-7 flex flex-col h-full relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-harvest-500)] text-[var(--color-soil-900)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most popular
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-harvest-400)] mb-3">🌱 Seedling</p>
                  <p className="font-serif text-3xl font-bold text-white mb-1">$4.99<span className="text-lg font-normal text-white/50">/mo</span></p>
                  <p className="text-white/40 text-sm mb-6">7-day free trial</p>
                  <ul className="space-y-2.5 text-sm text-white/80 flex-1 mb-8">
                    {["Everything in Free", "All premium articles", "Personalized homepage", "Saved & history tabs", "Article suggestions"].map(f => (
                      <li key={f} className="flex items-start gap-2"><span className="text-[var(--color-harvest-400)] mt-0.5">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/register?plan=SEEDLING" className="block text-center py-2.5 rounded-xl bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] text-[var(--color-soil-900)] text-sm font-bold transition-colors">
                    Try free for 7 days
                  </Link>
                </div>
              </RevealOnScroll>

              {/* Deep Roots */}
              <RevealOnScroll delay={3}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col h-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-sage-400)] mb-3">🌾 Deep Roots</p>
                  <p className="font-serif text-3xl font-bold text-white mb-1">$9.99<span className="text-lg font-normal text-white/50">/mo</span></p>
                  <p className="text-white/40 text-sm mb-6">7-day free trial</p>
                  <ul className="space-y-2.5 text-sm text-white/70 flex-1 mb-8">
                    {["Everything in Seedling", "Exclusive Deep Roots posts", "AI-powered search", "Early access to new features"].map(f => (
                      <li key={f} className="flex items-start gap-2"><span className="text-[var(--color-sage-400)] mt-0.5">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/register?plan=DEEP_ROOTS" className="block text-center py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-semibold hover:bg-white/10 transition-colors">
                    Try free for 7 days
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            <RevealOnScroll className="text-center mt-8">
              <p className="text-white/30 text-xs">No commitment — cancel anytime during your trial and you won&apos;t be charged.</p>
            </RevealOnScroll>
          </div>
        </section>
      )}
    </>
  );
}
