import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Together AI image generation CDN
      { hostname: "cdn.together.ai" },
      { hostname: "api.together.ai" },
      // Wildcard for any Together AI CDN subdomain
      { hostname: "*.together.ai" },
    ],
  },
};

export default nextConfig;
