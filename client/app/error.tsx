"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console or error tracking service in production
    console.error("[APP_ROUTE_ERROR]", error);
  }, [error]);

  return (
    <div className="relative isolate flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 bg-midnight text-white">
      {/* Sacred ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_10%,rgba(217,164,65,0.15),transparent_70%)]"
      />

      <div className="mx-auto w-full max-w-xl text-center">
        <GlassCard
          surface="strong"
          padding="lg"
          className="border border-white/10 shadow-2xl backdrop-blur-xl bg-midnight/80 text-white"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
            Grace of God Mission Asaba
          </span>

          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Something went unexpectedly wrong
          </h1>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            We apologize for the inconvenience. A temporary glitch occurred while loading this page.
            Our technical team has been notified.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-[11px] text-slate-400">
              Reference Code: <span className="text-gold font-bold">{error.digest}</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-6 text-sm font-bold text-midnight shadow-md hover:brightness-110 active:scale-95 transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </Button>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 transition active:scale-95"
            >
              <Home className="h-4 w-4" />
              <span>Return home</span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Contact office</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
