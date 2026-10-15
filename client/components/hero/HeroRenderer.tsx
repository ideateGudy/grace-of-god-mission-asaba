import type { PublicHero } from "@ggm/types";
import dynamic from "next/dynamic";
import { HeroSlideView } from "./HeroSlideView";
import { DefaultHero } from "./DefaultHero";

const HeroCarousel = dynamic(() => import("./HeroCarousel").then((module) => module.HeroCarousel), { ssr: true });

export function HeroRenderer({ hero }: { hero: PublicHero | null }) {
  if (!hero?.slides.length) return <DefaultHero />;
  const slides = hero.slides;
  if (hero?.mode === "CAROUSEL" && slides.length > 1) return <HeroCarousel slides={slides} autoplay={hero.autoplay} intervalSeconds={hero.intervalSeconds} />;
  return <HeroSlideView slide={slides[0]} priority isFirst />;
}
