import type { Metadata } from "next";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GalleryGrid, type GalleryItem } from "@/components/shared/GalleryGrid";
import { GlassCard } from "@/components/shared/GlassCard";
import { Image as ImageIcon } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo Gallery | Grace of God Mission Asaba",
  description:
    "Memories, conferences, services, and special moments shared by Grace of God Mission Asaba.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  let images: GalleryItem[] = [];
  try {
    const res = await api.public.gallery("?page=1&limit=60");
    images = (res.data as unknown as GalleryItem[]) ?? [];
  } catch {
    /* Keep the route available during API cold starts */
  }

  return (
    <PublicPageLayout
      title="Photo Gallery & Moments"
      description="Celebrating fellowship, conferences, baptisms, and divine encounters in God's presence."
      eyebrow="Church Life in Pictures · Memories"
    >
      {images.length ? (
        <GalleryGrid images={images} />
      ) : (
        <GlassCard surface="glass" padding="lg" className="text-center py-16 max-w-2xl mx-auto">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Moments Being Captured
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            Our media team is curating photos from recent worship services, youth conferences, and
            fellowships. Check back soon!
          </p>
        </GlassCard>
      )}
    </PublicPageLayout>
  );
}
