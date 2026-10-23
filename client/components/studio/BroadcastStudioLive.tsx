"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SafeMediaImage } from "@/components/studio/SafeMediaImage";
import {
  type BroadcastStudioState,
  DEFAULT_STUDIO_STATE,
  COUNTDOWN_THEMES,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  calculateTimeBreakdown,
} from "@ggm/types";
import {
  STUDIO_SYNC_CHANNEL,
  STUDIO_STORAGE_KEY,
  loadStudioStateFromStorage,
  type StudioSyncPayload,
} from "@/lib/studio/studio-sync";
import { audioSynth } from "@/lib/studio/audio-synth";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";
import { WebRtcReceiver } from "@/lib/studio/studio-webrtc";
import { api } from "@/lib/api/client";
import { cleanVerseText } from "@/lib/studio/bible-service";

function formatTwoDigits(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

export function BroadcastStudioLive() {
  const searchParams = useSearchParams();
  const isTransparentMode = searchParams.get("transparent") === "true";
  const isChromaGreen = searchParams.get("chroma") === "green";
  const isStageMode = searchParams.get("mode") === "stage";

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [state, setState] = useState<BroadcastStudioState>(() => {
    if (typeof window !== "undefined") {
      return loadStudioStateFromStorage();
    }
    return DEFAULT_STUDIO_STATE;
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const restored = loadStudioStateFromStorage();
      if (restored.mode === "event-date" && restored.targetDate) {
        return calculateSecondsUntilDate(restored.targetDate);
      } else if (restored.mode === "target-time" && restored.targetTimeString) {
        return calculateSecondsUntilTarget(restored.targetTimeString);
      }
      return restored.remainingSeconds;
    }
    return 1800;
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return loadStudioStateFromStorage().isRunning;
    }
    return true;
  });
  const [phoneFrame, setPhoneFrame] = useState<string | null>(null);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastSecondRef = useRef<number>(-1);
  const chimePlayedRef = useRef<boolean>(false);

  const currentTheme = COUNTDOWN_THEMES[state.theme] || COUNTDOWN_THEMES["royal-gold"];

  // 1. Initial State Restoration & Immediate Remote Fetch on Mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // First load from localStorage to guarantee persistence
    const restored = loadStudioStateFromStorage();
    setState(restored);
    setIsRunning(restored.isRunning);

    if (restored.mode === "event-date" && restored.targetDate) {
      setRemainingSeconds(calculateSecondsUntilDate(restored.targetDate));
    } else if (restored.mode === "target-time" && restored.targetTimeString) {
      setRemainingSeconds(calculateSecondsUntilTarget(restored.targetTimeString));
    } else {
      setRemainingSeconds(restored.remainingSeconds);
    }

    // Immediately fetch remote state from server to eliminate any stale flash on separate devices
    api.countdown.get().then((response) => {
      if (response?.data) {
        const remote = response.data;
        setState((prev) => ({
          ...prev,
          title: remote.title || prev.title,
          subtitle: remote.subtitle || prev.subtitle,
          scriptureRef: remote.scriptureRef || prev.scriptureRef,
          scriptureText: remote.scriptureText || prev.scriptureText,
          mode: remote.mode || prev.mode,
          targetTimeString: remote.targetTimeString || prev.targetTimeString,
          targetDate: remote.targetDate || prev.targetDate,
          durationSeconds: remote.durationSeconds || prev.durationSeconds,
          theme: remote.theme || prev.theme,
          bgImageUrl: remote.bgImageUrl !== undefined ? remote.bgImageUrl : prev.bgImageUrl,
          bgImageOpacity: remote.bgImageOpacity !== undefined ? remote.bgImageOpacity : prev.bgImageOpacity,
          soundEnabled: remote.soundEnabled ?? prev.soundEnabled,
          overtimeEnabled: remote.overtimeEnabled ?? prev.overtimeEnabled,
          showScripture: remote.showScripture ?? prev.showScripture,
          showLogo: remote.showLogo ?? prev.showLogo,
          stageMode: remote.stageMode ?? prev.stageMode,
          completionMessage: remote.completionMessage ?? prev.completionMessage,
          activeType: remote.activeType || prev.activeType,
          previewType: remote.previewType || prev.previewType,
          scripture: remote.scripture || prev.scripture,
          mediaList: remote.mediaList && remote.mediaList.length > 0 ? remote.mediaList : prev.mediaList,
          activeMediaId: remote.activeMediaId || prev.activeMediaId,
          overlay: remote.overlay || prev.overlay,
          camera: remote.camera || prev.camera,
          isBlackout: remote.isBlackout ?? prev.isBlackout,
          targetEndTime: remote.targetEndTime ?? prev.targetEndTime,
        }));

        setIsRunning(remote.isRunning);

        if (remote.mode === "event-date" && remote.targetDate) {
          setRemainingSeconds(calculateSecondsUntilDate(remote.targetDate));
        } else if (remote.mode === "target-time" && remote.targetTimeString) {
          setRemainingSeconds(calculateSecondsUntilTarget(remote.targetTimeString));
        } else if (remote.remainingSeconds !== undefined) {
          setRemainingSeconds(remote.remainingSeconds);
        }
      }
    }).catch(() => {}).finally(() => {
      setIsMounted(true);
    });
  }, []);

  // 2. BroadcastChannel & Local Storage Sync (0ms Local Sync)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(STUDIO_SYNC_CHANNEL);
      channel.onmessage = (event: MessageEvent<StudioSyncPayload>) => {
        if (event.data && event.data.type) {
          const payload = event.data;
          if (payload.sound && state.soundEnabled) {
            if (payload.sound === "chime") audioSynth.playCathedralChimes();
            else if (payload.sound === "bell") audioSynth.playOvertimeAlert();
          }

          if (payload.state) {
            setState(payload.state);
            setIsRunning(payload.state.isRunning);
            if (payload.state.mode === "event-date" && payload.state.targetDate) {
              setRemainingSeconds(calculateSecondsUntilDate(payload.state.targetDate));
            } else if (payload.state.mode === "target-time" && payload.state.targetTimeString) {
              setRemainingSeconds(calculateSecondsUntilTarget(payload.state.targetTimeString));
            } else {
              setRemainingSeconds(payload.state.remainingSeconds);
            }
          }
        }
      };
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STUDIO_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState(parsed);
          setIsRunning(parsed.isRunning);
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      channel?.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [state.soundEnabled]);

  // 3. Remote Server Polling (for multi-device sync, e.g. Phone controlling PC)
  useEffect(() => {
    if (!isMounted) return;

    const syncFromRemote = async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const response = await api.countdown.get();
        if (response?.data) {
          const remote = response.data;
          setState((prev) => ({
            ...prev,
            title: remote.title || prev.title,
            subtitle: remote.subtitle || prev.subtitle,
            scriptureRef: remote.scriptureRef || prev.scriptureRef,
            scriptureText: remote.scriptureText || prev.scriptureText,
            mode: remote.mode || prev.mode,
            targetTimeString: remote.targetTimeString || prev.targetTimeString,
            targetDate: remote.targetDate || prev.targetDate,
            durationSeconds: remote.durationSeconds || prev.durationSeconds,
            theme: remote.theme || prev.theme,
            bgImageUrl: remote.bgImageUrl !== undefined ? remote.bgImageUrl : prev.bgImageUrl,
            bgImageOpacity: remote.bgImageOpacity !== undefined ? remote.bgImageOpacity : prev.bgImageOpacity,
            soundEnabled: remote.soundEnabled ?? prev.soundEnabled,
            overtimeEnabled: remote.overtimeEnabled ?? prev.overtimeEnabled,
            showScripture: remote.showScripture ?? prev.showScripture,
            showLogo: remote.showLogo ?? prev.showLogo,
            stageMode: remote.stageMode ?? prev.stageMode,
            completionMessage: remote.completionMessage ?? prev.completionMessage,
            activeType: remote.activeType || prev.activeType,
            previewType: remote.previewType || prev.previewType,
            scripture: remote.scripture || prev.scripture,
            mediaList: remote.mediaList && remote.mediaList.length > 0 ? remote.mediaList : prev.mediaList,
            activeMediaId: remote.activeMediaId || prev.activeMediaId,
            overlay: remote.overlay || prev.overlay,
            camera: remote.camera || prev.camera,
            isBlackout: remote.isBlackout ?? prev.isBlackout,
            targetEndTime: remote.targetEndTime ?? prev.targetEndTime,
          }));

          setIsRunning(remote.isRunning);

          // Update remainingSeconds from remote only if drift is significant (> 1s) to prevent visual jitter/glitch
          if (remote.mode === "event-date" && remote.targetDate) {
            setRemainingSeconds(calculateSecondsUntilDate(remote.targetDate));
          } else if (remote.mode === "target-time" && remote.targetTimeString) {
            setRemainingSeconds(calculateSecondsUntilTarget(remote.targetTimeString));
          } else if (remote.remainingSeconds !== undefined) {
            if (remote.targetEndTime && remote.isRunning) {
              const calculated = Math.round((remote.targetEndTime - Date.now()) / 1000);
              const targetSecs = !remote.overtimeEnabled && calculated <= 0 ? 0 : calculated;
              setRemainingSeconds((curr) => (Math.abs(curr - targetSecs) > 1 ? targetSecs : curr));
            } else if (!remote.isRunning) {
              setRemainingSeconds(remote.remainingSeconds);
            }
          }
        }
      } catch {}
    };

    const interval = setInterval(syncFromRemote, 2000);
    return () => clearInterval(interval);
  }, [isMounted]);

  // 4. Runtime 1-Second Timer Tick (High accuracy, rock-solid, no glitching)
  useEffect(() => {
    if (!isMounted) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (state.mode === "event-date" && state.targetDate) {
          return calculateSecondsUntilDate(state.targetDate);
        } else if (state.mode === "target-time" && state.targetTimeString) {
          return calculateSecondsUntilTarget(state.targetTimeString);
        }

        // If targetEndTime is defined and timer is running, calculate directly against current epoch for zero-drift
        if (state.isRunning && state.targetEndTime) {
          const calculated = Math.round((state.targetEndTime - Date.now()) / 1000);
          if (!state.overtimeEnabled && calculated <= 0) {
            if (prev > 0 && chimePlayedRef.current === false && state.soundEnabled) {
              audioSynth.playCathedralChimes();
              chimePlayedRef.current = true;
            }
            setIsRunning(false);
            return 0;
          }
          if (calculated > 0 && calculated <= 10 && lastSecondRef.current !== calculated && state.soundEnabled) {
            audioSynth.playTick();
            lastSecondRef.current = calculated;
          }
          return calculated;
        }

        if (!isRunning) return prev;

        const next = prev - 1;

        // Chime audio cue when reaching zero
        if (next === 0 && !chimePlayedRef.current && state.soundEnabled) {
          audioSynth.playCathedralChimes();
          chimePlayedRef.current = true;
        } else if (next > 0) {
          chimePlayedRef.current = false;
        }

        // Ticking audio cue under 10 seconds
        if (next > 0 && next <= 10 && lastSecondRef.current !== next && state.soundEnabled) {
          audioSynth.playTick();
          lastSecondRef.current = next;
        }

        if (!state.overtimeEnabled && next <= 0) {
          setIsRunning(false);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, isRunning, state.isRunning, state.targetEndTime, state.mode, state.targetDate, state.targetTimeString, state.overtimeEnabled, state.soundEnabled]);

  // 5. Connect Camera Stream if camera is active
  useEffect(() => {
    if (state.activeType !== "camera" || !state.camera?.enabled || state.camera?.streamType !== "webcam") {
      return;
    }

    let activeStream: MediaStream | null = null;
    async function bindCamera() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: state.camera?.deviceId ? { deviceId: { exact: state.camera.deviceId } } : true,
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: state.camera?.deviceId ? { deviceId: { ideal: state.camera.deviceId } } : true,
            audio: false,
          });
        }
        activeStream = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Could not bind camera feed on live output:", err);
      }
    }

    void bindCamera();

    return () => {
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, [state.activeType, state.camera?.enabled, state.camera?.deviceId, state.camera?.streamType]);

  const phoneVideoRef = useRef<HTMLVideoElement | null>(null);
  const webrtcReceiverRef = useRef<WebRtcReceiver | null>(null);
  const [webrtcConnected, setWebrtcConnected] = useState<boolean>(false);

  // Connect Phone Camera Feed (WebRTC zero-latency + 45ms frame relay fallback)
  useEffect(() => {
    if (state.activeType !== "camera" || !state.camera?.enabled || state.camera?.streamType !== "phone" || state.isBlackout) {
      webrtcReceiverRef.current?.stop();
      webrtcReceiverRef.current = null;
      setWebrtcConnected(false);
      return;
    }

    const room = state.camera?.roomCode || "cam-1";

    // 1. WebRTC Receiver
    const receiver = new WebRtcReceiver(room);
    receiver.onStateChange = (connState) => {
      setWebrtcConnected(connState === "connected");
    };
    receiver.onRemoteStream = (remoteStream) => {
      setWebrtcConnected(true);
      if (phoneVideoRef.current) {
        phoneVideoRef.current.srcObject = remoteStream;
        phoneVideoRef.current.play().catch(() => {});
      }
    };
    receiver.start();
    webrtcReceiverRef.current = receiver;

    // 2. Instant Real-time Server-Sent Events (SSE) Stream for Frames
    let sseSource: EventSource | null = null;
    try {
      if (typeof window !== "undefined" && typeof EventSource !== "undefined") {
        const sse = new EventSource(`/api/v1/studio/stream/${encodeURIComponent(room)}`);
        sse.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "frame" && parsed.frame) {
              setPhoneFrame(parsed.frame);
            }
          } catch {}
        };
        sseSource = sse;
      }
    } catch {}

    // 3. High-Frequency Frame Polling fallback
    let isSubscribed = true;
    let isFetching = false;

    const fetchFrame = async () => {
      if (isFetching || !isSubscribed) return;
      isFetching = true;
      try {
        const res = await api.studio.getFrame(room);
        if (isSubscribed && res?.data?.frame) {
          setPhoneFrame(res.data.frame);
        }
      } catch {}
      finally {
        isFetching = false;
      }
    };

    void fetchFrame();
    const interval = setInterval(fetchFrame, 45);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      sseSource?.close();
      receiver.stop();
    };
  }, [state.activeType, state.camera?.enabled, state.camera?.streamType, state.camera?.roomCode, state.isBlackout]);

  // Fullscreen Feature for Live Output (OBS Sanctuary Screen / TV Projector)
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F" || e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleFullscreen]);

  const timeBreakdown = calculateTimeBreakdown(remainingSeconds);
  const activeMedia = state.mediaList.find((m) => m.id === state.activeMediaId) || state.mediaList[0];

  const showDays = timeBreakdown.days > 0;
  const showHours = timeBreakdown.days > 0 || timeBreakdown.hours > 0 || state.mode === "event-date";
  // Total cards displayed on screen: 2 (MM:SS), 3 (HH:MM:SS), or 4 (DD:HH:MM:SS)
  const activeCardsCount = (showDays ? 1 : 0) + (showHours ? 1 : 0) + 2;

  // Responsive Fliqlo card dimensions based on activeCardsCount
  // Mobile-first responsive sizing: maximizes screen presence on mobile while keeping clean margins
  const cardTileClass =
    activeCardsCount <= 2
      ? "rounded-2xl sm:rounded-3xl md:rounded-[2.25rem] px-4 py-6 sm:px-8 sm:py-9 md:px-12 md:py-12 lg:px-16 lg:py-14 min-w-[42vw] max-w-[45vw] sm:min-w-[190px] sm:max-w-none md:min-w-[260px] lg:min-w-[310px] max-h-[50vh] shadow-[0_16px_50px_rgba(0,0,0,0.9)]"
      : activeCardsCount === 3
      ? "rounded-xl sm:rounded-2xl md:rounded-3xl px-3 py-5 sm:px-6 sm:py-6 md:px-9 md:py-8 lg:px-11 lg:py-10 min-w-[29vw] max-w-[31vw] sm:min-w-[130px] sm:max-w-none md:min-w-[170px] lg:min-w-[210px] max-h-[46vh] shadow-[0_14px_45px_rgba(0,0,0,0.85)]"
      : "rounded-xl sm:rounded-2xl md:rounded-3xl px-2 py-4 sm:px-4 sm:py-4 md:px-6 md:py-5 lg:px-7 lg:py-6 min-w-[22vw] max-w-[23.5vw] sm:min-w-[90px] sm:max-w-none md:min-w-[120px] lg:min-w-[140px] max-h-[44vh] shadow-[0_12px_40px_rgba(0,0,0,0.8)]";

  const cardDigitClass =
    activeCardsCount <= 2
      ? "text-6xl sm:text-8xl md:text-[10.5rem] lg:text-[12.5rem] xl:text-[14.5rem]"
      : activeCardsCount === 3
      ? "text-4xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[10rem]"
      : "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl";

  const cardLabelClass =
    activeCardsCount <= 2
      ? "text-xs sm:text-xs md:text-sm lg:text-base font-black tracking-[0.25em] sm:tracking-[0.3em] mt-2.5 sm:mt-4"
      : activeCardsCount === 3
      ? "text-[11px] sm:text-[11px] md:text-xs lg:text-sm font-black tracking-[0.2em] sm:tracking-[0.25em] mt-2 sm:mt-2.5"
      : "text-[10px] sm:text-[10px] md:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] mt-2 sm:mt-2";

  const colonDotClass =
    activeCardsCount <= 2
      ? "w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5"
      : activeCardsCount === 3
      ? "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-4 lg:h-4"
      : "w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3";

  const colonContainerClass =
    activeCardsCount <= 2
      ? "flex flex-col gap-2 sm:gap-4 md:gap-6 pb-6 sm:pb-9 md:pb-12 opacity-60 shrink-0"
      : activeCardsCount === 3
      ? "flex flex-col gap-1.5 sm:gap-3 md:gap-4 pb-5 sm:pb-7 md:pb-9 opacity-60 shrink-0"
      : "flex flex-col gap-1 sm:gap-2.5 md:gap-3 pb-4 sm:pb-6 opacity-60 shrink-0";

  const cardContainerGap =
    activeCardsCount <= 2
      ? "gap-2 sm:gap-6 md:gap-10 lg:gap-14 max-w-6xl"
      : activeCardsCount === 3
      ? "gap-1.5 sm:gap-4 md:gap-7 lg:gap-9 max-w-5xl"
      : "gap-1 sm:gap-3 md:gap-4 lg:gap-5 max-w-5xl";

  // Emergency Blackout Check or Unmounted Initial State Gate
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-[#060714] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin opacity-40" />
      </div>
    );
  }

  if (state.isBlackout) {
    return <div className="w-full h-screen bg-black" />;
  }

  const isNormalTimer = state.mode === "activity" || state.mode === "duration";
  const isEventTimer = state.mode === "event-date" || state.mode === "target-time";
  const isTimeUp = isNormalTimer && remainingSeconds <= 0;
  const isEventCompleted = isEventTimer && remainingSeconds <= 0;

  // Determine root background based on display mode
  const rootBgStyle = isTransparentMode
    ? { background: "transparent" }
    : isChromaGreen
    ? { background: "#00FF00" }
    : isTimeUp
    ? { background: "radial-gradient(ellipse at 50% 20%, #450A0A 0%, #1C0305 50%, #0A0001 100%)" }
    : { background: currentTheme.bgDark };

  return (
    <div
      onDoubleClick={toggleFullscreen}
      className="relative w-full h-screen overflow-hidden select-none"
    >
      {/* 1. Underlying Base Dark Backdrop */}
      {!isTransparentMode && !isChromaGreen && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundColor: state.bgImageUrl === "dark" ? "#000000" : currentTheme.bgDark,
          }}
        />
      )}

      {/* 2. Optional Editable Background Image Overlay Layer (only when bgImageUrl is an image, not 'dark') */}
      {state.bgImageUrl && state.bgImageUrl !== "dark" && !isTransparentMode && !isChromaGreen && (
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          style={{ opacity: state.bgImageOpacity ?? 0.35 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.bgImageUrl}
            alt="Atmospheric Sanctuary Background"
            className="w-full h-full object-cover object-center filter brightness-110 contrast-110"
          />
        </div>
      )}

      {/* 3. Ambient Vignette / Tint Overlay:
             - 'dark': Overwrites theme color completely with pure deep black
             - bgImageUrl: Atmospheric glow with vignette over the photo
             - none/empty: Rich Theme Color Background gradient
      */}
      {!isTransparentMode && !isChromaGreen && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: isTimeUp
              ? "radial-gradient(ellipse at 50% 20%, rgba(69,10,10,0.85) 0%, rgba(28,3,5,0.92) 50%, rgba(10,0,1,0.97) 100%)"
              : state.bgImageUrl === "dark"
              ? "radial-gradient(ellipse at 50% 35%, #08090f 0%, #030407 65%, #000000 100%)"
              : state.bgImageUrl
              ? `radial-gradient(ellipse at 50% 30%, ${currentTheme.accentGlow.replace(/[\d.]+\)$/, "0.2)")} 0%, rgba(6,7,20,0.65) 60%, rgba(3,4,12,0.88) 100%)`
              : currentTheme.bgGradient,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* SCENE LAYER: Countdown, Scripture, Media, Camera Feed */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
        {/* 1. SCENE: COUNTDOWN */}
        {state.activeType === "countdown" && (
          <div className="w-full h-full flex flex-col justify-between md:justify-around items-center px-2 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 text-center animate-in fade-in duration-500 overflow-hidden">
            {/* Header: Church Logo & Programme Title */}
            <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 max-w-4xl pt-2 sm:pt-4">
              {state.showLogo && !isTransparentMode && (
                <div
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden p-1 bg-black/40 shadow-2xl backdrop-blur-md border border-white/10"
                  style={{ borderColor: isTimeUp ? "rgba(239, 68, 68, 0.6)" : undefined }}
                >
                  <Image
                    src={CHURCH_LOGO_PATH}
                    alt="Grace of God Mission Logo"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
              )}

              <div className="space-y-1 sm:space-y-1.5 px-3">
                <h1
                  className="text-lg sm:text-3xl md:text-5xl font-black tracking-tight uppercase"
                  style={{
                    color: isTimeUp ? "#EF4444" : currentTheme.digitColor,
                    textShadow: isTimeUp ? "0 4px 24px rgba(239,68,68,0.5)" : `0 4px 30px ${currentTheme.accentGlow}`,
                  }}
                >
                  {state.title}
                </h1>
                <p
                  className="text-[11px] sm:text-sm md:text-base font-bold tracking-[0.2em] uppercase opacity-90 max-w-xl mx-auto"
                  style={{ color: isTimeUp ? "#F87171" : currentTheme.labelColor }}
                >
                  {state.subtitle}
                </p>
              </div>
            </div>

            {/* Main Stage Display: Normal Timer (TIME UP) vs Event Timer (Message) vs Active Counting */}
            {isNormalTimer && isTimeUp ? (
              /* Normal Countdown Timer Reached Zero: Clean Minimalist TIME UP display with real-time Overtime */
              <div className="my-auto flex flex-col items-center justify-center gap-6 sm:gap-8 animate-in zoom-in-95 duration-500 w-full max-w-4xl px-4 text-center">
                <span className="text-6xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black tracking-tight uppercase font-sans leading-none select-none text-red-500 drop-shadow-[0_10px_40px_rgba(239,68,68,0.6)] animate-pulse">
                  TIME UP
                </span>

                {/* If Overtime is enabled, show the live running overtime clock */}
                {state.overtimeEnabled ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.25em] text-red-400/90">
                      OVERTIME ELAPSED
                    </span>
                    <span className="text-4xl sm:text-6xl md:text-7xl font-mono font-black text-red-400 tracking-wider">
                      +{formatTwoDigits(timeBreakdown.hours > 0 ? timeBreakdown.hours : timeBreakdown.minutes)}:
                      {formatTwoDigits(timeBreakdown.hours > 0 ? timeBreakdown.minutes : timeBreakdown.seconds)}
                      {timeBreakdown.hours > 0 && `:${formatTwoDigits(timeBreakdown.seconds)}`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-base text-zinc-400 font-medium tracking-widest uppercase">
                    Session Concluded
                  </span>
                )}
              </div>
            ) : isEventTimer && isEventCompleted && state.completionMessage ? (
              /* Event / Occasion Countdown Reached Zero with Custom Message */
              <div className="my-auto flex flex-col items-center justify-center gap-4 sm:gap-6 animate-in zoom-in-95 duration-500 max-w-5xl px-4 w-full text-center">
                <span
                  className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight uppercase leading-tight select-none font-sans"
                  style={{
                    color: currentTheme.primaryAccent,
                    textShadow: `0 8px 50px ${currentTheme.accentGlow}`,
                  }}
                >
                  {state.completionMessage}
                </span>
              </div>
            ) : (
              /* Fliqlo-Inspired Dynamic Flip Card Timer (Sizes up dynamically when 2 or 3 cards are shown) */
              <div className={`flex flex-col items-center justify-center my-auto w-full px-2 ${cardContainerGap}`}>
                <div className={`flex items-center justify-center ${cardContainerGap}`}>
                  {/* Days Flip Card (if > 0) */}
                  {showDays && (
                    <>
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className={`relative flex flex-col items-center justify-center bg-[#14151a]/95 border border-white/10 backdrop-blur-md overflow-hidden group ${cardTileClass}`}>
                          {/* Top/Bottom Subtle Gradient Depth */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/60 pointer-events-none" />
                          {/* Fliqlo Center Horizontal Split Flap Seam */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-r-sm pointer-events-none" />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-l-sm pointer-events-none" />

                          {/* Digits */}
                          <span
                            className={`relative z-10 font-black tracking-tight leading-none select-none font-mono ${cardDigitClass}`}
                            style={{
                              color: currentTheme.digitColor,
                              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                            }}
                          >
                            {formatTwoDigits(timeBreakdown.days)}
                          </span>
                        </div>
                        <span
                          className={`uppercase ${cardLabelClass}`}
                          style={{ color: currentTheme.labelColor }}
                        >
                          Days
                        </span>
                      </div>

                      {/* Colon Separator */}
                      <div className={colonContainerClass}>
                        <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                        <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                      </div>
                    </>
                  )}

                  {/* Hours Flip Card (always shown unless 0 days and 0 hours on duration timers) */}
                  {showHours && (
                    <>
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className={`relative flex flex-col items-center justify-center bg-[#14151a]/95 border border-white/10 backdrop-blur-md overflow-hidden group ${cardTileClass}`}>
                          {/* Top/Bottom Subtle Gradient Depth */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/60 pointer-events-none" />
                          {/* Fliqlo Center Horizontal Split Flap Seam */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-r-sm pointer-events-none" />
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-l-sm pointer-events-none" />

                          {/* Digits */}
                          <span
                            className={`relative z-10 font-black tracking-tight leading-none select-none font-mono ${cardDigitClass}`}
                            style={{
                              color: currentTheme.digitColor,
                              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                            }}
                          >
                            {formatTwoDigits(timeBreakdown.hours)}
                          </span>
                        </div>
                        <span
                          className={`uppercase ${cardLabelClass}`}
                          style={{ color: currentTheme.labelColor }}
                        >
                          Hours
                        </span>
                      </div>

                      {/* Colon Separator */}
                      <div className={colonContainerClass}>
                        <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                        <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                      </div>
                    </>
                  )}

                  {/* Minutes Flip Card */}
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`relative flex flex-col items-center justify-center bg-[#14151a]/95 border border-white/10 backdrop-blur-md overflow-hidden group ${cardTileClass}`}>
                      {/* Top/Bottom Subtle Gradient Depth */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/60 pointer-events-none" />
                      {/* Fliqlo Center Horizontal Split Flap Seam */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-r-sm pointer-events-none" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-l-sm pointer-events-none" />

                      {/* Digits */}
                      <span
                        className={`relative z-10 font-black tracking-tight leading-none select-none font-mono ${cardDigitClass}`}
                        style={{
                          color: currentTheme.digitColor,
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                      >
                        {formatTwoDigits(timeBreakdown.minutes)}
                      </span>
                    </div>
                    <span
                      className={`uppercase ${cardLabelClass}`}
                      style={{ color: currentTheme.labelColor }}
                    >
                      Minutes
                    </span>
                  </div>

                  {/* Colon Separator */}
                  <div className={colonContainerClass}>
                    <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                    <span className={`rounded-full ${colonDotClass}`} style={{ backgroundColor: currentTheme.labelColor }} />
                  </div>

                  {/* Seconds Flip Card */}
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className={`relative flex flex-col items-center justify-center bg-[#14151a]/95 border border-white/10 backdrop-blur-md overflow-hidden group ${cardTileClass}`}>
                      {/* Top/Bottom Subtle Gradient Depth */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/60 pointer-events-none" />
                      {/* Fliqlo Center Horizontal Split Flap Seam */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-black/80 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-r-sm pointer-events-none" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black/60 rounded-l-sm pointer-events-none" />

                      {/* Digits */}
                      <span
                        className={`relative z-10 font-black tracking-tight leading-none select-none font-mono ${cardDigitClass}`}
                        style={{
                          color: currentTheme.digitColor,
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                      >
                        {formatTwoDigits(timeBreakdown.seconds)}
                      </span>
                    </div>
                    <span
                      className={`uppercase ${cardLabelClass}`}
                      style={{ color: currentTheme.labelColor }}
                    >
                      Seconds
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Overtime Alert Indicator for Active Countdown */}
            {!isTimeUp && timeBreakdown.isOvertime && (
              <div className="px-5 py-2 rounded-full bg-red-600/90 text-white text-xs sm:text-sm font-black tracking-widest uppercase animate-pulse shadow-xl">
                ⚠️ OVERTIME: +{formatTwoDigits(timeBreakdown.minutes)}:
                {formatTwoDigits(timeBreakdown.seconds)}
              </div>
            )}

            {/* Bottom Scripture Quote: Clean Minimalist Style */}
            {state.showScripture && state.scriptureText && !isTransparentMode && !isTimeUp && (
              <div className="max-w-2xl text-center px-4 pt-2">
                <p className="text-sm sm:text-base text-zinc-300 font-serif italic">
                  &ldquo;{cleanVerseText(state.scriptureText)}&rdquo;
                </p>
                <span
                  className="text-xs font-bold uppercase tracking-wider block mt-1"
                  style={{ color: currentTheme.primaryAccent }}
                >
                  — {state.scriptureRef}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. SCENE: FULLSCREEN SCRIPTURE */}
        {state.activeType === "scripture" && state.scripture.displayMode === "fullscreen" && (
          <div className="w-full h-full flex flex-col justify-center items-center p-8 sm:p-20 text-center animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase shadow-lg">
                <span>📖 SCRIPTURE READING</span>
                <span>·</span>
                <span>{state.scripture.translation}</span>
              </div>

              <blockquote className="text-2xl sm:text-4xl md:text-5xl font-serif text-white leading-relaxed tracking-wide drop-shadow-xl">
                &ldquo;{cleanVerseText(state.scripture.text)}&rdquo;
              </blockquote>

              <div className="text-lg sm:text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-widest drop-shadow-md">
                — {state.scripture.reference}
              </div>
            </div>
          </div>
        )}

        {/* 3. SCENE: MEDIA SLIDE / MEDIA DECK FLYER */}
        {state.activeType === "media" && activeMedia && (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl">
              <SafeMediaImage
                src={activeMedia.url}
                alt={activeMedia.title}
                fill
                className="object-contain"
                priority
              />
              {activeMedia.overlayCaption && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/40 text-center shadow-2xl max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow-md">
                    {activeMedia.overlayCaption}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SCENE: LIVE CAMERA FEED / NDI / PHONE CAM */}
        {state.activeType === "camera" && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {state.camera.streamType === "webcam" && (
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {state.camera.streamType === "phone" && (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {/* Ultra-fast Frame Relay (always displayed as base image so it never flashes black) */}
                {phoneFrame && (
                  <img
                    src={phoneFrame}
                    alt="Live Phone Camera Feed"
                    className="w-full h-full object-contain"
                  />
                )}
                {/* Zero-latency WebRTC video track (layered on top when connected) */}
                <video
                  ref={phoneVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-contain ${webrtcConnected ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                />
                {/* Standby waiting screen */}
                {!webrtcConnected && !phoneFrame && (
                  <div className="text-center p-4 text-zinc-400">
                    <span className="text-sm font-bold text-white block">
                      Phone Camera Connected ({state.camera.roomCode || "cam-1"}) · Connecting Live Stream...
                    </span>
                  </div>
                )}
              </div>
            )}

            {state.camera.streamType === "youtube" && state.camera.youtubeId && (
              <iframe
                src={`https://www.youtube.com/embed/${state.camera.youtubeId}?autoplay=1&mute=1&controls=0&rel=0`}
                title="Live YouTube Stream Feed"
                allow="autoplay; encrypted-media"
                className="w-full h-full border-0 pointer-events-none"
              />
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DSK OVERLAYS LAYER: Speaker, Giving, Ticker, Scripture Lower Third */}
      {/* Positioned cleanly above bottom screen boundary so it never cuts off */}
      {/* ======================================================== */}
      <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-0 right-0 z-30 w-full px-3 sm:px-6 md:px-10 pointer-events-none">
        {/* Scripture Lower-Third (when scripture is in lower-third mode) */}
        {state.scripture.displayMode === "lower-third" && (
          <div className="max-w-4xl mx-auto mb-2 animate-in slide-in-from-bottom duration-500">
            <div
              className="p-3 sm:p-4 rounded-xl border-l-4 border-amber-400 shadow-2xl backdrop-blur-md"
              style={{
                background: "linear-gradient(90deg, rgba(6,7,20,0.95) 0%, rgba(16,19,41,0.92) 100%)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] sm:text-xs md:text-sm font-black text-amber-400 uppercase tracking-widest">
                  📖 {state.scripture.reference} ({state.scripture.translation})
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-white font-serif leading-relaxed italic line-clamp-3 sm:line-clamp-none">
                &ldquo;{cleanVerseText(state.scripture.text)}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Master DSK Overlay (Speaker Name, Tithes & Giving, Announcement Ticker) */}
        {state.overlay.enabled && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
            {state.overlay.type === "ticker" ? (
              /* Scrolling Announcement Ticker */
              <div
                className="overflow-hidden py-2 px-3 sm:px-4 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-2 sm:gap-4"
                style={{
                  background: "linear-gradient(90deg, #D9A441 0%, #B8860B 100%)",
                }}
              >
                <span className="px-2 py-0.5 rounded bg-black text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider flex-shrink-0">
                  {state.overlay.title || "ANNOUNCEMENTS"}
                </span>
                <div className="whitespace-nowrap overflow-hidden text-xs sm:text-sm font-black text-black tracking-wide animate-marquee">
                  {state.overlay.subtitle}
                </div>
              </div>
            ) : (
              /* Speaker or Giving Lower-Third Banner */
              <div
                className="p-3 sm:p-4 md:p-5 rounded-2xl border-l-4 sm:border-l-8 border-amber-400 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 sm:gap-4"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,7,20,0.96) 0%, rgba(16,19,41,0.90) 80%, rgba(6,7,20,0.8) 100%)",
                }}
              >
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <h3 className="text-xs sm:text-base md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 truncate">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="truncate">{state.overlay.title}</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-300 truncate">
                    {state.overlay.subtitle}
                  </p>
                  {state.overlay.extra && (
                    <p className="text-[10px] sm:text-xs text-zinc-300 font-mono tracking-tight truncate">
                      {state.overlay.extra}
                    </p>
                  )}
                </div>

                {state.showLogo && !isTransparentMode && (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-amber-400/50 bg-black/60 p-0.5 flex-shrink-0 shadow-lg hidden sm:block">
                    <Image
                      src={CHURCH_LOGO_PATH}
                      alt="GGM Logo"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
