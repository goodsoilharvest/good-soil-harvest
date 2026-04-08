"use client";

import { useState, useEffect } from "react";

const BETA_DISMISSED_KEY = "gs_beta_dismissed";

export function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(BETA_DISMISSED_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(BETA_DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="bg-[var(--color-harvest-500)] text-white text-xs sm:text-sm px-4 py-2 flex items-center justify-center gap-3 text-center">
      <span>
        <strong>Pre-launch beta.</strong> Stripe is in test mode — no real charges will occur.
        Sign-ups and content are live for testing only.
      </span>
      <button
        onClick={dismiss}
        className="shrink-0 text-white/70 hover:text-white leading-none text-base font-bold"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
