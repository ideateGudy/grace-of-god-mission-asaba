import { cn } from "@/lib/utils";

export function Section({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("py-16 md:py-24 lg:py-32", className)} {...props}>
      <div className="mx-auto max-w-6xl px-5 w-full">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("font-display text-4xl md:text-5xl leading-tight mb-8 md:mb-12", className)} {...props} />
  );
}
