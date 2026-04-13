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
            <p className="text-sm leading-relaxed mb-4">{siteConfig.tagline}</p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=61569241730096" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/goodsoilharvest/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.threads.com/@goodsoilharvest" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.343-.783-.98-1.404-1.813-1.837-.182 1.672-.775 2.986-1.765 3.907-1.128 1.048-2.675 1.6-4.474 1.593-1.366.006-2.57-.36-3.478-1.06-.98-.752-1.52-1.834-1.52-3.048 0-1.593.67-2.892 1.885-3.654.978-.614 2.246-.936 3.77-.957 1.103-.015 2.111.098 3.02.336-.107-1.16-.573-2.05-1.39-2.634-.89-.636-2.12-.953-3.66-.944l-.013-.002c-1.282.01-2.452.277-3.386.773l-.924-1.823c1.264-.669 2.766-1.019 4.326-1.068h.062c2.002-.012 3.627.47 4.834 1.432 1.29 1.028 2.004 2.578 2.12 4.602.546.272 1.04.6 1.478.986 1.002.882 1.695 2.089 2.001 3.483.387 1.76.166 3.881-1.32 5.422-1.774 1.838-4.013 2.618-7.244 2.637zM10.39 16.39c1.268.007 2.327-.286 3.056-.849.668-.516 1.09-1.275 1.237-2.209-.804-.205-1.728-.32-2.756-.306-2.447.035-3.856.798-3.856 2.088 0 .503.218.93.633 1.238.46.34 1.07.522 1.762.526l-.076.012z"/></svg>
              </a>
              <a href="https://x.com/goodsoilharvest" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
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
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-xs">
          <p>© {year} Good Soil Harvest LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
