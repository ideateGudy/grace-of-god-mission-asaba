import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Upcoming Church Events | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Upcoming Events & Gatherings",
    category: "CHURCH CALENDAR & ENCOUNTERS",
    eyebrow: "Fellowship & Spiritual Encounters",
    subtitle:
      "Join us for upcoming revivals, night vigils, youth conferences, and sanctuary celebrations at Grace of God Mission Asaba.",
    badge: "Sanctuary Gatherings · Akwuebulu, Asaba",
    accentColor: "#F59E0B",
  });
}
