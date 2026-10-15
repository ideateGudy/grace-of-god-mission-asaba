import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Plan a Visit",
  description: "Service times, location directions, and contact information for your visit to Grace of God Mission Asaba.",
  alternates: { canonical: "/visit" },
};

export default function PlanaVisitPage() {
  const phoneAvailable = !siteConfig.phone.startsWith("[");
  const whatsappAvailable = !siteConfig.whatsapp.startsWith("[") && Boolean(siteConfig.whatsapp);
  const mapAvailable = !siteConfig.googleMapsUrl.startsWith("[") && Boolean(siteConfig.googleMapsUrl);

  return (
    <PublicPageLayout
      title="Plan a Visit"
      description="We would love to welcome you. Find service times and directions to our church in Asaba."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard surface="solid" padding="lg">
          <Clock className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Service Schedule</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {siteConfig.serviceTimes}
          </p>
        </GlassCard>

        <GlassCard surface="solid" padding="lg">
          <MapPin className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Location & Directions</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {siteConfig.address}
            <br />
            {siteConfig.city}, {siteConfig.state}, {siteConfig.country}
          </p>
          {mapAvailable && (
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring rounded-md"
            >
              Get directions on Google Maps
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </GlassCard>

        <GlassCard surface="solid" padding="lg" className="md:col-span-2">
          <h2 className="font-display text-2xl font-semibold">Questions Before You Come?</h2>
          <p className="mt-2 text-muted-foreground">
            Our welcome team is glad to answer any questions or help you find your way.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {phoneAvailable && (
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-5 font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                href={`tel:${siteConfig.phone}`}
              >
                <Phone size={18} aria-hidden="true" />
                Call the church
              </a>
            )}
            {whatsappAvailable && (
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-5 font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                href={`https://wa.me/${siteConfig.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <FaWhatsapp className="size-5 text-[#25D366]" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
            >
              Send an online message
            </Link>
          </div>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
