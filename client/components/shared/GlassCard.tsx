import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const glassCard = cva("rounded-[var(--radius-lg)] border-0 text-card-foreground shadow-none", {
  variants: {
    surface: { glass: "glass", strong: "glass-strong", solid: "border border-border bg-card" },
    padding: { none: "p-0", md: "gap-4 py-5 md:py-6 px-4 md:px-6", lg: "gap-6 py-6 md:py-8 px-5 md:px-8" },
  },
  defaultVariants: { surface: "glass", padding: "md" },
});

export function GlassCard({
  surface, padding, className, ...props
}: React.ComponentProps<typeof Card> & VariantProps<typeof glassCard>) {
  return <Card className={cn(glassCard({ surface, padding }), className)} {...props} />;
}
