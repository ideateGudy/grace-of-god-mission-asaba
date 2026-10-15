import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { siteConfig } from "@/config/site";
import { HandHeart, Sparkles, ShieldCheck, Heart, Building2, CheckCircle2 } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Giving | Grace of God Mission Asaba",
  description:
    "Kingdom giving, tithes, and offerings bank details for Grace of God Mission Asaba, Delta State.",
  alternates: { canonical: "/give" },
};

export default function GivePage() {
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
        {/* 1. Scripture & Purpose Card */}
        <GlassCard
          surface="strong"
          padding="lg"
          className="relative overflow-hidden border border-border shadow-xl bg-gradient-to-r from-gold/10 via-card to-card"
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

        {/* 2. Main 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Bank Transfer Details Card */}
          <GlassCard
            surface="strong"
            padding="lg"
            className="border border-border shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">
                Official Bank Transfer Details
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                You can make your transfers directly using our official church account below.
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-card p-6 space-y-5 shadow-xs">
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

                <div className="border-t border-border/60 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Account Name
                  </span>
                  <p className="mt-1 font-display text-lg font-bold text-foreground">
                    {siteConfig.accountName.startsWith("[")
                      ? "Grace of God Mission Asaba"
                      : siteConfig.accountName}
                  </p>
                </div>

                <div className="border-t border-border/60 pt-4">
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

            <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Online Card Giving Coming Soon</p>
              <p>
                Secure online payment integration via Paystack is currently in development for
                subsequent releases.
              </p>
            </div>
          </GlassCard>

          {/* Impact & Generosity Card */}
          <GlassCard
            surface="solid"
            padding="lg"
            className="border border-border shadow-xl space-y-6"
          >
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Heart className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Where Your Giving Goes</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Your generosity directly finances the work of ministry and blesses lives across our
                community.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Community & Welfare Outreach</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Supporting vulnerable members, widows, students, and families in Asaba.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Evangelism & Gospel Spread</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Funding church plant missions, crusades, literature distribution, and digital sermon broadcasting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Sanctuary Maintenance & Operations</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Sustaining facility operations, sound equipment, media production, and children's church supplies.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Security Note:</span> Please always verify
              account details with the church secretary or pastors before making transfers.
            </div>
          </GlassCard>
        </div>
      </div>
    </PublicPageLayout>
  );
}
