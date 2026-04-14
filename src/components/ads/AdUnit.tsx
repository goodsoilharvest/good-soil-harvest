"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string; // AdSense ad unit slot ID
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

/**
 * Google AdSense ad unit. Only renders when:
 * - NEXT_PUBLIC_ADSENSE_ID env var is set (production only)
 * - The parent component decides to show it (free articles, non-subscribers)
 *
 * Usage: <AdUnit slot="1234567890" />
 */
export function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!publisherId || !adRef.current) return;
    try {
      // Push the ad to Google's ad rendering queue
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded or blocked by ad blocker — silently degrade
    }
  }, [publisherId]);

  if (!publisherId) return null;

  return (
    <div className={`my-8 text-center ${className}`}>
      <p className="text-xs text-[var(--text-muted)] mb-2">Advertisement</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
