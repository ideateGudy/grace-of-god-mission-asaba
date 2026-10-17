import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
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

function formatEmbedUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // YouTube watch link to embed
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }

  // Facebook video embed
  if (trimmed.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false`;
  }

  return trimmed;
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

  const embedUrl = formatEmbedUrl(liveStatus.liveVideoUrl);

  return (
    <PublicPageLayout
      title="Worship With Us Live"
      description="Connect to our live sanctuary broadcast from Asaba, Delta State, and experience transforming grace and apostolic power."
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Live Status Header / Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-border bg-card/60 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                liveStatus.isLive
                  ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/20 animate-pulse"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    liveStatus.isLive
                      ? "bg-red-500 text-white shadow-xs animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${liveStatus.isLive ? "bg-white" : "bg-muted-foreground"}`} />
                  {liveStatus.isLive ? "Live Broadcast" : "Broadcast Offline"}
                </span>
                {liveStatus.liveServiceType && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    • {liveStatus.liveServiceType}
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                {liveStatus.isLive
                  ? liveStatus.liveTitle || "Sunday Celebration & Encounter Service"
                  : "We Are Currently Offline"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Link
              href="/give"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Online Giving</span>
            </Link>
            <Link
              href="/prayer"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Prayer Request</span>
            </Link>
          </div>
        </div>

        {/* Video Player Container */}
        {liveStatus.isLive && embedUrl ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-black shadow-2xl">
            <div className="relative aspect-video w-full">
              <iframe
                src={embedUrl}
                title="Grace of God Mission Asaba Live Stream"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
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
