"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GalleryItem } from "./GalleryGrid";

export function GalleryLightbox({ images, index, onIndexChange, onClose }: { images: GalleryItem[]; index: number; onIndexChange: (index: number) => void; onClose: () => void }) {
  const image = images[index];
  if (!image) return null;
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-w-5xl border-0 bg-midnight p-4 text-white sm:p-6"><DialogTitle className="sr-only">Church gallery photo {index + 1} of {images.length}</DialogTitle><DialogDescription className="sr-only">{image.caption ?? image.album ?? "Gallery photo"}</DialogDescription><div className="relative aspect-[4/3] overflow-hidden rounded-md"><Image src={image.imageUrl} alt={image.caption ?? ""} fill sizes="90vw" className="object-contain" /></div><div className="flex items-center justify-between gap-3"><p className="text-sm text-white/80">{image.caption ?? `Photo ${index + 1} of ${images.length}`}</p><div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Previous photo" disabled={index === 0} onClick={() => onIndexChange(index - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Next photo" disabled={index === images.length - 1} onClick={() => onIndexChange(index + 1)}><ChevronRight /></Button></div></div></DialogContent></Dialog>;
}
