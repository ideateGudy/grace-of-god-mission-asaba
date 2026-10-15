import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { CopyButton } from "@/components/shared/CopyButton";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Giving",
  description: "Giving information and bank details for Grace of God Mission Asaba.",
  alternates: { canonical: "/give" },
};

export default function GivePage() {
  const confirmed = !siteConfig.accountNumber.startsWith("[");
  return (
    <PublicPageLayout
      title="Giving"
      description="Thank you for supporting the work, ministry, and community outreach of Grace of God Mission Asaba."
    >
      <GlassCard surface="solid" padding="lg" className="max-w-2xl">
        <h2 className="font-display text-2xl font-semibold">Bank Transfer Details</h2>
        {confirmed ? (
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Bank Name</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-foreground">
                {siteConfig.bankName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Account Name</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-foreground">
                {siteConfig.accountName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Account Number</dt>
              <dd className="mt-1 flex items-center gap-3 font-mono text-xl font-semibold text-foreground">
                {siteConfig.accountNumber}
                <CopyButton text={siteConfig.accountNumber} label="Account number" />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Verified giving details are being confirmed by church leadership. Please contact the church office directly before making any transfer.
          </p>
        )}
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Online card payments are not active for Phase 1. Always confirm bank account details with church leadership before transferring funds.
        </p>
      </GlassCard>
    </PublicPageLayout>
  );
}
