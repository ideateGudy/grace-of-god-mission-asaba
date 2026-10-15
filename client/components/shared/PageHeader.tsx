import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, className }: { title: string, description?: string, actions?: React.ReactNode, className?: string }) {
  return (
    <div className={cn("mb-8 md:mb-12 space-y-4", className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-lg text-balance max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
