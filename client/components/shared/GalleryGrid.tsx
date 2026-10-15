"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

export type GalleryItem = { id: string; imageUrl: string; caption?: string | null; album?: string | null; width?: number | null; height?: number | null };
const GalleryLightbox = dynamic(() => import("./GalleryLightbox").then((module) => module.GalleryLightbox));

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  return <><div className="columns-1 gap-4 sm:columns-2 lg:columns-3">{images.map((image, index) => <button key={image.id} type="button" onClick={() => setActive(index)} aria-label={`Open photo ${index + 1}: ${image.caption || image.album || "Church gallery photo"}`} className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-muted text-left focus-visible:outline-2 focus-visible:outline-ring"><span className="relative block aspect-[4/3]"><Image src={image.imageUrl} alt={image.caption ?? ""} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-300 hover:scale-[1.02]" /></span>{image.caption && <span className="block px-3 py-2 text-sm text-muted-foreground">{image.caption}</span>}</button>)}</div>{active !== null && <GalleryLightbox images={images} index={active} onIndexChange={setActive} onClose={() => setActive(null)} />}</>;
}
