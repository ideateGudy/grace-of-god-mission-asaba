"use client";

import {
  User,
  CreditCard,
  Megaphone,
  Type,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type StudioOverlayState,
} from "@ggm/types";

interface LowerThirdInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function LowerThirdInput({ state, onChange, onTakeLive }: LowerThirdInputProps) {
  const overlay = state.overlay;

  const handleToggle = () => {
    onChange((prev) => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        enabled: !prev.overlay.enabled,
      },
    }));
  };

  const handleTypeSelect = (type: StudioOverlayState["type"]) => {
    let title = overlay.title;
    let subtitle = overlay.subtitle;
    let extra = overlay.extra;

    if (type === "speaker") {
      title = "PASTOR DAVID OGBUELI";
      subtitle = "Senior Pastor · Grace of God Mission Asaba";
      extra = "Theme: The Reigning Church in Power";
    } else if (type === "giving") {
      title = "TITHES & KINGDOM OFFERINGS";
      subtitle = "Zenith Bank · Acc: 1014528990 · Grace of God Mission Asaba";
      extra = "USSD: *966*000*1014528990# | Reference: Tithe / Offering";
    } else if (type === "ticker") {
      title = "CHURCH ANNOUNCEMENTS";
      subtitle = "Join us this Wednesday 5:30 PM for Midweek Communion & Word Encounter · Workers Meeting Saturday 7:00 AM";
      extra = "";
    }

    onChange((prev) => ({
      ...prev,
      overlay: {
        ...prev.overlay,
        type,
        title,
        subtitle,
        extra,
      },
    }));
  };

  return (
    <div className="space-y-4 text-white">
      {/* Enable / Disable Master DSK Bar */}
      <div className="flex items-center justify-between p-3.5 bg-zinc-900/80 rounded-xl border border-white/10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                overlay.enabled ? "bg-red-500 animate-pulse" : "bg-zinc-600"
              }`}
            />
            Downstream Keyer (DSK) Lower Third Overlay
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Layers titles, speaker names, and bank details cleanly over camera feeds or slides.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow ${
            overlay.enabled
              ? "bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-400/40"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {overlay.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {overlay.enabled ? "OVERLAY ACTIVE" : "OVERLAY OFF"}
        </button>
      </div>

      {/* Preset Types */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          Overlay Category Template
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleTypeSelect("speaker")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              overlay.type === "speaker"
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-bold">Speaker / Minister</span>
            <span className="text-[10px] text-zinc-400">Preacher name & topic</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("giving")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              overlay.type === "giving"
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-bold">Tithes & Giving</span>
            <span className="text-[10px] text-zinc-400">Bank accounts & USSD</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("ticker")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              overlay.type === "ticker"
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span className="text-xs font-bold">Notice Marquee</span>
            <span className="text-[10px] text-zinc-400">Scrolling announcements</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSelect("custom")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              overlay.type === "custom"
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="text-xs font-bold">Custom Title</span>
            <span className="text-[10px] text-zinc-400">Manual text fields</span>
          </button>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-3 p-4 bg-zinc-900/50 rounded-xl border border-white/10">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Primary Title / Speaker Name
          </label>
          <input
            type="text"
            value={overlay.title}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, title: e.target.value },
              }))
            }
            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Subtitle / Ministry Role / Bank Details
          </label>
          <input
            type="text"
            value={overlay.subtitle}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, subtitle: e.target.value },
              }))
            }
            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">
            Additional Notice / USSD / Sermon Topic (Optional)
          </label>
          <input
            type="text"
            value={overlay.extra || ""}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, extra: e.target.value },
              }))
            }
            placeholder="e.g. USSD Code, Account Reference, or Sermon Topic..."
            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Live Lower-Third Rendering Preview */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          Lower-Third Graphic Preview
        </label>
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#060714] p-4 flex flex-col justify-end min-h-[100px]">
          <div
            className="p-3 rounded-lg border-l-4 border-amber-400 shadow-xl"
            style={{
              background:
                "linear-gradient(90deg, rgba(16,19,41,0.95) 0%, rgba(11,14,32,0.85) 75%, transparent 100%)",
            }}
          >
            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {overlay.title || "TITLE HERE"}
            </h4>
            <p className="text-[11px] text-amber-300 font-medium mt-0.5">
              {overlay.subtitle || "Subtitle / Details here"}
            </p>
            {overlay.extra && (
              <p className="text-[10px] text-zinc-400 mt-1 font-mono">{overlay.extra}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
