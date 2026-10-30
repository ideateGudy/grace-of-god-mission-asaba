"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX, ExternalLink } from "lucide-react";

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
      } else {
        sendYouTubeCommand("mute");
        setIsMuted(true);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* 16:9 Clean Video Container - zero buttons covering or blocking native player controls */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-black shadow-2xl">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title || "Live Stream"}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Control & Audio Toolbar located CLEANLY BELOW the video frame (No blocking) */}
      {isYouTube ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 p-3 sm:px-4 text-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm ${
                isMuted
                  ? "bg-primary text-primary-foreground hover:brightness-110 animate-pulse ring-2 ring-primary/30"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
            >
              {isMuted ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Tap to Unmute Stream Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Audio Playing (Tap to Mute)</span>
                </>
              )}
            </button>
            <span className="text-muted-foreground hidden md:inline">
              {isMuted
                ? "Browser policy autoplays muted. Click button above or use player volume bar."
                : "Sound is enabled at full volume."}
            </span>
          </div>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline shrink-0 py-1"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ) : (
        /* Facebook stream info banner placed cleanly below video */
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <p>
              <strong className="text-foreground">Facebook Live Audio:</strong> Click or tap the speaker icon inside the player controls to turn on audio.
            </p>
          </div>
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-blue-500 hover:underline shrink-0"
            >
              <span>Watch on Facebook</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
