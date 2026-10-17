import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";
import { api } from "@/lib/api/client";

export const alt = "Daily Grace Presentation View | Grace of God Mission Asaba";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function Image() {
  let todayDevotion = null;
  try {
    const res = await api.devotions.getToday();
    todayDevotion = res?.data;
  } catch {
    todayDevotion = null;
  }

  const title = todayDevotion
    ? `Presentation: ${todayDevotion.title}`
    : "Daily Grace Presentation View";

  const scripture = todayDevotion
    ? {
        text: todayDevotion.scriptureText,
        reference: todayDevotion.scriptureRef,
      }
    : undefined;

  return generateOgImage({
    title,
    category: "PROJECTOR & SANCTUARY DISPLAY",
    eyebrow: "Distraction-Free Screen & OBS Mode",
    subtitle:
      "Full-screen high-legibility presentation view for sanctuary services, prayer vigils, and church media displays.",
    badge: "HD Projector Mode · Auto-Play Loop · Full Screen",
    scripture,
    accentColor: "#D9A441",
  });
}
