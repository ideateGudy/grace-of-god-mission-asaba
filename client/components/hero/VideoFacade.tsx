"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function youtubeId(source: string) {
  try {
    const url = new URL(source);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0];
    if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).at(-1);
  } catch { return null; }
  return null;
}

export function VideoFacade({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const id = youtubeId(url);
  if (!id) return <a className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground" href={url} target="_blank" rel="noreferrer">Watch sermon video</a>;
  return <div className="relative aspect-video overflow-hidden rounded-xl bg-midnight">{loaded ? <iframe className="absolute inset-0 size-full" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-midnight to-indigo"><Button type="button" className="min-h-12" onClick={() => setLoaded(true)}><Play className="mr-2 size-5" aria-hidden="true" />Play sermon video</Button></div>}</div>;
}
