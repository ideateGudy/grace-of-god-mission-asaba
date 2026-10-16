import type { HeroSlideDto } from "@ggm/types";

const lightGradients = new Set([
  "radiance",
  "serenity",
  "parchment",
  "milk-gold",
  "milk-sky",
  "milk-rose",
  "milk-olive",
]);

/**
 * Calculates whether a hero slide requires DARK text (for light backgrounds)
 * or LIGHT text (for dark backgrounds), based on explicit textTone, gradient presets,
 * solid background colors, or image backgrounds.
 */
export function resolveHeroSlideTextTone(
  slide?: Partial<HeroSlideDto> | null
): "LIGHT" | "DARK" {
  if (!slide) return "LIGHT";

  // Explicit user override on slide
  if (slide.textTone === "DARK" || slide.textTone === "LIGHT") {
    return slide.textTone;
  }

  // Gradient presets
  if (slide.bgType === "GRADIENT" && slide.bgGradient) {
    return lightGradients.has(slide.bgGradient) ? "DARK" : "LIGHT";
  }

  // Solid background colors
  if (slide.bgType === "COLOR" && slide.bgColor) {
    const hex = slide.bgColor.replace("#", "").trim();
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 165 ? "DARK" : "LIGHT";
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 165 ? "DARK" : "LIGHT";
    }
  }

  // Default to LIGHT text for midnight & photo overlays
  return "LIGHT";
}
