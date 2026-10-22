import type { Metadata } from "next";
import { PhoneCameraTransmitter } from "@/components/studio/inputs/PhoneCameraTransmitter";

export const metadata: Metadata = {
  title: "Mobile Phone Camera Transmitter | GGM Broadcast Studio",
  description:
    "Zero-install wireless smartphone camera transmitter for Grace of God Mission Asaba live broadcasting. Stream HD camera angles over Wi-Fi directly into the Web Studio switcher.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PhoneCameraPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room } = await searchParams;

  return (
    <main className="w-full h-[100dvh] bg-black overflow-hidden">
      <PhoneCameraTransmitter roomCode={room} />
    </main>
  );
}
