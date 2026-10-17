import type { Metadata } from "next";
import { ChurchCountdown } from "@/components/countdown/ChurchCountdown";

export const metadata: Metadata = {
  title: "Service Countdown Timer | Grace of God Mission Asaba",
  description:
    "Official church service countdown timer for Grace of God Mission Asaba. Real-time sanctuary clock, editable programme themes, full-screen stage projection, and 100% offline capability.",
  alternates: {
    canonical: "/countdown",
  },
  openGraph: {
    title: "Sanctuary Countdown Timer | Grace of God Mission Asaba",
    description:
      "Full-screen church service countdown timer with editable programme titles, cathedral chimes, and offline reliability for stage screens, TVs, and livestreams.",
    url: "/countdown",
    siteName: "Grace of God Mission Asaba",
    locale: "en_US",
    type: "website",
  },
};

export default function CountdownPage() {
  return (
    <main className="min-h-screen bg-black">
      <ChurchCountdown />
    </main>
  );
}
