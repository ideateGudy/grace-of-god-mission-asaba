import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Users,
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { ChurchMap } from "@/components/shared/ChurchMap";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Plan Your Visit | Grace of God Mission Asaba",
  description:
    "Service times, directions, parking, and what to expect when visiting Grace of God Mission Asaba, Delta State, Nigeria.",
  alternates: { canonical: "/visit" },
};

export default function PlanaVisitPage() {
  const phoneAvailable = !siteConfig.phone.startsWith("[") && Boolean(siteConfig.phone);
  const whatsappAvailable =
    !siteConfig.whatsapp.startsWith("[") && Boolean(siteConfig.whatsapp);
  const mapAvailable =
    !siteConfig.googleMapsUrl.startsWith("[") && Boolean(siteConfig.googleMapsUrl);

  return (
    <PublicPageLayout
      title="Plan Your Visit"
      description="You have a warm home with us. Find our weekly service hours, location in Asaba, and what to expect."
      eyebrow="Join Us This Week · Services & Location"
    >
      <div className="space-y-12">
        {/* 1. Schedule & Location 2-Column Showcase */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Service Schedule */}
          <GlassCard
            surface="strong"
            padding="lg"
            className="border border-border shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Weekly Worship Schedule
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Join our life-giving services designed to ignite faith and deepen your walk with
                God.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-border/80 bg-card p-4 transition hover:border-gold/50">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-foreground">
                      Sunday Services
                    </span>
                    <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-bold text-gold">
                      Starts at {siteConfig.sundayServiceTime}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Regular services, special monthly celebrations, and African Praise Sundays.
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-bold text-foreground">
                      Wednesday Midweek Service
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {siteConfig.midweekServiceTime}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Regular prayer and word encounters for spiritual strength and breakthrough.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Children's Church</span> runs
              concurrently with all Sunday services.
            </div>
          </GlassCard>

          {/* Sanctuary Location & Directions */}
          <GlassCard
            surface="strong"
            padding="lg"
            className="border border-border shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Sanctuary Location
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Located in Asaba, Delta State, with easy accessibility and a welcoming atmosphere.
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-base font-semibold text-foreground">
                  Grace of God Mission Asaba Hq
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {siteConfig.address}
                </p>
                <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Free on-site parking available for cars and buses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Dedicated ushers ready to assist first-time guests</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <MapPin className="h-4 w-4" />
                <span>Get directions on Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </GlassCard>
        </div>

        {/* Interactive Google Map of Grace of God Mission Asaba Hq */}
        <ChurchMap showCardHeader />

        {/* 2. What to Expect as a Guest */}
        <GlassCard surface="solid" padding="lg" className="border border-border shadow-lg">
          <div className="mb-8 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4 text-gold" />
              <span>First Time Visiting?</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">What to Expect</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Visiting a church for the first time should be warm and stress-free. Here is what you
              will find when you walk through our doors.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold font-bold">
                1
              </div>
              <h3 className="font-display text-base font-bold text-foreground">Warm Welcome</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our welcoming ushers will greet you with a smile, answer questions, and help you
                find comfortable seats.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary font-bold">
                2
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Uplifting Praise
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Spirit-filled praise and worship led by our choir, creating an atmosphere to honor
                God freely.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary font-bold">
                3
              </div>
              <h3 className="font-display text-base font-bold text-foreground">Inspiring Word</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Practical, Bible-grounded teaching designed to strengthen your faith and daily walk.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 font-bold">
                4
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Children's Care
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Safe, age-appropriate Sunday classes where children learn Bible stories in a fun
                environment.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 3. Have Questions? Connect With Us */}
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Questions Before Coming?
              </h2>
              <p className="text-sm text-muted-foreground max-w-xl">
                Our welcome team is glad to answer any questions about service times, directions, or
                family accommodations.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              {phoneAvailable && (
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted transition"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Call Church</span>
                </a>
              )}

              {whatsappAvailable && (
                <a
                  href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted transition"
                >
                  <FaWhatsapp className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              )}

              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Send message</span>
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
