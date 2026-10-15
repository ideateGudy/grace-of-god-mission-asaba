import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Home, Compass, BookOpen, Calendar, HelpCircle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <PublicPageLayout
      title="Page Not Found"
      description="The page you are looking for may have been moved, renamed, or is temporarily unavailable."
      eyebrow="404 · Navigating Sanctuary"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <Compass className="h-8 w-8" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Let's help you find your way
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            You can return to the homepage or explore one of our popular sections below.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              <Home className="h-4 w-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/visit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted transition"
            >
              <HelpCircle className="h-4 w-4 text-gold" />
              <span>Plan Your Visit</span>
            </Link>
          </div>
        </GlassCard>

        {/* Quick Directory Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/sermons"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:border-gold/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition">
              Sermons Library
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Watch recent messages, teachings, and spiritual series.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-primary">
              <span>Listen now</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/events"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:border-gold/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold mb-3">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition">
              Events & Gatherings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Conventions, prayer vigils, conferences, and praise nights.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-primary">
              <span>View calendar</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            href="/contact"
            className="group rounded-2xl border border-border bg-card p-5 transition hover:border-gold/50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition">
              Contact & Inquiries
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect directly with church leadership or our pastoral office.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-primary">
              <span>Get in touch</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
