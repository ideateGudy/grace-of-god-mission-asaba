import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Sanctuary Live Stream | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Sanctuary Live Stream",
    category: "LIVE WORSHIP BROADCAST",
    eyebrow: "Worship With Us Anywhere in the World",
    subtitle:
      "Join our Sunday Morning Worship (7:00 AM) and Wednesday Midweek Service (5:00 PM) live from Asaba, Delta State.",
    badge: "LIVE Broadcast · Interactive Chat",
    accentColor: "#EF4444",
  });
}
