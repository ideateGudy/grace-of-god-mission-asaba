import Link from "next/link";
import { MapPin, PlayCircle, Sparkles, ExternalLink } from "lucide-react";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { siteConfig } from "@/config/site";

export function DefaultHero() {
  return (
    <section className="relative isolate flex min-h-[min(820px,94svh)] flex-col items-center justify-center overflow-hidden bg-midnight text-white px-5 pt-28 pb-16 md:px-8">
      {/* Sacred ambient light & radiant sunrise backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(217,164,65,0.22),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(46,49,146,0.35),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[#0B0D22] via-[#141633] to-[#141633]"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">

        {/* Welcome Pill */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Welcome to Grace of God Mission · Asaba Division</span>
        </div>

        {/* Single Orchestrated Title Moment */}
        <HeroSequence
          as="h1"
          title="A Sanctuary of Grace, Truth, and Loving Community"
          className="font-display text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-white"
        />

        {/* Welcoming Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed text-slate-200/90">
          Connecting lives to the heart of Jesus Christ in Asaba, Delta State. Join us for spirit-filled worship, Bible-grounded teaching, and a family that walks with you in faith.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/visit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3 text-base font-bold text-midnight shadow-[0_4px_20px_rgba(217,164,65,0.35)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_25px_rgba(217,164,65,0.45)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <MapPin className="h-5 w-5" aria-hidden="true" />
            <span>Plan your visit</span>
          </Link>
          <Link
            href="/sermons"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
            <span>Watch latest sermons</span>
          </Link>
        </div>

        {/* Weekly Fellowship Pill & Direct Link to Google Maps */}
        <a
          href={siteConfig.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          title="Open Grace of God Mission Asaba Hq on Google Maps"
          className="mt-12 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm text-slate-300 backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:text-white hover:border-gold/40 group"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>{siteConfig.serviceTimes} · {siteConfig.address}</span>
          <ExternalLink className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
