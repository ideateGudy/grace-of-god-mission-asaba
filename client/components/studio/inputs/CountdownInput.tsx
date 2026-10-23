"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Sparkles,
  Palette,
  Timer,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type CountdownThemeId,
  COUNTDOWN_THEMES,
  EVENT_DATE_PRESETS,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  formatToLocalIso,
  getNextSundayServiceDate,
  getNextMidweekServiceDate,
} from "@ggm/types";
import { audioSynth } from "@/lib/studio/audio-synth";

interface CountdownInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function CountdownInput({ state, onChange }: CountdownInputProps) {
  // Primary mode tabs: 1. Normal Activity Timer vs 2. Occasion/Event Timer
  const isEventMode = state.mode === "event-date" || state.mode === "target-time";
  const [activeCategory, setActiveCategory] = useState<"normal" | "occasion">(() =>
    isEventMode ? "occasion" : "normal"
  );
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  // Quick duration selection presets for Normal Activity Timer
  const normalDurationPresets = [
    { label: "5 Min", mins: 5, desc: "Offering / Announcements" },
    { label: "10 Min", mins: 10, desc: "Praise & Worship Session" },
    { label: "15 Min", mins: 15, desc: "Choir Ministration" },
    { label: "20 Min", mins: 20, desc: "Sunday School / Testimonies" },
    { label: "30 Min", mins: 30, desc: "Sermon / Exhortation" },
    { label: "45 Min", mins: 45, desc: "Keynote / Message" },
    { label: "60 Min", mins: 60, desc: "1 Hour Encounter" },
  ];

  // Quick apply normal duration
  const handleSelectNormalDuration = (mins: number, defaultTitle?: string) => {
    onChange((prev) => ({
      ...prev,
      mode: "activity",
      durationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      title: defaultTitle || prev.title || "SANCTUARY ACTIVITY",
      subtitle: prev.subtitle || "Activity In Progress",
      isRunning: false,
    }));
  };

  // Adjust remaining runtime seconds
  const adjustSeconds = (delta: number) => {
    onChange((prev) => ({
      ...prev,
      remainingSeconds: Math.max(0, prev.remainingSeconds + delta),
    }));
  };

  // Quick preset apply for Event / Occasion
  const handleSelectEventPreset = (presetId: string) => {
    const preset = EVENT_DATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const targetDate = preset.getTargetDate();
    const remaining = calculateSecondsUntilDate(targetDate);

    onChange((prev) => ({
      ...prev,
      mode: "event-date",
      targetDate,
      title: preset.title,
      subtitle: preset.subtitle,
      theme: preset.theme,
      remainingSeconds: remaining,
      isRunning: true,
    }));
  };

