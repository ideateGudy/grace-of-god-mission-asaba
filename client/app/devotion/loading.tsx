import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function DevotionLoading() {
  return (
    <PublicPageLayout
      title="Daily Devotion & Word"
      description="Start each day anchored in the truth of God's Word. Receive daily spiritual insight, grace, and prayer for victorious living."
      eyebrow="Spiritual Food · Psalm 119:105"
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>

        {/* Main Devotion Card Skeleton */}
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="pt-4 border-t border-border space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </GlassCard>

        {/* Archive Devotions Skeleton */}
        <div className="space-y-4 pt-6">
          <Skeleton className="h-7 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <GlassCard key={i} surface="glass" padding="md" className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
