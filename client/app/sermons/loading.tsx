import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function SermonsLoading() {
  return (
    <PublicPageLayout
      title="Sermons & The Living Word"
      description="Equipping believers through sound, Christ-centered Biblical exposition, faith-filled teachings, and practical discipleship."
      eyebrow="The Word of God · Teachings Archive"
    >
      <div className="space-y-10">
        {/* Search bar skeleton */}
        <GlassCard surface="strong" padding="md" className="border border-border shadow-md">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </GlassCard>

        {/* Sermons grid skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} surface="glass" padding="none" className="overflow-hidden border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-4 border-t border-border flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </PublicPageLayout>
  );
}
