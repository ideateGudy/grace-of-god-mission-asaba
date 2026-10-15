import Image from "next/image";
import Link from "next/link";
import type { HeroSlideDto } from "@ggm/types";
import { cn } from "@/lib/utils";
import { HeroSequence } from "@/components/motion/HeroSequence";

const gradients = {
  dawn: "--hero-gradient-dawn",
  daybreak: "--hero-gradient-daybreak",
  glow: "--hero-gradient-glow",
} as const;

export function HeroSlideView({
  slide,
  priority = false,
  isFirst = false,
}: {
  slide: HeroSlideDto;
  priority?: boolean;
  isFirst?: boolean;
}) {
  const text = slide.textTone === "LIGHT" ? "text-white" : "text-midnight";
  const background =
    slide.bgType === "COLOR"
      ? { backgroundColor: slide.bgColor ?? "var(--midnight)" }
      : slide.bgType === "GRADIENT"
      ? { backgroundImage: `var(${gradients[slide.bgGradient ?? "dawn"]})` }
      : undefined;

  return (
    <section
      className={cn(
        "relative isolate min-h-[min(760px,92svh)] overflow-hidden",
        slide.bgType === "COLOR" && "bg-midnight",
        slide.layout === "SPLIT" && (slide.bgType === "GRADIENT" ? "" : "bg-background")
      )}
      style={background}
    >
      {slide.bgType === "IMAGE" && slide.layout !== "SPLIT" && slide.imageUrl && (
        <>
          <Image
            src={slide.mobileImageUrl ?? slide.imageUrl}
            alt={slide.imageDecorative ? "" : slide.imageAlt ?? ""}
            fill
            priority={priority}
            sizes="100vw"
            className={cn("-z-20 object-cover", slide.mobileImageUrl && "sm:hidden")}
            style={{ objectPosition: `${slide.focalX}% ${slide.focalY}%` }}
          />
          {slide.mobileImageUrl && (
            <Image
              src={slide.imageUrl}
              alt={slide.imageDecorative ? "" : slide.imageAlt ?? ""}
              fill
              priority={priority}
              sizes="100vw"
              className="-z-20 hidden object-cover sm:block"
              style={{ objectPosition: `${slide.focalX}% ${slide.focalY}%` }}
            />
          )}
        </>
      )}
      {slide.bgType === "IMAGE" && slide.layout !== "SPLIT" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-midnight"
          style={{ opacity: slide.overlay / 100 }}
        />
      )}
      <div
        className={cn(
          "mx-auto grid min-h-[min(760px,92svh)] max-w-6xl items-center gap-10 px-5 pb-16 pt-28 md:px-8",
          slide.layout === "SPLIT" && "md:grid-cols-2",
          slide.align === "CENTER" && "text-center",
          slide.align === "END" && "text-right"
        )}
      >
        <div
          className={cn(
            "relative z-10 max-w-3xl",
            slide.align === "CENTER" && "mx-auto",
            slide.align === "END" && "ml-auto",
            slide.layout === "SPLIT" && "text-foreground"
          )}
        >
          <HeroSequence
            as={isFirst ? "h1" : "h2"}
            title={slide.title}
            className={cn("font-display text-balance text-[length:var(--fs-h1)] leading-[1.05]", slide.layout !== "SPLIT" && text)}
          />
          {slide.subtitle && (
            <p className={cn("mt-6 max-w-2xl text-lg leading-relaxed md:text-xl", slide.layout !== "SPLIT" && text, slide.layout !== "SPLIT" && "opacity-90")}>
              {slide.subtitle}
            </p>
          )}
          {(slide.primaryLabel || slide.secondaryLabel) && (
            <div className={cn("mt-8 flex flex-wrap gap-3", slide.align === "CENTER" && "justify-center", slide.align === "END" && "justify-end")}>
              {slide.primaryLabel && slide.primaryUrl && (
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-gold px-6 font-semibold text-midnight transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={slide.primaryUrl}
                >
                  {slide.primaryLabel}
                </Link>
              )}
              {slide.secondaryLabel && slide.secondaryUrl && (
                <Link
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-md border border-current px-6 font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    slide.layout === "SPLIT" ? "text-foreground" : text
                  )}
                  href={slide.secondaryUrl}
                >
                  {slide.secondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>
        {slide.layout === "SPLIT" && slide.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src={slide.imageUrl}
              alt={slide.imageDecorative ? "" : slide.imageAlt ?? ""}
              fill
              priority={priority}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: `${slide.focalX}% ${slide.focalY}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
