"use client";

import { useState } from "react";
import { Headphones, ExternalLink, Download } from "lucide-react";

export function SermonAudioPlayer({ audioUrl, title }: { audioUrl: string; title: string }) {
  const [hasError, setHasError] = useState(false);
  const [showDriveEmbed, setShowDriveEmbed] = useState(false);

  // Check if it's a Google Drive link
  const driveMatch = audioUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/);
  const driveId = driveMatch ? driveMatch[1] : null;

  const streamUrl = driveId
    ? `https://drive.google.com/uc?export=download&id=${driveId}`
    : audioUrl;
  const drivePreviewUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : null;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-secondary/20 p-6 shadow-md backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Sermon Audio</h2>
            <p className="text-xs text-muted-foreground line-clamp-1">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {drivePreviewUrl && (
            <button
              type="button"
              onClick={() => setShowDriveEmbed((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>{showDriveEmbed ? "Hide Drive Player" : "Switch Player"}</span>
            </button>
          )}

          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Download className="size-3.5" />
            <span>Download MP3</span>
          </a>
        </div>
      </div>

      <div className="pt-5">
        {!showDriveEmbed && !hasError ? (
          <div className="space-y-3">
            <audio
              controls
              preload="metadata"
              className="w-full h-12 rounded-lg accent-primary"
              onError={() => {
                if (driveId) setHasError(true);
              }}
            >
              <source src={streamUrl} type="audio/mpeg" />
              <source src={streamUrl} />
              Your browser does not support audio playback.
            </audio>
            {driveId && (
              <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Streaming from cloud storage</span>
                <button
                  type="button"
                  onClick={() => setShowDriveEmbed(true)}
                  className="text-primary hover:underline"
                >
                  Audio not playing? Switch to Drive player
                </button>
              </p>
            )}
          </div>
        ) : null}

        {(showDriveEmbed || hasError) && drivePreviewUrl && (
          <div className="space-y-3">
            <div className="relative h-28 w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-inner">
              <iframe
                src={drivePreviewUrl}
                className="absolute inset-0 size-full border-0"
                title={`Audio player for ${title}`}
                allow="autoplay"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Cloud Drive Player</span>
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <span>Open Audio in New Tab</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
