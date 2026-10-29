"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Sparkles, Wifi } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";

interface ServerWakingFallbackProps {
  /**
   * Title displayed on the card.
   * Defaults to "Connecting to Sanctuary Live Services..."
   */
  title?: string;
  /**
   * Explanatory text describing the cold-start wake up.
   */
  description?: string;
  /**
   * Route name or label to provide friendly context (e.g., "devotion", "sermons", "events").
   */
  resourceName?: string;
  /**
   * Optional children (such as skeletons or placeholder shapes) to render beneath or inside the card.
   */
  children?: React.ReactNode;
}

export function ServerWakingFallback({
  title = "Connecting to Sanctuary Live Services...",
  description = "Our cloud server is waking up from standby to load the latest updates. This usually completes in a few moments.",
  resourceName = "content",
  children,
}: ServerWakingFallbackProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // Tick every second to give the user dynamic reassurance that the system is active
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Auto-retry reload every 12 seconds in the background
    const autoRetry = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 12000);

    return () => {
      clearInterval(timer);
      clearInterval(autoRetry);
    };
  }, [router]);

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <GlassCard
        surface="strong"
        padding="lg"
        className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-card/90 to-card shadow-lg text-center py-10 px-6 sm:px-10"
      >
        {/* Ambient subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(217,164,65,0.12),transparent_70%)]"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner mb-4">
          <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold border border-gold/25 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sanctuary Cloud Waking Up</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          {title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleRetry}
            disabled={isPending}
            className="rounded-xl px-5 gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            <span>{isPending ? "Refreshing..." : "Check Now"}</span>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80 px-2">
            <Wifi className="h-3.5 w-3.5 text-primary/70 animate-pulse" />
            <span>Auto-syncing ({secondsElapsed}s elapsed)...</span>
          </div>
        </div>
      </GlassCard>

      {children}
    </div>
  );
}
