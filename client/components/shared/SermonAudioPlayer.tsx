"use client";

import { useState } from "react";
import { Headphones, ExternalLink, Download } from "lucide-react";

export function SermonAudioPlayer({ audioUrl, title }: { audioUrl: string; title: string }) {
  const [hasError, setHasError] = useState(false);

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
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Headphones className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-foreground">Listen to Sermon Audio</h2>
        </div>
        {driveId && (
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Download className="size-3.5" />
            <span>Download</span>
          </a>
        )}
      </div>

      {!hasError ? (
        <audio
          controls
          preload="metadata"
          className="w-full h-11 rounded-lg"
          onError={() => {
            if (driveId) setHasError(true);
          }}
        >
          <source src={streamUrl} type="audio/mpeg" />
          <source src={streamUrl} />
          Your browser does not support audio playback.
        </audio>
      ) : null}

      {/* Fallback to embedded player if direct HTML5 stream is blocked by Drive CORS or large file scan */}
      {hasError && drivePreviewUrl && (
        <div className="mt-2 space-y-3">
          <div className="relative h-20 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
            <iframe
              src={drivePreviewUrl}
              className="absolute inset-0 size-full border-0"
              title={`Audio preview for ${title}`}
              allow="autoplay"
            />
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Direct player fallback activated</span>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <span>Open in Google Drive</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
