"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  type CountdownThemeId,
  type ChurchCountdownState,
  COUNTDOWN_THEMES,
} from "@/lib/countdown/countdown-types";
import {
  COUNTDOWN_STORAGE_KEY,
  COUNTDOWN_SYNC_CHANNEL,
  type CountdownSyncPayload,
} from "@/lib/countdown/countdown-sync";
import { audioSynth } from "@/lib/countdown/audio-synth";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";

const DEFAULT_STATE: ChurchCountdownState = {
  title: "SUNDAY CELEBRATION SERVICE",
  subtitle: "Service Starts In...",
  scriptureRef: "ISAIAH 60:1",
  scriptureText:
    "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
  mode: "target-time",
  targetTimeString: "08:00",
  durationSeconds: 300,
  theme: "royal-gold",
  soundEnabled: true,
  overtimeEnabled: true,
  showScripture: true,
  showLogo: true,
  stageMode: false,
};

function formatTwoDigits(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

function calculateSecondsUntilTarget(targetHHMM: string): number {
  const [targetH, targetM] = targetHHMM.split(":").map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetH || 0, targetM || 0, 0, 0);

  let diffMs = target.getTime() - now.getTime();

  if (diffMs < -2 * 60 * 60 * 1000) {
    target.setDate(target.getDate() + 1);
    diffMs = target.getTime() - now.getTime();
  }

  return Math.round(diffMs / 1000);
}

