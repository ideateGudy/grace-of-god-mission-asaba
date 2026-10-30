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
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      ...Array.from(
        new Set(
          (process.env.IMAGE_ALLOWED_HOSTS?.split(",") || [])
            .map((h) => h.trim())
            .filter(Boolean)
        )
      ).map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
    ],
  },
  async redirects() {
    return [
      {
        source: "/countdown",
        destination: "/studio",
        permanent: false,
      },
      {
        source: "/countdown/live",
        destination: "/studio/live",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
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
