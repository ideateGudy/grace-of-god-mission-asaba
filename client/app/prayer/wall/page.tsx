"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { PrayerWallItemDto } from "@ggm/types";
import {
  HeartHandshake,
  Plus,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function PrayerWallPage() {
  const [items, setItems] = useState<PrayerWallItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [prayedIds, setPrayedIds] = useState<Record<string, boolean>>({});
  const [prayingId, setPrayingId] = useState<string | null>(null);

  useEffect(() => {
    // Load local storage prayed state
    try {
      const stored = localStorage.getItem("gom_prayed_requests");
      if (stored) {
        setPrayedIds(JSON.parse(stored));
      }
    } catch {}

    api.prayerWall
      .list("?limit=30")
      .then(({ data }) => {
        if (data) setItems(data);
      })
      .catch(() => toast.error("Could not load prayer wall entries."))
      .finally(() => setLoading(false));
  }, []);

  const handlePray = async (id: string) => {
    if (prayedIds[id] || prayingId === id) return;

    setPrayingId(id);
    try {
      const res = await api.prayerWall.pray(id);
      const newCount = res.data?.prayedCount;

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, prayedCount: newCount ?? item.prayedCount + 1 } : item
        )
      );

      const nextPrayed = { ...prayedIds, [id]: true };
      setPrayedIds(nextPrayed);
      try {
        localStorage.setItem("gom_prayed_requests", JSON.stringify(nextPrayed));
      } catch {}

      toast.success("Thank you for standing in faith and agreeing in prayer! 🙏", {
        description: "Your prayer makes a difference in God's kingdom.",
      });
    } catch {
      toast.error("Failed to record prayer. Please try again.");
    } finally {
      setPrayingId(null);
    }
  };

  return (
    <PublicPageLayout
      title="Community Prayer Wall"
      description="Stand in agreement with brethren across our congregation. Every request here is anonymous, confidential, and covered in pastoral intercession."
      eyebrow="Intercession · Galatians 6:2"
    >
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Intro Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-6 md:p-8 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Anonymous & Pastoral Protected</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Lift One Another in Prayer
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              "Confess your faults one to another, and pray one for another, that ye may be healed. The effectual fervent prayer of a righteous man availeth much." — James 5:16
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-xl px-6 min-h-11 shadow-sm">
            <Link href="/prayer" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Submit a Prayer Request</span>
            </Link>
          </Button>
        </div>

        {/* Prayer Requests Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
            <p className="text-sm">Loading intercessory prayer wall...</p>
          </div>
        ) : items.length === 0 ? (
          <GlassCard surface="strong" padding="lg" className="text-center py-16 border border-dashed border-border shadow-sm">
            <HeartHandshake className="mx-auto h-12 w-12 text-primary/60 mb-3" />
            <h3 className="font-display text-xl font-bold text-foreground">The Prayer Wall Is Fresh</h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto">
              No approved requests are currently listed on the public wall. Submit your petition to be agreed upon by church intercessors.
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link href="/prayer">Post a Prayer Need</Link>
            </Button>
          </GlassCard>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              const hasPrayed = Boolean(prayedIds[item.id]);
              const dateStr = new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-3xl border border-border bg-card/80 p-6 shadow-xs backdrop-blur-md transition duration-300 hover:shadow-md hover:border-primary/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2.5">
                      <span className="font-semibold uppercase tracking-wider text-primary text-[11px] flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-gold" />
                        <span>Petition #{idx + 1}</span>
                      </span>
                      <span>{dateStr}</span>
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed italic whitespace-pre-line">
                      "{item.request}"
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <span className="text-base">🙏</span>
                      <span>
                        <strong className="text-foreground">{item.prayedCount}</strong>{" "}
                        {item.prayedCount === 1 ? "prayer" : "prayers"} offered
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={hasPrayed ? "secondary" : "outline"}
                      disabled={hasPrayed || prayingId === item.id}
                      onClick={() => handlePray(item.id)}
                      className={`rounded-xl text-xs font-semibold transition active:scale-95 ${
                        hasPrayed ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" : "hover:border-primary/50"
                      }`}
                    >
                      {prayingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : hasPrayed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                      ) : null}
                      <span>{hasPrayed ? "I Prayed" : "I Prayed For This"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
