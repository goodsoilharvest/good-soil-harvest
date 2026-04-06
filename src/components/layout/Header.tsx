"use client";

import Link from "next/link";
import { useState } from "react";
import { niches, siteConfig } from "@/lib/config";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[var(--color-soil-800)] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-[var(--max-w-content)] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-[var(--color-harvest-400)] text-2xl">🌱</span>
            <span className="font-serif font-bold text-lg leading-tight">
              Good Soil{" "}
              <span className="text-[var(--color-sage-400)]">Harvest</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {niches.map((niche) => (
              <Link
                key={niche.slug}
                href={`/niches/${niche.slug}`}
                className="px-3 py-1.5 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {niche.shortTitle}
              </Link>
            ))}
            <Link href="/blog" className="px-3 py-1.5 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              All Posts
            </Link>
            <Link
              href="/about"
              className="ml-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden py-3 border-t border-white/10 flex flex-col gap-1">
            {niches.map((niche) => (
              <Link
                key={niche.slug}
                href={`/niches/${niche.slug}`}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                {niche.icon} {niche.title}
              </Link>
            ))}
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">
              All Posts
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
