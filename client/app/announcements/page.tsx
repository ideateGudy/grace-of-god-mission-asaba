import type { Metadata } from "next";
import { Pin, Sparkles, BellRing, CalendarDays } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Announcements & News | Grace of God Mission Asaba",
  description:
    "Current announcements, church notices, and important updates for Grace of God Mission Asaba congregants.",
  alternates: { canonical: "/announcements" },
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishFrom?: string | null;
  expiresAt?: string | null;
  createdAt: string;
};

export default async function AnnouncementsPage() {
  let announcements: Announcement[] = [];
  try {
    const res = await api.public.announcements();
    announcements = (res.data as unknown as Announcement[]) ?? [];
  } catch {
    /* Keep the page available during API cold starts */
  }

  const now = new Date();
  const filtered = announcements.filter((a) => {
    if (a.publishFrom && new Date(a.publishFrom) > now) return false;
    if (a.expiresAt && new Date(a.expiresAt) < now) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <PublicPageLayout
      title="Church Announcements & News"
      description="Stay informed with timely notices, ministry schedules, and church-wide updates."
      eyebrow="Congregational Notices · News"
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {filtered.length ? (
          <div className="space-y-6">
            {filtered.map((announcement) => (
              <GlassCard
                key={announcement.id}
                surface={announcement.pinned ? "strong" : "solid"}
                padding="lg"
                className={`transition-all duration-200 border shadow-md ${
                  announcement.pinned
                    ? "border-l-4 border-l-gold bg-gradient-to-r from-gold/10 via-card to-card hover:shadow-xl"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    {announcement.pinned && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                        <Pin className="h-3 w-3 rotate-45" />
                        <span>Pinned Notice</span>
                      </div>
                    )}
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {announcement.title}
                    </h2>
                  </div>

                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {new Intl.DateTimeFormat("en-NG", {
                        dateStyle: "long",
                        timeZone: "Africa/Lagos",
                      }).format(new Date(announcement.createdAt))}
                    </span>
                  </span>
                </div>

                <div className="mt-5 border-t border-border/60 pt-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {announcement.body}
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard surface="glass" padding="lg" className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BellRing className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              No Active Announcements
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              Check back frequently for updates, special announcements, and ministry notices from the
              church leadership.
            </p>
          </GlassCard>
        )}
      </div>
    </PublicPageLayout>
  );
}
