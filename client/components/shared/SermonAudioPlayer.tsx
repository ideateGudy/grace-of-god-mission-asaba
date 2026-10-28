"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function SermonAudioPlayer({
  audioUrl,
  title,
}: {
  audioUrl: string;
  title: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDriveEmbed, setShowDriveEmbed] = useState(false);

  // Extract Drive ID if Google Drive link
  const driveMatch = audioUrl.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/
  );
  const driveId = driveMatch ? driveMatch[1] : null;

  const streamUrl = driveId
    ? `https://drive.google.com/uc?export=download&id=${driveId}`
    : audioUrl;
  const drivePreviewUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsLoading(true);
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
        if (driveId) {
          setShowDriveEmbed(true);
        }
      });
    }
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 99999);
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeek = (values: number[]) => {
    if (!audioRef.current || !values[0] && values[0] !== 0) return;
    audioRef.current.currentTime = values[0];
    setCurrentTime(values[0]);
  };

  const handleVolumeChange = (values: number[]) => {
    if (!audioRef.current || !values[0] && values[0] !== 0) return;
    const val = values[0];
    audioRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    setPlaybackRate(nextRate);
  };

  // Audio event bindings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => {
      setIsLoading(false);
      setHasError(true);
      if (driveId) {
        setShowDriveEmbed(true);
      }
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
    };
  }, [driveId]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative mt-8 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-[#13172C] via-[#0E1020] to-[#0A0C18] p-6 md:p-8 shadow-2xl">
      {/* Ambient sacred glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-gold/10 blur-3xl"
      />

      {/* Hidden audio element driving playback */}
      <audio ref={audioRef} src={streamUrl} preload="metadata" />

      {/* Top Bar: Title & Actions */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-inner">
            <Headphones className="size-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Sermon Audio Player
              </span>
              {driveId && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60">
                  Cloud Stream
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1 mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {drivePreviewUrl && (
            <button
              type="button"
              onClick={() => setShowDriveEmbed((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/10 hover:border-white/25 active:scale-95"
            >
              <SlidersHorizontal className="size-3.5 text-primary" />
              <span>{showDriveEmbed ? "Use Native Player" : "Drive Backup Player"}</span>
            </button>
          )}

          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95"
          >
            <Download className="size-3.5" />
            <span>Download MP3</span>
          </a>
        </div>
      </div>

      {/* Main Player Display */}
      {!showDriveEmbed ? (
        <div className="relative z-10 pt-6 space-y-6">
          {/* Progress Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer py-1"
            />
            <div className="flex items-center justify-between text-xs font-semibold tabular-nums text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : isPlaying ? "Streaming…" : "--:--"}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Playback speed */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="inline-flex h-9 min-w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                title="Change speed"
              >
                {playbackRate}x
              </button>
            </div>

            {/* Central Playback Controls */}
            <div className="flex items-center gap-3">
              {/* Skip back 10s */}
              <button
                type="button"
                onClick={() => skip(-10)}
                className="flex size-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="size-4" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 active:scale-95 disabled:opacity-70"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <Pause className="size-6 fill-current" />
                ) : (
                  <Play className="size-6 fill-current ml-1" />
                )}
              </button>

              {/* Skip forward 10s */}
              <button
                type="button"
                onClick={() => skip(10)}
                className="flex size-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
                title="Fast forward 10 seconds"
              >
                <RotateCw className="size-4" />
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-white/70 hover:text-white transition"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="size-4 text-red-400" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cloud Drive Embedded Player Backup */
        <div className="relative z-10 pt-6 space-y-3">
          <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-inner">
            <iframe
              src={drivePreviewUrl || ""}
              className="absolute inset-0 size-full border-0"
              title={`Audio player for ${title}`}
              allow="autoplay"
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/60">
            <span>Google Drive Embedded Audio Player</span>
            <a
              href={streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              <span>Open File Directly</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
