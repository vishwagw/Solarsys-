import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "server.arcgisonline.com" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
    ],
  },
};

export default nextConfig;
