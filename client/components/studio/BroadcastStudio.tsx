"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Tv,
  Camera,
  Share2,
  ExternalLink,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Sliders,
  Check,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type StudioInputType,
  DEFAULT_STUDIO_STATE,
  COUNTDOWN_THEMES,
  calculateSecondsUntilTarget,
  calculateSecondsUntilDate,
  calculateTimeBreakdown,
} from "@ggm/types";
import {
  STUDIO_SYNC_CHANNEL,
  broadcastStudioState,
  loadStudioStateFromStorage,
  type StudioSyncPayload,
} from "@/lib/studio/studio-sync";
import { audioSynth } from "@/lib/studio/audio-synth";
import { CHURCH_LOGO_PATH } from "@/lib/flyer/church-logo";
import { SafeMediaImage } from "@/components/studio/SafeMediaImage";
import { CountdownInput } from "@/components/studio/inputs/CountdownInput";
import { ScriptureInput } from "@/components/studio/inputs/ScriptureInput";
import { MediaInput } from "@/components/studio/inputs/MediaInput";
import { LowerThirdInput } from "@/components/studio/inputs/LowerThirdInput";
import { CameraInput } from "@/components/studio/inputs/CameraInput";
import { toast } from "sonner";
import { WebRtcReceiver } from "@/lib/studio/studio-webrtc";
import { api } from "@/lib/api/client";

