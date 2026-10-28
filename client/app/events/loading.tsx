import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function EventsLoading() {
  return (
    <PublicPageLayout
      title="Events & Special Gatherings"
      description="Gathering together in unity, fellowship, and celebration. Explore upcoming conferences, retreats, and ministry life."
      eyebrow="Church Calendar · Gatherings"
    >
      <div className="space-y-10">
        <div className="flex gap-2 p-1.5 rounded-2xl border border-border bg-card/60 backdrop-blur-md max-w-fit">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} surface="glass" padding="none" className="overflow-hidden border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PublicPageLayout>
  );
}
