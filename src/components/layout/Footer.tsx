import Link from "next/link";
import { niches, siteConfig } from "@/lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-soil-900)] text-white/70">
      <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌱</span>
              <span className="font-serif font-bold text-white text-lg">
                Good Soil Harvest
              </span>
            </Link>
            <p className="text-sm leading-relaxed">{siteConfig.tagline}</p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wide mb-3">
              Topics
            </h3>
            <ul className="space-y-2 text-sm">
              {niches.map((niche) => (
                <li key={niche.slug}>
                  <Link
                    href={`/niches/${niche.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {niche.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wide mb-3">
              Site
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">All Posts</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white text-sm uppercase tracking-wide mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {year} Good Soil Harvest LLC. All rights reserved.</p>
          <p className="text-center">
            This site contains affiliate links.{" "}
            <Link href="/affiliate-disclosure" className="underline hover:text-white">
              Read our disclosure.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
