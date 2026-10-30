import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { ShieldCheck, BookOpen, HeartHandshake, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Grace of God Mission Asaba",
  description:
    "Official terms and conditions for utilizing the digital services, live broadcasts, and donation facilities of Grace of God Mission Asaba.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const lastUpdated = "30 October 2026";

  return (
    <PublicPageLayout
      title="Terms of Service"
      description="Guidelines and terms governing your use of the website, digital portals, media broadcasts, and donation channels of Grace of God Mission Asaba."
      eyebrow="Legal & Governance · General Terms"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-6 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Grace of God Mission Asaba</p>
              <p>Incorporated under Nigerian Law · Delta State, Nigeria</p>
            </div>
            <div className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-semibold text-primary">
              Last Updated: {lastUpdated}
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing, browsing, or utilizing the web services, live broadcasts, devotionals, and giving portals provided by Grace of God Mission Asaba (&quot;the Church&quot;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service and our accompanying{" "}
              <Link href="/privacy" className="text-primary underline font-medium">
                Privacy Notice
              </Link>
              . If you do not agree with any part of these terms, please refrain from using our platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">2. Purpose of Ministry Platforms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our website is provided to advance the Gospel of Jesus Christ, provide spiritual nourishment through daily devotionals and sermons, facilitate church event coordination, and connect the congregation and the wider public in Asaba, Delta State, and worldwide.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">3. Online Giving &amp; Financial Stewardship</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tithes, offerings, building pledges, and donations made via our website represent voluntary freewill gifts in support of the Church&apos;s charitable, ministerial, and community development missions.
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
              <li>All electronic payments are processed securely through licensed payment gateway partners (Paystack Payments Limited), which adhere to PCI-DSS Level 1 compliance.</li>
              <li>Donations are non-refundable once successfully processed, except in proven cases of technical duplicate billing or administrative error, upon written request within 14 days to the church office.</li>
              <li>The Church issues official automated transaction receipts for digital contributions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">4. User Conduct &amp; Submissions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When submitting contact requests, praise reports (testimonies), or prayer petitions:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>You agree to provide true, accurate, and non-defamatory information.</li>
              <li>You agree not to submit offensive, blasphemous, fraudulent, obscene, or abusive content.</li>
              <li>You confirm that you are at least 18 years of age or submitting under parental guidance.</li>
              <li>Testimonies submitted for the public wall are subject to pastoral review and moderation before publication. The Church reserves the right to edit for clarity or decline publication at its pastoral discretion.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">5. Intellectual Property &amp; Media Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All sermons, video recordings, audio tracks, written daily devotionals, logos, and graphic materials hosted on this platform are the property of Grace of God Mission Asaba, unless otherwise cited. Content is provided for personal spiritual edification and non-commercial fellowship sharing. Unauthorised commercial exploitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">6. Governing Law &amp; Jurisdiction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Companies and Allied Matters Act (CAMA) and the Nigeria Data Protection Act (NDPA) 2023. Any disputes arising in connection with these terms shall be subject to amicable ecclesiastical and arbitration resolution before competent courts in Delta State, Nigeria.
            </p>
          </section>

          <section className="space-y-3 border-t border-border/70 pt-6">
            <h2 className="font-display text-xl font-bold text-foreground">7. Contact Information</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For questions regarding these Terms of Service, please reach out to the Church Office:
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Grace of God Mission Asaba</strong><br />
              33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State, Nigeria<br />
              Email: <a href="mailto:info@ggmasaba.org" className="text-primary underline">info@ggmasaba.org</a> · Phone: +234 907 560 2319
            </p>
          </section>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
