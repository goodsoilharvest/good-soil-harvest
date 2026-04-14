export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <span className="text-6xl block">🌱</span>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">
          You&apos;re offline
        </h1>
        <p className="text-[var(--text-muted)] leading-relaxed">
          It looks like you&apos;ve lost your connection. Check your Wi-Fi or
          cellular data and try again. Your reading history and saved articles
          will be here when you&apos;re back.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block px-6 py-2.5 rounded-full bg-[var(--color-harvest-500)] text-[var(--color-soil-900)] font-semibold hover:bg-[var(--color-harvest-400)] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
