import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Online Giving & Stewardship | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Online Giving & Stewardship",
    category: "KINGDOM ADVANCEMENT & PARTNERSHIP",
    eyebrow: "Honor the Lord With Your Substance",
    subtitle:
      "Partner with Grace of God Mission Asaba to advance the Gospel, fund local outreaches, and build God's sanctuary.",
    badge: "Secure Online Tithes, Offerings & Projects",
    accentColor: "#10B981",
  });
}
