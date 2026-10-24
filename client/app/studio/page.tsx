import type { Metadata } from "next";
import { StudioAuthGuard } from "@/components/studio/StudioAuthGuard";

export const metadata: Metadata = {
  title: "Broadcast Studio Switcher | Grace of God Mission Asaba",
  description:
    "Official church livestream switcher and presentation software for Grace of God Mission Asaba. Real-time preview vs program switcher, Nigerian scripture engine, Media deck, and browser keying.",
  alternates: {
    canonical: "/studio",
  },
  openGraph: {
    title: "Broadcast Studio Switcher | Grace of God Mission Asaba",
    description:
      "Web-based church video switcher & presentation studio with Preview vs. Program switching, multi-tier Bible engine, Media service decks, and transparent overlay keying.",
    url: "/studio",
    siteName: "Grace of God Mission Asaba",
    locale: "en_US",
    type: "website",
  },
};

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-black">
      <StudioAuthGuard />
    </main>
  );
}
