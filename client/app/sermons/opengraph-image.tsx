import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Sermons & Spoken Word | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Sermons & Spoken Word",
    category: "SERMON LIBRARY & ARCHIVE",
    eyebrow: "Faith Comes By Hearing",
    subtitle:
      "Listen to life-transforming biblical messages, inspirational sermon series, and apostolic teachings from Grace of God Mission Asaba.",
    badge: "Free Audio & Video Messages · Full Archive",
    accentColor: "#6366F1",
  });
}
