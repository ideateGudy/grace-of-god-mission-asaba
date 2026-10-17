import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Community Prayer Wall | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Community Prayer Wall",
    category: "COMMUNITY PRAYER & AGREEMENT",
    eyebrow: "Bear Ye One Another's Burdens",
    subtitle:
      "Join fellow brothers and sisters in Christ. Stand in the gap, pray for one another, and witness answered prayers.",
    badge: "Interactive Prayer Wall · Stand in Agreement",
    accentColor: "#A855F7",
  });
}
