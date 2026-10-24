import type { Metadata } from "next";
import { BroadcastStudioLive } from "@/components/studio/BroadcastStudioLive";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Live Sanctuary Presentation Feed | Grace of God Mission Asaba",
  description:
    "Full-screen live sanctuary output and alpha transparent browser source for Grace of God Mission Asaba services. Displays active program scene, scriptures, countdowns, and lower-third overlays.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLivePage() {
  return (
    <main className="min-h-screen w-full bg-black overflow-hidden">
      <Suspense fallback={<div className="w-full h-screen bg-black" />}>
        <BroadcastStudioLive />
      </Suspense>
    </main>
  );
}
