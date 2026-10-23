import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { DevotionDto } from "@ggm/types";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Heart,
  ArrowLeft,
  Flame,
  BookmarkCheck,
} from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await api.devotions.get(id);
    const d = res?.data;
    if (!d) return { title: "Devotion | Grace of God Mission Asaba" };
    return {
      title: `${d.title} | Daily Devotion | Grace of God Mission Asaba`,
      description: d.content.slice(0, 160),
      alternates: { canonical: `/devotion/${id}` },
    };
  } catch {
    return { title: "Devotion | Grace of God Mission Asaba" };
  }
}

export default async function DevotionDetailPage({ params }: Props) {
  const { id } = await params;

  let devotion: DevotionDto | null = null;
  try {
    const res = await api.devotions.get(id);
    devotion = res?.data ?? null;
  } catch {}

  if (!devotion) notFound();

  const formattedDate = new Date(`${devotion.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PublicPageLayout
      title={devotion.title}
      description={`${devotion.series || "Daily Grace"} · ${formattedDate}`}
      eyebrow="Daily Devotion · Psalm 119:105"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back link */}
        <Link
          href="/devotion"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Devotions
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
              <Flame className="h-3.5 w-3.5" />
              <span>{devotion.series || "DAILY GRACE"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Main Devotion Card */}
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-6">
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {devotion.title}
            </h1>

            {devotion.textRef && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3.5 py-1.5 text-xs font-bold text-primary tracking-wide">
                <BookOpen className="h-4 w-4 text-gold" />
                <span>TEXT: {devotion.textRef}</span>
              </div>
            )}
          </div>

          {/* Verse of the Day */}
          <div className="rounded-2xl border-l-4 border-l-gold border-y border-r border-border/80 bg-gradient-to-r from-gold/10 via-card to-card p-5 sm:p-6 shadow-inner space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>VERSE OF THE DAY</span>
            </div>
            <p className="font-serif text-base sm:text-lg italic text-foreground leading-relaxed">
              &ldquo;{devotion.scriptureText}&rdquo;
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-primary text-right">
              — {devotion.scriptureRef}
            </p>
          </div>

          {/* Devotional Reflection */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
            {devotion.content}
          </div>

          {/* Prayer */}
          {devotion.prayer && (
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-4 w-4 text-gold" />
                <span>PRAYER</span>
              </div>
              <p className="text-sm sm:text-base font-medium italic text-foreground/95 leading-relaxed">
                &ldquo;{devotion.prayer}&rdquo;
              </p>
            </div>
          )}

          {/* Bible in 365 Days */}
          {devotion.bibleIn365Days && (
            <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>BIBLE IN 365 DAYS</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {devotion.bibleIn365Days
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((reading, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs"
                    >
                      <BookmarkCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{reading}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Point */}
          {devotion.actionPoint && (
            <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold">
                <Flame className="h-4 w-4" />
                <span>ACTION POINT</span>
              </div>
              <p className="font-display text-sm sm:text-base font-bold text-foreground tracking-wide uppercase">
                {devotion.actionPoint}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <Link
              href="/prayer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <Heart className="h-4 w-4" />
              <span>Need personal prayer today? Submit a request →</span>
            </Link>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/devotion">← All Devotions</Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
