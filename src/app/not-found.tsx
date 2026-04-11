import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌾</div>
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)] mb-3">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          That page either doesn&apos;t exist or has been moved. Let&apos;s get you back to something useful.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors"
          >
            Homepage
          </Link>
          <Link
            href="/blog"
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
