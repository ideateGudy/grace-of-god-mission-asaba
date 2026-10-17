import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Service Countdown Timer | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Sanctuary Countdown Timer",
    category: "CHURCH MEDIA & STAGE DISPLAY",
    eyebrow: "Live Service Countdown",
    subtitle:
      "Real-time countdown timer with editable programme titles, cathedral chimes, and offline reliability for projection screens, sanctuary TVs, and livestreams.",
    badge: "100% Offline Ready · Sanctuary Stage Display",
    accentColor: "#D9A441",
  });
}
