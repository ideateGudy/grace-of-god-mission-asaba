"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sliders,
  Settings2,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Calendar,
  Church,
  Flame,
  BookOpen,
  Crown,
  Plus,
  Minus,
  Check,
  Wifi,
  WifiOff,
  Tv,
  Share2,
  ExternalLink,
} from "lucide-react";
import {
  type CountdownMode,
  type CountdownThemeId,
  type ChurchCountdownState,
  COUNTDOWN_THEMES,
  COUNTDOWN_COLOR_PRESETS,
  PROGRAMME_PRESETS,
  ACTIVITY_PRESETS,
  EVENT_DATE_PRESETS,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  calculateTimeBreakdown,
  getNextSundayServiceDate,
  getNextMidweekServiceDate,
  getUpcomingNewYearDate,
  formatToLocalIso,
} from "@/lib/countdown/countdown-types";
import {
  COUNTDOWN_STORAGE_KEY,
  COUNTDOWN_RUNNING_KEY,
  COUNTDOWN_SECS_KEY,
  COUNTDOWN_ZEROED_KEY,
  COUNTDOWN_SYNC_CHANNEL,
  broadcastCountdownState,
} from "@/lib/countdown/countdown-sync";
import { audioSynth } from "@/lib/countdown/audio-synth";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { UpdateCountdownDto } from "@ggm/types";

const STORAGE_KEY = COUNTDOWN_STORAGE_KEY;

