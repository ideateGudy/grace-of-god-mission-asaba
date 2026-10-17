import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Grace of God Mission Asaba | Sanctuary of Grace & Truth";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Grace of God Mission Asaba",
    category: "SANCTUARY OF GRACE & TRUTH",
    eyebrow: "Welcome to Our Church Family",
    subtitle:
      "A vibrant Bible-believing family rooted in Christ, spiritual transformation, and community love in Asaba, Delta State.",
    badge: "Sunday Sanctuary 7:00 AM · Wednesday Midweek 5:00 PM",
    accentColor: "#D9A441",
  });
}
