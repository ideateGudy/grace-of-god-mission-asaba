import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";

export const alt = "Contact & Location | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return generateOgImage({
    title: "Contact & Sanctuary Location",
    category: "CONNECT WITH OUR PASTORS",
    eyebrow: "We Would Love to Hear From You",
    subtitle:
      "Find driving directions to No. 33 Arthur Richard Street, Akwuebulu, Asaba. Get in touch for counseling, inquiries, or prayer.",
    badge: "Sanctuary Address · Phone · Email Form",
    accentColor: "#14B8A6",
  });
}
