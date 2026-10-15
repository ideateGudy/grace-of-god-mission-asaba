import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ 
  icon: Icon, title, description, actionLabel, onAction, className 
}: { 
  icon?: LucideIcon, title: string, description?: string, actionLabel?: string, onAction?: () => void, className?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4", className)}>
      {Icon && <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4 text-muted-foreground"><Icon className="w-6 h-6" /></div>}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="mt-6">{actionLabel}</Button>
      )}
    </div>
  );
}
