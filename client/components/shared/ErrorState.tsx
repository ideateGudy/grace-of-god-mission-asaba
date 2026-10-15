import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ 
  title = "Something went wrong", description, onRetry, className 
}: { 
  title?: string, description?: string, onRetry?: () => void, className?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4", className)}>
      <div className="bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-destructive"><AlertCircle className="w-6 h-6" /></div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">Try again</Button>
      )}
    </div>
  );
}
