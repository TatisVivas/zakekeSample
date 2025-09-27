import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.zakeke.com" },
      { protocol: "https", hostname: "portal.zakeke.com" },
      { protocol: "https", hostname: "media.zakeke.com" },
      { protocol: "https", hostname: "zakeke.blob.core.windows.net" },
      { protocol: "https", hostname: "cdn.zakeke.com" },
    ],
  },
};

export default nextConfig;
