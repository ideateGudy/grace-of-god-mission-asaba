import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { DevotionDto } from "@ggm/types";
import { DevotionActions } from "@/components/devotion/DevotionActions";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Heart,
  ChevronRight,
  Flame,
  BookmarkCheck,
  Tv,
} from "lucide-react";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Daily Devotion | Grace of God Mission Asaba",
  description:
    "Daily spiritual nourishment from the Word of God. Receive inspiration, biblical guidance, and prayers from Grace of God Mission Asaba.",
  alternates: { canonical: "/devotion" },
  openGraph: {
    title: "Daily Devotion & Word | Grace of God Mission Asaba",
    description:
      "Daily spiritual nourishment from the Word of God. Receive inspiration, biblical guidance, and prayers from Grace of God Mission Asaba.",
    url: "/devotion",
    images: [
      {
        url: "/devotion/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Daily Devotion & Word",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Devotion & Word | Grace of God Mission Asaba",
    description:
      "Daily spiritual nourishment from the Word of God. Receive inspiration, biblical guidance, and prayers from Grace of God Mission Asaba.",
    images: ["/devotion/opengraph-image"],
  },
};

export default async function DevotionPage() {
  let todayDevotion: DevotionDto | null = null;
  let archive: DevotionDto[] = [];

  try {
    const [todayRes, listRes] = await Promise.all([
      api.devotions.getToday(),
      api.devotions.list("?limit=6"),
    ]);

    todayDevotion = todayRes?.data ?? null;
    archive = (listRes?.data ?? []).filter((d) => d.id !== todayDevotion?.id);
  } catch {}

  const formattedDate = todayDevotion
    ? new Date(`${todayDevotion.date}T00:00:00Z`).toLocaleDateString("en-GB", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <PublicPageLayout
      title="Daily Devotion & Word"
      description="Start each day anchored in the truth of God's Word. Receive daily spiritual insight, grace, and prayer for victorious living."
      eyebrow="Spiritual Food · Psalm 119:105"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        {todayDevotion ? (
          <div className="space-y-6">
            {/* Header info & Interactive Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
                  <Flame className="h-3.5 w-3.5" />
                  <span>{todayDevotion.series || "DAILY GRACE"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              <DevotionActions devotion={todayDevotion} formattedDate={formattedDate} />
            </div>

            {/* Main Devotion Card */}
            <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-6">
              <div className="space-y-3">
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  {todayDevotion.title}
                </h2>

                {/* TEXT: Scripture Reading Pill */}
                {todayDevotion.textRef && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 px-3.5 py-1.5 text-xs font-bold text-primary tracking-wide">
                    <BookOpen className="h-4 w-4 text-gold" />
                    <span>TEXT: {todayDevotion.textRef}</span>
                  </div>
                )}
              </div>

              {/* VERSE OF THE DAY Box */}
              <div className="rounded-2xl border-l-4 border-l-gold border-y border-r border-border/80 bg-gradient-to-r from-gold/10 via-card to-card p-5 sm:p-6 shadow-inner space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>VERSE OF THE DAY</span>
                </div>
                <p className="font-serif text-base sm:text-lg italic text-foreground leading-relaxed">
                  "{todayDevotion.scriptureText}"
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-primary text-right">
                  — {todayDevotion.scriptureRef}
                </p>
              </div>

              {/* Devotional Message Reflection */}
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
                {todayDevotion.content}
              </div>

              {/* Closing PRAYER Box */}
              {todayDevotion.prayer && (
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-card p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span>PRAYER</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium italic text-foreground/95 leading-relaxed">
                    "{todayDevotion.prayer}"
                  </p>
                </div>
              )}

              {/* BIBLE IN 365 DAYS Section (Optional) */}
              {todayDevotion.bibleIn365Days && (
                <div className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>BIBLE IN 365 DAYS</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {todayDevotion.bibleIn365Days
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

              {/* ACTION POINT Banner (Optional) */}
              {todayDevotion.actionPoint && (
                <div className="rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-5 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold">
                    <Flame className="h-4 w-4" />
                    <span>ACTION POINT</span>
                  </div>
                  <p className="font-display text-sm sm:text-base font-bold text-foreground tracking-wide uppercase">
                    {todayDevotion.actionPoint}
                  </p>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
                <Link
                  href="/prayer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  <Heart className="h-4 w-4" />
                  <span>Need personal prayer today? Submit a request →</span>
                </Link>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/devotion/present"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
                  >
                    <Tv className="h-3.5 w-3.5 text-primary" />
                    <span>Projector Screen View</span>
                  </Link>
                  <Link
                    href="/prayer/wall"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    <span>Community Prayer Wall</span>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <GlassCard surface="strong" padding="lg" className="text-center py-16 border border-dashed border-border shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-primary/60 mb-3" />
            <h3 className="font-display text-2xl font-bold text-foreground">
              Daily Devotion Coming Soon
            </h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Today's devotional guide is being prepared by our pastoral team. Check back shortly or explore our latest sermons.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="rounded-xl">
                <Link href="/sermons">Watch Latest Sermons</Link>
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Previous Devotions Archive */}
        {archive.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Recent Devotions</span>
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {archive.map((d) => {
                const dateLabel = new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <Link
                    key={d.id}
                    href={`/devotion/${d.id}`}
                    className="group block focus:outline-none"
                  >
                    <GlassCard
                      surface="solid"
                      padding="md"
                      className="border border-border group-hover:border-primary/40 group-focus-visible:border-primary/60 transition-colors h-full flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {dateLabel} · <strong className="text-primary">{d.scriptureRef}</strong>
                        </span>
                        <h4 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {d.title}
                        </h4>
                        {d.textRef && (
                          <p className="text-[11px] font-bold text-gold">TEXT: {d.textRef}</p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {d.content}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/40 text-right">
                        <span className="text-xs font-semibold text-primary inline-flex items-center group-hover:underline underline-offset-2">
                          Read reflection <ChevronRight className="h-3 w-3 ml-0.5" />
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
