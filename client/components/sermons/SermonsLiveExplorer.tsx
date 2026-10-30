"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, PlayCircle, Headphones, ArrowRight, BookOpen, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

export type SermonItem = {
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

interface SermonsLiveExplorerProps {
  initialSermons: SermonItem[];
  initialSearch?: string;
  initialSeries?: string;
  availableSeries?: string[];
}

export function SermonsLiveExplorer({
  initialSermons,
  initialSearch = "",
  initialSeries = "",
  availableSeries = [],
}: SermonsLiveExplorerProps) {
  // Combine initial search or series if provided
  const combinedInitial = initialSearch || initialSeries || "";
  const [searchTerm, setSearchTerm] = useState(combinedInitial);
  const [activeSeriesFilter, setActiveSeriesFilter] = useState(initialSeries);

  // Extract unique series from initial sermons if not provided
  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    if (availableSeries && availableSeries.length > 0) {
      availableSeries.forEach((s) => s && set.add(s.trim()));
    }
    initialSermons.forEach((s) => {
      if (s.series) set.add(s.series.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [availableSeries, initialSermons]);

  // Real-time instant in-memory filtering across all fields with a single input
  const filteredSermons = useMemo(() => {
    const qLower = searchTerm.trim().toLowerCase();
    const seriesPillLower = activeSeriesFilter.trim().toLowerCase();

    return initialSermons.filter((sermon) => {
      // Optional series pill filter
      if (seriesPillLower) {
        const itemSeries = sermon.series?.toLowerCase() ?? "";
        if (!itemSeries.includes(seriesPillLower)) {
          return false;
        }
      }

      // Single unified query filter (matches title, preacher, scripture, series, or description)
      if (qLower) {
        const titleMatch = sermon.title.toLowerCase().includes(qLower);
        const preacherMatch = sermon.preacher.toLowerCase().includes(qLower);
        const seriesMatch = sermon.series?.toLowerCase().includes(qLower) ?? false;
        const scriptureMatch = sermon.scripture?.toLowerCase().includes(qLower) ?? false;
        const descriptionMatch = sermon.description?.toLowerCase().includes(qLower) ?? false;

        if (!titleMatch && !preacherMatch && !seriesMatch && !scriptureMatch && !descriptionMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialSermons, searchTerm, activeSeriesFilter]);

  const hasActiveFilters = Boolean(searchTerm.trim() || activeSeriesFilter.trim());

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveSeriesFilter("");
  };

  const handleSeriesPillClick = (seriesName: string) => {
    if (activeSeriesFilter.toLowerCase() === seriesName.toLowerCase()) {
      setActiveSeriesFilter("");
    } else {
      setActiveSeriesFilter(seriesName);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar with Single Input */}
      <GlassCard surface="strong" padding="md" className="border border-border shadow-md">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Single Unified Real-Time Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="sermon-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sermons by title, preacher, series, scripture, or topic..."
              className="w-full min-h-12 rounded-xl border border-input bg-background pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-ring"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search input"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Result Count and Clear Actions */}
          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 px-4 text-xs font-semibold text-foreground hover:bg-muted transition active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
            <div className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary/10 px-4 text-xs font-bold text-primary whitespace-nowrap">
              {filteredSermons.length} {filteredSermons.length === 1 ? "Message" : "Messages"}
            </div>
          </div>
        </div>

        {/* Quick series pills for convenience */}
        {seriesOptions.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground mr-1">Series:</span>
            <button
              type="button"
              onClick={() => setActiveSeriesFilter("")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                !activeSeriesFilter
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {seriesOptions.map((seriesName) => {
              const isSelected = activeSeriesFilter.toLowerCase() === seriesName.toLowerCase();
              return (
                <button
                  key={seriesName}
                  type="button"
                  onClick={() => handleSeriesPillClick(seriesName)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {seriesName}
                </button>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Sermons Grid */}
      {filteredSermons.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSermons.map((sermon) => (
            <Link
              key={sermon.id}
              href={`/sermons/${encodeURIComponent(sermon.slug)}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
            >
              <div>
                {/* Thumbnail Banner with persistent 16:9 aspect ratio */}
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
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5 flex items-center justify-center border-b border-border/50">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-xs">
                      <Headphones className="size-6" />
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
            {hasActiveFilters ? "No Sermons Match Your Search" : "Sermon Archive Coming Soon"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            {hasActiveFilters
              ? "No sermons matched your search query. Try typing different keywords or reset the search."
              : "Recordings are currently being catalogued. Join us this Sunday at the Asaba sanctuary to receive the living Word live!"}
          </p>
          {hasActiveFilters && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Clear search
              </button>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
