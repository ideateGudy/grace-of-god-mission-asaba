import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Search, BookOpen, Clock, ArrowRight, Sparkles, Headphones } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sermons & Teachings | Grace of God Mission Asaba",
  description:
    "Listen to and watch spirit-filled sermons and Biblical teachings from pastors at Grace of God Mission Asaba.",
  alternates: { canonical: "/sermons" },
};

type Sermon = {
  id: string;
  slug: string;
  title: string;
  preacher: string;
  preachedAt: string;
  scripture?: string | null;
  series?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
};

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; series?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const series = params.series?.trim() ?? "";
  const query = new URLSearchParams({ page: "1", limit: "24" });
  if (q) query.set("q", q);
  if (series) query.set("series", series);

  let sermons: Sermon[] = [];
  try {
    const res = await api.public.sermons(`?${query}`);
    sermons = (res.data as unknown as Sermon[]) ?? [];
  } catch {
    /* Keep content pages available during API cold starts */
  }

  return (
    <PublicPageLayout
      title="Sermons & The Living Word"
      description="Equipping believers through sound, Christ-centered Biblical exposition, faith-filled teachings, and practical discipleship."
      eyebrow="The Word of God · Teachings Archive"
    >
      <div className="space-y-10">
        {/* Search & Filter Bar */}
        <GlassCard surface="strong" padding="md" className="border border-border shadow-md">
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            action="/sermons"
            role="search"
          >
            <label className="sr-only" htmlFor="sermon-search">
              Search sermons
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="sermon-search"
                name="q"
                defaultValue={q}
                placeholder="Search title, speaker, or topic..."
                className="w-full min-h-11 rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              />
            </div>

            <label className="sr-only" htmlFor="sermon-series">
              Series
            </label>
            <input
              id="sermon-series"
              name="series"
              defaultValue={series}
              placeholder="Filter by sermon series (e.g. Grace)"
              className="w-full min-h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              <span>Search</span>
            </button>
          </form>
        </GlassCard>

        {/* Sermons Grid */}
        {sermons.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <Link
                key={sermon.id}
                href={`/sermons/${encodeURIComponent(sermon.slug)}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
              >
                <div>
                  {/* Thumbnail Banner */}
                  {sermon.thumbnailUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={sermon.thumbnailUrl}
                        alt={sermon.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                          <PlayCircle className="h-3.5 w-3.5" />
                          <span>Listen / Watch</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[21/9] w-full overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5 flex items-center justify-center border-b border-border/50">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <Headphones className="size-5" />
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-semibold text-primary">
                        {sermon.series || "Message"}
                      </span>
                      {sermon.preachedAt && (
                        <span className="font-medium">
                          {new Intl.DateTimeFormat("en-NG", {
                            dateStyle: "medium",
                            timeZone: "Africa/Lagos",
                          }).format(new Date(sermon.preachedAt))}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>

                    <p className="text-xs font-medium text-muted-foreground">
                      Preacher: <strong className="text-foreground">{sermon.preacher}</strong>
                      {sermon.scripture ? ` · ${sermon.scripture}` : ""}
                    </p>

                    {sermon.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {sermon.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mx-6 mb-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-semibold text-primary">
                  <span className="inline-flex items-center gap-1.5">
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <span>Listen / Watch Message</span>
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <GlassCard surface="glass" padding="lg" className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {q || series ? "No Sermons Match Your Search" : "Sermon Archive Coming Soon"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
              {q || series
                ? "Try adjusting your search keywords or clearing the series filter to see more messages."
                : "Recordings are currently being catalogued. Join us this Sunday at the Asaba sanctuary to receive the living Word live!"}
            </p>
            {(q || series) && (
              <div className="mt-6">
                <Link
                  href="/sermons"
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Clear search filters
                </Link>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </PublicPageLayout>
  );
}
