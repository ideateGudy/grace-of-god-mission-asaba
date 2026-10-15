"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import type { HeroSlideDto } from "@ggm/types";
import { HeroSlideView } from "./HeroSlideView";
import { Button } from "@/components/ui/button";

export function HeroCarousel({ slides, autoplay, intervalSeconds }: { slides: HeroSlideDto[]; autoplay: boolean; intervalSeconds: number }) {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const shouldPlay = autoplay && !userPaused && !hovered && !focused && !reduced && slides.length > 1;
  useEffect(() => {
    if (!shouldPlay) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [shouldPlay, intervalSeconds, slides.length]);
  if (!slides.length) return null;
  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Welcome highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div aria-live={shouldPlay ? "off" : "polite"}>
        <HeroSlideView
          key={slides[active].id ?? active}
          slide={slides[active]}
          priority={active === 0}
          isFirst={active === 0}
        />
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-midnight/80 p-2 text-white">
          {autoplay && !reduced && (
            <Button type="button" variant="ghost" size="icon" className="size-11 text-white hover:bg-white/10 hover:text-white" aria-label={userPaused ? "Play slides" : "Pause slides"} onClick={() => setUserPaused((value) => !value)}>
              {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </Button>
          )}
          {slides.map((slide, index) => (
            <button key={slide.id ?? index} type="button" className="size-11 rounded-full" aria-label={`Show slide ${index + 1} of ${slides.length}`} aria-current={active === index} onClick={() => setActive(index)}>
              <span className={`mx-auto block size-2 rounded-full ${active === index ? "bg-gold" : "bg-white/60"}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
