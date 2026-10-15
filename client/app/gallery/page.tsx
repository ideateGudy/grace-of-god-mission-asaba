import type { Metadata } from "next";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GalleryGrid, type GalleryItem } from "@/components/shared/GalleryGrid";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and moments from services, conferences, and community gatherings at Grace of God Mission Asaba.",
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
      title="Photo Gallery"
      description="Images, fellowship, and special memories shared by the church family."
    >
      {images.length ? (
        <GalleryGrid images={images} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          Photos will appear here when published by the church.
        </p>
      )}
    </PublicPageLayout>
  );
}
