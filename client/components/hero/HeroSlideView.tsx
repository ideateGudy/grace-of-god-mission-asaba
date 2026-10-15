import Image from "next/image";
import Link from "next/link";
import { MapPin, PlayCircle, Sparkles, ExternalLink } from "lucide-react";
import type { HeroSlideDto } from "@ggm/types";
import { cn } from "@/lib/utils";
import { HeroSequence } from "@/components/motion/HeroSequence";
import { siteConfig } from "@/config/site";

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
  const isSplit = slide.layout === "SPLIT";
  const isImageBg = slide.bgType === "IMAGE" && !isSplit && Boolean(slide.imageUrl);
  const textTone = slide.textTone === "DARK" ? "text-midnight" : "text-white";

  const customBgStyle =
    slide.bgType === "COLOR" && slide.bgColor
      ? { backgroundColor: slide.bgColor }
      : slide.bgType === "GRADIENT" && slide.bgGradient
      ? { backgroundImage: `var(${gradients[slide.bgGradient]})` }
      : undefined;

  return (
    <section
      className={cn(
        "relative isolate flex min-h-[min(820px,94svh)] flex-col items-center justify-center overflow-hidden bg-midnight text-white px-5 pt-28 pb-16 md:px-8",
        isSplit && (slide.bgType === "GRADIENT" ? "" : "bg-background")
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
            style={{ opacity: slide.overlay / 100 }}
          />
        </>
      )}

      {/* Sacred ambient light & radiant sunrise backdrop */}
      {!isImageBg && (
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

      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-4xl flex flex-col",
          slide.align === "CENTER" && "items-center text-center",
          slide.align === "START" && "items-start text-left",
          slide.align === "END" && "items-end text-right",
          isSplit && "grid md:grid-cols-2 max-w-6xl gap-10 items-center text-left"
        )}
      >
        <div
          className={cn(
            "relative z-10 flex flex-col",
            slide.align === "CENTER" && "items-center",
            slide.align === "START" && "items-start",
            slide.align === "END" && "items-end",
            isSplit && "text-foreground items-start"
          )}
        >
          {/* Welcome Pill Chip */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Welcome to Grace of God Mission · Asaba Division</span>
          </div>

          {/* Single Orchestrated Title Moment */}
          <HeroSequence
            as={isFirst ? "h1" : "h2"}
            title={slide.title}
            className={cn(
              "font-display text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight",
              !isSplit && textTone,
              isSplit && "text-foreground"
            )}
          />

          {/* Welcoming Subtitle */}
          {slide.subtitle && (
            <p
              className={cn(
                "mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-light leading-relaxed",
                !isSplit && (slide.textTone === "DARK" ? "text-stone" : "text-slate-200/90"),
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
                "mt-8 flex flex-wrap items-center gap-4",
                slide.align === "CENTER" && "justify-center",
                slide.align === "START" && "justify-start",
                slide.align === "END" && "justify-end"
              )}
            >
              {slide.primaryLabel && slide.primaryUrl && (
                <Link
                  href={slide.primaryUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-7 py-3 text-base font-bold text-midnight shadow-[0_4px_20px_rgba(217,164,65,0.35)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_25px_rgba(217,164,65,0.45)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  target={slide.primaryUrl.startsWith("http") ? "_blank" : undefined}
                  rel={slide.primaryUrl.startsWith("http") ? "noreferrer" : undefined}
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  <span>{slide.primaryLabel}</span>
                </Link>
              )}
              {slide.secondaryLabel && slide.secondaryUrl && (
                <Link
                  href={slide.secondaryUrl}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3 text-base font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isSplit && "border-border bg-card text-foreground hover:bg-muted"
                  )}
                  target={slide.secondaryUrl.startsWith("http") ? "_blank" : undefined}
                  rel={slide.secondaryUrl.startsWith("http") ? "noreferrer" : undefined}
                >
                  <PlayCircle className="h-5 w-5" aria-hidden="true" />
                  <span>{slide.secondaryLabel}</span>
                </Link>
              )}
            </div>
          )}

          {/* Weekly Fellowship Pill & Direct Link to Google Maps */}
          <div
            className={cn(
              "mt-12 flex w-full",
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
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm text-slate-300 backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:text-white hover:border-gold/40 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Sunday Services: 7:00 AM · Wednesday: 5:00 PM · No. 33 Arthur Richard St, Akwuebulu, Asaba</span>
              <ExternalLink className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Split layout image */}
        {isSplit && slide.imageUrl && (
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
