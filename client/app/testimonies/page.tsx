import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { TestimonyDialog } from "@/components/testimonies/TestimonyDialog";
import { ServerWakingFallback } from "@/components/shared/ServerWakingFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api/client";
import type { PublicTestimonyDto } from "@ggm/types";
import { Sparkles, Quote, MessageCircleHeart } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Testimonies of Grace | Grace of God Mission Asaba",
  description:
    "Read inspiring praise reports, supernatural healings, divine provisions, and testimonies of God's power at Grace of God Mission Asaba.",
  alternates: { canonical: "/testimonies" },
};

export default async function TestimoniesPage() {
  let testimonies: PublicTestimonyDto[] = [];
  let isWakingUp = false;

  try {
    const res = await api.testimonies.list("?limit=30");
    if (res?.data) {
      testimonies = res.data;
    }
  } catch (err: any) {
    if (err?.status === 503 || err?.message?.includes("waking up") || err?.code === "ECONNREFUSED") {
      isWakingUp = true;
    }
  }

  const featured = testimonies.filter((t) => t.featured);
  const regular = testimonies.filter((t) => !t.featured);

  return (
    <PublicPageLayout
      title="Stories of God's Faithfulness"
      description="Celebrate the mighty acts of God in our midst. Discover how lives, families, and health are being renewed through His unfailing grace."
      eyebrow="Praise Reports · Revelation 12:11"
    >
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Banner with Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-6 md:p-8 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Overcoming by the Word of Testimony</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Has God Done Something Wonderful For You?
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Don't keep the praise to yourself. Share your testimony to encourage the brethren and give all glory to Jesus Christ.
            </p>
          </div>
          <div className="shrink-0">
            <TestimonyDialog />
          </div>
        </div>

        {/* Featured Testimonies Section */}
        {featured.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>Featured Praise Reports</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featured.map((t) => {
                const dateStr = new Date(t.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <GlassCard
                    key={t.id}
                    surface="strong"
                    padding="lg"
                    className="relative overflow-hidden border-2 border-primary/20 shadow-md flex flex-col justify-between"
                  >
                    <Quote className="absolute top-4 right-4 h-16 w-16 text-primary/10 -rotate-12 pointer-events-none" />
                    <div className="space-y-3 relative z-10">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <Sparkles className="h-3 w-3 text-gold" />
                        <span>Featured Miracle</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {t.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t.content}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{t.displayName}</span>
                      <span className="text-muted-foreground">{dateStr}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* All Testimonies Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MessageCircleHeart className="h-4 w-4" />
            <span>Community Praise Reports</span>
          </div>

          {testimonies.length === 0 ? (
            isWakingUp ? (
              <ServerWakingFallback
                title="Loading Praise Reports & Testimonies..."
                description="Our sanctuary server is waking up to retrieve congregation praise reports. Please hold on a moment as it loads."
                resourceName="testimonies"
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <GlassCard key={i} surface="glass" padding="md" className="space-y-3">
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                      <Skeleton className="h-16 w-full rounded-md" />
                      <Skeleton className="h-4 w-1/3 rounded-md" />
                    </GlassCard>
                  ))}
                </div>
              </ServerWakingFallback>
            ) : (
              <GlassCard surface="solid" padding="lg" className="text-center py-16 border border-dashed border-border shadow-xs">
                <Sparkles className="mx-auto h-12 w-12 text-primary/50 mb-3" />
                <h3 className="font-display text-xl font-bold text-foreground">
                  Be the First to Testify
                </h3>
                <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  No public testimonies are currently displayed. Click below to share your praise report with our congregation.
                </p>
                <div className="mt-6">
                  <TestimonyDialog />
                </div>
              </GlassCard>
            )
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(featured.length > 0 ? regular : testimonies).map((t) => {
                const dateStr = new Date(t.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={t.id}
                    className="flex flex-col justify-between rounded-3xl border border-border bg-card/70 p-6 shadow-xs backdrop-blur-md transition hover:shadow-md hover:border-primary/40"
                  >
                    <div className="space-y-2.5">
                      <h4 className="font-display text-base font-bold text-foreground line-clamp-2">
                        {t.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                        {t.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">{t.displayName}</span>
                      <span className="text-muted-foreground text-[11px]">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicPageLayout>
  );
}
