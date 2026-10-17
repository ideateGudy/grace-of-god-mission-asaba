import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Church Projects & Kingdom Impact | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Church Projects & Impact",
    category: "KINGDOM BUILDING & MISSIONS",
    eyebrow: "Building For Generations to Come",
    subtitle:
      "Explore ongoing sanctuary infrastructure, gospel missions, and community outreach projects at Grace of God Mission Asaba.",
    badge: "Building Fund · Global Missions · Community Impact",
    accentColor: "#059669",
  });
}