export function ChurchCountdownLive() {
  const [config, setConfig] = useState<ChurchCountdownState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_STATE, ...JSON.parse(saved) };
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_STATE;
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(300);
  const [showHint, setShowHint] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chimePlayedRef = useRef<boolean>(false);
  const lastSecondRef = useRef<number>(-1);
  const hideHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentTheme = COUNTDOWN_THEMES[config.theme] || COUNTDOWN_THEMES["royal-gold"];

  // Hide initial keyboard shortcut hint after 5 seconds
  useEffect(() => {
    hideHintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => {
      if (hideHintTimeoutRef.current) clearTimeout(hideHintTimeoutRef.current);
    };
  }, []);

  // Show hint briefly on mouse move, then re-hide
  const handleMouseMove = () => {
    setShowHint(true);
    if (hideHintTimeoutRef.current) clearTimeout(hideHintTimeoutRef.current);
    hideHintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  // Sync with Controller via BroadcastChannel & LocalStorage events
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(COUNTDOWN_SYNC_CHANNEL);
      channel.onmessage = (event: MessageEvent<CountdownSyncPayload>) => {
        if (event.data && event.data.type === "SYNC_STATE") {
          const { state, remainingSeconds: remoteSecs, isRunning: remoteRunning } = event.data;
          setConfig(state);
          setIsRunning(remoteRunning);
          setRemainingSeconds(remoteSecs);
        }
      };
    } catch {
      // BroadcastChannel unsupported or restricted
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === COUNTDOWN_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Compute countdown target when mode or parameters change
  useEffect(() => {
    if (config.mode === "target-time") {
      const secs = calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      chimePlayedRef.current = secs <= 0;
    } else {
      setRemainingSeconds(config.durationSeconds);
      setInitialTotalSeconds(config.durationSeconds);
      chimePlayedRef.current = false;
    }
  }, [config.mode, config.targetTimeString, config.durationSeconds]);

  // 1-second interval ticker for live projection
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (config.mode === "target-time") {
        const secs = calculateSecondsUntilTarget(config.targetTimeString);
        setRemainingSeconds(secs);

        // Sound triggers
        if (config.soundEnabled) {
          if (secs > 0 && secs <= 5 && lastSecondRef.current !== secs) {
            audioSynth.playUrgentTick();
            lastSecondRef.current = secs;
          } else if (secs <= 0 && !chimePlayedRef.current) {
            audioSynth.playServiceGong();
            chimePlayedRef.current = true;
          }
        }
      } else {
        // Duration mode
        setRemainingSeconds((prev) => {
          const next = prev - 1;

          if (config.soundEnabled) {
            if (next > 0 && next <= 5 && lastSecondRef.current !== next) {
              audioSynth.playUrgentTick();
              lastSecondRef.current = next;
            } else if (next === 0 && !chimePlayedRef.current) {
              audioSynth.playServiceGong();
              chimePlayedRef.current = true;
            }
          }

          if (!config.overtimeEnabled && next <= 0) {
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, config.mode, config.targetTimeString, config.soundEnabled, config.overtimeEnabled]);

  // Toggle fullscreen on double click or pressing 'F'
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyF") {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute breakdown: hours, minutes, seconds, overtime
  const isOvertime = remainingSeconds < 0;
  const absSeconds = Math.abs(remainingSeconds);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  // Percentage for progress bar (0 to 1)
  const progressRatio = useMemo(() => {
    if (initialTotalSeconds <= 0) return 0;
    if (remainingSeconds <= 0) return 1;
    return 1 - remainingSeconds / initialTotalSeconds;
  }, [remainingSeconds, initialTotalSeconds]);

  return (
    <div
      ref={containerRef}
      onDoubleClick={() => void toggleFullscreen()}
      onMouseMove={handleMouseMove}
      className="relative w-screen min-h-screen flex flex-col justify-between select-none overflow-hidden p-6 sm:p-10 md:p-14 cursor-default transition-colors duration-700"
      style={{
        background: currentTheme.bgDark,
        color: currentTheme.digitColor,
      }}
    >
      {/* Dynamic Ambient Glow Backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000"
        style={{
          background: currentTheme.bgGradient,
          opacity: 0.95,
        }}
      />

      {/* Volumetric Radial Aura Orb */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[160px] -z-10 transition-all duration-1000"
        style={{
          backgroundColor: isOvertime
            ? "rgba(239, 68, 68, 0.24)"
            : remainingSeconds <= 60
            ? "rgba(245, 158, 11, 0.28)"
            : currentTheme.accentGlow,
        }}
      />

      {/* Sacred Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* TOP HEADER: Church Brand Pill (Read-only, Clean) */}
      <header className="relative z-20 flex items-center justify-between max-w-7xl mx-auto w-full">
        {config.showLogo && (
          <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-xl">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-400/50 bg-black/40">
              <Image
                src={CHURCH_LOGO_PATH}
                alt="Grace of God Mission Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black tracking-wider block text-white">
                GRACE OF GOD MISSION
              </span>
              <span
                className="text-[10px] sm:text-xs font-bold tracking-widest block uppercase"
                style={{ color: currentTheme.primaryAccent }}
              >
                ASABA · SANCTUARY COUNTDOWN
              </span>
            </div>
          </div>
        )}

        {/* Live Projection Indicator & Hint */}
        <div
          className={`flex items-center gap-2 text-xs text-white/50 transition-opacity duration-500 ${
            showHint ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-[11px] font-semibold text-white/80">
            📺 Live Projection Screen · Double-click or Press &apos;F&apos; for Fullscreen
          </span>
        </div>
      </header>

      {/* MAIN STAGE COUNTDOWN (Completely Clean & Read-Only) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-8 max-w-7xl mx-auto w-full">
        {/* Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md mb-4 shadow-lg">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              backgroundColor: isOvertime
                ? "#EF4444"
                : remainingSeconds <= 60
                ? "#F59E0B"
                : currentTheme.primaryAccent,
            }}
          />
          <span
            className="text-xs sm:text-sm font-black tracking-widest uppercase"
            style={{ color: currentTheme.primaryAccent }}
          >
            {config.subtitle}
          </span>
        </div>

        {/* Programme Title (Non-editable, clean text) */}
        <h1 className="font-black tracking-tight text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight text-white mb-6 max-w-5xl">
          <span className="drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
            {config.title || "UNTITLED CHURCH PROGRAMME"}
          </span>
        </h1>

        {/* OVERTIME BADGE ALERT */}
        {isOvertime && (
          <div className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/25 border border-rose-500/60 text-rose-300 font-extrabold text-base sm:text-lg animate-pulse">
            <span>⚠️ SERVICE IN SESSION / OVERTIME</span>
          </div>
        )}

        {/* TIME'S UP CELEBRATORY BANNER (When 00:00:00 and overtime disabled) */}
        {!config.overtimeEnabled && remainingSeconds <= 0 && (
          <div className="mb-8 px-8 py-4 rounded-3xl bg-amber-500/25 border-2 border-amber-400 text-amber-200 font-black text-2xl sm:text-4xl animate-bounce shadow-2xl">
            ✨ WELCOME TO CHURCH · SERVICE HAS BEGUN ✨
          </div>
        )}

        {/* MASSIVE TIME DISPLAY CARDS */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 my-4">
          {/* Hours Card */}
          {(hours > 0 || config.mode === "target-time") && (
            <>
              <div className="flex flex-col items-center">
                <div
                  className="w-28 sm:w-44 md:w-56 lg:w-64 h-36 sm:h-52 md:h-64 lg:h-72 rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    borderColor: currentTheme.borderColor,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                    style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
                  />
                  <span
                    className="font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
                    style={{ color: currentTheme.digitColor }}
                  >
                    {formatTwoDigits(hours)}
                  </span>
                </div>
                <span
                  className="mt-4 text-xs sm:text-base md:text-lg font-black tracking-widest uppercase"
                  style={{ color: currentTheme.labelColor }}
                >
                  HOURS
                </span>
              </div>

              {/* Colon */}
              <div className="flex flex-col justify-center items-center gap-3 sm:gap-5 pb-10 sm:pb-16 text-3xl sm:text-5xl md:text-7xl text-white/40 font-black">
                <div className="w-2.5 sm:w-4 h-2.5 sm:h-4 rounded-full bg-white/70 animate-pulse" />
                <div className="w-2.5 sm:w-4 h-2.5 sm:h-4 rounded-full bg-white/70 animate-pulse" />
              </div>
            </>
          )}

          {/* Minutes Card */}
          <div className="flex flex-col items-center">
            <div
              className="w-28 sm:w-44 md:w-56 lg:w-64 h-36 sm:h-52 md:h-64 lg:h-72 rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderColor: currentTheme.borderColor,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              />
              <span
                className="font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
                style={{ color: currentTheme.digitColor }}
              >
                {formatTwoDigits(minutes)}
              </span>
            </div>
            <span
              className="mt-4 text-xs sm:text-base md:text-lg font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              MINUTES
            </span>
          </div>

          {/* Colon */}
          <div className="flex flex-col justify-center items-center gap-3 sm:gap-5 pb-10 sm:pb-16 text-3xl sm:text-5xl md:text-7xl text-white/40 font-black">
            <div className="w-2.5 sm:w-4 h-2.5 sm:h-4 rounded-full bg-white/70 animate-pulse" />
            <div className="w-2.5 sm:w-4 h-2.5 sm:h-4 rounded-full bg-white/70 animate-pulse" />
          </div>

          {/* Seconds Card */}
          <div className="flex flex-col items-center">
            <div
              className="w-28 sm:w-44 md:w-56 lg:w-64 h-36 sm:h-52 md:h-64 lg:h-72 rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderColor:
                  remainingSeconds <= 10 && remainingSeconds > 0
                    ? "#F59E0B"
                    : currentTheme.borderColor,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              />
              <span
                className="font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.95)]"
                style={{
                  color:
                    remainingSeconds <= 10 && remainingSeconds > 0
                      ? "#FDE047"
                      : currentTheme.digitColor,
                }}
              >
                {formatTwoDigits(seconds)}
              </span>
            </div>
            <span
              className="mt-4 text-xs sm:text-base md:text-lg font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              SECONDS
            </span>
          </div>
        </div>

        {/* Ambient Glowing Progress Bar */}
        <div className="w-full max-w-2xl mx-auto my-8 px-4">
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progressRatio * 100))}%`,
                background: `linear-gradient(90deg, ${currentTheme.primaryAccent}, ${currentTheme.secondaryAccent})`,
                boxShadow: `0 0 16px ${currentTheme.accentGlow}`,
              }}
            />
          </div>
        </div>

        {/* Scripture Card (Sanctuary Focus) */}
        {config.showScripture && config.scriptureText && (
          <div className="max-w-3xl mx-auto mt-2 px-8 py-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
            <span
              className="text-xs sm:text-sm font-black tracking-widest block uppercase mb-1.5"
              style={{ color: currentTheme.primaryAccent }}
            >
              // {config.scriptureRef || "SCRIPTURE FOCUS"}
            </span>
            <p className="text-base sm:text-lg md:text-xl font-medium italic text-white/95 leading-relaxed">
              &ldquo;{config.scriptureText}&rdquo;
            </p>
          </div>
        )}
      </main>

      {/* FOOTER: Minimalist subtle sanctuary indicator */}
      <footer className="relative z-20 flex items-center justify-between text-xs text-white/40 max-w-7xl mx-auto w-full pt-4">
        <span className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: currentTheme.primaryAccent }}
          />
          <span>{currentTheme.name}</span>
        </span>
        <span className="text-[11px] font-medium tracking-wider uppercase opacity-60">
          Grace of God Mission · Asaba Sanctuary
        </span>
      </footer>
    </div>
  );
}
