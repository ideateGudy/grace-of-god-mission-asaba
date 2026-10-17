import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Praise Reports & Testimonies | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Praise Reports & Testimonies",
    category: "MIRACLES & DELIVERANCE",
    eyebrow: "They Overcame by the Blood of the Lamb",
    subtitle:
      "Read real, uplifting accounts of supernatural healing, financial breakthrough, and divine deliverance at Grace of God Mission Asaba.",
    badge: "Share Your Testimony · Glorify God",
    accentColor: "#F59E0B",
  });
}
