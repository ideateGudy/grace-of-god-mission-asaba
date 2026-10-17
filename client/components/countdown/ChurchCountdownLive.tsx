"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  type CountdownThemeId,
  type ChurchCountdownState,
  COUNTDOWN_THEMES,
} from "@/lib/countdown/countdown-types";
import {
  COUNTDOWN_STORAGE_KEY,
  COUNTDOWN_RUNNING_KEY,
  COUNTDOWN_SECS_KEY,
  COUNTDOWN_ZEROED_KEY,
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
  showScripture: false,
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
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [config, setConfig] = useState<ChurchCountdownState>(DEFAULT_STATE);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(300);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chimePlayedRef = useRef<boolean>(false);
  const lastSecondRef = useRef<number>(-1);

  const currentTheme = COUNTDOWN_THEMES[config.theme] || COUNTDOWN_THEMES["royal-gold"];

  // Restore live countdown state on client mount before revealing UI (prevents hydration mismatch #418 & preset flash)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      let loadedConfig: ChurchCountdownState = DEFAULT_STATE;
      const savedConfig = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (savedConfig) {
        loadedConfig = { ...DEFAULT_STATE, ...JSON.parse(savedConfig) };
        setConfig(loadedConfig);
      }

      const isZeroed = localStorage.getItem(COUNTDOWN_ZEROED_KEY);
      if (isZeroed === "true") {
        setIsRunning(false);
        setRemainingSeconds(0);
        setInitialTotalSeconds(0);
        chimePlayedRef.current = true;
      } else {
        const savedRunning = localStorage.getItem(COUNTDOWN_RUNNING_KEY);
        if (savedRunning !== null) {
          setIsRunning(JSON.parse(savedRunning));
        } else {
          // Default to running so live projection counts down immediately on fresh devices
          setIsRunning(true);
        }

        const savedSecs = localStorage.getItem(COUNTDOWN_SECS_KEY);
        if (savedSecs !== null) {
          const parsed = Number(JSON.parse(savedSecs));
          setRemainingSeconds(parsed);
          setInitialTotalSeconds(Math.max(parsed, 1));
        } else {
          if (loadedConfig.mode === "target-time") {
            const secs = calculateSecondsUntilTarget(loadedConfig.targetTimeString);
            setRemainingSeconds(secs);
            setInitialTotalSeconds(Math.max(secs, 1));
          } else {
            setRemainingSeconds(loadedConfig.durationSeconds);
            setInitialTotalSeconds(Math.max(loadedConfig.durationSeconds, 1));
          }
        }
      }
    } catch {
      // Fallback
    }

    setIsMounted(true);
  }, []);

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
      } else if (e.key === COUNTDOWN_RUNNING_KEY && e.newValue !== null) {
        try {
          setIsRunning(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
      } else if (e.key === COUNTDOWN_SECS_KEY && e.newValue !== null) {
        try {
          setRemainingSeconds(Number(JSON.parse(e.newValue)));
        } catch {
          // Ignore
        }
      } else if (e.key === COUNTDOWN_ZEROED_KEY) {
        if (e.newValue === "true") {
          setRemainingSeconds(0);
          setIsRunning(false);
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const hasMountedSyncRef = useRef<boolean>(false);

  // Compute countdown target when mode or parameters change dynamically (skip initial mount, since state was restored)
  useEffect(() => {
    if (!isMounted) return;
    if (!hasMountedSyncRef.current) {
      hasMountedSyncRef.current = true;
      return;
    }

    if (config.mode === "target-time") {
      const secs = calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      chimePlayedRef.current = secs <= 0;
    } else {
      setRemainingSeconds(config.durationSeconds);
      setInitialTotalSeconds(Math.max(config.durationSeconds, 1));
      chimePlayedRef.current = false;
    }
  }, [isMounted, config.mode, config.targetTimeString, config.durationSeconds]);

  // 1-second interval ticker for live projection
  useEffect(() => {
    if (!isMounted || !isRunning) return;

    const interval = setInterval(() => {
      if (config.mode === "target-time") {
        const secs = calculateSecondsUntilTarget(config.targetTimeString);

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

        if (!config.overtimeEnabled && secs <= 0) {
          setRemainingSeconds(0);
          setIsRunning(false);
        } else {
          setRemainingSeconds(secs);
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
            setIsRunning(false);
            return 0;
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isMounted, isRunning, config.mode, config.targetTimeString, config.soundEnabled, config.overtimeEnabled]);

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

  // Toggle play/pause state
  const togglePlayPause = () => {
    setIsRunning((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(next));
        if (next) {
          localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        }
      } catch {
        // Ignored
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyF") {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
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

  // Render neutral sanctuary loading screen until mounted on client
  // Prevents React hydration mismatch #418 and eliminates flashing wrong preset colors/time on refresh
  if (!isMounted) {
    return (
      <div className="relative w-full min-h-[100dvh] flex flex-col justify-center items-center bg-[#060714] text-white select-none overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background: "radial-gradient(ellipse at 50% 20%, #171B38 0%, #0B0E20 45%, #05060E 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-400/60 bg-black/60 shadow-[0_0_30px_rgba(217,164,65,0.3)] p-1 animate-pulse">
            <Image
              src={CHURCH_LOGO_PATH}
              alt="Grace of God Mission Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
              GRACE OF GOD MISSION
            </h2>
            <p className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-400 uppercase">
              ASABA SANCTUARY COUNTDOWN
            </p>
          </div>
          <div className="w-32 sm:w-40 h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onDoubleClick={() => void toggleFullscreen()}
      className="relative w-full min-h-[100dvh] flex flex-col justify-between items-center select-none overflow-x-hidden p-3.5 sm:p-6 md:p-10 cursor-default transition-colors duration-700"
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
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[850px] h-[90vw] max-h-[850px] rounded-full blur-[100px] sm:blur-[160px] -z-10 transition-all duration-1000"
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

      {/* 1. TOP HEADER: Church Brand Pill (Read-only, Clean) */}
      <header className="relative z-20 flex items-center justify-center w-full pt-1 sm:pt-3">
        {config.showLogo && (
          <div className="flex items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-xl">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-amber-400/50 bg-black/40 shrink-0">
              <Image
                src={CHURCH_LOGO_PATH}
                alt="Grace of God Mission Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black tracking-wider block text-white leading-tight">
                GRACE OF GOD MISSION
              </span>
              <span
                className="text-[9px] sm:text-[11px] font-bold tracking-widest block uppercase"
                style={{ color: currentTheme.primaryAccent }}
              >
                ASABA SANCTUARY
              </span>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN STAGE: Subtitle, Programme Title, Countdown Time & Progress */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-4 sm:py-8 max-w-7xl mx-auto w-full px-2 sm:px-4">
        {/* Subtitle Eyebrow Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md mb-2.5 sm:mb-4 shadow-lg">
          <span
            className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full animate-pulse shrink-0"
            style={{
              backgroundColor: isOvertime
                ? "#EF4444"
                : remainingSeconds <= 60
                ? "#F59E0B"
                : currentTheme.primaryAccent,
            }}
          />
          <span
            className="text-[11px] sm:text-xs md:text-sm font-black tracking-widest uppercase"
            style={{ color: currentTheme.primaryAccent }}
          >
            {config.subtitle || "SERVICE STARTS IN..."}
          </span>
        </div>

        {/* Programme Title */}
        <h1 className="font-black tracking-tight text-2xl sm:text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-3 sm:mb-6 max-w-4xl px-2">
          <span className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] break-words">
            {config.title || "UNTITLED CHURCH PROGRAMME"}
          </span>
        </h1>

        {/* OVERTIME BADGE ALERT */}
        {isOvertime && (
          <div className="mb-3 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-rose-500/25 border border-rose-500/60 text-rose-300 font-extrabold text-xs sm:text-base animate-pulse">
            <span>⚠️ SERVICE IN SESSION / OVERTIME</span>
          </div>
        )}

        {/* TIME'S UP CELEBRATORY BANNER (When 00:00:00 and overtime disabled) */}
        {!config.overtimeEnabled && remainingSeconds <= 0 && (
          <div className="mb-4 sm:mb-8 px-4 sm:px-8 py-2.5 sm:py-4 rounded-2xl sm:rounded-3xl bg-amber-500/25 border-2 border-amber-400 text-amber-200 font-black text-lg sm:text-3xl md:text-4xl animate-bounce shadow-2xl">
            ✨ WELCOME TO CHURCH · SERVICE HAS BEGUN ✨
          </div>
        )}

        {/* RESUME / PLAY BUTTON IF PAUSED */}
        {!isRunning && remainingSeconds > 0 && (
          <div className="mb-3 sm:mb-6 z-20">
            <button
              type="button"
              onClick={togglePlayPause}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 border-2 border-amber-400 text-amber-200 font-black text-xs sm:text-sm backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer animate-pulse"
            >
              <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>TIMER PAUSED · TAP TO RESUME</span>
            </button>
          </div>
        )}

        {/* MASSIVE TIME DISPLAY CARDS (Ultra-responsive on all screen sizes) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 md:gap-6 lg:gap-8 my-2 sm:my-6 w-full max-w-5xl mx-auto">
          {/* Hours Card (shown if target-time mode or hours > 0) */}
          {(hours > 0 || config.mode === "target-time") && (
            <>
              <div className="flex flex-col items-center">
                <div
                  className="w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68 rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0"
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
                    className="font-black text-3xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                    style={{ color: currentTheme.digitColor }}
                  >
                    {formatTwoDigits(hours)}
                  </span>
                </div>
                <span
                  className="mt-2 sm:mt-4 text-[9px] sm:text-xs md:text-sm lg:text-base font-black tracking-widest uppercase"
                  style={{ color: currentTheme.labelColor }}
                >
                  HOURS
                </span>
              </div>

              {/* Colon */}
              <div className="flex flex-col justify-center items-center gap-1.5 sm:gap-3 md:gap-5 pb-5 sm:pb-8 md:pb-12 text-white/40 font-black shrink-0">
                <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
                <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
              </div>
            </>
          )}

          {/* Minutes Card */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0 ${
                hours > 0 || config.mode === "target-time"
                  ? "w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68"
                  : "w-[38vw] min-w-[110px] max-w-[160px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[320px] sm:w-52 md:w-64 lg:w-76 h-[40vw] min-h-[120px] max-h-[170px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[340px] sm:h-56 md:h-68 lg:h-80"
              }`}
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
                className={`font-black tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                  hours > 0 || config.mode === "target-time"
                    ? "text-3xl sm:text-6xl md:text-8xl lg:text-9xl"
                    : "text-5xl sm:text-7xl md:text-9xl lg:text-[10rem]"
                }`}
                style={{ color: currentTheme.digitColor }}
              >
                {formatTwoDigits(minutes)}
              </span>
            </div>
            <span
              className="mt-2 sm:mt-4 text-[9px] sm:text-xs md:text-sm lg:text-base font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              MINUTES
            </span>
          </div>

          {/* Colon */}
          <div className="flex flex-col justify-center items-center gap-1.5 sm:gap-3 md:gap-5 pb-5 sm:pb-8 md:pb-12 text-white/40 font-black shrink-0">
            <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
            <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
          </div>

          {/* Seconds Card */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0 ${
                hours > 0 || config.mode === "target-time"
                  ? "w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68"
                  : "w-[38vw] min-w-[110px] max-w-[160px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[320px] sm:w-52 md:w-64 lg:w-76 h-[40vw] min-h-[120px] max-h-[170px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[340px] sm:h-56 md:h-68 lg:h-80"
              }`}
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
                className={`font-black tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                  hours > 0 || config.mode === "target-time"
                    ? "text-3xl sm:text-6xl md:text-8xl lg:text-9xl"
                    : "text-5xl sm:text-7xl md:text-9xl lg:text-[10rem]"
                }`}
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
              className="mt-2 sm:mt-4 text-[9px] sm:text-xs md:text-sm lg:text-base font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              SECONDS
            </span>
          </div>
        </div>

        {/* 3. Ambient Glowing Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-xl md:max-w-2xl mx-auto my-3 sm:my-8 px-4">
          <div className="w-full h-2 sm:h-3 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
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
      </main>

      {/* 4. BALANCED BOTTOM SPACER */}
      <div className="relative z-20 h-2 sm:h-4 w-full pointer-events-none" />
    </div>
  );
}
