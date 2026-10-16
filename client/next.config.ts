import type { NextConfig } from "next"

if (process.env.NODE_ENV === "production") {
  if (!process.env.API_INTERNAL_URL || !process.env.NEXT_PUBLIC_SITE_URL || !process.env.REVALIDATE_SECRET) {
    throw new Error("Missing required environment variables for production build.");
  }
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_INTERNAL_URL || "http://127.0.0.1:5000"}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: (process.env.IMAGE_ALLOWED_HOSTS || "images.unsplash.com")
      .split(",")
      .map((host) => ({
        protocol: "https" as const,
        hostname: host.trim(),
      })),
  },
};

export default nextConfig;
