import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { getLiveSiteSettings, resolveSiteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events & Gatherings | Grace of God Mission Asaba",
  description:
    "Upcoming services, special conferences, retreats, and fellowships at Grace of God Mission Asaba, Delta State.",
  alternates: { canonical: "/events" },
};

type EventItem = {
  id: string;
  slug: string;
  title: string;
  venue: string;
  startsAt: string;
  endsAt?: string | null;
  description?: string | null;
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: "upcoming" | "past" }>;
}) {
  const [{ scope = "upcoming" }, liveSettings] = await Promise.all([
    searchParams,
    getLiveSiteSettings(),
  ]);
  const siteConfig = resolveSiteConfig(liveSettings);
  let events: EventItem[] = [];
  try {
    const res = await api.public.events(
      `?scope=${scope === "past" ? "past" : "upcoming"}&page=1&limit=50`
    );
    events = (res.data as unknown as EventItem[]) ?? [];
  } catch {
    /* Keep the route available during API cold starts */
  }

  return (
    <PublicPageLayout
      title="Events & Special Gatherings"
      description="Gathering together in unity, fellowship, and celebration. Explore upcoming conferences, retreats, and ministry life."
      eyebrow="Church Calendar · Gatherings"
    >
      <div className="space-y-10">
        {/* Timeframe Navigation Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl border border-border bg-card/60 backdrop-blur-md max-w-fit">
          <Link
            aria-current={scope !== "past" ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-xl px-5 text-sm font-semibold transition ${
              scope !== "past"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            href="/events"
          >
            Upcoming Events
          </Link>
          <Link
            aria-current={scope === "past" ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-xl px-5 text-sm font-semibold transition ${
              scope === "past"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            href="/events?scope=past"
          >
            Past Events Archive
          </Link>
        </div>

        {/* Events Grid */}
        {events.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const startDate = new Date(event.startsAt);
              const dayOfMonth = new Intl.DateTimeFormat("en-NG", {
                day: "numeric",
                timeZone: "Africa/Lagos",
              }).format(startDate);
              const month = new Intl.DateTimeFormat("en-NG", {
                month: "short",
                timeZone: "Africa/Lagos",
              }).format(startDate);
              const timeString = new Intl.DateTimeFormat("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Lagos",
              }).format(startDate);

              return (
                <Link
                  key={event.id}
                  href={`/events/${encodeURIComponent(event.slug)}`}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gold/50"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Stylized Date Badge */}
                      <div className="flex flex-col items-center justify-center rounded-xl bg-midnight px-3.5 py-2 text-white shadow-sm shrink-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                          {month}
                        </span>
                        <span className="text-xl font-extrabold font-mono">{dayOfMonth}</span>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{timeString}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span className="truncate">{event.venue || "Asaba Sanctuary"}</span>
                    </p>

                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-semibold text-primary">
                    <span>View Event Details</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard surface="glass" padding="lg" className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              No {scope === "past" ? "Past Events Recorded" : "Special Events Scheduled Right Now"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              {scope === "past"
                ? "Past events will be archived here as they conclude."
                : `Join us for our weekly gatherings: Sunday Services (${siteConfig.sundayServiceTime}) and Wednesday Midweek Encounter (${siteConfig.midweekServiceTime}).`}
            </p>
            {scope !== "past" && (
              <div className="mt-6">
                <Link
                  href="/visit"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:brightness-105"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>View Weekly Service Times</span>
                </Link>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </PublicPageLayout>
  );
}
