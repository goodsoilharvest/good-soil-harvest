import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Together AI (fallback — short-lived, only for local testing)
      { hostname: "api.together.ai" },
      { hostname: "*.together.ai" },
    ],
  },
};

export default nextConfig;
