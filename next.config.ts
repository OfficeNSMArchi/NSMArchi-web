import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  } as any,
  images: {
    domains: ["images.unsplash.com", "picsum.photos"],
    qualities: [75, 85, 90],
    deviceSizes: [640, 1080, 1920, 2560],
  },
};

export default nextConfig;
