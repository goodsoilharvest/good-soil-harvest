"use client";

import { useState, useEffect } from "react";

// Captures the beforeinstallprompt event for Chrome/Android.
// iOS Safari doesn't fire this event — we show manual instructions instead.
let deferredPrompt: Event | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function InstallApp() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(ios);

    // Chrome/Android — check if prompt is available
    if (deferredPrompt) {
      setCanInstall(true);
    }

    // Listen for future prompt availability
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    deferredPrompt = null;
    setCanInstall(false);
  }

  if (isInstalled) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">App installed</p>
            <p className="text-sm text-green-700 dark:text-green-400">Good Soil Harvest is installed on this device.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">📱</span>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-lg text-[var(--foreground)] mb-1">Install the App</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
            Add Good Soil Harvest to your home screen for a native app experience — faster loading,
            fullscreen reading, and push notifications for new articles.
          </p>

          {canInstall && (
            <button
              onClick={handleInstall}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-600)] hover:bg-[var(--color-sage-500)] text-white text-sm font-semibold transition-colors"
            >
              Install App
            </button>
          )}

          {isIOS && !canInstall && (
            <>
              <button
                onClick={() => setShowIOSGuide(!showIOSGuide)}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-sage-600)] hover:bg-[var(--color-sage-500)] text-white text-sm font-semibold transition-colors"
              >
                How to Install
              </button>
              {showIOSGuide && (
                <div className="mt-3 p-4 rounded-lg bg-[var(--surface-muted)] text-sm text-[var(--text-muted)] space-y-2">
                  <p><strong>1.</strong> Tap the <strong>Share</strong> button (square with arrow) in Safari</p>
                  <p><strong>2.</strong> Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></p>
                  <p><strong>3.</strong> Tap <strong>&quot;Add&quot;</strong> to confirm</p>
                </div>
              )}
            </>
          )}

          {!canInstall && !isIOS && (
            <p className="text-xs text-[var(--text-muted)]">
              Open this site in Chrome, Edge, or Safari to install.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
