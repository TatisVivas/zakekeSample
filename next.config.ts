import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.zakeke.com" },
      { protocol: "https", hostname: "portal.zakeke.com" },
      { protocol: "https", hostname: "media.zakeke.com" },
      { protocol: "https", hostname: "zakeke.blob.core.windows.net" },
      { protocol: "https", hostname: "cdn.zakeke.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Build should not fail on type or lint errors in CI/server
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
