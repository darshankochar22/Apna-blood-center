import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apnabloodcentre.in",
      },
      {
        protocol: "https",
        hostname: "gemini.google.com",
      },
    ],
  },
};

export default nextConfig;
