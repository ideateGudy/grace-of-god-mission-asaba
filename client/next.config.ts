import type { NextConfig } from "next"

if (process.env.NODE_ENV === "production") {
  if (!process.env.API_INTERNAL_URL || !process.env.NEXT_PUBLIC_SITE_URL || !process.env.REVALIDATE_SECRET) {
    throw new Error("Missing required environment variables for production build.");
  }
}

const nextConfig: NextConfig = {
  images: {
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
};

export default nextConfig;
