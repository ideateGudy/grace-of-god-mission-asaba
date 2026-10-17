import { NextRequest } from "next/server";
import { generateOgImage, OG_IMAGE_SIZE } from "@/lib/og/generate-og-image";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title") || "Grace of God Mission Asaba";
    const subtitle = searchParams.get("subtitle") || searchParams.get("description") || undefined;
    const category = searchParams.get("category") || "SANCTUARY OF GRACE & TRUTH";
    const eyebrow = searchParams.get("eyebrow") || undefined;
    const badge = searchParams.get("badge") || undefined;
    const accent = searchParams.get("accent") || "#D9A441";

    const verseText = searchParams.get("verseText");
    const verseRef = searchParams.get("verseRef");

    const scripture = verseText && verseRef ? { text: verseText, reference: verseRef } : undefined;

    return generateOgImage({
      title,
      subtitle,
      category,
      eyebrow,
      badge,
      scripture,
      accentColor: accent,
    });
  } catch (e: unknown) {
    return generateOgImage({
      title: "Grace of God Mission Asaba",
      subtitle: "A vibrant Bible-believing family rooted in Christ, spiritual transformation, and community love.",
      category: "SANCTUARY OF GRACE & TRUTH",
    });
  }
}
