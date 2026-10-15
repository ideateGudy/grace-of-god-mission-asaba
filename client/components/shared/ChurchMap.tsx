import { MapPin, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface ChurchMapProps {
  className?: string;
  height?: number | string;
  showCardHeader?: boolean;
}

export function ChurchMap({
  className,
  showCardHeader = false,
}: ChurchMapProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
        className
      )}
    >
      {showCardHeader && (
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/30 px-5 py-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-gold" />
            <span>Grace of God Mission Asaba Hq</span>
          </div>
          <a
            href={siteConfig.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[450px]">
        <iframe
          src={siteConfig.googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Grace of God Mission Asaba Hq Map Location"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
