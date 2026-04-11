"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)] mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Sorry about that. Try refreshing, or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Back to homepage
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-[var(--text-muted)] mt-6 opacity-60 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
