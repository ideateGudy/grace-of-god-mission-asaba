import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { siteConfig } from "@/config/site";
import {
  Flame,
  BookOpen,
  Users,
  Heart,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us | Grace of God Mission Asaba",
  description:
    "Discover the history, beliefs, mission, vision, and pastoral leadership of Grace of God Mission Asaba, Delta State, Nigeria.",
  alternates: { canonical: "/about" },
};

const defaultBeliefs = [
  {
    title: "The Holy Trinity",
    desc: "We believe in one God, eternally existent in three persons: Father, Son, and Holy Spirit.",
  },
  {
    title: "Authority of the Scriptures",
    desc: "The Bible is the inspired, infallible, and authoritative Word of God for all faith and life.",
  },
  {
    title: "Salvation Through Christ",
    desc: "Salvation is by grace through faith in the sacrificial death and resurrection of Jesus Christ alone.",
  },
  {
    title: "The Holy Spirit & Power",
    desc: "The indwelling and baptism of the Holy Spirit, empowering believers for holy living and divine service.",
  },
  {
    title: "The Church & Great Commission",
    desc: "The body of Christ united in love, dedicated to making disciples and serving our community in Asaba.",
  },
];

export default function AboutUsPage() {
  const hasLeadership = siteConfig.leadership && siteConfig.leadership.length > 0;
  const hasCustomBeliefs = siteConfig.beliefs && siteConfig.beliefs.length > 0;

  return (
    <PublicPageLayout
      title="About Our Church Family"
      description="Walking in unfailing grace, grounded in the Word of God, and touching lives across Asaba, Delta State."
      eyebrow="Who We Are · Grace of God Mission"
    >
      <div className="space-y-12">
        {/* 1. Our Story & Emblem Highlight */}
        <GlassCard
          surface="strong"
          padding="lg"
          className="relative overflow-hidden border border-border shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-gold/40 bg-midnight p-3.5 shadow-[0_0_30px_rgba(217,164,65,0.25)]">
              <Image
                src="/ggm_logo.png"
                alt="Grace of God Mission Emblem"
                width={84}
                height={84}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Our Heritage in Asaba</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                Our Story & Legacy
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {siteConfig.story.startsWith("[")
                  ? "Grace of God Mission Asaba is a vibrant fellowship of believers situated in the capital city of Delta State. Committed to preaching Christ in all His fullness, the church has stood as a beacon of truth, hope, and prayer for families, youth, and workers in the region."
                  : siteConfig.story}
              </p>
              {!siteConfig.foundedYear.startsWith("[") && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-primary">
                    <span>Established in {siteConfig.foundedYear}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* 2. Mission & Vision Dual Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Mission */}
          <GlassCard
            surface="solid"
            padding="lg"
            className="group relative overflow-hidden border border-border shadow-md transition-all duration-300 hover:border-gold/50 hover:shadow-xl"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Our Mission</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {siteConfig.mission.startsWith("[")
                ? "To proclaim the uncompromised Gospel of Jesus Christ, nurture believers into spiritual maturity, and demonstrate the unconditional love of God through active outreach in Asaba and beyond."
                : siteConfig.mission}
            </p>
          </GlassCard>

          {/* Vision */}
          <GlassCard
            surface="solid"
            padding="lg"
            className="group relative overflow-hidden border border-border shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Our Vision</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {siteConfig.vision.startsWith("[")
                ? "To be a thriving, multigenerational church family anchored in divine grace, empowered by the Holy Spirit, and impacting generations for the Kingdom of God."
                : siteConfig.vision}
            </p>
          </GlassCard>
        </div>

        {/* 3. What We Believe */}
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-lg">
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Biblical Foundations</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">What We Believe</h2>
            <p className="text-sm text-muted-foreground">
              Core doctrinal tenets guiding our teaching, fellowship, and worship.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(hasCustomBeliefs
              ? siteConfig.beliefs.map((b, i) => ({ title: `Tenet ${i + 1}`, desc: b }))
              : defaultBeliefs
            ).map((belief, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/80 bg-card p-4 transition hover:bg-accent/50"
              >
                <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{belief.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {belief.desc}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 4. Church Leadership */}
        <GlassCard surface="solid" padding="lg" className="border border-border shadow-md">
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Users className="h-4 w-4" />
              <span>Pastoral Care</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Pastoral Leadership</h2>
            <p className="text-sm text-muted-foreground">
              Servant leaders dedicated to shepherding the flock with wisdom, integrity, and prayer.
            </p>
          </div>

          {hasLeadership ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {siteConfig.leadership.map((leader, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-md"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary font-bold text-xl">
                    {leader.name.charAt(0)}
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{leader.name}</h3>
                  <p className="text-xs font-semibold text-primary">{leader.title}</p>
                  {leader.bio && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {leader.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Pastoral leadership profiles are currently being updated. Contact the church office
                for inquiries.
              </p>
            </div>
          )}
        </GlassCard>

        {/* 5. Visit Invitation Banner */}
        <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Experience God's Presence With Us
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              We would love to welcome you and your loved ones to our next Sunday service.
            </p>
          </div>
          <Link
            href="/visit"
            className="inline-flex shrink-0 min-h-12 items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95"
          >
            <MapPin className="h-4 w-4" />
            <span>Plan your visit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
