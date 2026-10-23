"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Calendar,
  Palette,
  Timer,
  Rocket,
  Check,
  ImageIcon,
  Sliders,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type CountdownThemeId,
  COUNTDOWN_THEMES,
  EVENT_DATE_PRESETS,
  calculateSecondsUntilDate,
  formatToLocalIso,
  getNextSundayServiceDate,
  getNextMidweekServiceDate,
} from "@ggm/types";
import { toast } from "sonner";

interface CountdownInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

export function CountdownInput({ state, onChange, onTakeLive }: CountdownInputProps) {
  // Primary viewing tabs: 1. Normal Activity Timer vs 2. Occasion/Event Timer
  // Switching this tab ONLY switches the UI viewing category — it DOES NOT touch or reset state.isRunning or state.remainingSeconds!
  const isEventMode = state.mode === "event-date" || state.mode === "target-time";
  const [activeCategory, setActiveCategory] = useState<"normal" | "occasion">(() =>
    isEventMode ? "occasion" : "normal"
  );
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  // Staged / Draft settings for Mode 1: Normal Duration
  const [draftMins, setDraftMins] = useState<number>(() =>
    state.mode === "activity" ? Math.max(1, Math.round(state.durationSeconds / 60)) : 15
  );
  const [draftNormalTitle, setDraftNormalTitle] = useState<string>(() =>
    state.mode === "activity" && state.title ? state.title : "SANCTUARY ACTIVITY"
  );
  const [draftNormalSubtitle, setDraftNormalSubtitle] = useState<string>(() =>
    state.mode === "activity" && state.subtitle ? state.subtitle : "Activity In Progress"
  );

  // Staged / Draft settings for Mode 2: Occasion / Event
  const [draftEventTitle, setDraftEventTitle] = useState<string>(() =>
    isEventMode && state.title ? state.title : "SUNDAY CELEBRATION SERVICE"
  );
  const [draftEventSubtitle, setDraftEventSubtitle] = useState<string>(() =>
    isEventMode && state.subtitle ? state.subtitle : "Service Starts In..."
  );
  const [draftCompletionMessage, setDraftCompletionMessage] = useState<string>(() =>
    state.completionMessage || "SERVICE IN PROGRESS"
  );
  const [draftEventDate, setDraftEventDate] = useState<string>(() =>
    state.targetDate || getNextSundayServiceDate()
  );

  // Quick duration selection presets for Normal Activity Timer
  const normalDurationPresets = [
    { label: "5 Min", mins: 5, desc: "Offering / Giving" },
    { label: "10 Min", mins: 10, desc: "Praise & Worship" },
    { label: "15 Min", mins: 15, desc: "Choir Ministration" },
    { label: "20 Min", mins: 20, desc: "Sunday School" },
    { label: "30 Min", mins: 30, desc: "Sermon / Message" },
    { label: "45 Min", mins: 45, desc: "Extended Keynote" },
    { label: "60 Min", mins: 60, desc: "1 Hour Encounter" },
  ];

  // Explicit Launch / Set for Normal Activity Timer (User must click to apply/reset)
  const handleLaunchNormalTimer = (overrideMins?: number, overrideTitle?: string) => {
    const minsToUse = overrideMins || draftMins;
    const titleToUse = overrideTitle || draftNormalTitle;
    const secs = minsToUse * 60;

    onChange((prev) => ({
      ...prev,
      mode: "activity",
      durationSeconds: secs,
      remainingSeconds: secs,
      targetEndTime: Date.now() + secs * 1000,
      title: titleToUse,
      subtitle: draftNormalSubtitle,
      activeType: "countdown", // Always put countdown on air when launched
      previewType: "countdown",
      isBlackout: false,
      isRunning: true, // Start immediately on launch
    }));

    if (onTakeLive) {
      onTakeLive();
    }

    toast.success(`Launched ${minsToUse} Min Activity Timer!`);
  };

  // Explicit Launch / Set for Occasion / Event Timer (User must click to apply/reset)
  const handleLaunchEventTimer = (
    overrideDate?: string,
    overrideTitle?: string,
    overrideSub?: string,
    overrideMsg?: string
  ) => {
    const dateToUse = overrideDate || draftEventDate;
    const titleToUse = overrideTitle || draftEventTitle;
    const subToUse = overrideSub || draftEventSubtitle;
    const msgToUse = overrideMsg !== undefined ? overrideMsg : draftCompletionMessage;
    const remaining = calculateSecondsUntilDate(dateToUse);

    onChange((prev) => ({
      ...prev,
      mode: "event-date",
      targetDate: dateToUse,
      title: titleToUse,
      subtitle: subToUse,
      completionMessage: msgToUse,
      remainingSeconds: remaining,
      activeType: "countdown", // Always put countdown on air when launched
      previewType: "countdown",
      isBlackout: false,
      isRunning: true,
    }));

    if (onTakeLive) {
      onTakeLive();
    }

    toast.success(`Launched Event Countdown for ${titleToUse}!`);
  };

  // Adjust remaining runtime seconds
  const adjustSeconds = (delta: number) => {
    onChange((prev) => {
      const nextRemaining = Math.max(0, prev.remainingSeconds + delta);
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        targetEndTime: prev.isRunning ? Date.now() + nextRemaining * 1000 : null,
      };
    });
  };

  // Quick preset apply for Event / Occasion
  const handleSelectEventPreset = (presetId: string) => {
    const preset = EVENT_DATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const targetDate = preset.getTargetDate();
    setDraftEventDate(targetDate);
    setDraftEventTitle(preset.title);
    setDraftEventSubtitle(preset.subtitle);

    handleLaunchEventTimer(targetDate, preset.title, preset.subtitle);
  };

  return (
    <div className="space-y-4 text-white">
      {/* ======================================================== */}
      {/* 1. PRIMARY TIMER TYPE SELECTOR (2 Clean Modes)           */}
      {/* Switching tabs NEVER resets a running timer!             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-black/60 rounded-xl border border-white/10">
        {/* Mode 1: Normal Countdown Timer */}
        <button
          type="button"
          onClick={() => setActiveCategory("normal")}
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
                  Editing View
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
          onClick={() => setActiveCategory("occasion")}
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
                  Editing View
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
            onClick={() =>
              onChange((prev) => {
                const nextRunning = !prev.isRunning;
                let nextTargetEnd = prev.targetEndTime;
                if (nextRunning) {
                  // Resuming: recalculate targetEndTime from current remaining seconds (supports overtime when negative)
                  const secs = prev.overtimeEnabled ? prev.remainingSeconds : Math.max(0, prev.remainingSeconds);
                  nextTargetEnd = Date.now() + secs * 1000;
                } else {
                  // Pausing: clear targetEndTime
                  nextTargetEnd = null;
                }
                return {
                  ...prev,
                  activeType: nextRunning ? "countdown" : prev.activeType,
                  isBlackout: nextRunning ? false : prev.isBlackout,
                  isRunning: nextRunning,
                  targetEndTime: nextTargetEnd,
                };
              })
            }
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
                    targetEndTime: null,
                    isRunning: false,
                    activeType: "countdown",
                  };
                }
                return {
                  ...prev,
                  remainingSeconds: prev.durationSeconds,
                  targetEndTime: null,
                  isRunning: false,
                  activeType: "countdown",
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

          {/* Background Image Overlay & Opacity Slider */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Live Page Background Image Overlay
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Opacity: {Math.round((state.bgImageOpacity ?? 0.25) * 100)}%
              </span>
            </div>

            {/* Background Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                {
                  label: "Cathedral Sanctuary",
                  url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80",
                },
                {
                  label: "Worship Lights",
                  url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80",
                },
                {
                  label: "Celestial Clouds",
                  url: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1920&q=80",
                },
                {
                  label: "Praise Rays",
                  url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1920&q=80",
                },
              ].map((bg) => {
                const isSelected = state.bgImageUrl === bg.url;
                return (
                  <button
                    key={bg.label}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        bgImageUrl: bg.url,
                      }))
                    }
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold text-left border transition-all truncate ${
                      isSelected
                        ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                        : "bg-black/50 text-zinc-300 border-white/5 hover:border-white/20"
                    }`}
                  >
                    {bg.label}
                  </button>
                );
              })}
            </div>

            {/* Custom URL Input & None Clear Option */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste custom background image URL..."
                value={state.bgImageUrl || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange((prev) => ({ ...prev, bgImageUrl: val }));
                }}
                className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
              />
              {state.bgImageUrl && (
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, bgImageUrl: "" }))}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Clear Image
                </button>
              )}
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
              <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-zinc-400 shrink-0">Overlay Darkness / Opacity:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={state.bgImageOpacity ?? 0.25}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChange((prev) => ({ ...prev, bgImageOpacity: val }));
                }}
                className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
                {Math.round((state.bgImageOpacity ?? 0.25) * 100)}%
              </span>
            </div>
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
          {/* Quick Duration Buttons (Clean, Tap-to-Stage) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Choose Activity Duration (Click to prepare, then click Launch Timer):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {normalDurationPresets.map((preset) => {
                const isSelectedDraft = draftMins === preset.mins;
                return (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => {
                      setDraftMins(preset.mins);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelectedDraft
                        ? "bg-amber-400 text-black border-amber-400 font-black shadow-lg"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:border-white/20 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-sm font-bold">{preset.label}</div>
                    <div className={`text-[9px] truncate mt-0.5 ${isSelectedDraft ? "text-black/80" : "text-zinc-500"}`}>
                      {preset.desc.split(" ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Custom Input, Title & Explicit Launch Button */}
          <div className="p-4 bg-zinc-900/60 rounded-xl border border-white/10 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    value={draftMins}
                    onChange={(e) => setDraftMins(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
                  value={draftNormalTitle}
                  onChange={(e) => setDraftNormalTitle(e.target.value)}
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
                  value={draftNormalSubtitle}
                  onChange={(e) => setDraftNormalSubtitle(e.target.value)}
                  placeholder="e.g. Time Remaining"
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Launch / Apply Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleLaunchNormalTimer()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch {draftMins} Min Countdown Timer</span>
              </button>
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
              Church Programme Presets (Click any to launch):
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Event / Service Title */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Service / Occasion Title
                </label>
                <input
                  type="text"
                  value={draftEventTitle}
                  onChange={(e) => setDraftEventTitle(e.target.value)}
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
                  value={draftEventSubtitle}
                  onChange={(e) => setDraftEventSubtitle(e.target.value)}
                  placeholder="e.g. Service Starts In..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Message shown when reaching 0:00:00 */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Message at End (when 0:00 reached)
                </label>
                <input
                  type="text"
                  value={draftCompletionMessage}
                  onChange={(e) => setDraftCompletionMessage(e.target.value)}
                  placeholder="e.g. SERVICE IN PROGRESS"
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
                  value={draftEventDate ? draftEventDate.slice(0, 16) : ""}
                  onChange={(e) => setDraftEventDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Quick Service Helper Shortcuts */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Quick Set Helper
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextSun = getNextSundayServiceDate();
                      setDraftEventDate(nextSun);
                      setDraftEventTitle("SUNDAY CELEBRATION SERVICE");
                      setDraftEventSubtitle("Service Starts In...");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-white/5 transition-colors"
                  >
                    Next Sun 8:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextWed = getNextMidweekServiceDate();
                      setDraftEventDate(nextWed);
                      setDraftEventTitle("MIDWEEK COMMUNION SERVICE");
                      setDraftEventSubtitle("Service Starts In...");
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-white/5 transition-colors"
                  >
                    Next Wed 5:30 PM
                  </button>
                </div>
              </div>
            </div>

            {/* Launch / Apply Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleLaunchEventTimer()}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Occasion Countdown</span>
              </button>
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
