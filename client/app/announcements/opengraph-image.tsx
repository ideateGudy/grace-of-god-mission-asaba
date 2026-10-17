import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Church Announcements & Bulletins | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Announcements & Bulletins",
    category: "CHURCH NOTICES & BULLETINS",
    eyebrow: "Stay Informed & Connected",
    subtitle:
      "Important pastoral announcements, departmental schedules, meeting dates, and upcoming programs for our congregation.",
    badge: "Official Church Bulletins & Updates",
    accentColor: "#0EA5E9",
  });
}
