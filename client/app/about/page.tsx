import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission, vision, beliefs, and leadership of Grace of God Mission Asaba.",
  alternates: { canonical: "/about" },
};

export default function AboutUsPage() {
  const hasLeadership = siteConfig.leadership && siteConfig.leadership.length > 0;
  const hasBeliefs = siteConfig.beliefs && siteConfig.beliefs.length > 0;

  return (
    <PublicPageLayout
      title="About the Church"
      description="The story, faith, and leadership of Grace of God Mission Asaba."
    >
      <div className="space-y-8">
        <GlassCard surface="solid" padding="lg">
          <h2 className="font-display text-2xl font-semibold text-foreground">Our Story</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {siteConfig.story}
          </p>
          {!siteConfig.foundedYear.startsWith("[") && (
            <p className="mt-4 text-sm font-medium text-foreground">
              Founded: {siteConfig.foundedYear}
            </p>
          )}
        </GlassCard>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard surface="solid" padding="lg">
            <h2 className="font-display text-2xl font-semibold text-foreground">Our Mission</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {siteConfig.mission}
            </p>
          </GlassCard>

          <GlassCard surface="solid" padding="lg">
            <h2 className="font-display text-2xl font-semibold text-foreground">Our Vision</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {siteConfig.vision}
            </p>
          </GlassCard>
        </div>

        <GlassCard surface="solid" padding="lg">
          <h2 className="font-display text-2xl font-semibold text-foreground">What We Believe</h2>
          {hasBeliefs ? (
            <ul className="mt-4 list-disc pl-5 space-y-2 text-muted-foreground">
              {siteConfig.beliefs.map((belief, idx) => (
                <li key={idx} className="leading-relaxed">
                  {belief}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              [STATEMENT OF BELIEFS - CONFIRM WITH CHURCH]
            </p>
          )}
        </GlassCard>

        <GlassCard surface="solid" padding="lg">
          <h2 className="font-display text-2xl font-semibold text-foreground">Church Leadership</h2>
          {hasLeadership ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {siteConfig.leadership.map((leader, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-lg font-semibold text-foreground">{leader.name}</h3>
                  <p className="text-sm text-primary font-medium">{leader.title}</p>
                  {leader.bio && <p className="mt-2 text-sm text-muted-foreground">{leader.bio}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 leading-relaxed text-muted-foreground">
              [LEADERSHIP DETAILS - CONFIRM WITH CHURCH]
            </p>
          )}
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
