import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle, Search } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sermons",
  description: "Browse sermons and biblical teaching from Grace of God Mission Asaba.",
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
      title="Sermons"
      description="Browse recorded teaching and messages from the church."
    >
      <form
        className="mb-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        action="/sermons"
        role="search"
      >
        <label className="sr-only" htmlFor="sermon-search">
          Search sermons
        </label>
        <input
          id="sermon-search"
          name="q"
          defaultValue={q}
          placeholder="Search title or preacher"
          className="min-h-11 rounded-md border border-input bg-background px-3 focus-visible:outline-2 focus-visible:outline-ring"
        />
        <label className="sr-only" htmlFor="sermon-series">
          Series
        </label>
        <input
          id="sermon-series"
          name="series"
          defaultValue={series}
          placeholder="Filter by series"
          className="min-h-11 rounded-md border border-input bg-background px-3 focus-visible:outline-2 focus-visible:outline-ring"
        />
        <button
          type="submit"
          className="min-h-11 rounded-md bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Search className="mr-2 inline size-4" aria-hidden="true" />
          Search
        </button>
      </form>

      {sermons.length ? (
        <ul className="divide-y divide-border" role="list">
          {sermons.map((sermon) => (
            <li key={sermon.id} className="py-5">
              <Link
                className="group flex min-h-16 items-center gap-4 focus-visible:outline-2 focus-visible:outline-ring rounded-lg p-1"
                href={`/sermons/${encodeURIComponent(sermon.slug)}`}
              >
                <PlayCircle
                  aria-hidden="true"
                  className="size-8 shrink-0 text-primary transition group-hover:scale-105"
                />
                <div>
                  <strong className="text-lg font-medium group-hover:text-primary transition-colors">
                    {sermon.title}
                  </strong>
                  <span className="block text-sm text-muted-foreground">
                    {sermon.preacher}
                    {sermon.series ? ` · ${sermon.series}` : ""} ·{" "}
                    {new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "long",
                      timeZone: "Africa/Lagos",
                    }).format(new Date(sermon.preachedAt))}
                  </span>
                  {sermon.scripture && (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {sermon.scripture}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          {q || series
            ? "No sermons match these filters."
            : "Sermons will appear here when published by the church."}
        </p>
      )}
    </PublicPageLayout>
  );
}
