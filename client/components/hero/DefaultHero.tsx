import type { HeroSlideDto } from "@ggm/types";
import { HeroSlideView } from "./HeroSlideView";

const defaultSlide: HeroSlideDto = {
  sortOrder: 0,
  layout: "TEXT_ONLY",
  align: "CENTER",
  title: "Grace of God Mission Asaba",
  subtitle: "Welcome. Explore service information, sermons and events.",
  primaryLabel: "Plan a visit",
  primaryUrl: "/visit",
  secondaryLabel: "Explore sermons",
  secondaryUrl: "/sermons",
  bgType: "COLOR",
  bgColor: "#141633",
  bgGradient: null,
  imageUrl: null,
  mobileImageUrl: null,
  imageAlt: null,
  imageDecorative: true,
  focalX: 50,
  focalY: 50,
  overlay: 40,
  textTone: "LIGHT",
};

export function DefaultHero() {
  return <HeroSlideView slide={defaultSlide} priority isFirst />;
}
