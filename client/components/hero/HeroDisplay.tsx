import { HeroWordReveal } from "./HeroWordReveal";
import { HeroSunrise } from "./HeroSunrise";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroData {
  title: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  videoUrl?: string | null;
  churchAddress?: string;
  serviceTimes?: string;
}

export function HeroDisplay({ data, className }: { data: HeroData; className?: string }) {
  return (
    <section className={cn("relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 px-5", className)}>
      <HeroSunrise />
      
      {data.videoUrl && (
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-overlay"
            src={data.videoUrl}
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        <HeroWordReveal text={data.title} className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-foreground" />
        
        {data.subtitle && (
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl text-balance">
            {data.subtitle}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          {data.primaryCtaText && data.primaryCtaLink && (
            <Button size="lg" className="rounded-full text-base h-14 px-8" asChild>
              <Link href={data.primaryCtaLink}>{data.primaryCtaText}</Link>
            </Button>
          )}
          <Button size="lg" variant="outline" className="rounded-full text-base h-14 px-8 glass-strong border-border hover:bg-muted/50" asChild>
            <Link href="/visit">Plan a Visit</Link>
          </Button>
        </div>

        {(data.churchAddress || data.serviceTimes) && (
          <div className="mt-12 glass-strong rounded-[var(--radius-lg)] p-6 flex flex-col sm:flex-row items-center gap-6 md:gap-12 text-sm text-muted-foreground">
            {data.serviceTimes && (
              <div className="flex flex-col items-center text-center">
                <span className="font-semibold text-foreground mb-1">Service Times</span>
                <span>{data.serviceTimes}</span>
              </div>
            )}
            {data.churchAddress && (
              <div className="flex flex-col items-center text-center relative group">
                <span className="font-semibold text-foreground mb-1">Location</span>
                <span className="flex items-center gap-2">
                  {data.churchAddress}
                  <CopyButton text={data.churchAddress} label="Address" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-1/2 -translate-y-1/2" />
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