const DEFAULT_STATE: ChurchCountdownState = {
  title: "SUNDAY CELEBRATION SERVICE",
  subtitle: "Service Starts In...",
  scriptureRef: "ISAIAH 60:1",
  scriptureText: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
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

function getPresetIcon(iconName: string): string {
  switch (iconName) {
    case "Church":
      return "⛪";
    case "BookOpen":
      return "📖";
    case "Flame":
      return "🔥";
    case "Sparkles":
      return "✨";
    case "Crown":
      return "👑";
    default:
      return "⏱️";
  }
}

export function ChurchCountdown() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [config, setConfig] = useState<ChurchCountdownState>(DEFAULT_STATE);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(1800);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [controlsOpen, setControlsOpen] = useState<boolean>(false);
  const [customTimerOpen, setCustomTimerOpen] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<string>("30");
  const [customSeconds, setCustomSeconds] = useState<string>("0");
  const [customTargetTime, setCustomTargetTime] = useState<string>("08:00");
  const [customTargetDate, setCustomTargetDate] = useState<string>(() => getNextSundayServiceDate());
  const [timerDialogTab, setTimerDialogTab] = useState<"activity" | "event-date">("activity");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chimePlayedRef = useRef<boolean>(false);
  const lastSecondRef = useRef<number>(-1);

  const currentTheme = COUNTDOWN_THEMES[config.theme] || COUNTDOWN_THEMES["royal-gold"];
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Restore state from database (with localStorage offline fallback)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMountedCancelled = false;

    async function initializeCountdown() {
      // 1. Instant local restore to prepare memory
      let loadedConfig: ChurchCountdownState = DEFAULT_STATE;
      try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
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

      // 2. Authoritative Database Fetch (sync across all physical devices)
      try {
        const response = await api.countdown.get();
        if (!isMountedCancelled && response?.data) {
          const dbData = response.data;
          const mergedConfig: ChurchCountdownState = {
            title: dbData.title || DEFAULT_STATE.title,
            subtitle: dbData.subtitle || DEFAULT_STATE.subtitle,
            scriptureRef: dbData.scriptureRef || DEFAULT_STATE.scriptureRef,
            scriptureText: dbData.scriptureText || DEFAULT_STATE.scriptureText,
            mode: dbData.mode || DEFAULT_STATE.mode,
            targetTimeString: dbData.targetTimeString || DEFAULT_STATE.targetTimeString,
            targetDate: dbData.targetDate || DEFAULT_STATE.targetDate,
            durationSeconds: dbData.durationSeconds || DEFAULT_STATE.durationSeconds,
            theme: dbData.theme || DEFAULT_STATE.theme,
            soundEnabled: dbData.soundEnabled ?? DEFAULT_STATE.soundEnabled,
            overtimeEnabled: dbData.overtimeEnabled ?? DEFAULT_STATE.overtimeEnabled,
            showScripture: dbData.showScripture ?? DEFAULT_STATE.showScripture,
            showLogo: dbData.showLogo ?? DEFAULT_STATE.showLogo,
            stageMode: dbData.stageMode ?? DEFAULT_STATE.stageMode,
          };

          setConfig(mergedConfig);
          setIsRunning(dbData.isRunning);

          let authoritativeSecs: number;
          if (mergedConfig.mode === "event-date") {
            authoritativeSecs = mergedConfig.targetDate
              ? calculateSecondsUntilDate(mergedConfig.targetDate)
              : calculateSecondsUntilTarget(mergedConfig.targetTimeString);
          } else if (mergedConfig.mode === "target-time") {
            authoritativeSecs = calculateSecondsUntilTarget(mergedConfig.targetTimeString);
          } else if (
            (mergedConfig.mode === "activity" || mergedConfig.mode === "duration") &&
            dbData.isRunning &&
            dbData.targetEndTime
          ) {
            authoritativeSecs = Math.max(0, Math.round((dbData.targetEndTime - Date.now()) / 1000));
          } else {
            authoritativeSecs = dbData.remainingSeconds;
          }

          setRemainingSeconds(authoritativeSecs);
          setInitialTotalSeconds(
            mergedConfig.mode === "activity" || mergedConfig.mode === "duration"
              ? Math.max(mergedConfig.durationSeconds, 1)
              : Math.max(authoritativeSecs, 1)
          );

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfig));
            localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(dbData.isRunning));
            const isDurationBased = mergedConfig.mode === "activity" || mergedConfig.mode === "duration";
            if (isDurationBased) {
              localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(authoritativeSecs));
            } else {
              localStorage.removeItem(COUNTDOWN_SECS_KEY);
            }
            if (authoritativeSecs === 0 && !dbData.isRunning) {
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

    void initializeCountdown();

    return () => {
      isMountedCancelled = true;
    };
  }, []);

  // Initialize broadcast channel for live projection synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      broadcastChannelRef.current = new BroadcastChannel(COUNTDOWN_SYNC_CHANNEL);
    } catch {
      // Ignored
    }
    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Broadcast state updates to live projection displays
  useEffect(() => {
    if (!isMounted) return;
    broadcastCountdownState(broadcastChannelRef.current, {
      type: "SYNC_STATE",
      state: config,
      remainingSeconds,
      isRunning,
    });
  }, [isMounted, config, remainingSeconds, isRunning]);

  // Save config to localStorage for 100% offline persistence
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore
    }
  }, [isMounted, config]);

  // Debounced database sync ref so every state modification saves to database
  const lastSavedPayloadRef = useRef<string>("");
  const dbSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state modifications to the database so all physical devices stay in lockstep
  useEffect(() => {
    if (!isMounted) return;

    if (dbSyncTimeoutRef.current) {
      clearTimeout(dbSyncTimeoutRef.current);
    }

    dbSyncTimeoutRef.current = setTimeout(() => {
      const payload: UpdateCountdownDto = {
        title: config.title,
        subtitle: config.subtitle,
        scriptureRef: config.scriptureRef,
        scriptureText: config.scriptureText,
        mode: config.mode,
        targetTimeString: config.targetTimeString,
        targetDate: config.targetDate,
        durationSeconds: config.durationSeconds,
        theme: config.theme,
        soundEnabled: config.soundEnabled,
        overtimeEnabled: config.overtimeEnabled,
        showScripture: config.showScripture,
        showLogo: config.showLogo,
        stageMode: config.stageMode,
        isRunning,
        remainingSeconds,
      };

      const key = `${config.title}|${config.subtitle}|${config.mode}|${config.targetDate}|${config.targetTimeString}|${config.durationSeconds}|${config.theme}|${isRunning}|${remainingSeconds}|${config.showScripture}|${config.showLogo}`;
      if (key === lastSavedPayloadRef.current) return;
      lastSavedPayloadRef.current = key;

      api.countdown.update(payload).catch(() => {
        // Offline resilient
      });
    }, 350);

    return () => {
      if (dbSyncTimeoutRef.current) {
        clearTimeout(dbSyncTimeoutRef.current);
      }
    };
  }, [isMounted, config, isRunning, remainingSeconds]);

  // Monitor network status
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Online connected. Timer remains synchronized offline.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Offline mode active. All countdown features work 100% offline.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const hasMountedSyncRef = useRef<boolean>(false);

  // Sync countdown target when mode or parameters change (skip initial mount, since state was restored)
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

  // 1-second interval ticker
  useEffect(() => {
    if (!isMounted || !isRunning) return;

    const interval = setInterval(() => {
      if (config.mode === "event-date") {
        // Event/Date countdown: counts down to zero and stays at zero. Does NOT show time up.
        const secs = config.targetDate
          ? calculateSecondsUntilDate(config.targetDate)
          : calculateSecondsUntilTarget(config.targetTimeString);

        // Sound triggers
        if (config.soundEnabled) {
          if (secs > 0 && secs <= 5 && lastSecondRef.current !== secs) {
            audioSynth.playUrgentTick();
            lastSecondRef.current = secs;
          } else if (secs === 0 && !chimePlayedRef.current) {
            audioSynth.playServiceGong();
            chimePlayedRef.current = true;
          }
        }

        if (secs <= 0) {
          setRemainingSeconds(0);
          setIsRunning(false);
        } else {
          setRemainingSeconds(secs);
        }
      } else if (config.mode === "target-time") {
        const secs = calculateSecondsUntilTarget(config.targetTimeString);

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
        // Church activity timer (mode: "activity" or "duration"): counts down to zero and triggers time up
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

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard shortcuts (Space = Play/Pause, R = Reset, F = Fullscreen, H = Hide Controls/Stage Mode, M = Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isEditingTitle
      ) {
        if (e.key === "Escape" && customTimerOpen) {
          setCustomTimerOpen(false);
        }
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "KeyZ" || e.code === "Digit0") {
        e.preventDefault();
        handleResetToZero();
      } else if (e.code === "KeyT") {
        e.preventDefault();
        setCustomTimerOpen((prev) => !prev);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleReset();
      } else if (e.code === "KeyF") {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.code === "KeyH") {
        e.preventDefault();
        setConfig((p) => ({ ...p, stageMode: !p.stageMode }));
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setConfig((p) => {
          const next = !p.soundEnabled;
          toast.info(next ? "Chimes Enabled" : "Chimes Muted");
          return { ...p, soundEnabled: next };
        });
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleAdjustMinutes(1);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleAdjustMinutes(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isEditingTitle, customTimerOpen]);

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
      // Fallback
    }
  };

  const togglePlayPause = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(next));
          if (next) {
            localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
          }
        } catch {
          // Ignore
        }
      }
      toast.info(next ? "Timer Resumed" : "Timer Paused");
      return next;
    });
  };

  const handleSelectActivityTimer = (durationMinutes: number = 30, activityTitle?: string) => {
    const totalSecs = Math.max(1, durationMinutes * 60);
    chimePlayedRef.current = false;
    lastSecondRef.current = -1;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, "true");
        localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(totalSecs));
      } catch {}
    }
    setRemainingSeconds(totalSecs);
    setInitialTotalSeconds(totalSecs);
    setIsRunning(true);
    setConfig((prev) => ({
      ...prev,
      mode: "activity",
      durationSeconds: totalSecs,
      title: activityTitle || (prev.mode === "event-date" ? "SERMON / MESSAGE" : prev.title),
      subtitle: "SANCTUARY ACTIVITY COUNTDOWN",
    }));
    toast.success(`Church Activity Timer: ${durationMinutes} mins (Shows 'Time Up' at zero)`);
  };

  const handleSelectEventDateTimer = (targetIso?: string, eventTitle?: string) => {
    const dateToUse = targetIso || config.targetDate || getNextSundayServiceDate();
    const secs = calculateSecondsUntilDate(dateToUse);
    chimePlayedRef.current = secs <= 0;
    lastSecondRef.current = -1;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        localStorage.removeItem(COUNTDOWN_SECS_KEY);
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(secs > 0));
      } catch {}
    }
    setRemainingSeconds(secs);
    setInitialTotalSeconds(Math.max(secs, 1));
    setIsRunning(secs > 0);
    setConfig((prev) => ({
      ...prev,
      mode: "event-date",
      targetDate: dateToUse,
      title:
        eventTitle ||
        (prev.mode === "activity" || prev.mode === "duration" ? "SUNDAY CELEBRATION SERVICE" : prev.title),
      subtitle: "COUNTDOWN TO SERVICE",
    }));
    toast.success("Event & Date Countdown Active (Stays at zero, no 'Time Up')");
  };

  const handleSetCustomEventDate = (isoString: string, customTitle?: string, autoStart: boolean = true) => {
    const secs = calculateSecondsUntilDate(isoString);
    chimePlayedRef.current = secs <= 0;
    lastSecondRef.current = -1;
    const shouldRun = autoStart && secs > 0;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        localStorage.removeItem(COUNTDOWN_SECS_KEY);
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(shouldRun));
      } catch {}
    }
    setRemainingSeconds(secs);
    setInitialTotalSeconds(Math.max(secs, 1));
    setIsRunning(shouldRun);
    setConfig((prev) => ({
      ...prev,
      mode: "event-date",
      targetDate: isoString,
      ...(customTitle ? { title: customTitle.toUpperCase() } : {}),
      subtitle: "COUNTDOWN TO PROGRAMME",
    }));
    setCustomTimerOpen(false);
    toast.success(`Target Event Date Set`);
  };

  const handleReset = () => {
    chimePlayedRef.current = false;
    lastSecondRef.current = -1;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, "true");
      } catch {}
    }
    if (config.mode === "event-date") {
      const secs = config.targetDate
        ? calculateSecondsUntilDate(config.targetDate)
        : calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      setIsRunning(secs > 0);
    } else if (config.mode === "target-time") {
      const secs = calculateSecondsUntilTarget(config.targetTimeString);
      setRemainingSeconds(secs);
      setInitialTotalSeconds(Math.max(secs, 1));
      setIsRunning(secs > 0);
    } else {
      setRemainingSeconds(config.durationSeconds);
      setInitialTotalSeconds(Math.max(config.durationSeconds, 1));
      setIsRunning(true);
    }
    toast.info("Timer Reset to Initial Target");
  };

  const handleResetToZero = () => {
    chimePlayedRef.current = true;
    lastSecondRef.current = -1;
    setRemainingSeconds(0);
    setInitialTotalSeconds(0);
    setIsRunning(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, "false");
        localStorage.setItem(COUNTDOWN_SECS_KEY, "0");
        localStorage.setItem(COUNTDOWN_ZEROED_KEY, "true");
      } catch {}
    }
    if (config.mode === "activity" || config.mode === "duration") {
      setConfig((prev) => ({
        ...prev,
        durationSeconds: 0,
      }));
    }
    toast.info("Timer Reset to 00:00:00 (Stopped)");
  };

  const handleSetCustomDuration = (minutes: number, seconds: number = 0, autoStart: boolean = true) => {
    const totalSecs = Math.max(0, Math.floor(minutes) * 60 + Math.floor(seconds));
    chimePlayedRef.current = false;
    lastSecondRef.current = -1;
    if (typeof window !== "undefined") {
      try {
        if (totalSecs > 0 || autoStart) {
          localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        }
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(autoStart));
        localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(totalSecs));
      } catch {}
    }
    setRemainingSeconds(totalSecs);
    setInitialTotalSeconds(Math.max(totalSecs, 1));
    setIsRunning(autoStart);
    setConfig((prev) => ({
      ...prev,
      mode: "activity",
      durationSeconds: totalSecs,
    }));
    setCustomTimerOpen(false);
    toast.success(
      `Activity Timer Set: ${minutes}m ${seconds > 0 ? `${seconds}s` : ""} ${autoStart ? "(Running)" : "(Ready)"}`
    );
  };

  const handleSetCustomTargetTime = (targetHHMM: string, autoStart: boolean = true) => {
    const secs = calculateSecondsUntilTarget(targetHHMM);
    chimePlayedRef.current = secs <= 0;
    lastSecondRef.current = -1;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
        localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(autoStart));
        localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(secs));
      } catch {}
    }
    setRemainingSeconds(secs);
    setInitialTotalSeconds(Math.max(secs, 1));
    setIsRunning(autoStart);
    setConfig((prev) => ({
      ...prev,
      mode: "target-time",
      targetTimeString: targetHHMM,
    }));
    setCustomTimerOpen(false);
    toast.success(`Target Clock: ${targetHHMM} ${autoStart ? "(Running)" : "(Ready)"}`);
  };

  const handleAdjustMinutes = (deltaMinutes: number) => {
    setRemainingSeconds((prev) => {
      const next = prev + deltaMinutes * 60;
      return next;
    });
    toast.info(`${deltaMinutes > 0 ? "+" : ""}${deltaMinutes} min adjusted`);
  };

  const handleApplyColorTheme = (themeId: CountdownThemeId, themeName: string) => {
    setConfig((prev) => ({
      ...prev,
      theme: themeId, // Only change page color / theme, preserve title and time!
    }));
    toast.success(`Color Theme Applied: ${themeName}`);
  };

  // Timer mode flags
  const isActivityTimer = config.mode === "activity" || config.mode === "duration";
  const isEventDateTimer = config.mode === "event-date" || config.mode === "target-time";

  // Compute breakdown: days, hours, minutes, seconds, overtime
  const { days, hours, minutes, seconds, isZero } = useMemo(
    () => calculateTimeBreakdown(remainingSeconds),
    [remainingSeconds]
  );
  const isOvertime = isActivityTimer && remainingSeconds < 0;

  // Percentage for circular progress ring (0 to 1)
  const progressRatio = useMemo(() => {
    if (initialTotalSeconds <= 0) return 0;
    if (remainingSeconds <= 0) return 1;
    return 1 - remainingSeconds / initialTotalSeconds;
  }, [remainingSeconds, initialTotalSeconds]);

  // Render neutral sanctuary loading screen until mounted on client
  // Prevents React hydration mismatch #418 and eliminates flashing wrong preset colors/time on refresh
  if (!isMounted) {
    return (
      <div className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#060714] text-white select-none overflow-hidden p-6">
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
      className={`relative w-full min-h-screen flex flex-col justify-between select-none overflow-hidden transition-colors duration-700 ${
        isFullscreen ? "p-4 sm:p-8" : "p-4 sm:p-6 md:p-8"
      }`}
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
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] -z-10 transition-all duration-1000"
        style={{
          backgroundColor: isOvertime
            ? "rgba(239, 68, 68, 0.22)"
            : remainingSeconds <= 60
            ? "rgba(245, 158, 11, 0.25)"
            : currentTheme.accentGlow,
        }}
      />

      {/* Modern Sacred Grid Lines in Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* ============================================================== */}
      {/* 1. TOP HEADER BAR: Church Logo, Live Status & Media HUD Controls */}
      {/* ============================================================== */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Church Brand Pill */}
        {config.showLogo && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-lg">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400/50 bg-black/40">
              <Image
                src={CHURCH_LOGO_PATH}
                alt="Grace of God Mission Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider block text-white">
                GRACE OF GOD MISSION
              </span>
              <span
                className="text-[10px] font-bold tracking-widest block uppercase"
                style={{ color: currentTheme.primaryAccent }}
              >
                ASABA · SANCTUARY COUNTDOWN
              </span>
            </div>
          </div>
        )}

        {/* Status Indicators & Media Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Offline Ready Badge */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-md transition ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? "⚡ Offline Ready" : "Offline Active"}</span>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !config.soundEnabled;
              setConfig((p) => ({ ...p, soundEnabled: next }));
              toast.info(next ? "Cathedral Chime Enabled" : "Audio Muted");
            }}
            title={config.soundEnabled ? "Chimes enabled (Press M to mute)" : "Chimes muted"}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/15 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">{config.soundEnabled ? "Chime On" : "Muted"}</span>
          </button>

          {/* Stage Mode (Hide UI) Toggle */}
          <button
            type="button"
            onClick={() => setConfig((p) => ({ ...p, stageMode: !p.stageMode }))}
            title={config.stageMode ? "Show controls (Press H)" : "Hide controls for projector (Press H)"}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              config.stageMode
                ? "bg-primary/20 border-primary text-primary"
                : "bg-white/[0.06] border-white/10 text-white hover:bg-white/15"
            }`}
          >
            {config.stageMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {config.stageMode ? "Exit Stage View" : "Stage View"}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            title="Toggle Sanctuary Fullscreen (Press F)"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/15 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
          </button>

          {/* Live Fullscreen Projection Route Link */}
          <a
            href="/countdown/live"
            target="_blank"
            rel="noopener noreferrer"
            title="Open clean, read-only live projection display in a new window/tab"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <Tv className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Live Projection</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </a>

          {/* Copy Live Projection Link */}
          <button
            type="button"
            onClick={() => {
              const url =
                typeof window !== "undefined"
                  ? `${window.location.origin}/countdown/live`
                  : "https://ggmasaba.vercel.app/countdown/live";
              if (navigator.clipboard) {
                void navigator.clipboard.writeText(url);
                toast.success("Live Projection link copied! Open on projector or OBS display.");
              }
            }}
            title="Copy clean projection link to clipboard"
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/15 transition flex items-center gap-1 text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Share Link</span>
          </button>

          {/* Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => setControlsOpen((prev) => !prev)}
            title="Configure Programme Title, Target Time, and Theme"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <Settings2 className="w-4 h-4 text-amber-400" />
            <span>Edit Programme</span>
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 2. DUAL-TIMER SELECTOR SEGMENTED CONTROL (Only One Runs At A Time) */}
      {/* ============================================================== */}
      {!config.stageMode && (
        <div className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-3 pb-2">
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl">
            {/* Tab 1: Church Sanctuary Activity Timer */}
            <button
              type="button"
              onClick={() =>
                handleSelectActivityTimer(Math.max(1, Math.floor((config.durationSeconds || 1800) / 60)))
              }
              className={`py-3 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 cursor-pointer ${
                isActivityTimer
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/25 ring-1 ring-amber-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="tracking-wide">Church Activity Timer</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActivityTimer ? "bg-black/20 text-black" : "bg-white/10 text-white/50"
                }`}
              >
                Shows &ldquo;Time Up&rdquo;
              </span>
            </button>

            {/* Tab 2: Event & Date Countdown */}
            <button
              type="button"
              onClick={() => handleSelectEventDateTimer()}
              className={`py-3 px-3 sm:px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 cursor-pointer ${
                isEventDateTimer
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="tracking-wide">Event & Date Countdown</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isEventDateTimer ? "bg-black/20 text-black" : "bg-white/10 text-white/50"
                }`}
              >
                Stays at Zero
              </span>
            </button>
          </div>

          {/* Contextual Quick Presets Bar for Active Timer */}
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {isActivityTimer ? (
              <>
                <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Activity Presets:</span>
                </span>
                {ACTIVITY_PRESETS.map((act) => {
                  const isCur =
                    config.mode === "activity" && config.durationSeconds === act.durationMinutes * 60;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleSelectActivityTimer(act.durationMinutes, act.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition cursor-pointer flex items-center gap-1.5 ${
                        isCur
                          ? "bg-amber-400 text-black border-amber-400 shadow-md font-black"
                          : "bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{getPresetIcon(act.iconName)}</span>
                      <span>{act.name}</span>
                      <span className="opacity-75">({act.durationMinutes}m)</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Quick Date Presets:</span>
                </span>
                {EVENT_DATE_PRESETS.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      const iso = ev.getTargetDate();
                      handleSelectEventDateTimer(iso, ev.name);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border bg-white/[0.04] border-white/10 text-white/80 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{getPresetIcon(ev.iconName)}</span>
                    <span>{ev.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setTimerDialogTab("event-date");
                    setCustomTimerOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Pick Date & Time...</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CORE COUNTDOWN STAGE: Editable Title, Massive Time, Scripture */}
      {/* ============================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-6 sm:py-10 max-w-6xl mx-auto w-full">
        {/* Editable Programme Title (Click to edit inline or via drawer) */}
        <div className="max-w-4xl mx-auto space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: isOvertime
                  ? "#EF4444"
                  : remainingSeconds <= 60
                  ? "#F59E0B"
                  : isActivityTimer
                  ? currentTheme.primaryAccent
                  : "#10B981",
              }}
            />
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: isActivityTimer ? currentTheme.primaryAccent : "#34D399" }}
            >
              {config.subtitle}
            </span>
          </div>

          {/* INLINE EDITABLE PROGRAMME TITLE */}
          {isEditingTitle ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value.toUpperCase() }))}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
                autoFocus
                className="w-full max-w-2xl px-4 py-2 text-2xl sm:text-4xl font-black text-center text-white bg-black/60 border-2 rounded-2xl outline-none"
                style={{ borderColor: currentTheme.primaryAccent }}
              />
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-3 rounded-2xl bg-primary text-black font-bold"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit programme title"
              className="group cursor-pointer font-black tracking-tight text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white transition hover:opacity-90 flex items-center justify-center gap-3"
            >
              <span className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                {config.title || "UNTITLED CHURCH PROGRAMME"}
              </span>
              {!config.stageMode && (
                <span className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground font-normal border border-white/20 rounded-md px-2 py-0.5 transition">
                  Edit ✏️
                </span>
              )}
            </h1>
          )}
        </div>

        {/* STATUS BANNER 1: CHURCH ACTIVITY TIMER - TIME UP (Prominent Alert) */}
        {isActivityTimer && remainingSeconds <= 0 && (
          <div className="mb-6 px-8 py-4 rounded-3xl bg-rose-600/30 border-2 border-rose-500 text-rose-200 font-black text-2xl sm:text-4xl animate-pulse shadow-[0_0_50px_rgba(244,63,94,0.4)] flex items-center justify-center gap-3">
            <span>⏰ TIME UP · PLEASE CONCLUDE</span>
          </div>
        )}

        {/* STATUS BANNER 2: ACTIVITY OVERTIME BADGE */}
        {isActivityTimer && isOvertime && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-extrabold text-sm sm:text-base animate-pulse">
            <span>
              ⚠️ ACTIVITY OVERTIME: +{formatTwoDigits(minutes)}:{formatTwoDigits(seconds)}
            </span>
          </div>
        )}

        {/* STATUS BANNER 3: EVENT & DATE COUNTDOWN - ARRIVAL BANNER (Does NOT show Time Up, stays at 0) */}
        {isEventDateTimer && remainingSeconds <= 0 && (
          <div className="mb-6 px-8 py-3.5 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-200 font-black text-xl sm:text-3xl animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            ✨ THE APPOINTED TIME HAS ARRIVED · WELCOME TO SERVICE ✨
          </div>
        )}

        {/* ============================================================== */}
        {/* ARCHITECTURAL TIME CARDS (Click any card or press T)          */}
        {/* ============================================================== */}
        {!config.stageMode && (
          <button
            type="button"
            onClick={() => {
              setTimerDialogTab(isActivityTimer ? "activity" : "event-date");
              setCustomTimerOpen(true);
            }}
            title="Click any card or press 'T' to set custom timer"
            className="group mb-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 hover:text-white transition shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Click cards or press &apos;T&apos; to configure · &apos;Z&apos; for 00:00</span>
          </button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 my-2">
          {/* Days Card (Displayed for Event Date Countdown when days > 0) */}
          {isEventDateTimer && days > 0 && (
            <>
              <div
                onClick={() => {
                  setTimerDialogTab("event-date");
                  setCustomTimerOpen(true);
                }}
                title="Click to configure date countdown (Press T)"
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className="w-20 sm:w-28 md:w-36 lg:w-44 h-28 sm:h-36 md:h-48 lg:h-56 rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] group-hover:border-emerald-400/60 relative overflow-hidden"
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
                    className="font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                    style={{ color: currentTheme.digitColor }}
                  >
                    {formatTwoDigits(days)}
                  </span>
                </div>
                <span
                  className="mt-3 text-xs sm:text-sm font-black tracking-widest uppercase"
                  style={{ color: currentTheme.labelColor }}
                >
                  DAYS
                </span>
              </div>

              {/* Colon Separator */}
              <div className="flex flex-col justify-center items-center gap-2 sm:gap-3 pb-6 sm:pb-10 text-xl sm:text-3xl text-white/40 font-black">
                <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
                <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
              </div>
            </>
          )}

          {/* Hours Card (Displayed if hours > 0 or in event-date mode) */}
          {(hours > 0 || isEventDateTimer || config.mode === "target-time") && (
            <>
              <div
                onClick={() => {
                  setTimerDialogTab(isActivityTimer ? "activity" : "event-date");
                  setCustomTimerOpen(true);
                }}
                title="Click to set custom timer (Press T)"
                className="flex flex-col items-center cursor-pointer group"
              >
                <div
                  className="w-20 sm:w-28 md:w-36 lg:w-44 h-28 sm:h-36 md:h-48 lg:h-56 rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] group-hover:border-amber-400/60 relative overflow-hidden"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    borderColor:
                      isActivityTimer && remainingSeconds <= 0 ? "#EF4444" : currentTheme.borderColor,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                    style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
                  />
                  <span
                    className="font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                    style={{
                      color:
                        isActivityTimer && remainingSeconds <= 0 ? "#F87171" : currentTheme.digitColor,
                    }}
                  >
                    {formatTwoDigits(hours)}
                  </span>
                </div>
                <span
                  className="mt-3 text-xs sm:text-sm font-black tracking-widest uppercase"
                  style={{ color: currentTheme.labelColor }}
                >
                  HOURS
                </span>
              </div>

              {/* Colon Separator */}
              <div className="flex flex-col justify-center items-center gap-2 sm:gap-3 pb-6 sm:pb-10 text-xl sm:text-3xl text-white/40 font-black">
                <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
                <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
              </div>
            </>
          )}

          {/* Minutes Card */}
          <div
            onClick={() => {
              setTimerDialogTab(isActivityTimer ? "activity" : "event-date");
              setCustomTimerOpen(true);
            }}
            title="Click to set custom timer (Press T)"
            className="flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`${
                isActivityTimer && hours === 0
                  ? "w-28 sm:w-44 md:w-56 lg:w-64 h-36 sm:h-52 md:h-64 lg:h-72"
                  : "w-20 sm:w-28 md:w-36 lg:w-44 h-28 sm:h-36 md:h-48 lg:h-56"
              } rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] group-hover:border-amber-400/60 relative overflow-hidden`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderColor:
                  isActivityTimer && remainingSeconds <= 0 ? "#EF4444" : currentTheme.borderColor,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-white/[0.03] border-b"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              />
              <span
                className={`font-black ${
                  isActivityTimer && hours === 0
                    ? "text-6xl sm:text-8xl md:text-9xl lg:text-[10rem]"
                    : "text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                } tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]`}
                style={{
                  color:
                    isActivityTimer && remainingSeconds <= 0 ? "#F87171" : currentTheme.digitColor,
                }}
              >
                {formatTwoDigits(minutes)}
              </span>
            </div>
            <span
              className="mt-3 text-xs sm:text-sm font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              MINUTES
            </span>
          </div>

          {/* Colon Separator */}
          <div className="flex flex-col justify-center items-center gap-2 sm:gap-3 pb-6 sm:pb-10 text-xl sm:text-3xl text-white/40 font-black">
            <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
            <div className="w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full bg-white/60 animate-pulse" />
          </div>

          {/* Seconds Card */}
          <div
            onClick={() => {
              setTimerDialogTab(isActivityTimer ? "activity" : "event-date");
              setCustomTimerOpen(true);
            }}
            title="Click to set custom timer (Press T)"
            className="flex flex-col items-center cursor-pointer group"
          >
            <div
              className={`${
                isActivityTimer && hours === 0
                  ? "w-28 sm:w-44 md:w-56 lg:w-64 h-36 sm:h-52 md:h-64 lg:h-72"
                  : "w-20 sm:w-28 md:w-36 lg:w-44 h-28 sm:h-36 md:h-48 lg:h-56"
              } rounded-3xl flex items-center justify-center border backdrop-blur-2xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:scale-[1.02] group-hover:border-amber-400/60 relative overflow-hidden`}
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
                className={`font-black ${
                  isActivityTimer && hours === 0
                    ? "text-6xl sm:text-8xl md:text-9xl lg:text-[10rem]"
                    : "text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
                } tracking-tighter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]`}
                style={{
                  color:
                    isActivityTimer && remainingSeconds <= 0
                      ? "#F87171"
                      : remainingSeconds <= 10 && remainingSeconds > 0
                      ? "#FDE047"
                      : currentTheme.digitColor,
                }}
              >
                {formatTwoDigits(seconds)}
              </span>
            </div>
            <span
              className="mt-3 text-xs sm:text-sm font-black tracking-widest uppercase"
              style={{ color: currentTheme.labelColor }}
            >
              SECONDS
            </span>
          </div>
        </div>

        {/* PROGRESS BAR (Clean thin glowing sanctuary progress bar) */}
        <div className="w-full max-w-xl mx-auto my-6 px-4">
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, progressRatio * 100))}%`,
                background: `linear-gradient(90deg, ${currentTheme.primaryAccent}, ${currentTheme.secondaryAccent})`,
                boxShadow: `0 0 12px ${currentTheme.accentGlow}`,
              }}
            />
          </div>
        </div>

        {/* Scripture Card (Sanctuary Inspiration) */}
        {config.showScripture && config.scriptureText && (
          <div className="max-w-2xl mx-auto mt-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
            <span
              className="text-xs font-black tracking-widest block uppercase mb-1"
              style={{ color: currentTheme.primaryAccent }}
            >
              // {config.scriptureRef || "SCRIPTURE FOCUS"}
            </span>
            <p className="text-sm sm:text-base font-medium italic text-white/90 leading-relaxed">
              &ldquo;{config.scriptureText}&rdquo;
            </p>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 4. BOTTOM CONTROLS DOCK (Hidden in Stage View for Clean Look)  */}
      {/* ============================================================== */}
      <footer className="relative z-20 max-w-5xl mx-auto w-full pt-4">
        {config.stageMode ? (
          /* Discreet floating toggle in bottom-right corner when in Stage View */
          <div className="flex justify-between items-center text-[11px] text-white/40 px-2 opacity-30 hover:opacity-100 transition">
            <span>Press &apos;H&apos; to show controls · &apos;F&apos; for fullscreen · &apos;Space&apos; to pause</span>
            <button
              type="button"
              onClick={() => setConfig((p) => ({ ...p, stageMode: false }))}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition"
            >
              Show Controls
            </button>
          </div>
        ) : (
          /* Full Media Desk Controls Dock */
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-xl shadow-2xl">
            {/* Play, Pause, Zero, Reset, Bumps & Custom Timer */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition shadow-lg ${
                  isRunning
                    ? "bg-amber-400 text-black hover:bg-amber-300"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isRunning ? "Pause" : "Start"}</span>
              </button>

              {/* Zero to 00:00 Button */}
              <button
                type="button"
                onClick={handleResetToZero}
                title="Reset time directly to 00:00:00 (Press Z or 0)"
                className="px-3 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>00:00 (Zero)</span>
              </button>

              {/* Reset to Initial Target */}
              <button
                type="button"
                onClick={handleReset}
                title="Reset to initial programmed time (Press R)"
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Quick Adjustment Controls for Active Mode */}
              {isActivityTimer ? (
                <>
                  {/* Quick Time Bumps (+1m, +5m, -1m) */}
                  <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-white/15">
                    <button
                      type="button"
                      onClick={() => handleAdjustMinutes(-1)}
                      className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                      <span>1m</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustMinutes(1)}
                      className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>1m</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdjustMinutes(5)}
                      className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>5m</span>
                    </button>
                  </div>

                  {/* Quick Duration Chips Bar */}
                  <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-white/15">
                    {[5, 10, 15, 20, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleSelectActivityTimer(mins)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          config.durationSeconds === mins * 60
                            ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                            : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/15">
                  {EVENT_DATE_PRESETS.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        const iso = ev.getTargetDate();
                        handleSelectEventDateTimer(iso, ev.name);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold border bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 text-white/80 hover:text-emerald-300 transition cursor-pointer"
                    >
                      {ev.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Set Custom Timer Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setTimerDialogTab(isActivityTimer ? "activity" : "event-date");
                  setCustomTimerOpen(true);
                }}
                title="Configure active timer (Press T)"
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-500/20 hover:from-amber-400/30 hover:to-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition shadow-sm ml-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Configure Timer</span>
              </button>
            </div>

            {/* Quick Mode Status & Target Info */}
            <div className="hidden md:flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isEventDateTimer
                    ? `Date Target: ${
                        config.targetDate
                          ? formatToLocalIso(new Date(config.targetDate)).slice(0, 16).replace("T", " ")
                          : config.targetTimeString
                      }`
                    : `Activity: ${Math.floor(config.durationSeconds / 60)} min`}
                </span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentTheme.primaryAccent }}
                />
                <span>{currentTheme.name}</span>
              </span>
            </div>

            {/* Stage View & Live Projection Link */}
            <div className="flex items-center gap-2">
              <a
                href="/countdown/live"
                target="_blank"
                rel="noopener noreferrer"
                title="Open clean, read-only live projection screen in a new window/tab"
                className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Projection Screen</span>
                <ExternalLink className="w-3 h-3 text-emerald-400/80" />
              </a>

              <button
                type="button"
                onClick={() => setConfig((p) => ({ ...p, stageMode: true }))}
                className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span>Sanctuary Stage View (H)</span>
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* ============================================================== */}
      {/* 5. SLIDE-OVER SETTINGS DRAWER: Custom Title, Target & Theme     */}
      {/* ============================================================== */}
      {controlsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#0D0F1F] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto text-white shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-lg text-white">Programme Settings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setControlsOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 1. Programme Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Programme Title (Edited for Current Service)
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUNDAY CELEBRATION SERVICE"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white font-bold text-sm focus:border-amber-400 outline-none"
                />
              </div>

              {/* 2. Subtitle / Eyebrow */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Subtitle Banner
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => setConfig((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="e.g. Service Starts In..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm focus:border-amber-400 outline-none"
                />
              </div>

              {/* 3. Timer Mode & Parameters */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Active Countdown Mode (Only One Runs At A Time)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectActivityTimer(Math.max(1, Math.floor((config.durationSeconds || 1800) / 60)));
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      isActivityTimer
                        ? "bg-amber-400/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/30"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Church Activity Timer</span>
                    <span className="text-[10px] text-amber-400/80">Shows &ldquo;Time Up&rdquo;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectEventDateTimer();
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      isEventDateTimer
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Event & Date Countdown</span>
                    <span className="text-[10px] text-emerald-400/80">Stays at Zero</span>
                  </button>
                </div>

                {/* Target Date Picker for Event Date Timer */}
                {isEventDateTimer ? (
                  <div className="pt-2 space-y-2">
                    <label className="text-[11px] font-bold text-white/70 block">
                      Target Event Date & Time:
                    </label>
                    <input
                      type="datetime-local"
                      value={config.targetDate ? formatToLocalIso(new Date(config.targetDate)).slice(0, 16) : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          const iso = new Date(e.target.value).toISOString();
                          handleSelectEventDateTimer(iso);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white font-mono text-sm focus:border-emerald-400 outline-none"
                    />
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {EVENT_DATE_PRESETS.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            const iso = ev.getTargetDate();
                            handleSelectEventDateTimer(iso, ev.name);
                          }}
                          className="py-1.5 px-2 rounded-lg text-[11px] font-bold border bg-white/5 border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-300 text-white/80 transition cursor-pointer text-center"
                        >
                          {ev.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Activity Duration Chips */
                  <div className="pt-2 space-y-2">
                    <label className="text-[11px] font-bold text-white/70 block">
                      Quick Sanctuary Activity Presets:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ACTIVITY_PRESETS.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleSelectActivityTimer(act.durationMinutes, act.name)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer text-left flex items-center justify-between ${
                            config.durationSeconds === act.durationMinutes * 60
                              ? "bg-amber-400 text-black border-amber-400"
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                          }`}
                        >
                          <span>{getPresetIcon(act.iconName)} {act.name}</span>
                          <span className="opacity-75">{act.durationMinutes}m</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Visual Themes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Sacred Visual Archetype
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.keys(COUNTDOWN_THEMES) as CountdownThemeId[]).map((themeKey) => {
                    const th = COUNTDOWN_THEMES[themeKey];
                    const isSelected = config.theme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, theme: themeKey }))}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? "bg-white/10 border-amber-400 ring-1 ring-amber-400/50"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center"
                            style={{ background: th.bgGradient }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: th.primaryAccent }}
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-white">{th.name}</span>
                            <span className="text-[10px] text-white/50 block">{th.tagline}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Scripture Reference & Text */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Display Scripture
                  </label>
                  <button
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, showScripture: !p.showScripture }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                      config.showScripture
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-white/10 border-white/20 text-white/50"
                    }`}
                  >
                    {config.showScripture ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {config.showScripture && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={config.scriptureRef}
                      onChange={(e) => setConfig((p) => ({ ...p, scriptureRef: e.target.value }))}
                      placeholder="e.g. ISAIAH 60:1"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none focus:border-amber-400"
                    />
                    <textarea
                      value={config.scriptureText}
                      onChange={(e) => setConfig((p) => ({ ...p, scriptureText: e.target.value }))}
                      placeholder="Scripture passage text..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfig(DEFAULT_STATE);
                  toast.info("Reset to Default Sunday Service");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white/70"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={() => setControlsOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-amber-400 text-black hover:bg-amber-300"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: FAST CUSTOM TIMER & ZERO OUT POPUP (Press T)          */}
      {/* ============================================================== */}
      {customTimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0D0F1F] border border-amber-400/30 rounded-3xl p-6 text-white shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Set Custom Timer</h3>
                  <p className="text-xs text-white/60">Quick church service presets or enter exact duration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomTimerOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => setTimerDialogTab("activity")}
                className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  timerDialogTab === "activity"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md ring-1 ring-amber-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Church Activity Timer</span>
              </button>
              <button
                type="button"
                onClick={() => setTimerDialogTab("event-date")}
                className={`py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  timerDialogTab === "event-date"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-md ring-1 ring-emerald-400"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Event & Date Countdown</span>
              </button>
            </div>

            {timerDialogTab === "activity" ? (
              <div className="space-y-4">
                {/* Information Callout */}
                <div className="px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-2">
                  <span className="text-sm">⏱️</span>
                  <span>Counts down to zero and displays <strong>&ldquo;TIME UP&rdquo;</strong> to regulate service activities.</span>
                </div>

                {/* Quick Activity Presets */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block">
                    Sanctuary Activity Presets:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ACTIVITY_PRESETS.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          handleSelectActivityTimer(act.durationMinutes, act.name);
                          setCustomTimerOpen(false);
                        }}
                        className="p-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-amber-400 hover:text-black border border-white/10 hover:border-amber-400 transition cursor-pointer flex items-center justify-between"
                      >
                        <span>{getPresetIcon(act.iconName)} {act.name}</span>
                        <span className="opacity-75">{act.durationMinutes}m</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Minute Chips (One-Click Launch) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
                    Quick Minute Chips:
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[3, 5, 10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleSetCustomDuration(m, 0, true)}
                        className="py-1.5 rounded-xl text-xs font-black bg-white/[0.06] hover:bg-amber-400 hover:text-black border border-white/10 hover:border-amber-400 transition cursor-pointer"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Minutes & Seconds Custom Input */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
                    Custom Activity Duration:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-white/50 mb-1">MINUTES</div>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        placeholder="30"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 text-white font-mono font-bold text-lg text-center focus:border-amber-400 outline-none"
                      />
                    </div>
                    <span className="text-xl font-bold text-white/40 pt-4">:</span>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-white/50 mb-1">SECONDS</div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(e.target.value)}
                        placeholder="00"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.07] border border-white/15 text-white font-mono font-bold text-lg text-center focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const mins = Number(customMinutes) || 0;
                      const secs = Number(customSeconds) || 0;
                      handleSetCustomDuration(mins, secs, true);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Activity Timer Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const mins = Number(customMinutes) || 0;
                      const secs = Number(customSeconds) || 0;
                      handleSetCustomDuration(mins, secs, false);
                    }}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Set & Ready
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Information Callout */}
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span>Counts down to zero and <strong>stays at zero</strong>. Does <strong>not</strong> show &ldquo;Time Up&rdquo;.</span>
                </div>

                {/* Quick Date Presets */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 block">
                    Quick Event Presets:
                  </label>
                  <div className="space-y-1.5">
                    {EVENT_DATE_PRESETS.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          const iso = ev.getTargetDate();
                          handleSetCustomEventDate(iso, ev.name, true);
                        }}
                        className="w-full p-2.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 transition cursor-pointer flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getPresetIcon(ev.iconName)}</span>
                          <div>
                            <span className="text-white block font-bold">{ev.name}</span>
                            <span className="text-[10px] text-white/50 block">{ev.subtitle}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono">Launch →</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Target Date & Time Input */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
                    Set Custom Target Date & Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={customTargetDate ? formatToLocalIso(new Date(customTargetDate)).slice(0, 16) : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCustomTargetDate(new Date(e.target.value).toISOString());
                      }
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.08] border border-white/20 text-white font-mono font-bold text-base text-center focus:border-emerald-400 outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleSetCustomEventDate(customTargetDate, undefined, true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Date Countdown</span>
                </button>
              </div>
            )}

            {/* Modal Bottom Bar: Reset to Zero */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/40">Shortcuts: Esc to exit · Z for 00:00</span>
              <button
                type="button"
                onClick={() => {
                  handleResetToZero();
                  setCustomTimerOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 00:00 (Zero Out)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
