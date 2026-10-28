import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { api } from "@/lib/api/client";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { VideoFacade } from "@/components/hero/VideoFacade";
import { SermonAudioPlayer } from "@/components/shared/SermonAudioPlayer";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { ShareButton } from "@/components/shared/ShareButton";

export const revalidate = 60;

type Sermon = {
  id: string;
  slug: string;
  title: string;
  preacher: string;
  preachedAt: string;
  scripture: string | null;
  series: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  description: string | null;
};

async function getSermon(slug: string) {
  try {
    const res = await api.public.sermon(slug);
    return res.data as unknown as Sermon;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermon(slug);
  return sermon
    ? {
        title: sermon.title,
        description: sermon.description ?? `Sermon by ${sermon.preacher}.`,
        alternates: { canonical: `/sermons/${sermon.slug}` },
        openGraph: {
          title: sermon.title,
          description: sermon.description ?? `Sermon by ${sermon.preacher}.`,
          type: "article",
          images: sermon.thumbnailUrl
            ? [
                {
                  url: sermon.thumbnailUrl,
                  width: 1200,
                  height: 630,
                  alt: sermon.title,
                },
              ]
            : [
                {
                  url: `/api/og?title=${encodeURIComponent(sermon.title)}&category=SERMON&subtitle=${encodeURIComponent(sermon.preacher ? `Preacher: ${sermon.preacher}` : "")}&eyebrow=${encodeURIComponent(sermon.series || "Faith Comes By Hearing")}&badge=${encodeURIComponent(sermon.scripture || "")}&accent=%236366F1`,
                  width: 1200,
                  height: 630,
                  alt: sermon.title,
                },
              ],
        },
      }
    : { title: "Sermon not found" };
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sermon = await getSermon(slug);
  if (!sermon) notFound();

  let relatedSermons: Sermon[] = [];
  try {
    const query = sermon.series
      ? `?series=${encodeURIComponent(sermon.series)}&limit=4`
      : `?limit=4`;
    const res = await api.public.sermons(query);
    relatedSermons = ((res.data as unknown as Sermon[]) ?? [])
      .filter((s) => s.slug !== sermon.slug)
      .slice(0, 3);
  } catch {
    // Graceful fallback during API cold starts
  }

  const formattedDate = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(new Date(sermon.preachedAt));

  return (
    <>
      <ScrollProgress />
      <PublicPageLayout
        title={sermon.title}
        description={`${sermon.preacher} · ${formattedDate}`}
      >
        <article className="max-w-4xl">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {sermon.scripture && (
              <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                {sermon.scripture}
              </span>
            )}
            {sermon.series && (
              <span className="text-sm text-muted-foreground">
                Series: {sermon.series}
              </span>
            )}
            <ShareButton title={sermon.title} />
          </div>

          {sermon.videoUrl && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <VideoFacade url={sermon.videoUrl} title={sermon.title} />
            </div>
          )}

          {sermon.audioUrl && (
            <SermonAudioPlayer audioUrl={sermon.audioUrl} title={sermon.title} />
          )}

          {sermon.description && (
            <div className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground/90">
              {sermon.description}
            </div>
          )}

          {relatedSermons.length > 0 && (
            <section className="mt-14 border-t border-border pt-10">
              <h2 className="font-display text-2xl font-semibold mb-6">
                {sermon.series ? "More from this series" : "Related teaching"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedSermons.map((related) => (
                  <Link
                    key={related.id}
                    href={`/sermons/${encodeURIComponent(related.slug)}`}
                    className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <PlayCircle className="size-6 text-primary mb-2 transition group-hover:scale-105" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {related.preacher}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10">
            <Link
              href="/sermons"
              className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring rounded-md"
            >
              ← Back to all sermons
            </Link>
          </div>
        </article>
      </PublicPageLayout>
    </>
  );
}
