import type { Metadata } from "next";
import { ChurchCountdownLive } from "@/components/countdown/ChurchCountdownLive";

export const metadata: Metadata = {
  title: "Live Projection Countdown Screen | Grace of God Mission Asaba",
  description:
    "Full-screen sanctuary live projection display for Grace of God Mission Asaba services. Clean, read-only countdown screen for projectors, sanctuary LED walls, and OBS live streaming.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CountdownLivePage() {
  return (
    <main className="min-h-screen w-full bg-black overflow-hidden">
      <ChurchCountdownLive />
    </main>
  );
}
