import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Church Photo Gallery | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Sanctuary Gallery & Moments",
    category: "CHURCH LIFE & WORSHIP HIGHLIGHTS",
    eyebrow: "Celebrating God's Goodness",
    subtitle:
      "Visual memories and highlights from our worship encounters, annual conventions, community outreaches, and sanctuary family.",
    badge: "Photo Gallery · Vibrant Sanctuary Life",
    accentColor: "#8B5CF6",
  });
}
