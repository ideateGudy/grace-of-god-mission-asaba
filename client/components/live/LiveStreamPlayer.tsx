"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Maximize, Play, ExternalLink } from "lucide-react";

interface LiveStreamPlayerProps {
  embedUrl: string;
  rawUrl?: string | null;
  title?: string | null;
  isYouTube: boolean;
}

export function LiveStreamPlayer({
  embedUrl,
  rawUrl,
  title = "Grace of God Mission Asaba Live Broadcast",
  isYouTube,
}: LiveStreamPlayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Send unMute / mute postMessage commands to YouTube iframe
  const sendYouTubeCommand = (func: string, args: any = "") => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const message = JSON.stringify({
        event: "command",
        func,
        args,
      });
      iframeRef.current.contentWindow.postMessage(message, "*");
    } catch {}
  };

  const handleToggleSound = () => {
    if (isYouTube) {
      if (isMuted) {
        sendYouTubeCommand("unMute");
        sendYouTubeCommand("setVolume", [100]);
        setIsMuted(false);
        setHasInteracted(true);
      } else {
        sendYouTubeCommand("mute");
        setIsMuted(true);
      }
    } else {
      // For non-YouTube (e.g. Facebook iframe), user clicking prompts direct interaction
      setIsMuted(false);
      setHasInteracted(true);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-3xl border border-border bg-black shadow-2xl"
    >
      {/* 16:9 Video Frame */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title || "Live Stream"}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />

        {/* Prominent Overlay Banner for Unmuting Audio */}
        {isMuted && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 sm:bottom-6 flex justify-center px-4 transition-all duration-300">
            <button
              type="button"
              onClick={handleToggleSound}
              className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full bg-primary/95 hover:bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 animate-bounce ring-4 ring-white/20"
            >
              <Volume2 className="h-5 w-5 animate-pulse text-gold" />
              <span>Tap to Unmute Audio</span>
            </button>
          </div>
        )}

        {/* Top Floating Controls Bar */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          {/* Quick Sound Toggle Pill */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={isMuted ? "Unmute stream audio" : "Mute stream audio"}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition-all duration-200 active:scale-95 ${
              isMuted
                ? "bg-red-600/90 hover:bg-red-600 text-white ring-2 ring-red-400/30"
                : "bg-black/60 hover:bg-black/80 text-white border border-white/20"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Audio Muted (Click to Unmute)</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span>Sound Active</span>
              </>
            )}
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Toggle Fullscreen"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition active:scale-95"
          >
            <Maximize className="h-4 w-4" />
          </button>

          {/* Direct External Link */}
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open video in new tab"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition active:scale-95"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
