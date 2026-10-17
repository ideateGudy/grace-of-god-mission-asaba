"use client";

import { useState, useRef, useEffect } from "react";
import {
  Palette,
  Download,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Square,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  MapPin,
  User,
  Quote,
  Share2,
  BookOpen,
  Church,
  Flame,
  CheckCircle2,
  Loader2,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  type FlyerData,
  type FlyerAspectRatio,
  type FlyerTemplateId,
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
  DEFAULT_PRESETS,
} from "@/lib/flyer/flyer-types";
import { FlyerRenderer } from "@/lib/flyer/flyer-renderer";
import {
  downloadFlyerPng,
  downloadFlyerJpeg,
  copyFlyerToClipboard,
} from "@/lib/flyer/flyer-export";
import { authFetch } from "@/lib/api/client";
import type { DevotionDto } from "@ggm/types";

export function FlyerStudio({
  initialDevotionDate,
}: {
  initialDevotionDate?: string;
}) {
  const [data, setData] = useState<FlyerData>(() => ({
    templateId: "royal-gold",
    aspectRatio: "square",
    churchName: "GRACE OF GOD MISSION ASABA",
    category: "SUNDAY CELEBRATION SERVICE",
    title: "SUPERNATURAL BREAKTHROUGH & UNSTOPPABLE FAVOUR",
    subtitle: "Come experience the tangible presence of God and step into your ordained season of victory.",
    scriptureRef: "ISAIAH 60:1",
    scriptureText: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    date: "SUNDAY, 25TH OCTOBER 2026",
    time: "8:00 AM & 10:00 AM (2 POWER SERVICES)",
    venue: "Auditorium of Grace, 12 Jesus Saves Road, Asaba, Delta State",
    minister: "HOST: PASTOR CHUKWUDI EZE",
    guestMinister: "",
    badgeText: "ANOINTING & MIRACLE BANQUET",
    broadcastBadge: "LIVE STREAMING ON YOUTUBE & FACEBOOK",
    showChurchLogo: true,
  }));

  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncingDevotion, setSyncingDevotion] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"content" | "style" | "logistics">("content");

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync from scheduled devotions if requested
  useEffect(() => {
    if (!initialDevotionDate) return;

    async function fetchDevotion() {
      setSyncingDevotion(true);
      try {
        const res = await authFetch("/api/v1/admin/devotions", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const devotions: DevotionDto[] = json.data ?? [];
        const match = devotions.find((d) => d.date === initialDevotionDate);

        if (match) {
          setData((prev) => ({
            ...prev,
            templateId: "emerald-grace",
            category: "DAILY GRACE DEVOTIONAL",
            title: match.title.toUpperCase(),
            subtitle: match.content.slice(0, 140) + "...",
            scriptureRef: match.scriptureRef,
            scriptureText: match.scriptureText,
            date: `DEVOTION · ${match.date}`,
            time: "DAILY SCRIPTURE & REFLECTION",
            badgeText: "VERSE OF THE DAY",
            broadcastBadge: "READ MORE AT GGMASABA.ORG/DEVOTION",
          }));
          toast.success(`Loaded devotion data for ${match.date}`);
        }
      } catch {
        // silent fallback
      } finally {
        setSyncingDevotion(false);
      }
    }

    void fetchDevotion();
  }, [initialDevotionDate]);

  const handleApplyPreset = (presetId: string) => {
    const preset = DEFAULT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setData((prev) => ({
      ...prev,
      ...preset.data,
    }));
    toast.success(`Applied template preset: ${preset.name}`);
  };

  const handleImportTodayDevotion = async () => {
    setSyncingDevotion(true);
    try {
      const res = await authFetch("/api/v1/admin/devotions", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not fetch devotions.");
      const json = await res.json();
      const devotions: DevotionDto[] = json.data ?? [];

      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Lagos",
      }).format(new Date());

      const todayDevotion =
        devotions.find((d) => d.date === todayStr) || devotions[0];

      if (!todayDevotion) {
        toast.error("No devotion found to import.");
        return;
      }

      setData((prev) => ({
        ...prev,
        templateId: "emerald-grace",
        category: "DAILY GRACE DEVOTIONAL",
        title: todayDevotion.title.toUpperCase(),
        subtitle: todayDevotion.content.slice(0, 150) + "...",
        scriptureRef: todayDevotion.scriptureRef,
        scriptureText: todayDevotion.scriptureText,
        date: `DAILY GRACE · ${todayDevotion.date}`,
        time: "DAILY INSPIRATION & PRAYER",
        badgeText: "VERSE OF THE DAY",
        broadcastBadge: "READ MORE: GGMASABA.ORG/DEVOTION",
      }));

      toast.success(`Loaded devotion for ${todayDevotion.date}: "${todayDevotion.title}"`);
    } catch {
      toast.error("Failed to load devotion data.");
    } finally {
      setSyncingDevotion(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!svgRef.current) return;
    setDownloading(true);
    try {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      await downloadFlyerPng(svgRef.current, `ggm-flyer-${slug}.png`, 1);
      toast.success("Flyer downloaded successfully in high resolution (PNG).");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to download flyer.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadJpeg = async () => {
    if (!svgRef.current) return;
    setDownloading(true);
    try {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      await downloadFlyerJpeg(svgRef.current, `ggm-flyer-${slug}.jpg`, 0.95);
      toast.success("WhatsApp Status flyer downloaded (JPEG).");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to download flyer.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!svgRef.current) return;
    try {
      await copyFlyerToClipboard(svgRef.current);
      setCopied(true);
      toast.success("Flyer copied to clipboard! You can now paste directly into WhatsApp or Telegram.");
      setTimeout(() => setCopied(false), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Clipboard copy is not supported in your browser.");
    }
  };

  const activeDimensions = FLYER_DIMENSIONS[data.aspectRatio];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Church Flyer Studio
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-bold text-gold border border-gold/30">
              <Sparkles className="w-3 h-3" />
              <span>Automated Graphics Engine</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Create high-resolution church service flyers, miracle night promos, and daily devotional cards automatically without AI.
          </p>
        </div>

        {/* 1-Click Sync Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImportTodayDevotion}
            disabled={syncingDevotion}
            className="text-xs gap-1.5 rounded-xl border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
          >
            {syncingDevotion ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
            <span>Import Today&apos;s Devotion</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleApplyPreset("sunday-service")}
            className="text-xs gap-1.5 rounded-xl border-gold/40 text-gold hover:bg-gold/10"
          >
            <Church className="w-3.5 h-3.5" />
            <span>Reset to Sunday Service</span>
          </Button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-muted-foreground shrink-0 flex items-center gap-1 pl-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Presets:</span>
        </span>
        {DEFAULT_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleApplyPreset(p.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/30 hover:bg-muted/70 text-foreground border border-border/60 shrink-0 transition flex items-center gap-1.5 shadow-2xs"
          >
            {p.id === "sunday-service" && <Church className="w-3.5 h-3.5 text-gold" />}
            {p.id === "miracle-vigil" && <Flame className="w-3.5 h-3.5 text-amber-500" />}
            {p.id === "daily-devotion" && <BookOpen className="w-3.5 h-3.5 text-emerald-500" />}
            {p.id === "youth-awakening" && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            {p.id === "midweek-service" && <Calendar className="w-3.5 h-3.5 text-primary" />}
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Split Workspace */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Editor Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Aspect Ratio Selector */}
          <GlassCard surface="solid" padding="md" className="space-y-3">
            <span className="text-xs font-bold text-foreground block">
              1. Choose Format & Aspect Ratio
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "square",
                  label: "Square (1:1)",
                  sub: "1080 × 1080 px",
                  icon: Square,
                },
                {
                  id: "story",
                  label: "Story (9:16)",
                  sub: "1080 × 1920 px",
                  icon: Smartphone,
                },
                {
                  id: "landscape",
                  label: "Screen (16:9)",
                  sub: "1920 × 1080 px",
                  icon: Monitor,
                },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = data.aspectRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      setData((p) => ({ ...p, aspectRatio: r.id as FlyerAspectRatio }))
                    }
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                        : "bg-muted/10 border-border/60 text-muted-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{r.label}</span>
                    <span className="text-[10px] opacity-75">{r.sub}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* 2. Visual Graphic Template Selector */}
          <GlassCard surface="solid" padding="md" className="space-y-3">
            <span className="text-xs font-bold text-foreground block">
              2. Select Sacred Graphic Archetype
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(FLYER_TEMPLATES) as FlyerTemplateId[]).map((tId) => {
                const t = FLYER_TEMPLATES[tId];
                const isSelected = data.templateId === tId;
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => setData((p) => ({ ...p, templateId: tId }))}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-2 relative overflow-hidden ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                        : "border-border/60 bg-muted/10 hover:border-border"
                    }`}
                  >
                    <div
                      className="w-full h-10 rounded-lg flex items-center justify-center p-1 relative overflow-hidden shadow-inner"
                      style={{ background: t.bgGradient }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: t.primaryAccent }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full ml-1"
                        style={{ backgroundColor: t.secondaryAccent }}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block line-clamp-1">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {t.tagline}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* 3. Content Details Accordion Tabs */}
          <GlassCard surface="solid" padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold text-foreground">
                3. Customize Dynamic Content
              </span>
              <div className="flex items-center gap-1">
                {(["content", "style", "logistics"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB: CONTENT */}
            {activeTab === "content" && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="space-y-1">
                  <Label htmlFor="fl-category" className="text-xs">Program Category / Tag</Label>
                  <Input
                    id="fl-category"
                    placeholder="e.g. SUNDAY CELEBRATION SERVICE"
                    value={data.category}
                    onChange={(e) => setData((p) => ({ ...p, category: e.target.value }))}
                    className="text-xs h-9"
                    maxLength={60}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-title" className="text-xs">Theme / Main Headline *</Label>
                  <Textarea
                    id="fl-title"
                    placeholder="e.g. SUPERNATURAL BREAKTHROUGH & DIVINE FAVOUR"
                    value={data.title}
                    onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
                    rows={2}
                    className="text-xs font-bold"
                    maxLength={140}
                  />
                  <p className="text-[10px] text-muted-foreground">Automatically scales and wraps across lines.</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-subtitle" className="text-xs">Subtitle / Expansion (Optional)</Label>
                  <Textarea
                    id="fl-subtitle"
                    placeholder="e.g. Come experience the tangible presence of God and step into your season of overflow."
                    value={data.subtitle}
                    onChange={(e) => setData((p) => ({ ...p, subtitle: e.target.value }))}
                    rows={2}
                    className="text-xs"
                    maxLength={200}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="fl-scref" className="text-xs">Scripture Reference</Label>
                    <Input
                      id="fl-scref"
                      placeholder="e.g. ISAIAH 60:1"
                      value={data.scriptureRef}
                      onChange={(e) => setData((p) => ({ ...p, scriptureRef: e.target.value }))}
                      className="text-xs h-9"
                      maxLength={60}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fl-badge" className="text-xs">Special Highlight Badge</Label>
                    <Input
                      id="fl-badge"
                      placeholder="e.g. ANOINTING SERVICE"
                      value={data.badgeText}
                      onChange={(e) => setData((p) => ({ ...p, badgeText: e.target.value }))}
                      className="text-xs h-9"
                      maxLength={60}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-sctext" className="text-xs">Theme Scripture Verse</Label>
                  <Textarea
                    id="fl-sctext"
                    placeholder='e.g. "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee."'
                    value={data.scriptureText}
                    onChange={(e) => setData((p) => ({ ...p, scriptureText: e.target.value }))}
                    rows={2}
                    className="text-xs italic"
                    maxLength={250}
                  />
                </div>
              </div>
            )}

            {/* TAB: LOGISTICS */}
            {activeTab === "logistics" && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="fl-date" className="text-xs">Date *</Label>
                    <Input
                      id="fl-date"
                      placeholder="e.g. SUNDAY, 25TH OCTOBER 2026"
                      value={data.date}
                      onChange={(e) => setData((p) => ({ ...p, date: e.target.value }))}
                      className="text-xs h-9 font-semibold"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fl-time" className="text-xs">Time *</Label>
                    <Input
                      id="fl-time"
                      placeholder="e.g. 8:00 AM & 10:00 AM"
                      value={data.time}
                      onChange={(e) => setData((p) => ({ ...p, time: e.target.value }))}
                      className="text-xs h-9 font-semibold"
                      maxLength={80}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-venue" className="text-xs">Venue & Location</Label>
                  <Input
                    id="fl-venue"
                    placeholder="e.g. Auditorium of Grace, 12 Jesus Saves Road, Asaba"
                    value={data.venue}
                    onChange={(e) => setData((p) => ({ ...p, venue: e.target.value }))}
                    className="text-xs h-9"
                    maxLength={120}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="fl-minister" className="text-xs">Host Minister</Label>
                    <Input
                      id="fl-minister"
                      placeholder="e.g. HOST: PASTOR CHUKWUDI EZE"
                      value={data.minister}
                      onChange={(e) => setData((p) => ({ ...p, minister: e.target.value }))}
                      className="text-xs h-9 font-semibold"
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fl-guest" className="text-xs">Guest Minister (Optional)</Label>
                    <Input
                      id="fl-guest"
                      placeholder="e.g. GUEST: APOSTLE EMMANUEL OKONKWO"
                      value={data.guestMinister}
                      onChange={(e) => setData((p) => ({ ...p, guestMinister: e.target.value }))}
                      className="text-xs h-9"
                      maxLength={80}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-broadcast" className="text-xs">Broadcast / Livestream Pill</Label>
                  <Input
                    id="fl-broadcast"
                    placeholder="e.g. LIVE STREAMING ON YOUTUBE & FACEBOOK"
                    value={data.broadcastBadge}
                    onChange={(e) => setData((p) => ({ ...p, broadcastBadge: e.target.value }))}
                    className="text-xs h-9"
                    maxLength={80}
                  />
                </div>
              </div>
            )}

            {/* TAB: STYLE */}
            {activeTab === "style" && (
              <div className="space-y-3.5 animate-in fade-in">
                <div className="space-y-1">
                  <Label htmlFor="fl-church" className="text-xs">Church Name Header</Label>
                  <Input
                    id="fl-church"
                    value={data.churchName}
                    onChange={(e) => setData((p) => ({ ...p, churchName: e.target.value }))}
                    className="text-xs h-9 font-bold"
                    maxLength={80}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/10">
                  <div>
                    <Label htmlFor="show-logo" className="text-xs font-semibold cursor-pointer">
                      Display Sacred Cross Crest
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Renders the golden cross emblem in the top branding row.
                    </p>
                  </div>
                  <Switch
                    id="show-logo"
                    checked={data.showChurchLogo}
                    onCheckedChange={(checked) =>
                      setData((p) => ({ ...p, showChurchLogo: checked }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fl-photo" className="text-xs">Speaker Photo URL (Optional)</Label>
                  <Input
                    id="fl-photo"
                    placeholder="https://... image URL for circular halo portrait"
                    value={data.speakerPhotoUrl || ""}
                    onChange={(e) => setData((p) => ({ ...p, speakerPhotoUrl: e.target.value }))}
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Paste an image URL to frame the minister in an illuminated golden halo.
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Live Preview & Export Toolbar */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-4">
          <GlassCard surface="strong" padding="md" className="space-y-3">
            {/* Preview Header & Zoom Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Live Visual Preview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-bold border border-gold/25">
                  {activeDimensions.label}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {activeDimensions.width} × {activeDimensions.height} px
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {[0.6, 0.8, 1].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setZoomLevel(scale)}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                      zoomLevel === scale
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {Math.round(scale * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Flyer Graphic Stage Container */}
            <div className="flex items-center justify-center p-3 sm:p-5 bg-black/40 rounded-2xl border border-border/50 overflow-hidden min-h-[420px]">
              <div
                style={{
                  maxWidth: data.aspectRatio === "story" ? "340px" : data.aspectRatio === "landscape" ? "540px" : "420px",
                  width: "100%",
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                }}
                className="shadow-2xl rounded-2xl overflow-hidden border border-border/70"
              >
                <FlyerRenderer data={data} svgRef={svgRef} />
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyClipboard}
                  className="rounded-xl text-xs gap-1.5 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Image!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-primary" />
                      <span>Copy Image</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadJpeg}
                  disabled={downloading}
                  className="rounded-xl text-xs gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-secondary-foreground" />
                  <span>JPEG (WhatsApp)</span>
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloading}
                className="rounded-xl text-xs gap-2 font-bold bg-gold hover:bg-gold/90 text-black shadow-md"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download High-Res PNG</span>
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
