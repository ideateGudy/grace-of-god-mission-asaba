import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice | Grace of God Mission Asaba",
  description:
    "How Grace of God Mission Asaba handles personal data submitted through our contact and prayer request forms.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PublicPageLayout
      title="Privacy Notice"
      description="A plain-language overview of how personal information submitted through this website is handled with care and confidentiality."
      eyebrow="Data Protection · Nigeria Data Protection Act 2023"
    >
      <div className="max-w-4xl mx-auto">
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-8">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-200">
            <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="leading-relaxed">
              <strong>Draft for Church Review:</strong> The church administration must confirm its
              data controller contact, retention schedule, and internal fulfillment workflows before
              this notice is deemed final.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Information We Collect
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you submit a message through our Contact form, we receive your name, message, and
              any email address or phone number you choose to provide. When submitting a Prayer
              Request, your contact details are entirely optional. We only collect the details you
              freely share.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">How Information Is Used</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Contact information is strictly used to reply to your inquiries. Prayer requests are
              made available exclusively to authorized pastoral intercessors so they can agree with you
              in prayer. Administrative access is protected by strict role-based access control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">Storage & Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submitted messages are stored in our secure database and are visible only to authorized
              personnel. We retain messages only as long as necessary to address your request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground">Your Rights & Requests</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under the Nigeria Data Protection Act (NDPA) 2023, you have the right to request
              access to, correction of, or permanent deletion of your personal information from our
              records at any time. To make a request, please{" "}
              <Link href="/contact" className="font-semibold text-primary underline">
                contact the church office
              </Link>
              . You may also contact the Nigeria Data Protection Commission (NDPC).
            </p>
          </section>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
