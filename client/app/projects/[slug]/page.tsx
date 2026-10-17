import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { OnlineGivingForm } from "@/components/giving/OnlineGivingForm";
import { Target, Users, Calendar, Heart, ShieldCheck, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectPublicSummary, PublicContributionItem } from "@ggm/types";

export const revalidate = 60;

async function getProject(slug: string): Promise<ProjectPublicSummary | null> {
  try {
    const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}/api/v1/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: ["projects", `project-${slug}`] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function getContributions(slug: string): Promise<PublicContributionItem[]> {
  try {
    const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}/api/v1/projects/${encodeURIComponent(slug)}/contributions?limit=25`, {
      next: { revalidate: 60, tags: ["contributions", `contributions-${slug}`] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Grace of God Mission Asaba`,
    description: project.description.slice(0, 160),
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.title,
      description: project.description.slice(0, 160),
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(project.title)}&category=CHURCH+PROJECT&subtitle=${encodeURIComponent(project.description.slice(0, 150))}&eyebrow=BUILDING+THE+KINGDOM&badge=${encodeURIComponent(project.status.toUpperCase())}&accent=%23059669`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const contributions = await getContributions(slug);

  const goalNaira = Number(project.goalKobo) / 100;
  const raisedNaira = Number(project.raisedKobo) / 100;

  const formattedGoal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(goalNaira);

  const formattedRaised = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(raisedNaira);

  return (
    <PublicPageLayout
      title={project.title}
      description={project.description.slice(0, 180)}
      eyebrow="Church Project · Building Together"
      actions={
        <Button asChild variant="outline" className="rounded-xl gap-2 text-xs border-white/30 text-white hover:bg-white/10">
          <Link href="/projects">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Projects</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-12 max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Left Column: Details & Contributor Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Visual Media Card */}
            {project.imageUrl && (
              <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-border shadow-2xl">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            )}

            {/* Description Card */}
            <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-4">
              <h2 className="font-display text-2xl font-bold text-foreground">
                About This Project
              </h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line space-y-4">
                {project.description}
              </div>

              {project.deadline && (
                <div className="flex items-center gap-2 pt-4 border-t border-border/70 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 text-gold shrink-0" />
                  <span>Target Completion Date: {new Date(project.deadline).toLocaleDateString("en-NG", { dateStyle: "long" })}</span>
                </div>
              )}
            </GlassCard>

            {/* Public Supporter Feed */}
            <GlassCard surface="solid" padding="lg" className="border border-border shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Supporters Wall ({project.contributionsCount})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">Recent gifts</span>
              </div>

              {contributions.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                  <Heart className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p>Be the first to sow a seed into this project!</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {contributions.map((c) => {
                    const amountFormatted = new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      maximumFractionDigits: 0,
                    }).format(Number(c.amountKobo) / 100);

                    return (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-4 p-3.5 rounded-2xl border border-border/70 bg-card text-xs shadow-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-foreground">{c.displayName}</p>
                          {c.message && (
                            <p className="text-muted-foreground italic">“{c.message}”</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/80">
                            {new Date(c.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-primary shrink-0">{amountFormatted}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Column: Progress & Online Giving Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Progress Card */}
            <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-3xl font-extrabold text-primary">{formattedRaised}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
                    {project.percent}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  raised towards <span className="font-bold text-foreground">{formattedGoal}</span> goal
                </p>

                <div className="h-3 w-full overflow-hidden rounded-full bg-muted mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-700"
                    style={{ width: `${Math.min(100, project.percent)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/70 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Total Gifts</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{project.contributionsCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px]">Status</span>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5 uppercase">{project.status}</p>
                </div>
              </div>
            </GlassCard>

            {/* Direct Paystack Giving Widget */}
            <OnlineGivingForm defaultProjectId={project.id} />
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
