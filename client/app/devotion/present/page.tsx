import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api/client";
import type { DevotionDto } from "@ggm/types";
import { DevotionPresenter } from "@/components/devotion/DevotionPresenter";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Daily Grace Presentation View | Grace of God Mission Asaba",
  description:
    "Full-screen high-legibility presentation & projector mode for the Daily Grace devotional at Grace of God Mission Asaba.",
  alternates: { canonical: "/devotion/present" },
  openGraph: {
    title: "Daily Grace Presentation View | Grace of God Mission Asaba",
    description:
      "Full-screen high-legibility presentation & projector mode for the Daily Grace devotional at Grace of God Mission Asaba.",
    url: "/devotion/present",
    images: [
      {
        url: "/devotion/present/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Daily Grace Presentation View",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Grace Presentation View | Grace of God Mission Asaba",
    description:
      "Full-screen high-legibility presentation & projector mode for the Daily Grace devotional at Grace of God Mission Asaba.",
    images: ["/devotion/present/opengraph-image"],
  },
};

export default async function DevotionPresentPage() {
  let todayDevotion: DevotionDto | null = null;

  try {
    const todayRes = await api.devotions.getToday();
    todayDevotion = todayRes?.data ?? null;
  } catch {
    todayDevotion = null;
  }

  const formattedDate = todayDevotion
    ? new Date(`${todayDevotion.date}T00:00:00Z`).toLocaleDateString("en-GB", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  if (!todayDevotion) {
    return (
      <div className="min-h-screen w-full bg-[#0A0C1D] text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl">
          <BookOpen className="h-8 w-8 text-gold" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="font-display text-3xl font-extrabold text-white">
            Daily Grace Presentation
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            No active devotional guide found for today yet. The pastoral team is currently preparing today's message.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-primary text-white hover:brightness-110">
          <Link href="/devotion">Return to Devotion Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <DevotionPresenter
      devotion={todayDevotion}
      formattedDate={formattedDate}
      isStandalonePage={true}
    />
  );
}
