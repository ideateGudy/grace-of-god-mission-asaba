import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";
import { api } from "@/lib/api/client";

export const alt = "Daily Grace Devotional | Grace of God Mission Asaba";
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

  const title = todayDevotion?.title || "Daily Grace Devotion & Word";
  const eyebrow = todayDevotion?.textRef
    ? `TEXT: ${todayDevotion.textRef}`
    : "Spiritual Food For Victorious Living";

  const scripture = todayDevotion
    ? {
        text: todayDevotion.scriptureText,
        reference: todayDevotion.scriptureRef,
      }
    : undefined;

  return generateOgImage({
    title,
    category: "DAILY GRACE DEVOTIONAL",
    eyebrow,
    subtitle:
      "Start every day anchored in the truth of God's Word. Receive spiritual nourishment, biblical guidance, and prayers.",
    badge: "Daily Word · Scripture Reading · Prayer",
    scripture,
    accentColor: "#D9A441",
  });
}
