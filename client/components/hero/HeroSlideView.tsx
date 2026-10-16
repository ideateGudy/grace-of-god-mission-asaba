"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, PlayCircle, Sparkles, ExternalLink } from "lucide-react";
import type { HeroSlideDto } from "@ggm/types";
import { cn } from "@/lib/utils";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/store/useUiStore";

const gradients: Record<string, string> = {
  dawn: "--hero-gradient-dawn",
  daybreak: "--hero-gradient-daybreak",
  glow: "--hero-gradient-glow",
  radiance: "--hero-gradient-radiance",
  serenity: "--hero-gradient-serenity",
  parchment: "--hero-gradient-parchment",
};

const lightGradients = new Set(["radiance", "serenity", "parchment"]);

export function HeroSlideView({
  slide,
  priority = false,
  isFirst = false,
  animate = true,
}: {
  slide: HeroSlideDto;
  priority?: boolean;
  isFirst?: boolean;
  animate?: boolean;
}) {
  const isSplit = slide.layout === "SPLIT";
  const isImageBg = slide.bgType === "IMAGE" && !isSplit && Boolean(slide.imageUrl);
  const isLightGradient = slide.bgType === "GRADIENT" && lightGradients.has(slide.bgGradient ?? "");
  const isDarkTone = slide.textTone === "DARK" || isLightGradient;
  const textTone = isDarkTone ? "text-midnight" : "text-white";

  useEffect(() => {
    if (isFirst) {
      useUiStore.getState().setHeroTextTone(isDarkTone ? "DARK" : "LIGHT");
    }
  }, [isFirst, isDarkTone]);

  const isDefaultMidnight =
    !isImageBg &&
    !isSplit &&
    (slide.bgType === "COLOR" || !slide.bgType) &&
    (!slide.bgColor || slide.bgColor.toLowerCase() === "#141633");

  const customBgStyle: React.CSSProperties | undefined =
    slide.bgType === "COLOR" && slide.bgColor
      ? { backgroundColor: slide.bgColor }
      : slide.bgType === "GRADIENT" && slide.bgGradient
      ? { backgroundImage: `var(${gradients[slide.bgGradient] ?? gradients.dawn})` }
      : undefined;

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[min(780px,94svh)] flex-col items-center justify-center overflow-hidden px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16 transition-colors duration-150",
        isDefaultMidnight && "bg-midnight text-white",
        !isDefaultMidnight && !customBgStyle && (isSplit ? "bg-background text-foreground" : "bg-midnight text-white"),
        isDarkTone ? "text-midnight" : "text-white"
      )}
      style={customBgStyle}
    >
      {/* Background Image handling if present */}
      {isImageBg && slide.imageUrl && (
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
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-midnight"
            style={{ opacity: (slide.overlay ?? 40) / 100 }}
          />
        </>
      )}

      {/* Sacred ambient light & radiant sunrise backdrop for default Midnight */}
      {isDefaultMidnight && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(217,164,65,0.22),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(46,49,146,0.35),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-[#0B0D22] via-[#141633] to-[#141633]"
          />
        </>
      )}

      {/* Subtle ambient glow for custom dark backgrounds (non-default) */}
      {!isImageBg && !isSplit && !isDarkTone && !isDefaultMidnight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(255,255,255,0.06),transparent_70%)]"
        />
      )}

      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-4xl flex flex-col",
          slide.align === "CENTER" && "items-center text-center",
          slide.align === "START" && "items-start text-left",
          slide.align === "END" && "items-end text-right",
          isSplit && "grid md:grid-cols-2 max-w-6xl gap-8 md:gap-10 items-center text-left"
        )}
      >
        <div
          className={cn(
            "relative z-10 flex flex-col w-full",
            slide.align === "CENTER" && "items-center",
            slide.align === "START" && "items-start",
            slide.align === "END" && "items-end",
            isSplit && "text-foreground items-start"
          )}
        >
          {/* Welcome Pill Chip */}
          <div
            className={cn(
              "mb-4 sm:mb-5 inline-flex max-w-full items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur-sm text-center",
              isDarkTone
                ? "border-gold/50 bg-gold/15 text-midnight"
                : "border-gold/30 bg-gold/10 text-gold"
            )}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-gold" aria-hidden="true" />
            <span className="truncate">Welcome to Grace of God Mission · Asaba Division</span>
          </div>

          {/* Single Orchestrated Title Moment */}
          <HeroSequence
            as={isFirst ? "h1" : "h2"}
            title={slide.title}
            animate={animate}
            className={cn(
              "font-display text-balance text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] sm:leading-[1.08] tracking-tight",
              slide.align === "CENTER" && "text-center",
              slide.align === "START" && "text-left",
              slide.align === "END" && "text-right",
              !isSplit && textTone,
              isSplit && (isDarkTone ? "text-midnight" : "text-foreground")
            )}
          />

          {/* Welcoming Subtitle */}
          {slide.subtitle && (
            <p
              className={cn(
                "mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-xl font-light leading-relaxed",
                slide.align === "CENTER" && "text-center",
                slide.align === "START" && "text-left",
                slide.align === "END" && "text-right",
                !isSplit && (isDarkTone ? "text-stone" : "text-slate-200/90"),
                isSplit && "text-muted-foreground"
              )}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Primary and Secondary CTAs */}
          {(slide.primaryLabel || slide.secondaryLabel) && (
            <div
              className={cn(
                "mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto",
                slide.align === "CENTER" && "justify-center",
                slide.align === "START" && "justify-start",
                slide.align === "END" && "justify-end"
              )}
            >
              {slide.primaryLabel && (
                <Link
                  href={slide.primaryUrl || "#"}
                  className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gold px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-midnight shadow-[0_4px_20px_rgba(217,164,65,0.35)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_25px_rgba(217,164,65,0.45)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  target={slide.primaryUrl?.startsWith("http") ? "_blank" : undefined}
                  rel={slide.primaryUrl?.startsWith("http") ? "noreferrer" : undefined}
                >
                  <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{slide.primaryLabel}</span>
                </Link>
              )}
              {slide.secondaryLabel && (
                <Link
                  href={slide.secondaryUrl || "#"}
                  className={cn(
                    "inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isSplit
                      ? "border-border bg-card text-foreground hover:bg-muted"
                      : isDarkTone
                        ? "border-midnight/20 bg-midnight/10 text-midnight hover:bg-midnight/20 shadow-sm"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  )}
                  target={slide.secondaryUrl?.startsWith("http") ? "_blank" : undefined}
                  rel={slide.secondaryUrl?.startsWith("http") ? "noreferrer" : undefined}
                >
                  <PlayCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{slide.secondaryLabel}</span>
                </Link>
              )}
            </div>
          )}

          {/* Weekly Fellowship Pill & Direct Link to Google Maps */}
          <div
            className={cn(
              "mt-8 sm:mt-12 flex w-full",
              slide.align === "CENTER" && "justify-center",
              slide.align === "START" && "justify-start",
              slide.align === "END" && "justify-end",
              isSplit && "justify-start"
            )}
          >
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              title="Open Grace of God Mission Asaba Hq on Google Maps"
              className={cn(
                "inline-flex items-center gap-2 rounded-2xl sm:rounded-full border px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm backdrop-blur-md transition-all duration-200 group text-center flex-wrap sm:flex-nowrap justify-center",
                isSplit
                  ? "border-border bg-card/80 text-foreground hover:bg-card hover:border-primary/40"
                  : isDarkTone
                    ? "border-midnight/15 bg-midnight/5 text-stone hover:bg-midnight/10 hover:text-midnight hover:border-midnight/30"
                    : "border-white/15 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white hover:border-gold/40"
              )}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>{siteConfig.serviceTimes} · {siteConfig.address}</span>
              <ExternalLink className="h-3.5 w-3.5 text-gold shrink-0 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Split layout image */}
        {isSplit && slide.imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg border border-border/40">
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
        {isSplit && !slide.imageUrl && (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-2 opacity-50 text-gold" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Split layout image</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a photo in the editor to preview it here</p>
          </div>
        )}
      </div>
    </section>
  );
}
