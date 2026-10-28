"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function getEmbedInfo(source: string) {
  try {
    const url = new URL(source);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return { type: "youtube" as const, src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1` };
    }
    if (url.hostname.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).at(-1);
      if (id) return { type: "youtube" as const, src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1` };
    }
    // Google Drive video preview embed
    const driveMatch = source.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return { type: "drive" as const, src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
    }
    // Direct video stream / MP4
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(source)) {
      return { type: "video" as const, src: source };
    }
  } catch { return null; }
  return null;
}

export function VideoFacade({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const embed = getEmbedInfo(url);

  if (!embed) {
    return (
      <a className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground" href={url} target="_blank" rel="noreferrer">
        Watch sermon video
      </a>
    );
  }

  if (embed.type === "video") {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl bg-midnight">
        <video controls className="size-full" preload="metadata">
          <source src={embed.src} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-midnight">
      {loaded ? (
        <iframe
          className="absolute inset-0 size-full"
          src={embed.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-midnight to-indigo">
          <Button type="button" className="min-h-12" onClick={() => setLoaded(true)}>
            <Play className="mr-2 size-5" aria-hidden="true" />
            Play sermon video
          </Button>
        </div>
      )}
    </div>
  );
}
