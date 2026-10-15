import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("font-display text-2xl font-bold tracking-tight text-foreground", className)}>
      <span className="dark:hidden">Grace of God</span>
      <span className="hidden dark:inline">Grace of God</span>
    </div>
  );
}
