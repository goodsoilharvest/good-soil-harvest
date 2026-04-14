"use client";

import { AdUnit } from "./AdUnit";

interface BlogAdProps {
  show: boolean;
  slot?: string;
}

/**
 * Conditionally renders an ad unit in blog posts.
 * The parent server component determines whether to show based on:
 * - Article is free (not premium, not deep roots)
 * - Viewer has no active subscription
 */
export function BlogAd({ show, slot }: BlogAdProps) {
  if (!show) return null;
  // Use a default slot — Chris will replace with real AdSense slot ID after approval
  return <AdUnit slot={slot ?? "auto"} />;
}
