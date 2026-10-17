import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";

export const revalidate = 60;

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  address: string | null;
  mapUrl: string | null;
  description: string | null;
};

async function getEvent(slug: string) {
  try {
    const res = await api.public.event(slug);
    return res.data as unknown as EventRecord;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  return event
    ? {
        title: event.title,
        description: event.description ?? `${event.venue} · ${event.startsAt}`,
        alternates: { canonical: `/events/${event.slug}` },
        openGraph: {
          title: event.title,
          description: event.description ?? event.venue,
          type: "article",
          images: [
            {
              url: `/api/og?title=${encodeURIComponent(event.title)}&category=CHURCH+EVENT&subtitle=${encodeURIComponent(event.description?.slice(0, 150) ?? event.venue ?? "")}&eyebrow=SANCTUARY+EVENT&badge=${encodeURIComponent(event.venue ?? "Asaba, Delta State")}&accent=%23F59E0B`,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ],
        },
      }
    : { title: "Event not found" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const startDate = new Date(event.startsAt);
  const formattedStart = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(startDate);

  return (
    <PublicPageLayout title={event.title} description={formattedStart}>
      <article className="max-w-3xl">
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/events/${encodeURIComponent(event.slug)}/calendar`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <CalendarDays size={18} aria-hidden="true" />
            Add to calendar (.ics)
          </a>
          {event.mapUrl && (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-5 font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            >
              <MapPin size={18} aria-hidden="true" />
              Open map
            </a>
          )}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Venue & Location
          </h2>
          <p className="mt-2 text-lg font-medium text-foreground">
            {event.venue}
          </p>
          {event.address && (
            <p className="mt-1 text-muted-foreground">{event.address}</p>
          )}
        </div>

        {event.description && (
          <div className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {event.description}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring rounded-md"
          >
            ← Back to all events
          </Link>
        </div>
      </article>
    </PublicPageLayout>
  );
}
