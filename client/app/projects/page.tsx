import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerWakingFallback } from "@/components/shared/ServerWakingFallback";
import { Sparkles, Target, Users, Calendar, ArrowRight, HeartHandshake } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectPublicSummary } from "@ggm/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Church Projects & Missions | Grace of God Mission Asaba",
  description:
    "Partner with Grace of God Mission Asaba to fund sanctuary expansion, community outreach, and evangelical crusades in Delta State.",
  alternates: { canonical: "/projects" },
};

async function getProjects(): Promise<{ projects: ProjectPublicSummary[]; isWakingUp: boolean }> {
  try {
    const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}/api/v1/projects?limit=50`, {
      next: { revalidate: 60, tags: ["projects"] },
    });
    if (!res.ok) {
      const isWakingUp = res.status === 502 || res.status === 503 || res.status === 504;
      return { projects: [], isWakingUp };
    }
    const json = await res.json();
    return { projects: json.data || [], isWakingUp: false };
  } catch {
    return { projects: [], isWakingUp: true };
  }
}

export default async function ProjectsPage() {
  const { projects, isWakingUp } = await getProjects();

  return (
    <PublicPageLayout
      title="Kingdom Projects & Missions"
      description="Join hands with us in advancing physical facilities, student sponsorships, and evangelical mission fields across Asaba."
      eyebrow="Building Together · Faith in Action"
    >
      <div className="space-y-12 max-w-6xl mx-auto">
        {/* Intro Highlight Banner */}
        <GlassCard
          surface="strong"
          padding="lg"
          className="relative overflow-hidden border border-border shadow-xl bg-gradient-to-r from-gold/10 via-card to-card"
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                <Target className="h-4 w-4" />
                <span>Transparent Partnership</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Building For Eternity, One Milestone at a Time
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every project represents a tangible step in spreading the Gospel and ministering to
                the people of Delta State. Track our fundraising progress transparently below.
              </p>
            </div>

            <Button asChild className="rounded-xl bg-primary hover:brightness-110 text-white gap-2 shrink-0">
              <Link href="/give">
                <HeartHandshake className="h-4 w-4" />
                <span>General Giving</span>
              </Link>
            </Button>
          </div>
        </GlassCard>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          isWakingUp ? (
            <ServerWakingFallback
              title="Connecting to Church Projects..."
              description="Our sanctuary server is waking up to retrieve active church building projects and mission outreach initiatives. Please hold on a moment as it connects."
              resourceName="projects"
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <GlassCard key={i} surface="glass" padding="none" className="overflow-hidden border border-border">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </ServerWakingFallback>
          ) : (
            <GlassCard surface="solid" padding="lg" className="text-center py-16 space-y-4 border border-border">
              <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">No Active Projects</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                There are currently no open project appeals. You can still support our ongoing ministry through general tithes and offerings.
              </p>
              <div className="pt-2">
                <Button asChild className="rounded-xl">
                  <Link href="/give">Give to Church Mission</Link>
                </Button>
              </div>
            </GlassCard>
          )
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
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
                <GlassCard
                  key={project.id}
                  surface="strong"
                  padding="none"
                  className="overflow-hidden border border-border shadow-xl flex flex-col justify-between group transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div>
                    {/* Project Image or Sacred Fallback */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-midnight via-primary/20 to-gold/20">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gold/40">
                          <Target className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-bold text-foreground backdrop-blur-md border border-border">
                        {project.percent}% Funded
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-primary font-bold">{formattedRaised}</span>
                          <span className="text-muted-foreground font-normal">of {formattedGoal}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
                            style={{ width: `${Math.min(100, project.percent)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gold" />
                          <span>{project.contributionsCount} gifts received</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Target: {new Date(project.deadline).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex gap-2">
                    <Button asChild className="w-full rounded-xl bg-primary hover:brightness-110 text-white font-bold gap-1 text-xs">
                      <Link href={`/give?project=${project.id}`}>
                        <span>Support Project</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl text-xs font-semibold">
                      <Link href={`/projects/${project.slug}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
