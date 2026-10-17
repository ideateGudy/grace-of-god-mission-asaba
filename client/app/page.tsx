import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  CalendarDays,
  MapPin,
  PlayCircle,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  Users,
  Flame,
  HeartHandshake,
  HandHeart,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Camera,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { getLiveSiteSettings, resolveSiteConfig } from "@/config/site";
import { HeroRenderer } from "@/components/hero/HeroRenderer";
import { SunriseBackdrop } from "@/components/motion/SunriseBackdrop";
import { MobileNav } from "@/components/layout/MobileNav";
import { QuickActionBar } from "@/components/layout/QuickActionBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { resolveHeroSlideTextTone } from "@/lib/hero-tone";
import { Section, SectionHeading } from "@/components/shared/Section";
import { GlassCard } from "@/components/shared/GlassCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { ChurchMap } from "@/components/shared/ChurchMap";

export const metadata: Metadata = {
  title: "Grace of God Mission Asaba | Sanctuary of Grace & Truth",
  description:
    "Join Grace of God Mission Asaba for vibrant Sunday and Midweek worship, Bible teaching, community fellowship, and prayer in Asaba, Delta State, Nigeria.",
};

type ContentItem = {
  id: string;
  slug: string;
  title: string;
  preacher?: string;
  series?: string | null;
  preachedAt?: string;
  startsAt?: string;
  endsAt?: string | null;
  venue?: string;
  excerpt?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  scripture?: string | null;
};

type AnnouncementItem = {
  id: string;
  title: string;
  pinned?: boolean;
  body?: string;
  description?: string | null;
  excerpt?: string | null;
};

