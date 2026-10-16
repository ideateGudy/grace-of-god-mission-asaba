import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Heart, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { GiveThanksVerifier } from "@/components/giving/GiveThanksVerifier";

export const metadata: Metadata = {
  title: "Thank You for Giving | Grace of God Mission Asaba",
  description: "Official confirmation and receipt for your giving to Grace of God Mission Asaba.",
};

interface VerifyResult {
  status: "SUCCESS" | "PENDING" | "FAILED";
  reference: string;
  amountKobo: string;
  projectTitle: string;
  displayName: string;
  createdAt: string;
}

async function verifyGiving(reference: string): Promise<VerifyResult | null> {
  try {
    const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${base}/api/v1/giving/status/${encodeURIComponent(reference)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function GiveThanksPage({
  searchParams,
}: {
  searchParams?: Promise<{ reference?: string | string[]; trxref?: string | string[]; mock?: string }>;
}) {
  const resolved = searchParams ? await searchParams : {};
  let rawRef: string | string[] = resolved.reference || resolved.trxref || "";
  if (Array.isArray(rawRef)) {
    rawRef = rawRef[0] || "";
  } else if (typeof rawRef === "string" && rawRef.includes(",")) {
    rawRef = rawRef.split(",")[0] || "";
  }
  const ref = (rawRef as string).trim();
  const result = ref ? await verifyGiving(ref) : null;

  const isSuccess = result?.status === "SUCCESS";
  const isPending = result?.status === "PENDING";
  const amountNaira = result ? (Number(result.amountKobo) / 100).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }) : "₦0";

  return (
    <PublicPageLayout
      title="Thank You for Your Generosity"
      description="“Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.” — Luke 6:38"
      eyebrow="Giving Confirmation · Covenant Blessing"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-2xl text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSuccess ? (
              <div className="h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shadow-lg ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : isPending ? (
              <div className="h-20 w-20 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center shadow-lg ring-8 ring-amber-500/10">
                <Clock className="h-10 w-10" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shadow-lg ring-8 ring-destructive/10">
                <AlertCircle className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {isSuccess
                ? "Payment Received with Gratitude"
                : isPending
                ? "Payment Processing"
                : "Transaction Verification"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {isSuccess
                ? "Your freewill gift has been securely received by Grace of God Mission Asaba. May the Lord multiply your seeds sown."
                : isPending
                ? "We are verifying your transaction with Paystack. Your receipt will be confirmed momentarily."
                : "We could not automatically verify this payment reference. If your account was debited, our church administration team will reconcile your receipt."}
            </p>
            <GiveThanksVerifier reference={ref} initialStatus={result?.status} />
          </div>

          {/* Receipt Summary Details */}
          {result && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3.5 text-left text-xs shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/70">
                <span className="font-semibold text-muted-foreground">Amount</span>
                <span className="font-mono text-xl font-black text-primary">{amountNaira}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Target Fund</span>
                <span className="font-medium text-foreground">{result.projectTitle}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Donor Name</span>
                <span className="font-medium text-foreground">{result.displayName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Transaction Ref</span>
                <span className="font-mono text-[11px] text-muted-foreground">{result.reference}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Status</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                    isSuccess
                      ? "bg-emerald-500/10 text-emerald-600"
                      : isPending
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {result.status}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto rounded-xl gap-2 bg-primary hover:brightness-110 text-white">
              <Link href="/projects">
                <span>View Church Projects</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}
