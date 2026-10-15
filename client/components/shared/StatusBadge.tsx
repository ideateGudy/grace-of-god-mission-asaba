import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  published: "bg-success text-white hover:bg-success/90",
  draft: "bg-muted text-muted-foreground hover:bg-muted/90",
  "live now": "bg-success text-white hover:bg-success/90",
  scheduled: "bg-indigo/10 text-indigo hover:bg-indigo/20 dark:text-indigo-soft",
  ended: "bg-muted text-muted-foreground hover:bg-muted/90",
  active: "bg-success text-white hover:bg-success/90",
  deactivated: "bg-destructive text-white hover:bg-destructive/90",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const normalized = status.toLowerCase();
  const matchedKey = Object.keys(statusColors).find(k => normalized.includes(k)) || "draft";
  
  return (
    <Badge variant="outline" className={cn("border-0 font-normal", statusColors[matchedKey], className)}>
      {status}
    </Badge>
  );
}
