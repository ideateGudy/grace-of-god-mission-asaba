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
  height,
  showCardHeader = false,
}: ChurchMapProps) {
  return (
    <div
      className={cn(
        "relative w-full col-span-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
        className
      )}
    >
      {showCardHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/80 bg-muted/30 px-5 py-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 font-semibold text-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              <span>Grace of God Mission Asaba Hq</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground">·</span>
            <span className="text-[11px] font-normal text-muted-foreground">{siteConfig.address}</span>
          </div>
          <a
            href={siteConfig.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      <div
        className={cn(
          "relative w-full",
          !height && "h-[340px] sm:h-[420px] md:h-[480px]"
        )}
        style={height ? { height } : undefined}
      >
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
