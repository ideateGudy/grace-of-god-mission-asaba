"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type CountdownThemeId,
  COUNTDOWN_THEMES,
  PROGRAMME_PRESETS,
  ACTIVITY_PRESETS,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  getNextSundayServiceDate,
} from "@ggm/types";
import { audioSynth } from "@/lib/studio/audio-synth";

interface CountdownInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function CountdownInput({ state, onChange, onTakeLive }: CountdownInputProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "theme">("presets");

  const handleApplyPreset = (presetId: string) => {
    const preset = PROGRAMME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    onChange((prev) => {
      const mode = preset.data.mode || "activity";
      let remaining = preset.data.durationSeconds || 1800;
      if (mode === "target-time") {
        remaining = calculateSecondsUntilTarget(preset.data.targetTimeString || "08:00");
      } else if (mode === "event-date") {
        remaining = calculateSecondsUntilDate(preset.data.targetDate || getNextSundayServiceDate());
      }

      return {
        ...prev,
        title: preset.data.title || prev.title,
        subtitle: preset.data.subtitle || prev.subtitle,
        scriptureRef: preset.data.scriptureRef || prev.scriptureRef,
        scriptureText: preset.data.scriptureText || prev.scriptureText,
        mode,
        targetTimeString: preset.data.targetTimeString || prev.targetTimeString,
        targetDate: preset.data.targetDate || prev.targetDate,
        durationSeconds: preset.data.durationSeconds || prev.durationSeconds,
        theme: preset.data.theme || prev.theme,
        remainingSeconds: remaining,
        isRunning: true,
      };
    });
  };

  const handleApplyActivity = (activityId: string) => {
    const act = ACTIVITY_PRESETS.find((a) => a.id === activityId);
    if (!act) return;

    onChange((prev) => ({
      ...prev,
      title: act.title,
      subtitle: act.subtitle,
      mode: "activity",
      durationSeconds: act.durationMinutes * 60,
      remainingSeconds: act.durationMinutes * 60,
      theme: act.theme,
      isRunning: true,
    }));
  };

  const adjustSeconds = (delta: number) => {
    onChange((prev) => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + delta),
    }));
  };

  return (
    <div className="space-y-4 text-white">
      {/* Tab Selectors */}
      <div className="flex border-b border-white/10 gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "presets"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ⛪ Programme Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "custom"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ⏱️ Custom Timer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "theme"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          🎨 Sacred Themes
        </button>
      </div>

      {/* Timer Runtime Quick Controls */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/80 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => onChange((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs shadow-md transition-all ${
            state.isRunning
              ? "bg-amber-500 text-black hover:bg-amber-400"
              : "bg-emerald-600 text-white hover:bg-emerald-500"
          }`}
        >
          {state.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {state.isRunning ? "Pause Timer" : "Start Timer"}
        </button>

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              remainingSeconds: prev.durationSeconds,
              isRunning: false,
            }))
          }
          className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => adjustSeconds(-60)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(60)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold"
            title="Add 1 minute"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(300)}
            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold"
            title="Add 5 minutes"
          >
            +5m
          </button>
        </div>

        <button
          type="button"
          onClick={() => onChange((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            state.soundEnabled
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "bg-zinc-800 text-zinc-400"
          }`}
          title="Toggle cathedral chime sound"
        >
          {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          Sound {state.soundEnabled ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={() => {
            audioSynth.playCathedralChimes();
          }}
          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
          title="Test cathedral chime"
        >
          🔔 Test Chime
        </button>
      </div>

      {/* Tab: Presets */}
      {activeTab === "presets" && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Sunday & Midweek Service Presets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PROGRAMME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p.id)}
                className="flex flex-col text-left p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 hover:border-amber-400/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {p.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                    {p.data.mode}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-1">{p.data.subtitle}</p>
              </button>
            ))}
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pt-2">
            Timed Activities (Sermon, Worship, Offering)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACTIVITY_PRESETS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleApplyActivity(a.id)}
                className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 hover:border-amber-400/30 text-left transition-all"
              >
                <div className="text-xs font-bold text-amber-300">{a.durationMinutes} Mins</div>
                <div className="text-[11px] text-zinc-300 truncate">{a.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Custom Timer */}
      {activeTab === "custom" && (
        <div className="space-y-4 p-4 bg-zinc-900/50 rounded-xl border border-white/10">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Service Title</label>
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Subtitle / Status</label>
            <input
              type="text"
              value={state.subtitle}
              onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Mode</label>
              <select
                value={state.mode}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, mode: e.target.value as any }))
                }
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="activity">Duration Timer (Minutes)</option>
                <option value="target-time">Target Time (e.g. 08:00 AM)</option>
                <option value="event-date">Event Date (e.g. Sunday Service)</option>
              </select>
            </div>

            {state.mode === "target-time" ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Target Time (HH:MM)
                </label>
                <input
                  type="time"
                  value={state.targetTimeString}
                  onChange={(e) => {
                    const time = e.target.value;
                    const secs = calculateSecondsUntilTarget(time);
                    onChange((prev) => ({
                      ...prev,
                      targetTimeString: time,
                      remainingSeconds: secs,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={Math.round(state.durationSeconds / 60)}
                  onChange={(e) => {
                    const mins = Math.max(1, parseInt(e.target.value, 10) || 1);
                    onChange((prev) => ({
                      ...prev,
                      durationSeconds: mins * 60,
                      remainingSeconds: mins * 60,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={state.overtimeEnabled}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, overtimeEnabled: e.target.checked }))
                }
                className="rounded bg-black border-white/20 text-amber-500 focus:ring-0"
              />
              Track Overtime (+MM:SS in red when 0:00 reached)
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={state.stageMode}
                onChange={(e) => onChange((prev) => ({ ...prev, stageMode: e.target.checked }))}
                className="rounded bg-black border-white/20 text-amber-500 focus:ring-0"
              />
              Stage Mode (Giant High-Contrast pulpit digits)
            </label>
          </div>
        </div>
      )}

      {/* Tab: Sacred Themes */}
      {activeTab === "theme" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.keys(COUNTDOWN_THEMES) as CountdownThemeId[]).map((themeKey) => {
            const th = COUNTDOWN_THEMES[themeKey];
            const isSelected = state.theme === themeKey;
            return (
              <button
                key={themeKey}
                type="button"
                onClick={() => onChange((prev) => ({ ...prev, theme: themeKey }))}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(217,164,65,0.2)]"
                    : "border-white/10 bg-zinc-900/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{th.name}</span>
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: th.primaryAccent }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2">{th.tagline}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
