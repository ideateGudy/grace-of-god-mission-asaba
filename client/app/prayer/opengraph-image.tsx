import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Prayer Requests & Intercession | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Prayer Requests & Intercession",
    category: "PASTORAL CARE & INTERCESSION",
    eyebrow: "Call Upon Me and I Will Answer",
    subtitle:
      "Our pastoral team and church intercessors stand in faith with you. Submit your private or public prayer request today.",
    badge: "Confidential Support · Standing in Faith",
    accentColor: "#8B5CF6",
  });
}
