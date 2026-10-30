"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX, Maximize, ExternalLink, HelpCircle } from "lucide-react";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Send unMute / mute postMessage commands to YouTube iframe (YouTube supports iframe API)
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
      } else {
        sendYouTubeCommand("mute");
        setIsMuted(true);
      }
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
    <div className="space-y-3">
      {/* 16:9 Video Container */}
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-3xl border border-border bg-black shadow-2xl"
      >
        <div className="relative aspect-video w-full bg-black">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title || "Live Stream"}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          {/* YouTube-only: prominent unmute button and status pill */}
          {isYouTube && (
            <>
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

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
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

                <button
                  type="button"
                  onClick={handleFullscreen}
                  aria-label="Toggle Fullscreen"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition active:scale-95"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {/* Facebook and non-YouTube: Native controls overlay bar */}
          {!isYouTube && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleFullscreen}
                aria-label="Toggle Fullscreen"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md border border-white/20 hover:bg-black/80 transition active:scale-95"
              >
                <Maximize className="h-4 w-4" />
              </button>

              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Watch directly on Facebook"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-md transition active:scale-95"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open on Facebook</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Helpful banner below Facebook player showing where the native speaker icon is */}
      {!isYouTube && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <p>
              <strong className="text-foreground">Facebook Live Audio:</strong> Hover or tap inside the video player above and click the speaker icon <span className="font-semibold text-foreground">(bottom-right / bottom-left)</span> to turn on sound.
            </p>
          </div>
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:underline shrink-0"
            >
              <span>Watch on Facebook App</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
