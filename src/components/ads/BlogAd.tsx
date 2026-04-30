"use client";

import { AdUnit } from "./AdUnit";

interface BlogAdProps {
  show: boolean;
  slot?: string;
}

const BLOG_INLINE_SLOT = "7015556402";

export function BlogAd({ show, slot }: BlogAdProps) {
  if (!show) return null;
  return <AdUnit slot={slot ?? BLOG_INLINE_SLOT} format="fluid" layout="in-article" />;
}
