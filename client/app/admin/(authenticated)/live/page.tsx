"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Radio, Save, Loader2, Tv, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import type { UpdateLivestreamDto } from "@ggm/types";

export default function AdminLivestreamPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateLivestreamDto>({
    isLive: false,
    liveTitle: "Sunday Celebration Service",
    liveServiceType: "Sunday Service",
    liveVideoUrl: "",
    liveNotes: "",
  });

  useEffect(() => {
    let cancelled = false;
    api.livestream
      .get()
      .then(({ data }) => {
        if (!cancelled && data) {
          setFormData({
            isLive: data.isLive ?? false,
            liveTitle: data.liveTitle || "Sunday Celebration Service",
            liveServiceType: data.liveServiceType || "Sunday Service",
            liveVideoUrl: data.liveVideoUrl || "",
            liveNotes: data.liveNotes || "",
          });
        }
      })
      .catch(() => toast.error("Unable to load livestream configuration."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.livestream.update({
        isLive: formData.isLive,
        liveTitle: formData.liveTitle?.trim() || "",
        liveServiceType: formData.liveServiceType?.trim() || "",
        liveVideoUrl: formData.liveVideoUrl?.trim() || "",
        liveNotes: formData.liveNotes?.trim() || "",
      });
      toast.success(
        formData.isLive
          ? "Livestream is now ACTIVE! Visitors will see the live broadcast."
          : "Livestream marked as offline."
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update livestream status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Livestream Management"
          description="Control real-time church video broadcasts, service outlines, and live status."
        />
        <div className="flex items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading livestream settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Livestream Control"
          description="Manage live video streaming, service types, and real-time notes for online worshippers."
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="self-start sm:self-auto gap-2"
        >
          <a href="/live" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            <span>Open Live Page</span>
          </a>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Master Live Toggle Card */}
        <GlassCard
          surface="solid"
          padding="lg"
          className={`border transition-colors ${
            formData.isLive ? "border-red-500/40 bg-red-500/5 shadow-md" : "border-border"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  formData.isLive
                    ? "bg-red-500 text-white animate-pulse shadow-md"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {formData.isLive ? "BROADCAST IS CURRENTLY LIVE" : "Broadcast Is Offline"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.isLive
                    ? "The live video player and 'Live Now' badge are visible across the public website."
                    : "Visitors will see the regular service schedule and sermon archives."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="live-toggle" className="text-sm font-semibold cursor-pointer">
                {formData.isLive ? "LIVE" : "OFFLINE"}
              </Label>
              <Switch
                id="live-toggle"
                checked={formData.isLive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isLive: checked }))
                }
              />
            </div>
          </div>
        </GlassCard>

        {/* Stream Details */}
        <GlassCard surface="solid" padding="lg" className="space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              <span>Broadcast Details & Source</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Provide the video stream link and service context.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liveTitle">Broadcast Title *</Label>
              <Input
                id="liveTitle"
                placeholder="e.g. Sunday Celebration & Miracle Encounter"
                value={formData.liveTitle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liveTitle: e.target.value }))
                }
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liveServiceType">Service Category</Label>
              <Input
                id="liveServiceType"
                placeholder="e.g. Sunday Service / Midweek Encounter / Convention"
                value={formData.liveServiceType || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liveServiceType: e.target.value }))
                }
                maxLength={120}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="liveVideoUrl">
                Live Stream URL (YouTube or Facebook Live)
              </Label>
              <Input
                id="liveVideoUrl"
                type="text"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
                value={formData.liveVideoUrl || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liveVideoUrl: e.target.value }))
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Paste any standard YouTube watch, live, or embed link, or a Facebook video URL.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="liveNotes">Live Service Notes & Scriptures</Label>
              <Textarea
                id="liveNotes"
                placeholder="Key sermon scriptures, announcements, or prayer points for online worshippers..."
                value={formData.liveNotes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, liveNotes: e.target.value }))
                }
                rows={4}
                maxLength={5000}
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} className="min-w-36 h-11">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
