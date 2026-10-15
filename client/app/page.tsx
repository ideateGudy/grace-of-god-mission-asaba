import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin, PlayCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import { HeroRenderer } from "@/components/hero/HeroRenderer";
import { SunriseBackdrop } from "@/components/motion/SunriseBackdrop";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuickActionBar } from "@/components/layout/QuickActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Section, SectionHeading } from "@/components/shared/Section";
import { GlassCard } from "@/components/shared/GlassCard";
import { WordReveal } from "@/components/motion/WordReveal";

export const metadata: Metadata = { title: "Grace of God Mission Asaba", description: "Service information, sermons, events, and ways to connect with Grace of God Mission Asaba." };

type ContentItem = { id: string; slug: string; title: string; preacher?: string; series?: string | null; preachedAt?: string; startsAt?: string; excerpt?: string | null; description?: string | null };

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try { return await load(); } catch { return fallback; }
}

export default async function HomePage() {
  const [heroResult, sermonResult, eventResult, announcementResult] = await Promise.all([
    safe(() => api.hero.getPublic(), { data: null }),
    safe(() => api.public.sermons("?page=1&limit=4"), { data: [], meta: { page: 1, limit: 4, total: 0 } }),
    safe(() => api.public.events("?scope=upcoming&page=1&limit=3"), { data: [], meta: { page: 1, limit: 3, total: 0 } }),
    safe(() => api.public.announcements(), { data: [] }),
  ]);
  const sermons = sermonResult.data as ContentItem[];
  const events = eventResult.data as ContentItem[];
  const announcements = announcementResult.data as ContentItem[];
  const pinnedAnnouncement = announcements[0];

  return <div className="relative flex min-h-screen flex-col">
    <SunriseBackdrop />
    <SiteHeader /><MobileNav />
    <main id="main-content" className="flex-1">
      <HeroRenderer hero={heroResult.data} />
      <Section className="bg-card/95">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div><SectionHeading>Join us in Asaba</SectionHeading><p className="max-w-2xl text-muted-foreground">Service schedule: <strong className="text-foreground">{siteConfig.serviceTimes}</strong><br />Location: <strong className="text-foreground">{siteConfig.churchAddress}</strong></p></div>
          <div className="flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground" href="/visit"><MapPin size={18} aria-hidden="true" />Plan your visit</Link><Link className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 font-semibold" href="/contact">Contact the church</Link></div>
        </div>
      </Section>
      {pinnedAnnouncement && <Section><GlassCard surface="strong" padding="md"><p className="text-sm font-medium text-muted-foreground">Church announcement</p><h2 className="mt-2 font-display text-2xl">{pinnedAnnouncement.title}</h2><p className="mt-2 text-muted-foreground">{pinnedAnnouncement.excerpt ?? pinnedAnnouncement.description}</p><Link className="mt-4 inline-block min-h-11 py-2 font-semibold text-primary underline-offset-4 hover:underline" href="/announcements">All announcements</Link></GlassCard></Section>}
      <Section className="bg-card/95"><div className="mx-auto max-w-4xl text-center"><SectionHeading>Our vision</SectionHeading>{siteConfig.vision.startsWith("[") ? <p className="mx-auto max-w-2xl text-muted-foreground">{siteConfig.vision}</p> : <WordReveal text={siteConfig.vision} />}<Link href="/about" className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary">Learn about the church</Link></div></Section>
      <Section className="bg-card/90">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><SectionHeading>Recent sermons</SectionHeading><p className="text-muted-foreground">Listen to recent teaching.</p></div><Link className="min-h-11 py-2 font-semibold text-primary underline-offset-4 hover:underline" href="/sermons">Browse sermons</Link></div>
        {sermons.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{sermons.map((sermon) => <Link key={sermon.id} href={`/sermons/${encodeURIComponent(sermon.slug)}`} className="group flex min-h-24 items-center gap-4 border-b border-border py-5"><PlayCircle size={28} aria-hidden="true" className="shrink-0 text-primary" /><span><strong className="block text-lg group-hover:text-primary">{sermon.title}</strong><span className="text-sm text-muted-foreground">{sermon.preacher}{sermon.series ? ` · ${sermon.series}` : ""}{sermon.preachedAt ? ` · ${new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" }).format(new Date(sermon.preachedAt))}` : ""}</span></span></Link>)}</div> : <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-muted-foreground">Sermons will appear here when the church adds them.</p>}
      </Section>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]"><div><SectionHeading>Upcoming events</SectionHeading>{events.length ? <ul className="mt-6 divide-y divide-border">{events.map((event) => <li key={event.id} className="py-5"><Link href={`/events/${encodeURIComponent(event.slug)}`} className="group flex items-start gap-4"><CalendarDays className="mt-1 shrink-0 text-primary" aria-hidden="true" /><span><strong className="text-lg group-hover:text-primary">{event.title}</strong><span className="block text-sm text-muted-foreground">{event.startsAt ? new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(event.startsAt)) : "Date to be announced"}</span></span></Link></li>)}</ul> : <p className="mt-4 text-muted-foreground">Upcoming events will be listed here.</p>}<Link href="/events" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">View all events</Link></div>
          <GlassCard surface="solid" padding="lg"><h2 className="font-display text-3xl">Connect with us</h2><p className="mt-3 text-muted-foreground">Find service information, send a prayer request, or get in touch with the church.</p><div className="mt-6 flex flex-col items-start gap-2"><Link href="/visit" className="min-h-11 py-2 font-semibold text-primary">Visit information</Link><Link href="/prayer" className="min-h-11 py-2 font-semibold text-primary">Send a prayer request</Link><Link href="/give" className="min-h-11 py-2 font-semibold text-primary">Giving information</Link></div></GlassCard>
        </div>
      </Section>
    </main><SiteFooter /><QuickActionBar />
  </div>;
}
