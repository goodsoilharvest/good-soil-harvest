"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string; // AdSense ad unit slot ID (numeric)
  format?: "auto" | "rectangle" | "horizontal" | "fluid";
  layout?: "in-article";
  className?: string;
}

export function AdUnit({ slot, format = "auto", layout, className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!publisherId || !adRef.current) return;
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded or blocked — silently degrade
    }
  }, [publisherId]);

  if (!publisherId) return null;

  const safeSlot = /^\d+$/.test(slot) ? slot : null;
  if (!safeSlot) return null;

  const isInArticle = layout === "in-article";

  return (
    <div className={`my-8 text-center ${className}`}>
      <p className="text-xs text-[var(--text-muted)] mb-2">Advertisement</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={publisherId}
        data-ad-slot={safeSlot}
        data-ad-format={format}
        {...(isInArticle ? { "data-ad-layout": "in-article" } : { "data-full-width-responsive": "true" })}
      />
    </div>
  );
}
