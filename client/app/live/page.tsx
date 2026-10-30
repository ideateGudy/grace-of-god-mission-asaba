import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { TestimonyDialog } from "@/components/testimonies/TestimonyDialog";
import { LiveStreamPlayer } from "@/components/live/LiveStreamPlayer";
import { api } from "@/lib/api/client";
import {
  Radio,
  Clock,
  Calendar,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Share2,
  Tv,
  ExternalLink,
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Live Service | Grace of God Mission Asaba",
  description:
    "Join the online worship experience of Grace of God Mission Asaba. Stream live Sunday celebrations and Midweek encounters from anywhere in the world.",
  alternates: { canonical: "/live" },
};

function formatEmbedUrl(rawUrl?: string | null): { embedUrl: string | null; isYouTube: boolean } {
  if (!rawUrl) return { embedUrl: null, isYouTube: false };
  const trimmed = rawUrl.trim();
  if (!trimmed) return { embedUrl: null, isYouTube: false };

  // YouTube watch link or live link to embed (with enablejsapi=1 so postMessage unmute works)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&enablejsapi=1&playsinline=1&rel=0`,
      isYouTube: true,
    };
  }

  // Facebook video embed
  if (trimmed.includes("facebook.com")) {
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false&autoplay=true`,
      isYouTube: false,
    };
  }

  return { embedUrl: trimmed, isYouTube: false };
}

export default async function LivePage() {
  let liveStatus = {
    isLive: false,
    liveTitle: null as string | null,
    liveServiceType: null as string | null,
    liveVideoUrl: null as string | null,
    liveNotes: null as string | null,
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await api.livestream.get();
    if (res?.data) {
      liveStatus = res.data;
    }
  } catch {}

  const { embedUrl, isYouTube } = formatEmbedUrl(liveStatus.liveVideoUrl);

  return (
    <PublicPageLayout
      title="Worship With Us Live"
      description="Connect to our live sanctuary broadcast from Asaba, Delta State, and experience transforming grace and apostolic power."
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Live Status Header / Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-border bg-card/70 p-4 sm:p-5 shadow-lg backdrop-blur-md">
          {/* Status info */}
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shrink-0 ${
                liveStatus.isLive
                  ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/20 animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Radio className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                    liveStatus.isLive
                      ? "bg-red-500 text-white shadow-xs animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${liveStatus.isLive ? "bg-white" : "bg-muted-foreground"}`} />
                  {liveStatus.isLive ? "Live Broadcast" : "Broadcast Offline"}
                </span>
                {liveStatus.liveServiceType && (
                  <span className="text-[11px] font-semibold text-muted-foreground truncate">
                    • {liveStatus.liveServiceType}
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-foreground leading-snug line-clamp-2">
                {liveStatus.isLive
                  ? liveStatus.liveTitle || "Sunday Celebration & Encounter Service"
                  : "We Are Currently Offline"}
              </h2>
            </div>
          </div>

          {/* Action buttons: perfectly aligned, responsive grid on mobile, flex row on tablet/desktop */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-border/50 md:border-t-0">
            <TestimonyDialog>
              <button
                type="button"
                className="inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-lg sm:rounded-xl border border-primary/30 bg-primary/10 px-2.5 sm:px-3 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95 w-full sm:w-auto text-center"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Testify</span>
              </button>
            </TestimonyDialog>
            <Link
              href="/give"
              className="inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-lg sm:rounded-xl bg-primary px-2.5 sm:px-3.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:brightness-110 active:scale-95 w-full sm:w-auto text-center"
            >
              <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Give</span>
            </Link>
            <Link
              href="/prayer"
              className="inline-flex h-9 sm:h-9.5 items-center justify-center gap-1.5 rounded-lg sm:rounded-xl border border-border bg-secondary/80 px-2.5 sm:px-3 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-95 w-full sm:w-auto text-center"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Prayer</span>
            </Link>
          </div>
        </div>

        {/* Video Player Container */}
        {liveStatus.isLive && embedUrl ? (
          <LiveStreamPlayer
            embedUrl={embedUrl}
            rawUrl={liveStatus.liveVideoUrl}
            title={liveStatus.liveTitle}
            isYouTube={isYouTube}
          />
        ) : (
          <GlassCard surface="strong" padding="lg" className="border border-border text-center py-12 shadow-md">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-primary">
                <Tv className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Next Scheduled Worship Encounters
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our broadcast goes live during regular church gatherings. Bookmark this page or join us in person at Cable Point, Asaba.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                <div className="rounded-2xl border border-border/80 bg-card p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Calendar className="h-4 w-4" />
                    <span>Sunday Celebrations</span>
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-foreground">
                    7:00 AM WAT
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Word, vibrant praise, testimonies & prophetic blessings.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Clock className="h-4 w-4" />
                    <span>Midweek Encounter</span>
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-foreground">
                    5:00 PM WAT
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    In-depth Bible teaching, deliverance & fervent intercession.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/sermons"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Watch Past Sermons</span>
                </Link>
                <Link
                  href="/prayer/wall"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-95 w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span>Visit Prayer Wall</span>
                </Link>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Live Service Notes or Outline */}
        {liveStatus.liveNotes && (
          <GlassCard surface="solid" padding="lg" className="border border-border space-y-3 shadow-md">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <span>Service Notes & Scriptures</span>
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
              {liveStatus.liveNotes}
            </div>
          </GlassCard>
        )}
      </div>
    </PublicPageLayout>
  );
}
