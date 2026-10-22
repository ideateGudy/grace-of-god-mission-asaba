"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeMediaImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function SafeMediaImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = "",
  priority = false,
}: SafeMediaImageProps) {
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = "/images/flyers/sunday-celebration-hero.webp";
  const effectiveSrc = hasError || !src ? fallbackSrc : src;
  const isExternalOrData =
    effectiveSrc.startsWith("http://") ||
    effectiveSrc.startsWith("https://") ||
    effectiveSrc.startsWith("data:") ||
    effectiveSrc.startsWith("blob:");

  // For any external URL, data URL, blob, or on error: use standard img to guarantee zero Next.js hostname errors
  if (isExternalOrData || hasError) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={effectiveSrc}
        alt={alt || "Media Slide"}
        className={fill ? `absolute inset-0 w-full h-full object-contain ${className}` : className}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={effectiveSrc}
      alt={alt || "Media Slide"}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      unoptimized={true}
      onError={() => setHasError(true)}
    />
  );
}
