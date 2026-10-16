import type { PublicHero } from "@ggm/types";
import dynamic from "next/dynamic";
import { HeroSlideView } from "./HeroSlideView";
import { DefaultHero } from "./DefaultHero";

const HeroCarousel = dynamic(() => import("./HeroCarousel").then((module) => module.HeroCarousel), { ssr: true });

export function HeroRenderer({
  hero,
  activeSlideIndex,
  animate = true,
}: {
  hero: PublicHero | null;
  activeSlideIndex?: number;
  animate?: boolean;
}) {
  if (!hero?.slides.length) return <DefaultHero />;
  const slides = hero.slides;
  if (activeSlideIndex !== undefined) {
    const slide = slides[activeSlideIndex] ?? slides[0];
    return <HeroSlideView slide={slide} priority isFirst animate={animate} />;
  }
  if (hero?.mode === "CAROUSEL" && slides.length > 1) {
    return <HeroCarousel slides={slides} autoplay={hero.autoplay} intervalSeconds={hero.intervalSeconds} />;
  }
  return <HeroSlideView slide={slides[0]} priority isFirst animate={animate} />;
}
