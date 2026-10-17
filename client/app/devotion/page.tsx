import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { DevotionDto } from "@ggm/types";
import {
  BookOpen,
  Calendar,
  Sparkles,
  Share2,
  Heart,
  ChevronRight,
  Flame,
} from "lucide-react";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Daily Devotion | Grace of God Mission Asaba",
  description:
    "Daily spiritual nourishment from the Word of God. Receive inspiration, biblical guidance, and prayers from Grace of God Mission Asaba.",
  alternates: { canonical: "/devotion" },
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
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
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
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold border border-gold/30">
                <Flame className="h-3.5 w-3.5" />
                <span>Today's Word of Grace</span>
              </div>
            </div>

            {/* Main Devotion Card */}
            <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-6">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {todayDevotion.title}
                </h2>
                <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <BookOpen className="h-4 w-4" />
                  <span>{todayDevotion.scriptureRef}</span>
                </div>
              </div>

              {/* Scripture Anchor Box */}
              <div className="rounded-2xl border-l-4 border-l-primary border-y border-r border-border bg-card/80 p-5 shadow-inner">
                <p className="font-serif text-base sm:text-lg italic text-foreground leading-relaxed">
                  "{todayDevotion.scriptureText}"
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary text-right">
                  — {todayDevotion.scriptureRef}
                </p>
              </div>

              {/* Devotional Message */}
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                {todayDevotion.content}
              </div>

              {/* Closing Prayer Box */}
              {todayDevotion.prayer && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span>Prayer for Today</span>
                  </div>
                  <p className="text-sm font-medium italic text-foreground/90 leading-relaxed">
                    "{todayDevotion.prayer}"
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
                <Link
                  href="/prayer/wall"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <span>Visit Community Prayer Wall</span>
                </Link>
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
                  <GlassCard
                    key={d.id}
                    surface="solid"
                    padding="md"
                    className="border border-border hover:border-primary/40 transition flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {dateLabel} · <strong className="text-primary">{d.scriptureRef}</strong>
                      </span>
                      <h4 className="font-display text-base font-bold text-foreground">
                        {d.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {d.content}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 text-right">
                      <span className="text-xs font-semibold text-primary inline-flex items-center">
                        Read reflection <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
