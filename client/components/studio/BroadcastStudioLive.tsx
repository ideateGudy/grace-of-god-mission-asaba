"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Maximize2, Minimize2 } from "lucide-react";
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

function formatTwoDigits(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

export function BroadcastStudioLive() {
  const searchParams = useSearchParams();
  const isTransparentMode = searchParams.get("transparent") === "true";
  const isChromaGreen = searchParams.get("chroma") === "green";
  const isStageMode = searchParams.get("mode") === "stage";

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [state, setState] = useState<BroadcastStudioState>(DEFAULT_STUDIO_STATE);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [phoneFrame, setPhoneFrame] = useState<string | null>(null);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastSecondRef = useRef<number>(-1);
  const chimePlayedRef = useRef<boolean>(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTheme = COUNTDOWN_THEMES[state.theme] || COUNTDOWN_THEMES["royal-gold"];

  // 1. Initial State Restoration on Mount
  useEffect(() => {
    if (typeof window === "undefined") return;

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

    setIsMounted(true);
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
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F" || e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [toggleFullscreen]);

  const timeBreakdown = calculateTimeBreakdown(remainingSeconds);
  const activeMedia = state.mediaList.find((m) => m.id === state.activeMediaId) || state.mediaList[0];

  // Emergency Blackout Check
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
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden select-none flex flex-col justify-between"
      style={rootBgStyle}
    >
      {/* Floating Auto-Hiding Fullscreen Toggle Button (Excluded in transparent OBS mode) */}
      {!isTransparentMode && !isChromaGreen && (
        <div
          className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3.5 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white border border-amber-400/40 backdrop-blur-md text-xs font-bold flex items-center gap-2 shadow-2xl transition-all"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F or Double-Click)"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Dynamic Radial Ambient Glow Background (if not transparent / chroma) */}
      {!isTransparentMode && !isChromaGreen && (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: currentTheme.bgGradient }}
        />
      )}

      {/* ======================================================== */}
      {/* SCENE LAYER: Countdown, Scripture, Media, Camera Feed */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
        {/* 1. SCENE: COUNTDOWN */}
        {state.activeType === "countdown" && (
          <div className="w-full h-full flex flex-col justify-between items-center px-6 sm:px-12 md:px-20 lg:px-28 py-8 sm:py-12 md:py-16 text-center animate-in fade-in duration-500">
            {/* Header: Church Logo & Programme Title */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 max-w-4xl">
              {state.showLogo && !isTransparentMode && (
                <div
                  className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden p-1 bg-black/20 shadow-xl backdrop-blur-sm"
                  style={{ borderColor: isTimeUp ? "rgba(239, 68, 68, 0.6)" : "transparent" }}
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

              <div className="space-y-1 sm:space-y-2">
                <h1
                  className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight uppercase"
                  style={{
                    color: isTimeUp ? "#EF4444" : currentTheme.digitColor,
                    textShadow: isTimeUp ? "0 4px 24px rgba(239,68,68,0.5)" : `0 4px 30px ${currentTheme.accentGlow}`,
                  }}
                >
                  {state.title}
                </h1>
                <p
                  className="text-xs sm:text-base md:text-lg font-semibold tracking-widest uppercase opacity-90"
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

                {/* If Overtime is enabled, show the live running overtime clock without boxed strokes */}
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
              /* Event / Occasion Countdown Reached Zero with Custom Message (Minimalist, borderless) */
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
                <span className="text-xs sm:text-base text-zinc-400 font-medium tracking-widest uppercase">
                  Service in Session
                </span>
              </div>
            ) : (
              /* Giant Modern Minimalist Digits Display (No stroke container, pure theme typography) */
              <div className="flex flex-col items-center justify-center my-auto w-full max-w-6xl px-4">
                <div className="flex items-baseline justify-center gap-2 sm:gap-6 md:gap-10 lg:gap-14 w-full">
                  {/* Days Card (if > 0) */}
                  {timeBreakdown.days > 0 && (
                    <>
                      <div className="flex flex-col items-center">
                        <span
                          className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-none select-none font-mono"
                          style={{
                            color: currentTheme.digitColor,
                            textShadow: `0 8px 40px ${currentTheme.accentGlow}`,
                          }}
                        >
                          {formatTwoDigits(timeBreakdown.days)}
                        </span>
                        <span
                          className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] mt-2 sm:mt-4"
                          style={{ color: currentTheme.labelColor }}
                        >
                          Days
                        </span>
                      </div>
                      <span
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-light opacity-40 select-none self-center -translate-y-4 sm:-translate-y-6"
                        style={{ color: currentTheme.labelColor }}
                      >
                        :
                      </span>
                    </>
                  )}

                  {/* Hours Card (always shown unless 0 days and 0 hours on duration timers) */}
                  {(timeBreakdown.days > 0 || timeBreakdown.hours > 0 || state.mode === "event-date") && (
                    <>
                      <div className="flex flex-col items-center">
                        <span
                          className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-none select-none font-mono"
                          style={{
                            color: currentTheme.digitColor,
                            textShadow: `0 8px 40px ${currentTheme.accentGlow}`,
                          }}
                        >
                          {formatTwoDigits(timeBreakdown.hours)}
                        </span>
                        <span
                          className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] mt-2 sm:mt-4"
                          style={{ color: currentTheme.labelColor }}
                        >
                          Hours
                        </span>
                      </div>
                      <span
                        className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-light opacity-40 select-none self-center -translate-y-4 sm:-translate-y-6"
                        style={{ color: currentTheme.labelColor }}
                      >
                        :
                      </span>
                    </>
                  )}

                  {/* Minutes Card */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-none select-none font-mono"
                      style={{
                        color: currentTheme.digitColor,
                        textShadow: `0 8px 40px ${currentTheme.accentGlow}`,
                      }}
                    >
                      {formatTwoDigits(timeBreakdown.minutes)}
                    </span>
                    <span
                      className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] mt-2 sm:mt-4"
                      style={{ color: currentTheme.labelColor }}
                    >
                      Minutes
                    </span>
                  </div>

                  <span
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-light opacity-40 select-none self-center -translate-y-4 sm:-translate-y-6"
                    style={{ color: currentTheme.labelColor }}
                  >
                    :
                  </span>

                  {/* Seconds Card */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-none select-none font-mono"
                      style={{
                        color: currentTheme.digitColor,
                        textShadow: `0 8px 40px ${currentTheme.accentGlow}`,
                      }}
                    >
                      {formatTwoDigits(timeBreakdown.seconds)}
                    </span>
                    <span
                      className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] mt-2 sm:mt-4"
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
                  &ldquo;{state.scriptureText}&rdquo;
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
                &ldquo;{state.scripture.text}&rdquo;
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
      {/* ======================================================== */}
      <div className="relative z-30 w-full p-4 sm:p-8 pointer-events-none">
        {/* Scripture Lower-Third (when scripture is in lower-third mode) */}
        {state.scripture.displayMode === "lower-third" && (
          <div className="max-w-4xl mx-auto mb-3 animate-in slide-in-from-bottom duration-500">
            <div
              className="p-4 rounded-xl border-l-4 border-amber-400 shadow-2xl backdrop-blur-md"
              style={{
                background: "linear-gradient(90deg, rgba(6,7,20,0.95) 0%, rgba(16,19,41,0.92) 100%)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-widest">
                  📖 {state.scripture.reference} ({state.scripture.translation})
                </span>
              </div>
              <p className="text-xs sm:text-base text-white font-serif leading-relaxed italic">
                &ldquo;{state.scripture.text}&rdquo;
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
                className="overflow-hidden py-2 px-4 rounded-xl shadow-2xl border border-amber-400/40 flex items-center gap-4"
                style={{
                  background: "linear-gradient(90deg, #D9A441 0%, #B8860B 100%)",
                }}
              >
                <span className="px-2.5 py-0.5 rounded bg-black text-amber-300 text-xs font-black uppercase tracking-wider flex-shrink-0">
                  {state.overlay.title || "ANNOUNCEMENTS"}
                </span>
                <div className="whitespace-nowrap overflow-hidden text-xs sm:text-sm font-black text-black tracking-wide animate-marquee">
                  {state.overlay.subtitle}
                </div>
              </div>
            ) : (
              /* Speaker or Giving Lower-Third Banner */
              <div
                className="p-4 rounded-2xl border-l-8 border-amber-400 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,7,20,0.96) 0%, rgba(16,19,41,0.90) 80%, rgba(6,7,20,0.8) 100%)",
                }}
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    {state.overlay.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-amber-300">
                    {state.overlay.subtitle}
                  </p>
                  {state.overlay.extra && (
                    <p className="text-[11px] sm:text-xs text-zinc-300 font-mono tracking-tight">
                      {state.overlay.extra}
                    </p>
                  )}
                </div>

                {state.showLogo && !isTransparentMode && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-400/50 bg-black/60 p-0.5 flex-shrink-0 shadow-lg hidden sm:block">
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
