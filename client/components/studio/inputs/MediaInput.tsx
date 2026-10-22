"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { SafeMediaImage } from "@/components/studio/SafeMediaImage";
import {
  UploadCloud,
  Plus,
  Trash2,
  Download,
  Upload,
  Image as ImageIcon,
  Loader2,
  Check,
  Eye,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type StudioMediaItem,
} from "@ggm/types";
import {
  DEFAULT_CHURCH_SLIDES,
  loadSavedProjectDecks,
  saveProjectDeck,
  uploadMediaToCloudinary,
  exportDeckToJson,
  importDeckFromJson,
} from "@/lib/studio/media-service";
import { toast } from "sonner";

interface MediaInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function MediaInput({ state, onChange, onTakeLive }: MediaInputProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newSlideTitle, setNewSlideTitle] = useState<string>("");
  const [newSlideUrl, setNewSlideUrl] = useState<string>("");
  const [newSlideCategory, setNewSlideCategory] = useState<StudioMediaItem["category"]>("flyer");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mediaList = state.mediaList.length > 0 ? state.mediaList : DEFAULT_CHURCH_SLIDES;
  const activeMediaId = state.activeMediaId || mediaList[0]?.id;

  const handleStageSlide = (slide: StudioMediaItem) => {
    onChange((prev) => ({
      ...prev,
      previewType: "media",
      activeMediaId: slide.id,
      mediaList: prev.mediaList.length > 0 ? prev.mediaList : DEFAULT_CHURCH_SLIDES,
    }));
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Processing slide for service deck...");

    try {
      const secureUrl = await uploadMediaToCloudinary(file, "gallery");
      const newItem: StudioMediaItem = {
        id: `slide_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
        url: secureUrl,
        category: "flyer",
        uploadedAt: new Date().toISOString(),
      };

      onChange((prev) => {
        const existing = prev.mediaList.length > 0 ? prev.mediaList : DEFAULT_CHURCH_SLIDES;
        return {
          ...prev,
          previewType: "media",
          activeMediaId: newItem.id,
          mediaList: [newItem, ...existing],
        };
      });

      toast.success("Image uploaded to Cloudinary & added to service deck!", { id: toastId });
    } catch {
      // Offline / Local Mock Fallback: Read as client DataURL so media deck always works 100%
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newItem: StudioMediaItem = {
            id: `slide_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, "").toUpperCase(),
            url: dataUrl,
            category: "flyer",
            uploadedAt: new Date().toISOString(),
          };
          onChange((prev) => {
            const existing = prev.mediaList.length > 0 ? prev.mediaList : DEFAULT_CHURCH_SLIDES;
            return {
              ...prev,
              previewType: "media",
              activeMediaId: newItem.id,
              mediaList: [newItem, ...existing],
            };
          });
          toast.success("Image added to service deck (local storage mode)!", { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddDirectUrl = () => {
    if (!newSlideUrl.trim()) return;

    const newItem: StudioMediaItem = {
      id: `slide_${Date.now()}`,
      title: (newSlideTitle.trim() || "CHURCH ANNOUNCEMENT SLIDE").toUpperCase(),
      url: newSlideUrl.trim(),
      category: newSlideCategory,
      uploadedAt: new Date().toISOString(),
    };

    onChange((prev) => {
      const existing = prev.mediaList.length > 0 ? prev.mediaList : DEFAULT_CHURCH_SLIDES;
      return {
        ...prev,
        previewType: "media",
        activeMediaId: newItem.id,
        mediaList: [newItem, ...existing],
      };
    });

    setNewSlideTitle("");
    setNewSlideUrl("");
    toast.success("Slide added to playlist!");
  };

  const handleDeleteSlide = (id: string) => {
    onChange((prev) => ({
      ...prev,
      mediaList: prev.mediaList.filter((m) => m.id !== id),
    }));
    toast.info("Slide removed from playlist.");
  };

  const handleExportDeck = () => {
    const json = exportDeckToJson({
      id: `deck_${Date.now()}`,
      name: "Sunday Service Presentation Deck",
      date: new Date().toISOString().split("T")[0],
      items: mediaList,
    });

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ggm_service_deck_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project deck exported as JSON!");
  };

  const handleImportDeck = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const imported = importDeckFromJson(content);
      if (imported && imported.items.length > 0) {
        onChange((prev) => ({
          ...prev,
          previewType: "media",
          activeMediaId: imported.items[0].id,
          mediaList: imported.items,
        }));
        toast.success(`Imported ${imported.items.length} slides from "${imported.name}"!`);
      } else {
        toast.error("Invalid service project file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Upload & Deck Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 rounded-xl border border-white/5">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Cloudinary Service Project / Photo Deck
          </h4>
          <p className="text-[11px] text-zinc-400">
            Pre-stage flyers, sermon slides, and offering graphics before church service.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
            Upload to Cloudinary
          </button>

          <button
            type="button"
            onClick={handleExportDeck}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
            title="Export project deck JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <label
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs cursor-pointer"
            title="Import project deck JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".json" onChange={handleImportDeck} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Slide via URL */}
      <div className="flex flex-col sm:flex-row gap-2 p-3 bg-zinc-900/40 rounded-xl border border-white/5">
        <input
          type="text"
          value={newSlideUrl}
          onChange={(e) => setNewSlideUrl(e.target.value)}
          placeholder="Or paste direct image URL (https://res.cloudinary.com/...)..."
          className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <input
          type="text"
          value={newSlideTitle}
          onChange={(e) => setNewSlideTitle(e.target.value)}
          placeholder="Slide title (e.g. Offering Graphic)..."
          className="w-full sm:w-48 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={handleAddDirectUrl}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Service Playlist Slides Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {mediaList.map((slide) => {
          const isStaged = activeMediaId === slide.id;
          return (
            <div
              key={slide.id}
              className={`relative group rounded-xl overflow-hidden border transition-all ${
                isStaged
                  ? "border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  : "border-white/10 bg-zinc-900/60 hover:border-white/30"
              }`}
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => handleStageSlide(slide)}
                className="relative aspect-video w-full bg-black/80 cursor-pointer overflow-hidden"
              >
                <SafeMediaImage
                  src={slide.url}
                  alt={slide.title}
                  fill
                  className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                />
                {isStaged && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" /> Staged In Preview
                  </div>
                )}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 text-[9px] uppercase font-bold backdrop-blur-sm">
                  {slide.category}
                </div>
              </div>

              {/* Title & Delete Bar */}
              <div className="p-2.5 flex items-center justify-between gap-2 bg-zinc-900/90">
                <span className="text-xs font-bold text-white truncate" title={slide.title}>
                  {slide.title}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStageSlide(slide)}
                    className="p-1 rounded bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white transition-colors"
                    title="Stage in preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1 rounded bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                    title="Delete slide"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
