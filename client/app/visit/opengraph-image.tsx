import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Plan Your Visit | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Plan Your Visit to Church",
    category: "FIRST-TIME GUESTS & FAMILIES",
    eyebrow: "You Are Warmly Welcomed Here",
    subtitle:
      "What to expect on your first Sunday: warm fellowship, uplifting praise, biblical preaching, safe children's church, and easy parking.",
    badge: "Sunday Sanctuary 7:00 AM · Come As You Are",
    accentColor: "#F59E0B",
  });
}
