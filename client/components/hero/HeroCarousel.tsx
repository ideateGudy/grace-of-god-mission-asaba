"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { HeroSlideDto } from "@ggm/types";
import { HeroSlideView } from "./HeroSlideView";
import { cn } from "@/lib/utils";

export function HeroCarousel({
  slides,
  autoplay,
  intervalSeconds,
}: {
  slides: HeroSlideDto[];
  autoplay: boolean;
  intervalSeconds: number;
}) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();

  const shouldPlay = autoplay && !hovered && !focused && !reduced && slides.length > 1;

  useEffect(() => {
    if (!shouldPlay) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % slides.length),
      intervalSeconds * 1000
    );
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
        <div
          className="absolute bottom-3 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:gap-2 pointer-events-auto"
          aria-label="Slide indicators"
        >
          {slides.map((slide, index) => {
            const isActive = active === index;

            return (
              <button
                key={slide.id ?? index}
                type="button"
                className="p-1.5 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full cursor-pointer"
                aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                aria-current={isActive}
                onClick={() => setActive(index)}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    isActive
                      ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-gold shadow-[0_2px_8px_rgba(217,164,65,0.7)] ring-1 ring-black/30"
                      : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/70 hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] ring-1 ring-black/40 hover:scale-125"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
