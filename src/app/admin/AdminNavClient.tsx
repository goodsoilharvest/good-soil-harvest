"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/drafts", label: "Drafts" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNavClient({ signOutAction }: { signOutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[var(--color-soil-800)] text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-serif font-bold text-[var(--color-harvest-400)]">
            🌱 Good Soil CMS
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: My Feed + Sign out (desktop) / hamburger (mobile) */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden md:inline text-sm text-[var(--color-sage-300)] hover:text-white transition-colors"
          >
            ← My Feed
          </Link>
          <form action={signOutAction} className="hidden md:block">
            <button type="submit" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign out
            </button>
          </form>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-white/10 py-2 flex flex-col">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/10 mt-2 pt-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-5 py-3 text-sm text-[var(--color-sage-300)] hover:text-white hover:bg-white/10 transition-colors"
            >
              ← My Feed
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="block w-full text-left px-5 py-3 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
