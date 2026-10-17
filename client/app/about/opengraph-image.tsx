import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "About Us | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "About Grace of God Mission Asaba",
    category: "OUR HISTORY, LEADERSHIP & VISION",
    eyebrow: "Rooted in Faith, Growing in Grace",
    subtitle:
      "Learn about our church history, pastoral leadership, foundational biblical beliefs, and heartbeat for the Asaba community.",
    badge: "Biblical Foundation · Community Impact",
    accentColor: "#3B82F6",
  });
}
