import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming gatherings, conferences, and services at Grace of God Mission Asaba.",
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
  const { scope = "upcoming" } = await searchParams;
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
      title="Events & Gatherings"
      description="Gatherings, conferences, and special services from Grace of God Mission Asaba."
    >
      <nav
        className="mb-8 flex gap-3"
        aria-label="Event timeframe navigation"
      >
        <Link
          aria-current={scope !== "past" ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-md px-5 font-medium transition focus-visible:outline-2 focus-visible:outline-ring ${
            scope !== "past"
              ? "bg-primary text-primary-foreground font-semibold"
              : "border border-border bg-card text-foreground hover:bg-muted"
          }`}
          href="/events"
        >
          Upcoming
        </Link>
        <Link
          aria-current={scope === "past" ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-md px-5 font-medium transition focus-visible:outline-2 focus-visible:outline-ring ${
            scope === "past"
              ? "bg-primary text-primary-foreground font-semibold"
              : "border border-border bg-card text-foreground hover:bg-muted"
          }`}
          href="/events?scope=past"
        >
          Past events
        </Link>
      </nav>

      {events.length ? (
        <ul className="divide-y divide-border" role="list">
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
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Africa/Lagos",
            }).format(startDate);

            return (
              <li key={event.id} className="py-6">
                <Link
                  href={`/events/${encodeURIComponent(event.slug)}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl p-2 transition focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <div
                    aria-hidden="true"
                    className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary text-foreground text-center"
                  >
                    <span className="text-xs font-semibold uppercase leading-none text-muted-foreground">
                      {month}
                    </span>
                    <span className="text-xl font-bold leading-tight">
                      {dayOfMonth}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.title}
                    </strong>
                    <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                      {timeString}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" />
                      {event.venue}
                    </span>
                    {event.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No {scope === "past" ? "past events" : "upcoming events"} are listed yet.
        </p>
      )}
    </PublicPageLayout>
  );
}
