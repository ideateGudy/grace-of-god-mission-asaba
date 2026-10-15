import type { Metadata } from "next";
import { Pin } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Announcements",
  description: "Current notices, updates, and news from Grace of God Mission Asaba.",
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
      title="Announcements"
      description="Important notices and updates shared with the church family."
    >
      {filtered.length ? (
        <div className="space-y-6">
          {filtered.map((announcement) => (
            <GlassCard
              key={announcement.id}
              surface={announcement.pinned ? "strong" : "solid"}
              padding="lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {announcement.pinned && (
                    <Pin className="size-5 text-gold rotate-45" aria-label="Pinned notice" />
                  )}
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {announcement.title}
                  </h2>
                </div>
                {announcement.pinned && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    Pinned
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("en-NG", {
                  dateStyle: "long",
                  timeZone: "Africa/Lagos",
                }).format(new Date(announcement.createdAt))}
              </p>
              <div className="mt-5 whitespace-pre-wrap leading-relaxed text-foreground/90">
                {announcement.body}
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          There are no active announcements at this time.
        </p>
      )}
    </PublicPageLayout>
  );
}
