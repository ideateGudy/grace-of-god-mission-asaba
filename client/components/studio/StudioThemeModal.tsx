"use client";

import { useState } from "react";
import {
  Palette,
  ImageIcon,
  Sliders,
  Edit3,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type CountdownThemeId,
  COUNTDOWN_THEMES,
} from "@ggm/types";
import { toast } from "sonner";

interface StudioThemeModalProps {
  state: BroadcastStudioState;
  isOpen: boolean;
  onClose: () => void;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
}

export function StudioThemeModal({
  state,
  isOpen,
  onClose,
  onChange,
}: StudioThemeModalProps) {
  const [editingPresets, setEditingPresets] = useState<boolean>(false);
  const [bgPresets, setBgPresets] = useState<Array<{ id: string; label: string; url: string }>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ggm_studio_bg_presets_v1");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      {
        id: "cathedral",
        label: "Cathedral Sanctuary",
        url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80",
      },
      {
        id: "worship",
        label: "Worship Lights",
        url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80",
      },
      {
        id: "celestial",
        label: "Celestial Clouds",
        url: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1920&q=80",
      },
      {
        id: "praise",
        label: "Praise Rays",
        url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=80",
      },
    ];
  });

  if (!isOpen) return null;

  const handleUpdatePreset = (id: string, newLabel: string, newUrl: string) => {
    setBgPresets((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, label: newLabel, url: newUrl } : p));
      try {
        localStorage.setItem("ggm_studio_bg_presets_v1", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success("Background preset updated!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0c0e1a] border border-amber-400/40 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              Studio Theme &amp; Background Manager
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme Color Palettes */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            1. Sacred Liturgical Color Themes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(COUNTDOWN_THEMES) as CountdownThemeId[]).map((themeKey) => {
              const th = COUNTDOWN_THEMES[themeKey];
              const isSelected = state.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({ ...prev, theme: themeKey }));
                    toast.success(`Theme switched to ${th.name}!`);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 text-amber-300 font-bold shadow-[0_0_15px_rgba(217,164,65,0.2)]"
                      : "border-white/5 bg-black/40 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-black truncate">{th.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{th.tagline}</div>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-inner"
                    style={{ backgroundColor: th.primaryAccent }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Background Presentation Modes */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              2. Live Background Mode (Countdown, Scripture, Sanctuary)
            </label>
            <span className="text-[11px] text-zinc-400 font-mono">
              Opacity: {Math.round((state.bgImageOpacity ?? 0.35) * 100)}%
            </span>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <Sliders className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={state.bgImageOpacity ?? 0.35}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  bgImageOpacity: parseFloat(e.target.value),
                }))
              }
              className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
              {Math.round((state.bgImageOpacity ?? 0.35) * 100)}%
            </span>
          </div>

          {/* Background Mode Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 1. None (Theme Color Background) */}
            <button
              type="button"
              onClick={() => {
                onChange((prev) => ({ ...prev, bgImageUrl: "" }));
                toast.success("Using Theme Color gradient background!");
              }}
              className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                state.bgImageUrl === "" || !state.bgImageUrl
                  ? "bg-amber-400 text-black border-amber-400 shadow-md font-black"
                  : "bg-black/50 text-zinc-300 border-white/5 hover:border-white/20"
              }`}
            >
              🎨 None (Theme Color)
              <span className="block text-[10px] opacity-75 font-normal mt-0.5">
                Uses selected liturgical gradient
              </span>
            </button>

            {/* 2. Dark Background */}
            <button
              type="button"
              onClick={() => {
                onChange((prev) => ({ ...prev, bgImageUrl: "dark" }));
                toast.success("Switched to pure deep Dark Background!");
              }}
              className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                state.bgImageUrl === "dark"
                  ? "bg-amber-400 text-black border-amber-400 shadow-md font-black"
                  : "bg-black/50 text-zinc-300 border-white/5 hover:border-white/20"
              }`}
            >
              🌑 Dark Background
              <span className="block text-[10px] opacity-75 font-normal mt-0.5">
                Pure #000000 deep dark black
              </span>
            </button>

            {/* Editable & Dynamic Unsplash Photo Presets */}
            {bgPresets.map((bg) => {
              const isSelected = state.bgImageUrl === bg.url;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({ ...prev, bgImageUrl: bg.url }));
                    toast.success(`Applied ${bg.label}!`);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all truncate ${
                    isSelected
                      ? "bg-amber-400 text-black border-amber-400 shadow-md font-black"
                      : "bg-black/50 text-zinc-300 border-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="truncate block">🖼️ {bg.label}</span>
                  <span className="block text-[10px] opacity-75 font-normal truncate mt-0.5">
                    Atmospheric photo overlay
                  </span>
                </button>
              );
            })}
          </div>

          {/* Edit Custom Preset URLs */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
            <button
              type="button"
              onClick={() => setEditingPresets(!editingPresets)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>{editingPresets ? "Done Editing URLs" : "Edit Image Preset URLs"}</span>
            </button>
            <a
              href="https://unsplash.com/s/photos/church-worship"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
            >
              <span>Browse Church Photos</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Editable Presets Form */}
          {editingPresets && (
            <div className="p-3 bg-black/60 rounded-xl border border-amber-400/40 space-y-2 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Edit Preset Names &amp; Image URLs
              </span>
              <div className="space-y-2">
                {bgPresets.map((preset) => (
                  <div key={preset.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={preset.label}
                      onChange={(e) => handleUpdatePreset(preset.id, e.target.value, preset.url)}
                      placeholder="Preset Name"
                      className="w-full sm:w-36 px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={preset.url}
                      onChange={(e) => handleUpdatePreset(preset.id, preset.label, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onChange((prev) => ({ ...prev, bgImageUrl: preset.url }));
                        toast.success(`Applied ${preset.label}!`);
                      }}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-lg uppercase shrink-0"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
