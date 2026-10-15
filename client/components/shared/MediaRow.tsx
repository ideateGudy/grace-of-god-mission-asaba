import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlayCircle } from "lucide-react";

export function MediaRow({ 
  title, subtitle, meta, imageUrl, onClick, className 
}: { 
  title: string, subtitle?: string, meta?: string, imageUrl?: string | null, onClick?: () => void, className?: string 
}) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-border/50",
        onClick && "cursor-pointer hover:bg-muted/30 transition-colors",
        className
      )}
    >
      {imageUrl ? (
        <div className="relative w-full sm:w-48 aspect-video sm:aspect-video rounded-[var(--radius-md)] overflow-hidden bg-muted shrink-0">
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 200px" />
          {onClick && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full sm:w-48 aspect-video rounded-[var(--radius-md)] bg-muted shrink-0 flex items-center justify-center text-muted-foreground">
          {onClick && <PlayCircle className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-lg truncate group-hover:text-primary transition-colors">{title}</h3>
        {subtitle && <p className="text-muted-foreground truncate">{subtitle}</p>}
        {meta && <p className="text-xs text-muted-foreground mt-2">{meta}</p>}
      </div>
    </div>
  );
}
