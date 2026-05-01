import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  } as any,
  images: {
    domains: ["images.unsplash.com", "picsum.photos"],
  },
};

export default nextConfig;
