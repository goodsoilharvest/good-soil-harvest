import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Self — blog images served via /api/img/ proxy from private Vercel Blob
      { hostname: "www.goodsoilharvest.com" },
      { hostname: "goodsoilharvest.com" },
      // Together AI (fallback — short-lived, only for local testing)
      { hostname: "api.together.ai" },
      { hostname: "*.together.ai" },
    ],
  },
};

export default nextConfig;