function formatTwoDigits(n: number): string {
  return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

export function BroadcastStudio() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [state, setState] = useState<BroadcastStudioState>(DEFAULT_STUDIO_STATE);
  const [activeInputTab, setActiveInputTab] = useState<StudioInputType>("countdown");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [phoneFrame, setPhoneFrame] = useState<string | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const programVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const activeDeviceIdRef = useRef<string | undefined>(undefined);

  // 1. Initial State Restoration
  useEffect(() => {
    if (typeof window === "undefined") return;

    const restored = loadStudioStateFromStorage();
    setState(restored);
    setActiveInputTab(restored.previewType || "countdown");

    try {
      channelRef.current = new BroadcastChannel(STUDIO_SYNC_CHANNEL);
    } catch {}

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsMounted(true);

    return () => {
      channelRef.current?.close();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Camera Stream Lifecycle Manager (OBS / vMix Style Preview & Program Feeds)
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

    const isPreviewCam = state.previewType === "camera";
    const isProgramCam = state.activeType === "camera" && !state.isBlackout;
    const streamType = state.camera?.streamType || "webcam";
    const targetDeviceId = state.camera?.deviceId;

    if (!isPreviewCam && !isProgramCam) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        activeDeviceIdRef.current = undefined;
        setCameraActive(false);
      }
      return;
    }

    if (streamType !== "webcam") {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        activeDeviceIdRef.current = undefined;
        setCameraActive(false);
      }
      return;
    }

    // If the active stream already matches the target deviceId and is active, just ensure videos are playing
    if (
      cameraStreamRef.current &&
      cameraStreamRef.current.active &&
      activeDeviceIdRef.current === targetDeviceId
    ) {
      const stream = cameraStreamRef.current;
      if (previewVideoRef.current && isPreviewCam && previewVideoRef.current.srcObject !== stream) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play().catch(() => {});
      }
      if (programVideoRef.current && isProgramCam && programVideoRef.current.srcObject !== stream) {
        programVideoRef.current.srcObject = stream;
        programVideoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      return;
    }

    // Stop existing stream if device changed or inactive
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      activeDeviceIdRef.current = undefined;
    }

    let isCurrent = true;

    async function initCamera() {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true,
            audio: false,
          });
        } catch {
          // Fallback if exact deviceId constraint is rejected
          stream = await navigator.mediaDevices.getUserMedia({
            video: targetDeviceId ? { deviceId: { ideal: targetDeviceId } } : true,
            audio: false,
          });
        }

        if (!isCurrent) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        cameraStreamRef.current = stream;
        activeDeviceIdRef.current = targetDeviceId;
        setCameraActive(true);

        if (previewVideoRef.current && isPreviewCam) {
          previewVideoRef.current.srcObject = stream;
          previewVideoRef.current.play().catch(() => {});
        }
        if (programVideoRef.current && isProgramCam) {
          programVideoRef.current.srcObject = stream;
          programVideoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Could not start camera preview for device:", targetDeviceId, err);
        setCameraActive(false);
      }
    }

    void initCamera();

    return () => {
      isCurrent = false;
    };
  }, [state.previewType, state.activeType, state.isBlackout, state.camera?.streamType, state.camera?.deviceId]);

  // Re-attach active stream whenever monitor DOM elements update
  useEffect(() => {
    const stream = cameraStreamRef.current;
    if (!stream || !stream.active) return;

    if (state.previewType === "camera" && previewVideoRef.current) {
      if (previewVideoRef.current.srcObject !== stream) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play().catch(() => {});
      }
    }

    if (state.activeType === "camera" && !state.isBlackout && programVideoRef.current) {
      if (programVideoRef.current.srcObject !== stream) {
        programVideoRef.current.srcObject = stream;
        programVideoRef.current.play().catch(() => {});
      }
    }
  }, [state.previewType, state.activeType, state.isBlackout]);

  const phoneStreamRef = useRef<MediaStream | null>(null);
  const webrtcReceiverRef = useRef<WebRtcReceiver | null>(null);
  const [webrtcConnected, setWebrtcConnected] = useState<boolean>(false);
  const previewPhoneVideoRef = useRef<HTMLVideoElement | null>(null);
  const programPhoneVideoRef = useRef<HTMLVideoElement | null>(null);

  // Poll Phone Camera Frame + WebRTC Receiver for instant 0-latency playback
  useEffect(() => {
    const isPhoneCam =
      (state.previewType === "camera" || (state.activeType === "camera" && !state.isBlackout)) &&
      state.camera?.streamType === "phone";

    if (!isPhoneCam) {
      webrtcReceiverRef.current?.stop();
      webrtcReceiverRef.current = null;
      setWebrtcConnected(false);
      return;
    }

    const room = state.camera?.roomCode || "cam-1";

    // 1. Initialize WebRTC Receiver
    const receiver = new WebRtcReceiver(room);
    receiver.onStateChange = (connState) => {
      setWebrtcConnected(connState === "connected");
    };
    receiver.onRemoteStream = (remoteStream) => {
      phoneStreamRef.current = remoteStream;
      setWebrtcConnected(true);
      if (previewPhoneVideoRef.current) {
        previewPhoneVideoRef.current.srcObject = remoteStream;
        previewPhoneVideoRef.current.play().catch(() => {});
      }
      if (programPhoneVideoRef.current) {
        programPhoneVideoRef.current.srcObject = remoteStream;
        programPhoneVideoRef.current.play().catch(() => {});
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

    // 3. High-Frequency Frame Polling (45ms fallback)
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
  }, [state.previewType, state.activeType, state.isBlackout, state.camera?.streamType, state.camera?.roomCode]);

  // Fullscreen toggle for Studio
  const toggleStudioFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // 2. Broadcast and Persist State Changes
  const updateStudioState = useCallback(
    (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => {
      setState((prev) => {
        const next = updater(prev);

        // Instant local window broadcast via BroadcastChannel
        broadcastStudioState(channelRef.current, {
          type: "SYNC_STUDIO",
          state: next,
        });

        // Remote database sync for cross-device controllers (e.g. phone controlling PC)
        if (navigator.onLine) {
          api.countdown.update({
            title: next.title,
            subtitle: next.subtitle,
            scriptureRef: next.scriptureRef,
            scriptureText: next.scriptureText,
            mode: next.mode,
            targetTimeString: next.targetTimeString,
            targetDate: next.targetDate,
            durationSeconds: next.durationSeconds,
            theme: next.theme,
            soundEnabled: next.soundEnabled,
            overtimeEnabled: next.overtimeEnabled,
            showScripture: next.showScripture,
            showLogo: next.showLogo,
            stageMode: next.stageMode,
            isRunning: next.isRunning,
            remainingSeconds: next.remainingSeconds,
            activeType: next.activeType,
            previewType: next.previewType,
            scripture: next.scripture,
            mediaList: next.mediaList,
            activeMediaId: next.activeMediaId,
            overlay: next.overlay,
            camera: next.camera,
            isBlackout: next.isBlackout,
            transitionType: next.transitionType,
            transitionDurationMs: next.transitionDurationMs,
          }).catch(() => {});
        }

        return next;
      });
    },
    []
  );

  // 3. Hardware Switcher Transition Actions: CUT, FADE, FTB, CLEAR DSK
  const handleCut = useCallback(() => {
    updateStudioState((prev) => {
      const nextType = prev.previewType;
      return {
        ...prev,
        activeType: nextType,
        isBlackout: false,
      };
    });
    toast.success("CUT TO AIR");
  }, [updateStudioState]);

  const handleFade = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      updateStudioState((prev) => ({
        ...prev,
        activeType: prev.previewType,
        isBlackout: false,
      }));
      setIsFading(false);
      toast.success("FADED TO AIR");
    }, 400);
  }, [updateStudioState]);

  const handleToggleBlackout = useCallback(() => {
    updateStudioState((prev) => {
      const nextBlack = !prev.isBlackout;
      if (nextBlack) toast.error("FTB: BLACKOUT ACTIVE");
      else toast.info("FTB: RESTORED");
      return { ...prev, isBlackout: nextBlack };
    });
  }, [updateStudioState]);

  const handleClearDsk = useCallback(() => {
    updateStudioState((prev) => ({
      ...prev,
      overlay: { ...prev.overlay, enabled: false },
    }));
    toast.info("OVERLAYS CLEARED");
  }, [updateStudioState]);

  // 4. Keyboard Shortcuts: Space (CUT), Enter (FADE), B/F (FTB), Esc (Clear DSK), 1-5 (Tabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleCut();
      } else if (e.code === "Enter") {
        e.preventDefault();
        handleFade();
      } else if (e.key === "b" || e.key === "B" || e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleBlackout();
      } else if (e.code === "Escape") {
        e.preventDefault();
        handleClearDsk();
      } else if (e.key === "1") {
        setActiveInputTab("countdown");
        updateStudioState((prev) => ({ ...prev, previewType: "countdown" }));
      } else if (e.key === "2") {
        setActiveInputTab("scripture");
        updateStudioState((prev) => ({ ...prev, previewType: "scripture" }));
      } else if (e.key === "3") {
        setActiveInputTab("media");
        updateStudioState((prev) => ({ ...prev, previewType: "media" }));
      } else if (e.key === "4") {
        setActiveInputTab("lower-third");
      } else if (e.key === "5") {
        setActiveInputTab("camera");
        updateStudioState((prev) => ({ ...prev, previewType: "camera" }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCut, handleFade, handleToggleBlackout, handleClearDsk, updateStudioState]);

  // 5. OBS Browser Source Link Copy
  const copyObsUrl = (transparent: boolean = true) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ggmasaba.vercel.app";
    const url = transparent ? `${origin}/studio/live?transparent=true` : `${origin}/studio/live`;
    navigator.clipboard.writeText(url);
    toast.success(
      transparent
        ? "Copied OBS Browser Source URL (Transparent Keying)!"
        : "Copied Sanctuary Live URL!"
    );
  };

  const openPopout = () => {
    if (typeof window === "undefined") return;
    window.open(
      "/studio/live",
      "GgmStudioLiveOutput",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  const currentTheme = COUNTDOWN_THEMES[state.theme] || COUNTDOWN_THEMES["royal-gold"];
  const timeBreakdown = calculateTimeBreakdown(state.remainingSeconds);
  const activeMedia = state.mediaList.find((m) => m.id === state.activeMediaId) || state.mediaList[0];

  return (
    <div className="min-h-screen bg-[#070913] text-white flex flex-col font-sans select-none">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR: Studio Branding, Tally & Quick Tools */}
      {/* ======================================================== */}
      <header className="px-4 py-3 bg-[#0c0e1c] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400/60 bg-black/40 p-0.5">
            <Image
              src={CHURCH_LOGO_PATH}
              alt="GGM Logo"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-2">
              <span>GGM BROADCAST STUDIO</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                vMix & OBS Mode
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400 hidden sm:block">
              Sanctuary Switcher · Sanctuary LED Wall · OBS Alpha Keyer
            </p>
          </div>
        </div>

        {/* Studio Tally Badges */}
        <div className="flex items-center gap-2">
          {/* Staged Tally */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STAGED: {state.previewType}</span>
          </div>

          {/* On Air Tally */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all ${
              state.isBlackout
                ? "bg-zinc-800 border-zinc-600 text-zinc-400"
                : "bg-red-600/30 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                state.isBlackout ? "bg-zinc-500" : "bg-red-500 animate-ping"
              }`}
            />
            <span>{state.isBlackout ? "BLACKOUT" : `LIVE: ${state.activeType}`}</span>
          </div>
        </div>

        {/* Quick Actions (OBS copy, Pop-out, Chime Soundboard) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => copyObsUrl(true)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Copy URL for OBS Studio Browser Source with transparent keying"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">OBS Keying URL</span>
          </button>

          <button
            type="button"
            onClick={openPopout}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Open Live Output in dedicated window for projector or secondary monitor"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Projector Window</span>
          </button>

          <button
            type="button"
            onClick={() => audioSynth.playCathedralChimes()}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs"
            title="Trigger Cathedral Chimes"
          >
            🔔
          </button>

          <button
            type="button"
            onClick={toggleStudioFullscreen}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition-colors"
            title={isFullscreen ? "Exit Fullscreen Studio" : "Enter Fullscreen Studio"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. DUAL VIDEO MONITORS: PREVIEW (Left) vs PROGRAM (Right) */}
      {/* ======================================================== */}
      <section className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 border-b border-white/10 bg-[#090b17]">
        {/* PREVIEW MONITOR (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PREVIEW [STAGED] &middot; {state.previewType.toUpperCase()}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">NEXT SCENE</span>
          </div>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-emerald-500/60 bg-black shadow-lg flex items-center justify-center">
            {/* Preview Staged Representation */}
            {state.previewType === "countdown" && (
              <div className="text-center p-4">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  {state.title}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                  {formatTwoDigits(timeBreakdown.hours)}:{formatTwoDigits(timeBreakdown.minutes)}:
                  {formatTwoDigits(timeBreakdown.seconds)}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-1">{state.subtitle}</span>
              </div>
            )}

            {state.previewType === "scripture" && (
              <div className="p-4 text-center max-w-sm">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black uppercase">
                  {state.scripture.reference} ({state.scripture.translation})
                </span>
                <p className="text-xs text-zinc-200 font-serif italic mt-2 line-clamp-3">
                  &ldquo;{state.scripture.text}&rdquo;
                </p>
              </div>
            )}

            {state.previewType === "media" && activeMedia && (
              <div className="relative w-full h-full">
                <SafeMediaImage
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {state.previewType === "camera" && (
              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                {state.camera.streamType === "webcam" && (
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                {state.camera.streamType === "youtube" && state.camera.youtubeId && (
                  <iframe
                    src={`https://www.youtube.com/embed/${state.camera.youtubeId}?autoplay=1&mute=1&controls=0&rel=0`}
                    title="Preview YouTube Feed"
                    allow="autoplay; encrypted-media"
                    className="w-full h-full border-0 pointer-events-none"
                  />
                )}
                {state.camera.streamType === "phone" && (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {/* Zero-latency WebRTC video track */}
                    <video
                      ref={previewPhoneVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-contain ${webrtcConnected ? "block" : "hidden"}`}
                    />
                    {/* Ultra-fast Frame Relay fallback */}
                    {!webrtcConnected && phoneFrame && (
                      <img
                        src={phoneFrame}
                        alt="Phone Camera Live Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                    {/* Standby waiting screen */}
                    {!webrtcConnected && !phoneFrame && (
                      <div className="text-center p-4 text-zinc-400">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-amber-400 animate-pulse" />
                        <span className="text-xs font-bold text-white block">
                          Phone Camera Transmitter ({state.camera.roomCode || "cam-1"})
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Waiting for live feed &middot; Scan QR code below
                        </span>
                      </div>
                    )}
                    {webrtcConnected && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/80 text-black font-mono font-black text-[9px] uppercase tracking-wider">
                        ⚡ WebRTC 0-Latency
                      </span>
                    )}
                  </div>
                )}
                {state.camera.streamType === "webcam" && !cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 text-center pointer-events-none">
                    <Camera className="w-8 h-8 text-amber-400/80 mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-white">Live Camera Preview Active</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Select camera input in tab 5 below</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER TRANSITION CONTROLS (2 Cols) */}
        <div className="lg:col-span-2 flex flex-row lg:flex-col items-center justify-center gap-2 sm:gap-3 py-2">
          {/* CUT Button */}
          <button
            type="button"
            onClick={handleCut}
            className="flex-1 lg:flex-none w-full py-3 sm:py-4 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="Instant Switch (Spacebar)"
          >
            <span>CUT</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">(Space)</span>
          </button>

          {/* FADE Button */}
          <button
            type="button"
            onClick={handleFade}
            className="flex-1 lg:flex-none w-full py-2.5 sm:py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
            title="Smooth Dissolve (Enter)"
          >
            <span>FADE</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">(Enter)</span>
          </button>

          {/* FTB (Fade to Black) */}
          <button
            type="button"
            onClick={handleToggleBlackout}
            className={`flex-1 lg:flex-none w-full py-2 px-3 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
              state.isBlackout
                ? "bg-red-500 text-white ring-2 ring-red-400 animate-pulse"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            }`}
            title="Fade to Black (B or F)"
          >
            <span>FTB</span>
            <span className="text-[9px] opacity-60 hidden sm:inline">(B)</span>
          </button>

          {/* Clear DSK Overlays */}
          <button
            type="button"
            onClick={handleClearDsk}
            className="flex-1 lg:flex-none w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 uppercase border border-white/5"
            title="Clear Lower Third (Esc)"
          >
            Clear DSK (Esc)
          </button>
        </div>

        {/* PROGRAM MONITOR (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              PROGRAM [LIVE ON AIR] &middot; {state.activeType.toUpperCase()}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">SANCTUARY FEED</span>
          </div>

          <div
            className={`relative aspect-video w-full rounded-xl overflow-hidden border-2 bg-black shadow-2xl flex items-center justify-center transition-all ${
              state.isBlackout
                ? "border-zinc-700"
                : "border-red-600 ring-2 ring-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
            } ${isFading ? "opacity-30" : "opacity-100"}`}
          >
            {state.isBlackout ? (
              <div className="text-zinc-600 font-black text-xs uppercase tracking-widest">
                BLACKOUT ACTIVE
              </div>
            ) : (
              <>
                {/* Active Program Scene */}
                {state.activeType === "countdown" && (
                  <div className="text-center p-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                      {state.title}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                      {formatTwoDigits(timeBreakdown.hours)}:
                      {formatTwoDigits(timeBreakdown.minutes)}:
                      {formatTwoDigits(timeBreakdown.seconds)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-1">{state.subtitle}</span>
                  </div>
                )}

                {state.activeType === "scripture" && (
                  <div className="p-4 text-center max-w-sm">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black uppercase">
                      {state.scripture.reference} ({state.scripture.translation})
                    </span>
                    <p className="text-xs text-zinc-200 font-serif italic mt-2 line-clamp-3">
                      &ldquo;{state.scripture.text}&rdquo;
                    </p>
                  </div>
                )}

                {state.activeType === "media" && activeMedia && (
                  <div className="relative w-full h-full">
                    <SafeMediaImage
                      src={activeMedia.url}
                      alt={activeMedia.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {state.activeType === "camera" && (
                  <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
                    {state.camera.streamType === "webcam" && (
                      <video
                        ref={programVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )}
                    {state.camera.streamType === "youtube" && state.camera.youtubeId && (
                      <iframe
                        src={`https://www.youtube.com/embed/${state.camera.youtubeId}?autoplay=1&mute=1&controls=0&rel=0`}
                        title="Program YouTube Feed"
                        allow="autoplay; encrypted-media"
                        className="w-full h-full border-0 pointer-events-none"
                      />
                    )}
                    {state.camera.streamType === "phone" && (
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        {/* Zero-latency WebRTC video track */}
                        <video
                          ref={programPhoneVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-contain ${webrtcConnected ? "block" : "hidden"}`}
                        />
                        {/* Ultra-fast Frame Relay fallback */}
                        {!webrtcConnected && phoneFrame && (
                          <img
                            src={phoneFrame}
                            alt="Phone Camera Program Feed"
                            className="w-full h-full object-contain"
                          />
                        )}
                        {/* Standby waiting screen */}
                        {!webrtcConnected && !phoneFrame && (
                          <div className="text-center p-4 text-zinc-400">
                            <Camera className="w-8 h-8 mx-auto mb-2 text-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-white block">
                              PHONE CAM ON AIR ({state.camera.roomCode || "cam-1"})
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              Waiting for live phone stream...
                            </span>
                          </div>
                        )}
                        {webrtcConnected && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-wider animate-pulse">
                            ⚡ LIVE P2P
                          </span>
                        )}
                      </div>
                    )}
                    {state.camera.streamType === "webcam" && !cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 text-center pointer-events-none">
                        <Camera className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                        <span className="text-xs font-bold text-white">Camera Transmitting On Air</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Overlaid DSK Indicator Pill on Program Monitor */}
                {state.overlay.enabled && (
                  <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-black/80 border border-amber-400/50 backdrop-blur-sm flex items-center justify-between text-[10px]">
                    <span className="text-amber-300 font-bold truncate">
                      DSK: {state.overlay.title}
                    </span>
                    <span className="px-1 rounded bg-red-600 text-white font-black text-[9px] uppercase">
                      ON AIR
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INPUT CHANNEL DOCK (OBS / vMix Bottom Bay) */}
      {/* ======================================================== */}
      <main className="flex-1 p-3 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        {/* Channel Strip Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 gap-2 pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveInputTab("countdown");
              updateStudioState((prev) => ({ ...prev, previewType: "countdown" }));
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeInputTab === "countdown"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Countdown Timer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveInputTab("scripture");
              updateStudioState((prev) => ({ ...prev, previewType: "scripture" }));
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeInputTab === "scripture"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Bible Scripture</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveInputTab("media");
              updateStudioState((prev) => ({ ...prev, previewType: "media" }));
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeInputTab === "media"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. Cloudinary Media Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveInputTab("lower-third")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeInputTab === "lower-third"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>4. Lower Thirds (DSK)</span>
            {state.overlay.enabled && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveInputTab("camera");
              updateStudioState((prev) => ({ ...prev, previewType: "camera" }));
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeInputTab === "camera"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>5. Camera / NDI / Phone</span>
          </button>
        </div>

        {/* Active Input Panel Container */}
        <div className="p-4 sm:p-6 bg-zinc-900/40 rounded-2xl border border-white/5">
          {activeInputTab === "countdown" && (
            <CountdownInput
              state={state}
              onChange={updateStudioState}
              onTakeLive={handleCut}
            />
          )}

          {activeInputTab === "scripture" && (
            <ScriptureInput
              state={state}
              onChange={updateStudioState}
              onTakeLive={handleCut}
            />
          )}

          {activeInputTab === "media" && (
            <MediaInput
              state={state}
              onChange={updateStudioState}
              onTakeLive={handleCut}
            />
          )}

          {activeInputTab === "lower-third" && (
            <LowerThirdInput
              state={state}
              onChange={updateStudioState}
              onTakeLive={handleCut}
            />
          )}

          {activeInputTab === "camera" && (
            <CameraInput
              state={state}
              onChange={updateStudioState}
              onTakeLive={handleCut}
            />
          )}
        </div>
      </main>
    </div>
  );
}