  return (
    <div className="space-y-4 text-white">
      {/* ======================================================== */}
      {/* 1. PRIMARY TIMER TYPE SELECTOR (2 Clean Modes)           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-black/60 rounded-xl border border-white/10">
        {/* Mode 1: Normal Countdown Timer */}
        <button
          type="button"
          onClick={() => {
            setActiveCategory("normal");
            onChange((prev) => ({
              ...prev,
              mode: "activity",
              durationSeconds: prev.durationSeconds || 1200,
              remainingSeconds: prev.durationSeconds || 1200,
            }));
          }}
          className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
            activeCategory === "normal"
              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 ring-1 ring-amber-400"
              : "bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800/80"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              activeCategory === "normal" ? "bg-black/20 text-black" : "bg-zinc-800 text-amber-400"
            }`}
          >
            <Timer className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider">
                1. Normal Countdown Timer
              </span>
              {activeCategory === "normal" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/30">
                  Active
                </span>
              )}
            </div>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeCategory === "normal" ? "text-black/80 font-medium" : "text-zinc-400"
              }`}
            >
              Fixed minutes (10m, 20m, 30m) for sermon, offering, or worship. No date needed.
            </p>
          </div>
        </button>

        {/* Mode 2: Countdown to Occasion or Event */}
        <button
          type="button"
          onClick={() => {
            setActiveCategory("occasion");
            onChange((prev) => {
              const defaultDate = prev.targetDate || getNextSundayServiceDate();
              return {
                ...prev,
                mode: "event-date",
                targetDate: defaultDate,
                remainingSeconds: calculateSecondsUntilDate(defaultDate),
              };
            });
          }}
          className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
            activeCategory === "occasion"
              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 ring-1 ring-amber-400"
              : "bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800/80"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              activeCategory === "occasion" ? "bg-black/20 text-black" : "bg-zinc-800 text-amber-400"
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider">
                2. Occasion &amp; Event Countdown
              </span>
              {activeCategory === "occasion" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/30">
                  Active
                </span>
              )}
            </div>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeCategory === "occasion" ? "text-black/80 font-medium" : "text-zinc-400"
              }`}
            >
              Sunday Service, Midweek, Conference, or Vigil with target date &amp; starting time.
            </p>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. LIVE RUNTIME PLAYBACK & QUICK ADJUST BAR              */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/90 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          {/* Start / Pause */}
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs shadow-md transition-all ${
              state.isRunning
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {state.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{state.isRunning ? "Pause" : "Start"}</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={() =>
              onChange((prev) => {
                if (prev.mode === "event-date" && prev.targetDate) {
                  return {
                    ...prev,
                    remainingSeconds: calculateSecondsUntilDate(prev.targetDate),
                    isRunning: false,
                  };
                }
                return {
                  ...prev,
                  remainingSeconds: prev.durationSeconds,
                  isRunning: false,
                };
              })
            }
            className="flex items-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
            title="Reset timer to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Quick Step Buttons (+/- 1m, 5m) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => adjustSeconds(-60)}
              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors"
              title="Minus 1 minute"
            >
              -1m
            </button>
            <button
              type="button"
              onClick={() => adjustSeconds(60)}
              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors"
              title="Plus 1 minute"
            >
              +1m
            </button>
            <button
              type="button"
              onClick={() => adjustSeconds(300)}
              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-colors"
              title="Plus 5 minutes"
            >
              +5m
            </button>
          </div>
        </div>

        {/* Audio / Theme Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              state.soundEnabled
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Sound</span> {state.soundEnabled ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              showThemePicker
                ? "bg-amber-400 text-black font-bold"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme: {COUNTDOWN_THEMES[state.theme]?.name?.split(" ")[0]}</span>
          </button>
        </div>
      </div>

      {/* Theme Picker Dropdown if toggled */}
      {showThemePicker && (
        <div className="p-3 bg-zinc-900/90 rounded-xl border border-amber-400/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Select Sacred Color Palette &amp; Overlay Styling
            </span>
            <button
              type="button"
              onClick={() => setShowThemePicker(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {(Object.keys(COUNTDOWN_THEMES) as CountdownThemeId[]).map((themeKey) => {
              const th = COUNTDOWN_THEMES[themeKey];
              const isSelected = state.theme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, theme: themeKey }))}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 text-amber-300 font-bold"
                      : "border-white/5 bg-black/40 text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs truncate">{th.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{th.tagline}</div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: th.primaryAccent }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION CONTENT: BASED ON SELECTED MODE               */}
      {/* ======================================================== */}

      {/* -------------------------------------------------------- */}
      {/* MODE 1: NORMAL COUNTDOWN TIMER (Duration in Minutes)     */}
      {/* -------------------------------------------------------- */}
      {activeCategory === "normal" && (
        <div className="space-y-4">
          {/* Quick Duration Buttons (Clean, Tap-to-Set) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Quick Pick Duration:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {normalDurationPresets.map((preset) => {
                const isCurrent =
                  state.mode === "activity" && Math.round(state.durationSeconds / 60) === preset.mins;
                return (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => handleSelectNormalDuration(preset.mins, state.title)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? "bg-amber-400 text-black border-amber-400 font-black shadow-lg"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:border-white/20 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-sm font-bold">{preset.label}</div>
                    <div className={`text-[9px] truncate mt-0.5 ${isCurrent ? "text-black/80" : "text-zinc-500"}`}>
                      {preset.desc.split(" ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Custom Input & Title Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-900/60 rounded-xl border border-white/10">
            {/* Minutes input */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Duration (Minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={Math.round(state.durationSeconds / 60)}
                  onChange={(e) => {
                    const mins = Math.max(1, parseInt(e.target.value, 10) || 1);
                    onChange((prev) => ({
                      ...prev,
                      mode: "activity",
                      durationSeconds: mins * 60,
                      remainingSeconds: mins * 60,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-zinc-400 font-semibold">Min</span>
              </div>
            </div>

            {/* Display Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Display Title (e.g. SERMON, OFFERING)
              </label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. PASTOR DAVID OGBUELI SERMON"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Status / Subtitle
              </label>
              <input
                type="text"
                value={state.subtitle}
                onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g. Time Remaining"
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* MODE 2: OCCASION & EVENT COUNTDOWN (Date & Starting Time) */}
      {/* -------------------------------------------------------- */}
      {activeCategory === "occasion" && (
        <div className="space-y-4">
          {/* Quick Preset Cards (Sunday Service, Midweek, Vigil) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Church Programme Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {EVENT_DATE_PRESETS.map((preset) => {
                const isCurrent =
                  state.mode === "event-date" && state.title === preset.title;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectEventPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all group ${
                      isCurrent
                        ? "bg-amber-400 text-black border-amber-400 shadow-lg font-bold"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:border-amber-400/40 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{preset.name}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                          isCurrent ? "bg-black/20 text-black" : "bg-black/60 text-amber-400"
                        }`}
                      >
                        {preset.category}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] truncate mt-1 ${
                        isCurrent ? "text-black/80" : "text-zinc-400"
                      }`}
                    >
                      {preset.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Starting Time Custom Form */}
          <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Event / Service Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Service / Occasion Title
                </label>
                <input
                  type="text"
                  value={state.title}
                  onChange={(e) => onChange((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. SUNDAY CELEBRATION SERVICE"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Subtitle / Note */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Subtitle / Note
                </label>
                <input
                  type="text"
                  value={state.subtitle}
                  onChange={(e) => onChange((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Service Starts In..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Target Date & Starting Time (HTML5 datetime-local) */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Occasion Date &amp; Starting Time</span>
                  <span className="text-[10px] text-zinc-400">YYYY-MM-DD HH:MM</span>
                </label>
                <input
                  type="datetime-local"
                  value={
                    state.targetDate
                      ? state.targetDate.slice(0, 16)
                      : formatToLocalIso(new Date()).slice(0, 16)
                  }
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    const secs = calculateSecondsUntilDate(nextVal);
                    onChange((prev) => ({
                      ...prev,
                      mode: "event-date",
                      targetDate: nextVal,
                      remainingSeconds: secs,
                    }));
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Quick Service Helper Shortcuts */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Quick Set Next Service Date
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSun = getNextSundayServiceDate();
                      onChange((prev) => ({
                        ...prev,
                        mode: "event-date",
                        targetDate: nextSun,
                        title: "SUNDAY CELEBRATION SERVICE",
                        subtitle: "Service Starts In...",
                        remainingSeconds: calculateSecondsUntilDate(nextSun),
                      }));
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-white/5 transition-colors"
                  >
                    Next Sunday 8:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextWed = getNextMidweekServiceDate();
                      onChange((prev) => ({
                        ...prev,
                        mode: "event-date",
                        targetDate: nextWed,
                        title: "MIDWEEK COMMUNION SERVICE",
                        subtitle: "Service Starts In...",
                        remainingSeconds: calculateSecondsUntilDate(nextWed),
                      }));
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-white/5 transition-colors"
                  >
                    Next Wednesday 5:30 PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. OPTIONAL ADVANCED TOGGLES (Overtime & Stage Mode)       */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-6 p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-xs text-zinc-300">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.overtimeEnabled}
            onChange={(e) => onChange((prev) => ({ ...prev, overtimeEnabled: e.target.checked }))}
            className="w-4 h-4 rounded bg-black border-white/20 text-amber-500 focus:ring-0"
          />
          <span>Track Overtime (+MM:SS in red when time reaches 0:00)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.stageMode}
            onChange={(e) => onChange((prev) => ({ ...prev, stageMode: e.target.checked }))}
            className="w-4 h-4 rounded bg-black border-white/20 text-amber-500 focus:ring-0"
          />
          <span>Stage Mode (Giant High-Contrast pulpit countdown)</span>
        </label>
      </div>
    </div>
  );
}
