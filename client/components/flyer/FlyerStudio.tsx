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
  Layers,
  ImagePlus,
  Move,
  Trash2,
  CopyPlus,
  Crosshair,
  Blend,
  Maximize2,
  Crown,
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
  type FlyerImageLayer,
  type LayerBlendMode,
  type LayerMaskShape,
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
import { getChurchLogoDataUrl } from "@/lib/flyer/church-logo";
import { CURATED_ASSETS, type CuratedAsset } from "@/lib/flyer/flyer-assets";
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
    layers: [],
  }));

  const [logoDataUrl, setLogoDataUrl] = useState<string>("/ggm_logo.png");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncingDevotion, setSyncingDevotion] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"content" | "design" | "logistics" | "style">("content");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isDraggingFileOver, setIsDraggingFileOver] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draggingLayerRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    initialLayerX: number;
    initialLayerY: number;
  } | null>(null);

  // Load official church logo base64 on mount for seamless zero-taint canvas export
  useEffect(() => {
    void getChurchLogoDataUrl().then((url) => {
      if (url) setLogoDataUrl(url);
    });
  }, []);

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

  // -------------------------------------------------------------
  // CUSTOM IMAGE LAYERS & BASIC DESIGN TOOLS HANDLERS
  // -------------------------------------------------------------
  const addImageFileAsLayer = (file: File, targetX?: number, targetY?: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please drop or upload a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const currentDim = FLYER_DIMENSIONS[data.aspectRatio];
      const defaultWidth = 440;
      const defaultHeight = 440;
      const defaultX = targetX !== undefined ? targetX - defaultWidth / 2 : Math.round((currentDim.width - defaultWidth) / 2);
      const defaultY = targetY !== undefined ? targetY - defaultHeight / 2 : Math.round((currentDim.height - defaultHeight) / 2);

      const layerId = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newLayer: FlyerImageLayer = {
        id: layerId,
        name: file.name.replace(/\.[^/.]+$/, "").slice(0, 24) || "Custom Image",
        url,
        x: Math.max(10, Math.round(defaultX)),
        y: Math.max(10, Math.round(defaultY)),
        width: defaultWidth,
        height: defaultHeight,
        rotation: 0,
        opacity: 0.95,
        blendMode: "normal",
        maskShape: "feathered",
      };

      setData((prev) => ({
        ...prev,
        layers: [...(prev.layers || []), newLayer],
      }));
      setSelectedLayerId(layerId);
      setActiveTab("design");
      toast.success(`Added layer "${newLayer.name}". Drag to move or adjust blend modes!`);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCuratedAsset = (asset: CuratedAsset) => {
    const currentDim = FLYER_DIMENSIONS[data.aspectRatio];
    const layerId = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newLayer: FlyerImageLayer = {
      id: layerId,
      name: asset.name,
      url: asset.url,
      x: Math.round((currentDim.width - asset.defaultWidth) / 2),
      y: Math.round((currentDim.height - asset.defaultHeight) / 2),
      width: asset.defaultWidth,
      height: asset.defaultHeight,
      rotation: 0,
      opacity: asset.defaultOpacity,
      blendMode: asset.defaultBlendMode,
      maskShape: asset.defaultMaskShape,
    };

    setData((prev) => ({
      ...prev,
      layers: [...(prev.layers || []), newLayer],
    }));
    setSelectedLayerId(layerId);
    setActiveTab("design");
    toast.success(`Added ${asset.name} with ${asset.defaultBlendMode.toUpperCase()} blend!`);
  };

  const handleLayerPointerDown = (e: React.PointerEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLayerId(layerId);

    const layer = data.layers?.find((l) => l.id === layerId);
    if (!layer || layer.locked) return;

    draggingLayerRef.current = {
      layerId,
      startX: e.clientX,
      startY: e.clientY,
      initialLayerX: layer.x,
      initialLayerY: layer.y,
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!draggingLayerRef.current || !svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      if (!svgRect.width || !svgRect.height) return;

      const currentDim = FLYER_DIMENSIONS[data.aspectRatio];
      const scaleX = currentDim.width / svgRect.width;
      const scaleY = currentDim.height / svgRect.height;

      const deltaX = (moveEvt.clientX - draggingLayerRef.current.startX) * scaleX;
      const deltaY = (moveEvt.clientY - draggingLayerRef.current.startY) * scaleY;

      const newX = Math.round(draggingLayerRef.current.initialLayerX + deltaX);
      const newY = Math.round(draggingLayerRef.current.initialLayerY + deltaY);

      setData((prev) => ({
        ...prev,
        layers: prev.layers?.map((l) =>
          l.id === layerId ? { ...l, x: newX, y: newY } : l
        ),
      }));
    };

    const handlePointerUp = () => {
      draggingLayerRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFileOver) setIsDraggingFileOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) {
      toast.error("Please drop an image file (PNG, JPG, WebP, SVG).");
      return;
    }

    const svgRect = svgRef.current?.getBoundingClientRect();
    const currentDim = FLYER_DIMENSIONS[data.aspectRatio];
    let dropX = currentDim.width / 2;
    let dropY = currentDim.height / 2;

    if (svgRect && svgRect.width > 0 && svgRect.height > 0) {
      const relX = (e.clientX - svgRect.left) / svgRect.width;
      const relY = (e.clientY - svgRect.top) / svgRect.height;
      dropX = Math.round(relX * currentDim.width);
      dropY = Math.round(relY * currentDim.height);
    }

    for (const file of files) {
      addImageFileAsLayer(file, dropX, dropY);
    }
  };

  const updateSelectedLayer = (updates: Partial<FlyerImageLayer>) => {
    if (!selectedLayerId) return;
    setData((prev) => ({
      ...prev,
      layers: prev.layers?.map((l) =>
        l.id === selectedLayerId ? { ...l, ...updates } : l
      ),
    }));
  };

  const handleDeleteLayer = (layerId: string) => {
    setData((prev) => ({
      ...prev,
      layers: prev.layers?.filter((l) => l.id !== layerId),
    }));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
    toast.success("Layer removed from flyer.");
  };

  const handleDuplicateLayer = (layerId: string) => {
    const existing = data.layers?.find((l) => l.id === layerId);
    if (!existing) return;

    const dupId = `layer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const duplicated: FlyerImageLayer = {
      ...existing,
      id: dupId,
      name: `${existing.name} (Copy)`,
      x: existing.x + 40,
      y: existing.y + 40,
    };

    setData((prev) => ({
      ...prev,
      layers: [...(prev.layers || []), duplicated],
    }));
    setSelectedLayerId(dupId);
    toast.success("Layer duplicated.");
  };

  const handleCenterLayer = (layerId: string) => {
    const currentDim = FLYER_DIMENSIONS[data.aspectRatio];
    setData((prev) => ({
      ...prev,
      layers: prev.layers?.map((l) =>
        l.id === layerId
          ? {
              ...l,
              x: Math.round((currentDim.width - l.width) / 2),
              y: Math.round((currentDim.height - l.height) / 2),
            }
          : l
      ),
    }));
    toast.success("Layer centered on flyer.");
  };

  const handleReorderLayer = (layerId: string, direction: "up" | "down") => {
    const currentLayers = [...(data.layers || [])];
    const idx = currentLayers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;

    if (direction === "up" && idx < currentLayers.length - 1) {
      const temp = currentLayers[idx];
      currentLayers[idx] = currentLayers[idx + 1];
      currentLayers[idx + 1] = temp;
    } else if (direction === "down" && idx > 0) {
      const temp = currentLayers[idx];
      currentLayers[idx] = currentLayers[idx - 1];
      currentLayers[idx - 1] = temp;
    }

    setData((prev) => ({ ...prev, layers: currentLayers }));
  };

  const selectedLayer = data.layers?.find((l) => l.id === selectedLayerId);

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
            {p.id === "word-of-the-month" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            {p.id === "word-of-the-month-exceeding" && <Crown className="w-3.5 h-3.5 text-purple-400" />}
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
                {(["content", "design", "logistics", "style"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition flex items-center gap-1 ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{tab === "design" ? "Layers & Blend" : tab}</span>
                    {tab === "design" && data.layers && data.layers.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-primary-foreground text-primary text-[10px] font-extrabold flex items-center justify-center">
                        {data.layers.length}
                      </span>
                    )}
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

            {/* TAB: DESIGN & BLEND */}
            {activeTab === "design" && (
              <div className="space-y-4 animate-in fade-in">
                {/* Hidden File Input for Image Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      addImageFileAsLayer(file);
                      e.target.value = "";
                    }
                  }}
                />

                {/* Upload or Drop Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-xs gap-2 rounded-xl border-dashed border-primary/50 hover:bg-primary/5 h-10"
                    >
                      <ImagePlus className="w-4 h-4 text-primary" />
                      <span>Upload Photo / Graphic Layer</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    💡 You can also drag & drop any image file directly onto the flyer canvas preview!
                  </p>
                </div>

                {/* Curated Sacred Graphic Asset Additions */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Quick Curated Assets:</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Add with blend presets</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CURATED_ASSETS.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => handleAddCuratedAsset(asset)}
                        className="p-2 rounded-xl border border-border/70 bg-muted/15 hover:bg-muted/40 transition flex items-center gap-2 text-left"
                      >
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-7 h-7 rounded-lg object-contain bg-black/60 p-0.5 border border-border/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-foreground truncate">{asset.name}</p>
                          <p className="text-[9.5px] text-primary uppercase font-mono">{asset.defaultBlendMode}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer Management List */}
                {data.layers && data.layers.length > 0 && (
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>Flyer Image Layers ({data.layers.length})</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Click to select & inspect</span>
                    </Label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {data.layers.map((layer) => {
                        const isSelected = selectedLayerId === layer.id;
                        return (
                          <div
                            key={layer.id}
                            onClick={() => setSelectedLayerId(layer.id)}
                            className={`p-2 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border/60 bg-muted/10 hover:bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={layer.url}
                                alt={layer.name}
                                className="w-8 h-8 rounded-lg object-cover bg-black/50 border border-border shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{layer.name}</p>
                                <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border/40">
                                  {layer.blendMode} · {Math.round(layer.opacity * 100)}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCenterLayer(layer.id);
                                }}
                                title="Center on Canvas"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <Crosshair className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateLayer(layer.id);
                                }}
                                title="Duplicate"
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                              >
                                <CopyPlus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLayer(layer.id);
                                }}
                                title="Delete"
                                className="p-1 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Layer Design Inspector */}
                {selectedLayer ? (
                  <div className="space-y-3.5 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                        <Blend className="w-3.5 h-3.5 text-primary" />
                        <span>Design Tools: {selectedLayer.name}</span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLayerId(null)}
                        className="text-[10px] h-6 px-1.5 text-muted-foreground"
                      >
                        Deselect
                      </Button>
                    </div>

                    {/* Blend Mode Selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Blending Mode</Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(
                          [
                            { id: "normal", label: "Normal", tip: "Standard solid opaque" },
                            { id: "screen", label: "Screen", tip: "Light flare (black vanishes)" },
                            { id: "color-dodge", label: "Dodge", tip: "Intense luminous glow" },
                            { id: "multiply", label: "Multiply", tip: "Dark texture (white vanishes)" },
                            { id: "overlay", label: "Overlay", tip: "Punchy contrast blend" },
                            { id: "soft-light", label: "Soft Light", tip: "Subtle cinematic tint" },
                            { id: "lighten", label: "Lighten", tip: "Lightens background" },
                            { id: "luminosity", label: "Luminosity", tip: "Luminance tone" },
                          ] as const
                        ).map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateSelectedLayer({ blendMode: b.id })}
                            title={b.tip}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center border ${
                              selectedLayer.blendMode === b.id
                                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                                : "bg-muted/15 border-border/60 text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mask / Edge Feathering Shape */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Edge Mask & Feathering</Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "feathered", label: "Feather", tip: "Soft gradient fade into background" },
                          { id: "circle", label: "Circle", tip: "Sacred circular crop" },
                          { id: "rounded", label: "Rounded", tip: "Curved bento corners" },
                          { id: "rect", label: "Full", tip: "Standard rectangular" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => updateSelectedLayer({ maskShape: m.id as LayerMaskShape })}
                            title={m.tip}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center border ${
                              selectedLayer.maskShape === m.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/15 border-border/60 text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Opacity</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(selectedLayer.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1"
                        step="0.05"
                        value={selectedLayer.opacity}
                        onChange={(e) =>
                          updateSelectedLayer({ opacity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Size / Scale Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Dimensions / Size</Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {selectedLayer.width} × {selectedLayer.height} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="120"
                        max="1400"
                        step="20"
                        value={selectedLayer.width}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateSelectedLayer({ width: val, height: val });
                        }}
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Rotation Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Rotation Angle</Label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-muted-foreground">
                            {selectedLayer.rotation}°
                          </span>
                          {selectedLayer.rotation !== 0 && (
                            <button
                              type="button"
                              onClick={() => updateSelectedLayer({ rotation: 0 })}
                              className="text-[10px] text-primary hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={selectedLayer.rotation}
                        onChange={(e) =>
                          updateSelectedLayer({ rotation: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Layer Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCenterLayer(selectedLayer.id)}
                        className="text-[11px] h-8 gap-1 rounded-lg"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Center</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderLayer(selectedLayer.id, "up")}
                        className="text-[11px] h-8 gap-1 rounded-lg"
                      >
                        <span>Bring Forward</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderLayer(selectedLayer.id, "down")}
                        className="text-[11px] h-8 gap-1 rounded-lg"
                      >
                        <span>Send Backward</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLayer(selectedLayer.id)}
                        className="text-[11px] h-8 gap-1 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border/80 text-center bg-muted/5 space-y-1.5">
                    <Move className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-xs font-semibold text-foreground">Click Any Layer on Flyer to Inspect</p>
                    <p className="text-[10px] text-muted-foreground">
                      Click directly on an image on the flyer canvas to drag it or adjust its blend mode.
                    </p>
                  </div>
                )}
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
                  <div className="flex items-center gap-3">
                    <img
                      src="/ggm_logo.png"
                      alt="GGM Official Logo"
                      className="w-10 h-10 rounded-full object-contain border border-gold/40 bg-black/40 p-0.5"
                    />
                    <div>
                      <Label htmlFor="show-logo" className="text-xs font-semibold cursor-pointer">
                        Official Church Logo Emblem
                      </Label>
                      <p className="text-[10px] text-muted-foreground">
                        Always included by default on every flyer.
                      </p>
                    </div>
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
            <div
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              className="flex items-center justify-center p-3 sm:p-5 bg-black/40 rounded-2xl border border-border/50 overflow-hidden min-h-[420px] relative"
            >
              {/* Luminous Drag-and-Drop HUD Overlay */}
              {isDraggingFileOver && (
                <div className="absolute inset-0 bg-primary/25 backdrop-blur-xs border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center pointer-events-none z-30 animate-in fade-in">
                  <div className="p-4 rounded-2xl bg-black/85 border border-primary/50 text-center shadow-2xl">
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
                    <p className="text-sm font-bold text-white">Drop Image to Add & Blend</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WebP, SVG</p>
                  </div>
                </div>
              )}

              <div
                style={{
                  maxWidth: data.aspectRatio === "story" ? "340px" : data.aspectRatio === "landscape" ? "540px" : "420px",
                  width: "100%",
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                }}
                className="shadow-2xl rounded-2xl overflow-hidden border border-border/70 select-none relative"
              >
                <FlyerRenderer
                  data={data}
                  svgRef={svgRef}
                  logoDataUrl={logoDataUrl}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={(id) => {
                    setSelectedLayerId(id);
                    setActiveTab("design");
                  }}
                  onLayerPointerDown={handleLayerPointerDown}
                />
              </div>
            </div>

            {/* Quick Canvas Tip / Selected Layer Floating Pill */}
            <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
              {selectedLayer ? (
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Selected: <strong>{selectedLayer.name}</strong></span>
                  <span className="text-muted-foreground font-normal">· Drag on canvas or use design tools to blend</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Tip: Drag & drop images directly onto the flyer, or click elements to move them freely.</span>
                </div>
              )}
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
