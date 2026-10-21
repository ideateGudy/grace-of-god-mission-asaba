"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import {
  type CountdownThemeId,
  type ChurchCountdownState,
  COUNTDOWN_THEMES,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  calculateTimeBreakdown,
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
import { api } from "@/lib/api/client";

const DEFAULT_STATE: ChurchCountdownState = {
  title: "SUNDAY CELEBRATION SERVICE",
  subtitle: "Service Starts In...",
  scriptureRef: "ISAIAH 60:1",
  scriptureText:
    "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
  mode: "activity",
  targetTimeString: "08:00",
  targetDate: "",
  durationSeconds: 1800,
  theme: "royal-gold",
  soundEnabled: true,
  overtimeEnabled: false,
  showScripture: false,
  showLogo: true,
  stageMode: false,
};

function formatTwoDigits(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

export function ChurchCountdownLive() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [config, setConfig] = useState<ChurchCountdownState>(DEFAULT_STATE);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(1800);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chimePlayedRef = useRef<boolean>(false);
  const lastSecondRef = useRef<number>(-1);

  const currentTheme = COUNTDOWN_THEMES[config.theme] || COUNTDOWN_THEMES["royal-gold"];

  // Restore live countdown state on client mount before revealing UI (prevents hydration mismatch #418 & preset flash)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMountedCancelled = false;

    async function initializeLiveCountdown() {
      // 1. Instant local restore to prime memory
      let loadedConfig: ChurchCountdownState = DEFAULT_STATE;
      try {
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
            setIsRunning(true);
          }

          if (loadedConfig.mode === "event-date") {
            const secs = loadedConfig.targetDate
              ? calculateSecondsUntilDate(loadedConfig.targetDate)
              : calculateSecondsUntilTarget(loadedConfig.targetTimeString);
            setRemainingSeconds(secs);
            setInitialTotalSeconds(Math.max(secs, 1));
          } else if (loadedConfig.mode === "target-time") {
            const secs = calculateSecondsUntilTarget(loadedConfig.targetTimeString);
            setRemainingSeconds(secs);
            setInitialTotalSeconds(Math.max(secs, 1));
          } else {
            const savedSecs = localStorage.getItem(COUNTDOWN_SECS_KEY);
            if (savedSecs !== null) {
              const parsed = Number(JSON.parse(savedSecs));
              setRemainingSeconds(parsed);
              setInitialTotalSeconds(Math.max(parsed, 1));
            } else {
              setRemainingSeconds(loadedConfig.durationSeconds);
              setInitialTotalSeconds(Math.max(loadedConfig.durationSeconds, 1));
            }
          }
        }
      } catch {}

      // 2. Authoritative Database Fetch (syncs across PC and mobile)
      try {
        const response = await api.countdown.get();
        if (!isMountedCancelled && response?.data) {
          const remote = response.data;
          const mergedConfig: ChurchCountdownState = {
            title: remote.title || DEFAULT_STATE.title,
            subtitle: remote.subtitle || DEFAULT_STATE.subtitle,
            scriptureRef: remote.scriptureRef || DEFAULT_STATE.scriptureRef,
            scriptureText: remote.scriptureText || DEFAULT_STATE.scriptureText,
            mode: remote.mode || DEFAULT_STATE.mode,
            targetTimeString: remote.targetTimeString || DEFAULT_STATE.targetTimeString,
            targetDate: remote.targetDate || DEFAULT_STATE.targetDate,
            durationSeconds: remote.durationSeconds || DEFAULT_STATE.durationSeconds,
            theme: remote.theme || DEFAULT_STATE.theme,
            soundEnabled: remote.soundEnabled ?? DEFAULT_STATE.soundEnabled,
            overtimeEnabled: remote.overtimeEnabled ?? DEFAULT_STATE.overtimeEnabled,
            showScripture: remote.showScripture ?? DEFAULT_STATE.showScripture,
            showLogo: remote.showLogo ?? DEFAULT_STATE.showLogo,
            stageMode: remote.stageMode ?? DEFAULT_STATE.stageMode,
          };

          setConfig(mergedConfig);
          setIsRunning(remote.isRunning);

          let authoritativeSecs: number;
          if (mergedConfig.mode === "event-date") {
            authoritativeSecs = mergedConfig.targetDate
              ? calculateSecondsUntilDate(mergedConfig.targetDate)
              : calculateSecondsUntilTarget(mergedConfig.targetTimeString);
          } else if (mergedConfig.mode === "target-time") {
            authoritativeSecs = calculateSecondsUntilTarget(mergedConfig.targetTimeString);
          } else if (
            (mergedConfig.mode === "activity" || mergedConfig.mode === "duration") &&
            remote.isRunning &&
            remote.targetEndTime
          ) {
            authoritativeSecs = Math.max(0, Math.round((remote.targetEndTime - Date.now()) / 1000));
          } else {
            authoritativeSecs = remote.remainingSeconds;
          }

          setRemainingSeconds(authoritativeSecs);
          setInitialTotalSeconds(
            mergedConfig.mode === "activity" || mergedConfig.mode === "duration"
              ? Math.max(mergedConfig.durationSeconds, 1)
              : Math.max(authoritativeSecs, 1)
          );

          try {
            localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(mergedConfig));
            localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(remote.isRunning));
            const isDurationBased = mergedConfig.mode === "activity" || mergedConfig.mode === "duration";
            if (isDurationBased) {
              localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(authoritativeSecs));
            } else {
              localStorage.removeItem(COUNTDOWN_SECS_KEY);
            }
            if (authoritativeSecs === 0 && !remote.isRunning) {
              localStorage.setItem(COUNTDOWN_ZEROED_KEY, "true");
            } else {
              localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
            }
          } catch {}
        }
      } catch {
        // Fallback already restored from localStorage
      }

      if (!isMountedCancelled) {
        setIsMounted(true);
      }
    }

    void initializeLiveCountdown();

    return () => {
      isMountedCancelled = true;
    };
  }, []);

  // Poll authoritative database state every 3 seconds to stay synchronized with PC/controller across devices
  useEffect(() => {
    if (!isMounted) return;

    const syncFromRemote = async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const response = await api.countdown.get();
        if (!response?.data) return;
        const remote = response.data;

        // Sync config properties if changed on controller
        setConfig((prev) => {
          if (
            prev.title !== remote.title ||
            prev.subtitle !== remote.subtitle ||
            prev.mode !== remote.mode ||
            prev.targetTimeString !== remote.targetTimeString ||
            prev.targetDate !== (remote.targetDate ?? "") ||
            prev.durationSeconds !== remote.durationSeconds ||
            prev.theme !== remote.theme ||
            prev.showScripture !== remote.showScripture ||
            prev.showLogo !== remote.showLogo
          ) {
            return {
              ...prev,
              title: remote.title,
              subtitle: remote.subtitle,
              scriptureRef: remote.scriptureRef,
              scriptureText: remote.scriptureText,
              mode: remote.mode,
              targetTimeString: remote.targetTimeString,
              targetDate: remote.targetDate ?? "",
              durationSeconds: remote.durationSeconds,
              theme: remote.theme,
              showScripture: remote.showScripture,
              showLogo: remote.showLogo,
              overtimeEnabled: remote.overtimeEnabled,
              soundEnabled: remote.soundEnabled,
            };
          }
          return prev;
        });

        // Sync running status
        setIsRunning((prevRunning) => {
          if (prevRunning !== remote.isRunning) {
            return remote.isRunning;
          }
          return prevRunning;
        });

        // Sync time if paused or reset to 0
        if (!remote.isRunning || remote.remainingSeconds === 0) {
          setRemainingSeconds(remote.remainingSeconds);
        } else if (remote.mode === "event-date" && remote.targetDate) {
          const calculatedSecs = calculateSecondsUntilDate(remote.targetDate);
          setRemainingSeconds(calculatedSecs);
        } else if (remote.mode === "duration" && remote.targetEndTime) {
          const calculatedSecs = Math.round((remote.targetEndTime - Date.now()) / 1000);
          setRemainingSeconds((prev) => {
            if (Math.abs(prev - calculatedSecs) > 2) {
              return calculatedSecs;
            }
            return prev;
          });
        }
      } catch {
        // Stays resilient offline
      }
    };

    const interval = setInterval(syncFromRemote, 3000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        void syncFromRemote();
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
    };
  }, [isMounted]);

  // Sync with Controller via BroadcastChannel & LocalStorage events on the same device
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
          if (state.mode === "event-date") {
            const secs = state.targetDate
              ? calculateSecondsUntilDate(state.targetDate)
              : calculateSecondsUntilTarget(state.targetTimeString);
            setRemainingSeconds(secs);
          } else if (state.mode === "target-time") {
            setRemainingSeconds(calculateSecondsUntilTarget(state.targetTimeString));
          } else {
            setRemainingSeconds(remoteSecs);
          }
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
          setConfig((currentConfig) => {
            if (currentConfig.mode === "activity" || currentConfig.mode === "duration") {
              setRemainingSeconds(Number(JSON.parse(e.newValue!)));
            }
            return currentConfig;
          });
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

    if (config.mode === "event-date") {
      const secs = config.targetDate
        ? calculateSecondsUntilDate(config.targetDate)
        : calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      chimePlayedRef.current = secs <= 0;
    } else if (config.mode === "target-time") {
      const secs = calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      chimePlayedRef.current = secs <= 0;
    } else {
      setRemainingSeconds(config.durationSeconds);
      setInitialTotalSeconds(Math.max(config.durationSeconds, 1));
      chimePlayedRef.current = false;
    }
  }, [isMounted, config.mode, config.targetDate, config.targetTimeString, config.durationSeconds]);

  // 1-second interval ticker for live projection
  useEffect(() => {
    if (!isMounted || !isRunning) return;

    const interval = setInterval(() => {
      if (config.mode === "event-date") {
        const secs = config.targetDate
          ? calculateSecondsUntilDate(config.targetDate)
          : calculateSecondsUntilTarget(config.targetTimeString);

        // Date Countdown: Counts down to zero and stays at zero. Does NOT show Time Up.
        if (secs <= 0) {
          setRemainingSeconds(0);
          setIsRunning(false);
        } else {
          setRemainingSeconds(secs);
        }
      } else if (config.mode === "target-time") {
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
        // Activity Timer (mode === "activity" || mode === "duration")
        // Regulates church activities: counts down to zero and shows time up
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
  }, [
    isMounted,
    isRunning,
    config.mode,
    config.targetDate,
    config.targetTimeString,
    config.soundEnabled,
    config.overtimeEnabled,
  ]);

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

  // Compute breakdown: days, hours, minutes, seconds, overtime
  const isOvertime = remainingSeconds < 0;
  const breakdown = calculateTimeBreakdown(remainingSeconds);
  const { days, hours, minutes, seconds } = breakdown;

  const isActivityTimer = config.mode === "activity" || config.mode === "duration";
  const isEventDateTimer = config.mode === "event-date" || config.mode === "target-time";

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
          backgroundColor:
            isActivityTimer && remainingSeconds <= 0
              ? "rgba(239, 68, 68, 0.32)"
              : isOvertime
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
              backgroundColor:
                isActivityTimer && remainingSeconds <= 0
                  ? "#EF4444"
                  : isOvertime
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
            {config.subtitle || (isActivityTimer ? "CHURCH ACTIVITY TIMER" : "SERVICE STARTS IN...")}
          </span>
        </div>

        {/* Programme Title */}
        <h1 className="font-black tracking-tight text-2xl sm:text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-3 sm:mb-6 max-w-4xl px-2">
          <span className="drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] break-words">
            {config.title || (isActivityTimer ? "CHURCH ACTIVITY" : "UNTITLED CHURCH PROGRAMME")}
          </span>
        </h1>

        {/* ------------------------------------------------------------- */}
        {/* BANNER 1: CHURCH ACTIVITY TIMER "TIME UP" BANNER             */}
        {/* Shows clearly when church activity timer reaches zero         */}
        {/* ------------------------------------------------------------- */}
        {isActivityTimer && remainingSeconds <= 0 && (
          <div className="mb-4 sm:mb-8 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-3xl bg-rose-600/35 border-2 border-rose-500 text-rose-100 font-black text-2xl sm:text-4xl md:text-5xl animate-pulse shadow-[0_0_60px_rgba(244,63,94,0.6)]">
            ⏰ TIME UP · PLEASE CONCLUDE
          </div>
        )}

        {/* Overtime indicator for activity timer if overtime enabled */}
        {isActivityTimer && isOvertime && config.overtimeEnabled && (
          <div className="mb-3 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-rose-500/25 border border-rose-500/60 text-rose-300 font-extrabold text-xs sm:text-base animate-pulse">
            <span>⚠️ ACTIVITY OVERTIME</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BANNER 2: EVENT DATE COUNTDOWN ARRIVAL BANNER                  */}
        {/* Stays at zero and DOES NOT show "TIME UP"                     */}
        {/* ------------------------------------------------------------- */}
        {isEventDateTimer && remainingSeconds <= 0 && (
          <div className="mb-4 sm:mb-8 px-6 sm:px-10 py-2.5 sm:py-4 rounded-2xl sm:rounded-3xl bg-amber-500/20 border-2 border-amber-400 text-amber-200 font-black text-lg sm:text-2xl md:text-3xl animate-in fade-in shadow-xl">
            ✨ WELCOME TO CHURCH · PROGRAMME IN SESSION ✨
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

        {/* ============================================================== */}
        {/* MASSIVE TIME DISPLAY CARDS (Ultra-responsive on all screen sizes) */}
        {/* ============================================================== */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 md:gap-6 lg:gap-8 my-2 sm:my-6 w-full max-w-5xl mx-auto">
          {/* A. DAYS CARD (Displayed only in Event Date Countdown when days > 0) */}
          {isEventDateTimer && days > 0 && (
            <>
              <div className="flex flex-col items-center">
                <div
                  className="w-[20vw] min-w-[62px] max-w-[85px] sm:max-w-[130px] md:max-w-[170px] lg:max-w-[210px] sm:w-32 md:w-44 lg:w-52 h-[24vw] min-h-[75px] max-h-[95px] sm:max-h-[160px] md:max-h-[210px] lg:max-h-[240px] sm:h-38 md:h-48 lg:h-58 rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0"
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
                    className="font-black text-2xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                    style={{ color: currentTheme.digitColor }}
                  >
                    {formatTwoDigits(days)}
                  </span>
                </div>
                <span
                  className="mt-2 sm:mt-4 text-[9px] sm:text-xs md:text-sm lg:text-base font-black tracking-widest uppercase"
                  style={{ color: currentTheme.labelColor }}
                >
                  DAYS
                </span>
              </div>

              {/* Colon */}
              <div className="flex flex-col justify-center items-center gap-1.5 sm:gap-3 md:gap-5 pb-5 sm:pb-8 md:pb-12 text-white/40 font-black shrink-0">
                <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
                <div className="w-1.5 sm:w-3 md:w-3.5 h-1.5 sm:h-3 md:h-3.5 rounded-full bg-white/70 animate-pulse" />
              </div>
            </>
          )}

          {/* B. HOURS CARD */}
          {(hours > 0 || (isEventDateTimer && days === 0) || config.mode === "target-time") && (
            <>
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0 ${
                    isEventDateTimer && days > 0
                      ? "w-[20vw] min-w-[62px] max-w-[85px] sm:max-w-[130px] md:max-w-[170px] lg:max-w-[210px] sm:w-32 md:w-44 lg:w-52 h-[24vw] min-h-[75px] max-h-[95px] sm:max-h-[160px] md:max-h-[210px] lg:max-h-[240px] sm:h-38 md:h-48 lg:h-58"
                      : "w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68"
                  }`}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    borderColor:
                      isActivityTimer && remainingSeconds <= 0
                        ? "#EF4444"
                        : currentTheme.borderColor,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                    style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
                  />
                  <span
                    className={`font-black tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                      isEventDateTimer && days > 0
                        ? "text-2xl sm:text-5xl md:text-7xl lg:text-8xl"
                        : "text-3xl sm:text-6xl md:text-8xl lg:text-9xl"
                    }`}
                    style={{
                      color:
                        isActivityTimer && remainingSeconds <= 0
                          ? "#FCA5A5"
                          : currentTheme.digitColor,
                    }}
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

          {/* C. MINUTES CARD */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0 ${
                isEventDateTimer && days > 0
                  ? "w-[20vw] min-w-[62px] max-w-[85px] sm:max-w-[130px] md:max-w-[170px] lg:max-w-[210px] sm:w-32 md:w-44 lg:w-52 h-[24vw] min-h-[75px] max-h-[95px] sm:max-h-[160px] md:max-h-[210px] lg:max-h-[240px] sm:h-38 md:h-48 lg:h-58"
                  : hours > 0 || (isEventDateTimer && days === 0) || config.mode === "target-time"
                  ? "w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68"
                  : "w-[38vw] min-w-[110px] max-w-[160px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[320px] sm:w-52 md:w-64 lg:w-76 h-[40vw] min-h-[120px] max-h-[170px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[340px] sm:h-56 md:h-68 lg:h-80"
              }`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderColor:
                  isActivityTimer && remainingSeconds <= 0
                    ? "#EF4444"
                    : currentTheme.borderColor,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              />
              <span
                className={`font-black tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] ${
                  isEventDateTimer && days > 0
                    ? "text-2xl sm:text-5xl md:text-7xl lg:text-8xl"
                    : hours > 0 || (isEventDateTimer && days === 0) || config.mode === "target-time"
                    ? "text-3xl sm:text-6xl md:text-8xl lg:text-9xl"
                    : "text-5xl sm:text-7xl md:text-9xl lg:text-[10rem]"
                }`}
                style={{
                  color:
                    isActivityTimer && remainingSeconds <= 0
                      ? "#FCA5A5"
                      : currentTheme.digitColor,
                }}
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

          {/* D. SECONDS CARD */}
          <div className="flex flex-col items-center">
            <div
              className={`rounded-2xl sm:rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.6)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0 ${
                isEventDateTimer && days > 0
                  ? "w-[20vw] min-w-[62px] max-w-[85px] sm:max-w-[130px] md:max-w-[170px] lg:max-w-[210px] sm:w-32 md:w-44 lg:w-52 h-[24vw] min-h-[75px] max-h-[95px] sm:max-h-[160px] md:max-h-[210px] lg:max-h-[240px] sm:h-38 md:h-48 lg:h-58"
                  : hours > 0 || (isEventDateTimer && days === 0) || config.mode === "target-time"
                  ? "w-[24vw] min-w-[72px] max-w-[100px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[250px] sm:w-36 md:w-52 lg:w-60 h-[28vw] min-h-[85px] max-h-[110px] sm:max-h-[190px] md:max-h-[250px] lg:max-h-[280px] sm:h-44 md:h-56 lg:h-68"
                  : "w-[38vw] min-w-[110px] max-w-[160px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[320px] sm:w-52 md:w-64 lg:w-76 h-[40vw] min-h-[120px] max-h-[170px] sm:max-h-[240px] md:max-h-[300px] lg:max-h-[340px] sm:h-56 md:h-68 lg:h-80"
              }`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderColor:
                  isActivityTimer && remainingSeconds <= 0
                    ? "#EF4444"
                    : remainingSeconds <= 10 && remainingSeconds > 0
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
                  isEventDateTimer && days > 0
                    ? "text-2xl sm:text-5xl md:text-7xl lg:text-8xl"
                    : hours > 0 || (isEventDateTimer && days === 0) || config.mode === "target-time"
                    ? "text-3xl sm:text-6xl md:text-8xl lg:text-9xl"
                    : "text-5xl sm:text-7xl md:text-9xl lg:text-[10rem]"
                }`}
                style={{
                  color:
                    isActivityTimer && remainingSeconds <= 0
                      ? "#FCA5A5"
                      : remainingSeconds <= 10 && remainingSeconds > 0
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
                background:
                  isActivityTimer && remainingSeconds <= 0
                    ? "linear-gradient(90deg, #EF4444, #DC2626)"
                    : `linear-gradient(90deg, ${currentTheme.primaryAccent}, ${currentTheme.secondaryAccent})`,
                boxShadow:
                  isActivityTimer && remainingSeconds <= 0
                    ? "0 0 16px rgba(239, 68, 68, 0.6)"
                    : `0 0 16px ${currentTheme.accentGlow}`,
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
