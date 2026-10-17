import type { NextConfig } from "next"

if (process.env.NODE_ENV === "production") {
  if (!process.env.API_INTERNAL_URL || !process.env.NEXT_PUBLIC_SITE_URL || !process.env.REVALIDATE_SECRET) {
    throw new Error("Missing required environment variables for production build.");
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year edge CDN cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: Array.from(
      new Set([
        "images.unsplash.com",
        "res.cloudinary.com",
        ...(process.env.IMAGE_ALLOWED_HOSTS?.split(",") || []),
      ].map((h) => h.trim()).filter(Boolean))
    ).map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  async headers() {
    return [
      {
        source: "/(images|icons|fonts)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
