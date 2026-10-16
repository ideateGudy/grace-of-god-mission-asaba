import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { siteConfig } from "@/config/site";
import { HandHeart, Sparkles, ShieldCheck, Heart, Building2, CheckCircle2, CreditCard, ArrowRight } from "lucide-react";
import { OnlineGivingForm } from "@/components/giving/OnlineGivingForm";
import Link from "next/link";
import type { ProjectPublicSummary } from "@ggm/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Giving & Kingdom Stewardship | Grace of God Mission Asaba",
  description:
    "Secure online giving, tithes, freewill offerings, and church building project support for Grace of God Mission Asaba, Delta State.",
  alternates: { canonical: "/give" },
};

async function getActiveProjects(): Promise<ProjectPublicSummary[]> {
  try {
    const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}/api/v1/projects`, {
      next: { revalidate: 60, tags: ["projects"] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function GivePage({
  searchParams,
}: {
  searchParams?: Promise<{ project?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const projects = await getActiveProjects();
  const selectedProjectId = resolvedSearchParams?.project;

  const hasRealAccount =
    siteConfig.accountNumber &&
    !siteConfig.accountNumber.startsWith("[") &&
    siteConfig.accountNumber !== "";

  return (
    <PublicPageLayout
      title="Worship Through Giving"
      description="Honouring the Lord through tithes, freewill offerings, and kingdom partnership to advance the Gospel across Asaba and beyond."
      eyebrow="Kingdom Stewardship · Generosity"
    >
      <div className="space-y-12 max-w-5xl mx-auto">
        {/* 1. Scripture Banner */}
        <GlassCard
          surface="strong"
          padding="lg"
          className="relative overflow-hidden border border-border shadow-xl bg-gradient-to-r from-gold/15 via-card to-card"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/20 text-gold shadow-md">
              <HandHeart className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                “Every man according as he purposeth in his heart, so let him give; not grudgingly,
                or of necessity: for God loveth a cheerful giver.”
              </h2>
              <p className="text-sm font-semibold text-gold">2 Corinthians 9:7</p>
            </div>
          </div>
        </GlassCard>

        {/* 2. Main Giving Options: Online Paystack + Bank Transfer */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Online Paystack Giving (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <OnlineGivingForm projects={projects} defaultProjectId={selectedProjectId} />
          </div>

          {/* Right Column: Direct Bank Transfer Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard
              surface="strong"
              padding="lg"
              className="border border-border shadow-xl flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Official Bank Transfer
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Prefer direct electronic bank transfer from your banking app or USSD? Use our official church account below.
                </p>

                <div className="mt-6 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Bank Name
                    </span>
                    <p className="mt-1 font-display text-lg font-bold text-foreground">
                      {siteConfig.bankName.startsWith("[")
                        ? "Confirm with Church Office"
                        : siteConfig.bankName}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account Name
                    </span>
                    <p className="mt-1 font-display text-base font-bold text-foreground">
                      {siteConfig.accountName.startsWith("[")
                        ? "Grace of God Mission Asaba"
                        : siteConfig.accountName}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account Number
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-mono text-2xl font-black text-primary tracking-wide">
                        {hasRealAccount ? siteConfig.accountNumber : "Available upon request"}
                      </p>
                      {hasRealAccount && (
                        <CopyButton text={siteConfig.accountNumber} label="Account number" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note:</span> Please include your name or description (e.g., "Tithe", "Building Seed") in the transfer narration.
              </div>
            </GlassCard>

            {/* Link to Church Projects */}
            {projects.length > 0 && (
              <GlassCard surface="solid" padding="md" className="border border-border">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gold uppercase tracking-wider">Church Building & Missions</p>
                    <h4 className="font-display text-base font-bold text-foreground mt-0.5">Explore Active Projects</h4>
                  </div>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* 3. Where Your Giving Goes Section */}
        <GlassCard surface="solid" padding="lg" className="border border-border shadow-lg space-y-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Heart className="h-4 w-4" />
              <span>Kingdom Stewardship</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Where Your Giving Goes</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Your generosity directly finances the work of ministry, outreach to the vulnerable, and the physical expansion of God's sanctuary.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Community & Welfare</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Food relief, education grants, and urgent welfare assistance for vulnerable families in Asaba.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Evangelism & Crusades</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Community outreaches, city-wide praise conventions, youth missions, and gospel literature distribution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-foreground">Sanctuary Expansion</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Building projects, sanctuary improvements, media recording gear, and children's church facilities.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