type GalleryPreviewItem = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  album?: string | null;
};

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [heroResult, sermonResult, eventResult, announcementResult, galleryResult, liveSettings] = await Promise.all([
    safe(() => api.hero.getPublic(), { data: null }),
    safe(() => api.public.sermons("?page=1&limit=4"), {
      data: [],
      meta: { page: 1, limit: 4, total: 0 },
    }),
    safe(() => api.public.events("?scope=upcoming&page=1&limit=3"), {
      data: [],
      meta: { page: 1, limit: 3, total: 0 },
    }),
    safe(() => api.public.announcements(), { data: [] }),
    safe(() => api.public.gallery("?page=1&limit=6"), {
      data: [],
      meta: { page: 1, limit: 6, total: 0 },
    }),
    safe(() => getLiveSiteSettings(), null),
  ]);
  const siteConfig = resolveSiteConfig(liveSettings);

  const sermons = sermonResult.data as ContentItem[];
  const events = eventResult.data as ContentItem[];
  const announcements = announcementResult.data as AnnouncementItem[];
  const galleryItems = (galleryResult.data as unknown as GalleryPreviewItem[]) ?? [];
  const pinnedAnnouncement = announcements.find((a: AnnouncementItem) => a.pinned) ?? announcements[0];

  const hasRealBankDetails =
    siteConfig.accountNumber &&
    !siteConfig.accountNumber.startsWith("[") &&
    siteConfig.accountNumber !== "";

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <SunriseBackdrop />
      <SiteHeader initialHeroTextTone={resolveHeroSlideTextTone(heroResult.data?.slides?.[0])} />
      <MobileNav />

      <main id="main-content" className="flex-1">
        {/* 1. Hero Section (Admin-managed or Atmospheric Default) */}
        <HeroRenderer hero={heroResult.data} />

        {/* 2. Floating Welcome & Schedule Bar */}
        <div className="relative z-20 mx-auto -mt-10 sm:-mt-14 max-w-6xl px-5 w-full">
          <GlassCard
            surface="strong"
            padding="lg"
            className="border border-border/80 shadow-2xl backdrop-blur-xl"
          >
            <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
              {/* Service Schedule Column */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span>Weekly Gatherings in Asaba</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <div>
                      <span className="font-semibold text-foreground">Sunday Services</span>
                      <p className="text-[11px] text-muted-foreground">Regular, Celebrations & African Praise</p>
                    </div>
                    <span className="text-primary font-bold font-mono text-sm">{siteConfig.sundayServiceTime}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <div>
                      <span className="font-semibold text-foreground">Wednesday Midweek</span>
                      <p className="text-[11px] text-muted-foreground">Prayer & Word Encounter</p>
                    </div>
                    <span className="text-primary font-bold font-mono text-sm">{siteConfig.midweekServiceTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">
                    Fellowships for children, youth, women & men.
                  </p>
                </div>
              </div>

              {/* Location Column */}
              <div className="space-y-3 border-y border-border/60 py-4 lg:border-x lg:border-y-0 lg:px-6 lg:py-0">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span>Sanctuary Location</span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Grace of God Mission Asaba Hq
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {siteConfig.address}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Visitors & families warmly welcomed</span>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Link
                  href="/visit"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-[0.98]"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Plan your visit</span>
                </Link>
                <div className="flex gap-2">
                  <a
                    href={siteConfig.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Get directions</span>
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex flex-1 min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                  >
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Contact us</span>
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. Pinned Announcement Banner (Conditional) */}
        {pinnedAnnouncement && (
          <Section className="py-10 md:py-14">
            <GlassCard
              surface="glass"
              padding="lg"
              className="border-l-4 border-l-gold bg-gradient-to-r from-gold/5 via-card/50 to-card/90"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                    <Sparkles className="h-3 w-3" />
                    <span>Important Announcement</span>
                  </span>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {pinnedAnnouncement.title}
                  </h3>
                  <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
                    {pinnedAnnouncement.excerpt ?? pinnedAnnouncement.description}
                  </p>
                </div>
                <Link
                  href="/announcements"
                  className="inline-flex shrink-0 min-h-11 items-center gap-2 rounded-lg bg-card px-5 py-2 text-sm font-semibold text-primary border border-border hover:bg-accent transition"
                >
                  <span>All announcements</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </GlassCard>
          </Section>
        )}

        {/* 4. Experience Grace: Core Pillars */}
        <Section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Who We Are</span>
            </span>
            <SectionHeading className="mt-4 mb-4">
              A Christ-Centered Family in Asaba
            </SectionHeading>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Walking in the fullness of God's grace, spiritual growth, and heartfelt fellowship.
              Here is what defines our journey together in Christ.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pillar 1 */}
            <GlassCard
              surface="solid"
              padding="lg"
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gold/50"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold transition group-hover:scale-110">
                <Flame className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Spirit-Filled Worship
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Experience heartfelt praise, inspiring collective prayer, and an atmosphere
                saturated with God's peace and presence every Sunday and Wednesday.
              </p>
            </GlassCard>

            {/* Pillar 2 */}
            <GlassCard
              surface="solid"
              padding="lg"
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-110">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Biblically Grounded Truth
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Sound, practical exposition of the Word of God that anchors your faith, transforms
                character, and equips you to walk in dominion.
              </p>
            </GlassCard>

            {/* Pillar 3 */}
            <GlassCard
              surface="solid"
              padding="lg"
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-soft/50"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition group-hover:scale-110">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Loving Community
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Lifelong friendships and dedicated fellowships for children, youth, women of
                grace, and men of valor. You never walk alone.
              </p>
            </GlassCard>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <span>Discover our story, beliefs, and leadership</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>

        {/* 5. Recent Sermons Section */}
        <Section className="bg-card/70 py-16 md:py-24 border-y border-border/60">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                <span>The Living Word</span>
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
                Recent Sermons & Teachings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Listen or watch recent messages preached at the Asaba sanctuary.
              </p>
            </div>
            <Link
              href="/sermons"
              className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-primary hover:underline underline-offset-4 text-sm"
            >
              <span>Browse sermon archive</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {sermons.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sermons.slice(0, 3).map((sermon, idx) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${encodeURIComponent(sermon.slug)}`}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-semibold text-primary">
                        {sermon.series || "Sunday Message"}
                      </span>
                      {sermon.preachedAt && (
                        <span>
                          {new Intl.DateTimeFormat("en-NG", {
                            dateStyle: "medium",
                            timeZone: "Africa/Lagos",
                          }).format(new Date(sermon.preachedAt))}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground">
                      Speaker: <strong className="text-foreground">{sermon.preacher}</strong>
                      {sermon.scripture ? ` · ${sermon.scripture}` : ""}
                    </p>
                    {sermon.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {sermon.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-semibold text-primary">
                    <span className="inline-flex items-center gap-1.5">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      <span>Listen to Sermon</span>
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <GlassCard surface="glass" padding="lg" className="text-center py-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PlayCircle className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Sermon Archive Coming Soon
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Our audio and video teachings are being catalogued. Join us in person this Sunday
                to hear God's transformative message live!
              </p>
              <Link
                href="/visit"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105"
              >
                <MapPin className="h-4 w-4" />
                <span>Visit this Sunday</span>
              </Link>
            </GlassCard>
          )}
        </Section>

        {/* 6. Upcoming Events */}
        <Section className="py-16 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Church Life</span>
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
                Upcoming Gatherings
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay connected with retreats, special conferences, and fellowships.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-primary hover:underline underline-offset-4 text-sm"
            >
              <span>View full calendar</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {events.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {events.map((event) => {
                const eventDate = event.startsAt ? new Date(event.startsAt) : null;
                const monthStr = eventDate
                  ? new Intl.DateTimeFormat("en-NG", {
                      month: "short",
                      timeZone: "Africa/Lagos",
                    }).format(eventDate)
                  : "TBA";
                const dayStr = eventDate
                  ? new Intl.DateTimeFormat("en-NG", {
                      day: "numeric",
                      timeZone: "Africa/Lagos",
                    }).format(eventDate)
                  : "--";

                return (
                  <Link
                    key={event.id}
                    href={`/events/${encodeURIComponent(event.slug)}`}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gold/50"
                  >
                    <div>
                      {/* Date Badge + Title */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center rounded-xl bg-midnight px-3.5 py-2 text-white shadow-sm shrink-0">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gold">
                            {monthStr}
                          </span>
                          <span className="text-xl font-extrabold font-mono">{dayStr}</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {eventDate
                                ? new Intl.DateTimeFormat("en-NG", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    timeZone: "Africa/Lagos",
                                  }).format(eventDate)
                                : "Time to be announced"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="truncate">{event.venue || "Asaba Sanctuary"}</span>
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-semibold text-primary">
                      <span>Event Details</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <GlassCard surface="glass" padding="lg" className="text-center py-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Join Us for Regular Services
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                No special events scheduled at this moment. You are always welcome at our Sunday
                Worship ({siteConfig.sundayServiceTime}) and Wednesday Midweek ({siteConfig.midweekServiceTime}).
              </p>
              <Link
                href="/visit"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105"
              >
                <MapPin className="h-4 w-4" />
                <span>Service Information</span>
              </Link>
            </GlassCard>
          )}
        </Section>

        {/* Moments & Church Life Photo Gallery */}
        {galleryItems.length > 0 && (
          <Section className="py-16 md:py-24 border-t border-border/60">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Camera className="h-3.5 w-3.5" />
                  <span>Moments & Memories</span>
                </span>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
                  Life at Grace of God Mission
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Capturing moments of joyful worship, conferences, fellowships, and ministry impact in Asaba.
                </p>
              </div>
              <Link
                href="/gallery"
                className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-primary hover:underline underline-offset-4 text-sm"
              >
                <span>View all photos</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {galleryItems.slice(0, 6).map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm hover:shadow-md transition-all"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.caption || "Church life photo"}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">
                      {item.caption || item.album || "Grace of God Mission Asaba"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* 7. Dual Sanctuary: Prayer & Kingdom Giving */}
        <Section className="py-16 md:py-24 bg-card/60 border-t border-border/60">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Prayer Request Card */}
            <GlassCard
              surface="strong"
              padding="lg"
              className="relative overflow-hidden border border-border shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HeartHandshake className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  How Can We Pray for You?
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  No burden is meant to be carried alone. Our pastoral team and intercessory warriors
                  pray over every submitted request with love and in strict confidence.
                </p>
                <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Your requests remain 100% private and confidential</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Dedicated intercessory team praying every week</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border/60">
                <Link
                  href="/prayer"
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-[0.98] transition"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Send a prayer request</span>
                </Link>
              </div>
            </GlassCard>

            {/* Kingdom Giving Card */}
            <GlassCard
              surface="strong"
              padding="lg"
              className="relative overflow-hidden border border-border shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <HandHeart className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Worship Through Giving
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Your faithful tithes, freewill offerings, and seeds sustain the ministry, support
                  community outreach, and advance God's Kingdom in Asaba and beyond.
                </p>

                {/* Quick Bank Details Preview */}
                <div className="mt-5 rounded-xl border border-border/80 bg-background/80 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-semibold text-foreground">
                      {siteConfig.bankName.startsWith("[")
                        ? "Confirm with Church"
                        : siteConfig.bankName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-semibold text-foreground">
                      {siteConfig.accountName.startsWith("[")
                        ? "Grace of God Mission Asaba"
                        : siteConfig.accountName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary">
                        {hasRealBankDetails ? siteConfig.accountNumber : "Available upon request"}
                      </span>
                      {hasRealBankDetails && (
                        <CopyButton text={siteConfig.accountNumber} label="Account number" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/give"
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-midnight shadow-sm hover:brightness-105 active:scale-[0.98] transition"
                >
                  <HandHeart className="h-4 w-4" />
                  <span>Giving & bank details</span>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Online giving is coming soon
                </span>
              </div>
            </GlassCard>
          </div>
        </Section>

        {/* 8. Sanctuary Location & Interactive Map Section */}
        <Section id="map" className="py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                <span>Visit Us in Person</span>
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground">
                Sanctuary Location & Map
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {siteConfig.address}
              </p>
            </div>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in Google Maps App</span>
            </a>
          </div>

          <ChurchMap showCardHeader />
        </Section>
      </main>

      <SiteFooter />
      <QuickActionBar />
    </div>
  );
}
