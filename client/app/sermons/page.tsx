import type { Metadata } from "next";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerWakingFallback } from "@/components/shared/ServerWakingFallback";
import { SermonsLiveExplorer, type SermonItem } from "@/components/sermons/SermonsLiveExplorer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sermons & Teachings | Grace of God Mission Asaba",
  description:
    "Listen to and watch spirit-filled sermons and Biblical teachings from pastors at Grace of God Mission Asaba.",
  alternates: { canonical: "/sermons" },
};

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; series?: string }>;
}) {
  const params = await searchParams;
  const initialQ = params.q?.trim() ?? "";
  const initialSeries = params.series?.trim() ?? "";

  // Fetch a generous batch for instant client-side live filtering
  const query = new URLSearchParams({ page: "1", limit: "100" });

  let sermons: SermonItem[] = [];
  let isWakingUp = false;

  try {
    const res = await api.public.sermons(`?${query}`);
    sermons = (res.data as unknown as SermonItem[]) ?? [];
  } catch (err: any) {
    if (err?.status === 503 || err?.message?.includes("waking up") || err?.code === "ECONNREFUSED") {
      isWakingUp = true;
    }
  }

  return (
    <PublicPageLayout
      title="Sermons & The Living Word"
      description="Equipping believers through sound, Christ-centered Biblical exposition, faith-filled teachings, and practical discipleship."
      eyebrow="The Word of God · Teachings Archive"
    >
      {isWakingUp ? (
        <ServerWakingFallback
          title="Connecting to Sermon Library..."
          description="Our sanctuary server is waking up to fetch audio sermons and teachings. Please hold on a moment as it connects."
          resourceName="sermons"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} surface="glass" padding="none" className="overflow-hidden border border-border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </GlassCard>
            ))}
          </div>
        </ServerWakingFallback>
      ) : (
        <SermonsLiveExplorer
          initialSermons={sermons}
          initialSearch={initialQ}
          initialSeries={initialSeries}
        />
      )}
    </PublicPageLayout>
  );
}
