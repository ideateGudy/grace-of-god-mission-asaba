"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function GiveThanksVerifier({
  reference,
  initialStatus,
}: {
  reference: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (initialStatus === "SUCCESS" || !reference) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/v1/giving/status/${encodeURIComponent(reference)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.status === "SUCCESS") {
            clearInterval(interval);
            router.refresh();
          }
        }
      } catch {}

      if (attempts >= 4) {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [reference, initialStatus, router]);

  const handleManualCheck = async () => {
    if (!reference) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/v1/giving/status/${encodeURIComponent(reference)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.status === "SUCCESS") {
          toast.success("Payment verified successfully!");
          router.refresh();
          return;
        }
      }
      toast.info("Transaction is still processing with Paystack. Please check again in a moment.");
    } catch {
      toast.error("Could not reach verification server.");
    } finally {
      setChecking(false);
    }
  };

  if (initialStatus === "SUCCESS") return null;

  return (
    <div className="pt-2">
      <Button
        variant="secondary"
        onClick={handleManualCheck}
        disabled={checking}
        className="gap-2 rounded-xl text-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
        <span>{checking ? "Verifying with Paystack…" : "Re-check Payment Status"}</span>
      </Button>
    </div>
  );
}
