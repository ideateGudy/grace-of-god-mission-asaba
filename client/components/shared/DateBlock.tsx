import { cn } from "@/lib/utils";

export function DateBlock({ date, className }: { date: Date, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center bg-muted/50 rounded-[var(--radius-md)] w-16 h-16 shrink-0", className)}>
      <span className="text-xs font-medium text-primary uppercase">{date.toLocaleString('en-NG', { month: 'short' })}</span>
      <span className="text-2xl font-bold font-display leading-none tabular-nums text-foreground">{date.getDate()}</span>
    </div>
  );
}

export function EventRow({ title, venue, date, className }: { title: string, venue: string, date: Date, className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-4 border-b border-border/50 hover:bg-muted/30 transition-colors", className)}>
      <DateBlock date={date} />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-lg truncate">{title}</h3>
        <p className="text-muted-foreground text-sm truncate flex items-center gap-1.5 mt-0.5">
          <span>{date.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}</span>
          <span>&middot;</span>
          <span className="truncate">{venue}</span>
        </p>
      </div>
    </div>
  );
}
