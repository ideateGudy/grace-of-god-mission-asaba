"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Video,
  Radio,
  Sliders,
  Check,
  AlertTriangle,
  Play,
  ExternalLink,
  Copy,
  X,
  ShieldAlert,
} from "lucide-react";
import {
  STUDIO_SYNC_CHANNEL,
  type StudioSyncPayload,
} from "@/lib/studio/studio-sync";
import { WebRtcBroadcaster } from "@/lib/studio/studio-webrtc";
import { api } from "@/lib/api/client";

export function PhoneCameraTransmitter({ roomCode = "ggm-cam" }: { roomCode?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isOnAir, setIsOnAir] = useState<boolean>(false);
  const [isStaged, setIsStaged] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<string>("Ready to connect");
  const [fpsCount, setFpsCount] = useState<number>(0);
  const [isSecure, setIsSecure] = useState<boolean>(true);

  const [showInsecureModal, setShowInsecureModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Check secure context (HTTPS or localhost)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const secure = window.isSecureContext ?? (window.location.protocol === "https:" || window.location.hostname === "localhost");
      setIsSecure(secure);
    }
  }, []);

  // Universal cross-browser getUserMedia resolver
  const requestMediaStream = useCallback(async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    if (navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    const legacyGUM =
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia;

    if (legacyGUM) {
      return new Promise<MediaStream>((resolve, reject) => {
        legacyGUM.call(navigator, constraints, resolve, reject);
      });
    }
    throw new Error("SECURE_CONTEXT_REQUIRED");
  }, []);

  // Start mobile camera stream with 3-tier constraint fallback
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    setIsStarting(true);
    setCameraStatus("Initializing camera feed...");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      let stream: MediaStream;
      try {
        stream = await requestMediaStream({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err: any) {
        if (err?.message === "SECURE_CONTEXT_REQUIRED") throw err;
        try {
          stream = await requestMediaStream({
            video: { facingMode: { ideal: mode } },
            audio: false,
          });
        } catch (err2: any) {
          if (err2?.message === "SECURE_CONTEXT_REQUIRED") throw err2;
          stream = await requestMediaStream({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities: any = track?.getCapabilities ? track.getCapabilities() : {};
      setHasTorch(Boolean(capabilities?.torch));

      setCameraActive(true);
      setCameraStatus("Camera Live & Transmitting");
    } catch (err: any) {
      console.warn("Camera start failed:", err);
      setCameraActive(false);

      if (err?.message === "SECURE_CONTEXT_REQUIRED" || !isSecure) {
        setCameraStatus("Browser blocked camera on plain HTTP. Follow setup steps below.");
        setShowInsecureModal(true);
      } else {
        setCameraStatus(`Camera error: ${err?.message || "Permission required. Tap 'Tap to Start Camera'"}`);
      }
    } finally {
      setIsStarting(false);
    }
  }, [isSecure, requestMediaStream]);

  // Try auto-starting, but user can always tap the prominent start button
  useEffect(() => {
    void startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, startCamera]);

  const broadcasterRef = useRef<WebRtcBroadcaster | null>(null);
  const [webrtcState, setWebrtcState] = useState<string>("disconnected");
  const isSendingFrameRef = useRef<boolean>(false);

  // Real-time WebRTC broadcaster + High-Frequency Frame Transmitter fallback
  useEffect(() => {
    if (!cameraActive || !streamRef.current) {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      broadcasterRef.current?.stop();
      broadcasterRef.current = null;
      return;
    }

    // 1. Initialize WebRTC Broadcaster (Zero-Latency P2P)
    const broadcaster = new WebRtcBroadcaster(roomCode);
    broadcaster.onStateChange = (state) => {
      setWebrtcState(state);
    };
    broadcaster.start(streamRef.current).catch((err) => {
      console.warn("WebRTC broadcaster start error:", err);
    });
    broadcasterRef.current = broadcaster;

    // 2. High-Frequency Frame Transmitter (50ms interval ~20 FPS fallback)
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });

    let framesSent = 0;
    const fpsTimer = setInterval(() => {
      setFpsCount(framesSent);
      framesSent = 0;
    }, 1000);

    const sendFrameLoop = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx || isSendingFrameRef.current) return;

      const w = 480;
      const h = Math.round((video.videoHeight / (video.videoWidth || 1)) * 480) || 270;
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(video, 0, 0, w, h);
      const frameData = canvas.toDataURL("image/jpeg", 0.55);

      isSendingFrameRef.current = true;
      const label = `Phone Camera (${roomCode})`;
      api.studio.sendFrame(roomCode, frameData, label)
        .catch(() => {})
        .finally(() => {
          isSendingFrameRef.current = false;
        });

      framesSent++;
    };

    frameIntervalRef.current = setInterval(sendFrameLoop, 50);

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      clearInterval(fpsTimer);
      broadcaster.stop();
    };
  }, [cameraActive, roomCode]);

  // Sync tally status with studio (via BroadcastChannel for same device & remote API for cross-device)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(STUDIO_SYNC_CHANNEL);
      channel.onmessage = (event: MessageEvent<StudioSyncPayload>) => {
        if (event.data?.state) {
          const st = event.data.state;
          const isThisCamOnAir =
            st.activeType === "camera" &&
            !st.isBlackout &&
            (st.camera?.roomCode === roomCode || !st.camera?.roomCode);
          const isThisCamStaged =
            st.previewType === "camera" &&
            (st.camera?.roomCode === roomCode || !st.camera?.roomCode);

          setIsOnAir(isThisCamOnAir);
          setIsStaged(isThisCamStaged);
        }
      };
    } catch {}

    // Cross-device remote tally sync (PC -> Phone)
    const syncRemoteTally = async () => {
      try {
        const res = await api.countdown.get();
        if (res?.data) {
          const st = res.data;
          const isThisCamOnAir =
            st.activeType === "camera" &&
            !st.isBlackout &&
            (st.camera?.roomCode === roomCode || !st.camera?.roomCode);
          const isThisCamStaged =
            st.previewType === "camera" &&
            (st.camera?.roomCode === roomCode || !st.camera?.roomCode);

          setIsOnAir(isThisCamOnAir);
          setIsStaged(isThisCamStaged);
        }
      } catch {}
    };

    const tallyTimer = setInterval(syncRemoteTally, 1200);

    return () => {
      channel?.close();
      clearInterval(tallyTimer);
    };
  }, [roomCode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchEnabled;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchEnabled(nextTorch);
    } catch {}
  };

  const vercelHttpsUrl = `https://ggmasaba.vercel.app/studio/cam?room=${roomCode}`;

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden flex flex-col justify-between select-none">
      {/* Background Fullscreen Camera Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top Bar: Live Tally Indicator for Cameraman */}
      <div className="relative z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div
          className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-all duration-300 ${
            isOnAir
              ? "bg-red-600 text-white animate-pulse ring-4 ring-red-500/50"
              : isStaged
              ? "bg-amber-400 text-black ring-2 ring-amber-400/50"
              : "bg-zinc-800/90 text-zinc-300"
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnAir ? "bg-white" : isStaged ? "bg-black" : "bg-zinc-500"
            }`}
          />
          {isOnAir ? "🔴 ON AIR (LIVE FEED)" : isStaged ? "🟡 STANDBY (PREVIEW)" : "⚪ READY"}
        </div>

        <div className="flex items-center gap-2">
          {cameraActive && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
              {fpsCount} FPS
            </span>
          )}
          <div className="text-[11px] font-mono px-2.5 py-1 rounded bg-black/60 text-zinc-300 backdrop-blur-sm border border-white/10">
            ROOM: {roomCode.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Insecure Context (HTTP on LAN IP) Warning Banner */}
      {!isSecure && (
        <div className="relative z-30 mx-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 backdrop-blur-md text-amber-200 text-xs space-y-1 text-center">
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Mobile Camera Security Note</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Mobile Chrome/Safari disables camera access over plain HTTP IP. For instant 100% camera access, open via secure HTTPS:
          </p>
          <a
            href={vercelHttpsUrl}
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-black font-bold text-xs rounded-lg mt-1"
          >
            <span>Open in HTTPS Mode</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Center Focus Area & Start Button */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-auto p-4 text-center">
        {!cameraActive ? (
          <div className="p-6 rounded-2xl bg-black/80 border border-amber-400/40 backdrop-blur-md shadow-2xl max-w-sm space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Start Mobile Camera Transmitter
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tap below to grant camera access and start transmitting to the studio switcher.
              </p>
            </div>
            <button
              type="button"
              disabled={isStarting}
              onClick={() => {
                if (!isSecure && (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia)) {
                  setShowInsecureModal(true);
                  return;
                }
                void startCamera(facingMode);
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isStarting ? "Accessing Camera..." : "Tap to Start Camera"}</span>
            </button>
            <p className="text-[10px] text-zinc-500 font-mono">{cameraStatus}</p>
          </div>
        ) : (
          <div className="pointer-events-none opacity-40">
            <div className="w-48 h-48 border border-white/30 rounded-2xl flex items-center justify-center relative">
              <div className="w-4 h-4 border-t-2 border-l-2 border-white absolute top-2 left-2" />
              <div className="w-4 h-4 border-t-2 border-r-2 border-white absolute top-2 right-2" />
              <div className="w-4 h-4 border-b-2 border-l-2 border-white absolute bottom-2 left-2" />
              <div className="w-4 h-4 border-b-2 border-r-2 border-white absolute bottom-2 right-2" />
              <div className="w-2 h-2 bg-white/60 rounded-full" />
            </div>
            <p className="text-[10px] text-white/80 mt-2 font-mono uppercase tracking-widest">
              🟢 TRANSMITTING LIVE FEED TO STUDIO
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Controls */}
      <div className="relative z-20 p-6 flex items-center justify-around bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <button
          type="button"
          onClick={toggleFacingMode}
          className="p-4 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-white/20 shadow-xl active:scale-95 transition-transform flex flex-col items-center gap-1"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-wider">Flip</span>
        </button>

        {hasTorch && (
          <button
            type="button"
            onClick={toggleTorch}
            className={`p-4 rounded-full border shadow-xl active:scale-95 transition-all flex flex-col items-center gap-1 ${
              torchEnabled
                ? "bg-amber-400 text-black border-amber-300"
                : "bg-zinc-900/90 text-white border-white/20"
            }`}
          >
            {torchEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            <span className="text-[9px] uppercase font-bold tracking-wider">Light</span>
          </button>
        )}

        <div className="text-center">
          <span className="text-[10px] text-zinc-400 block font-mono">STATUS</span>
          <span className={`text-xs font-bold ${cameraActive ? "text-emerald-400" : "text-amber-400"}`}>
            {cameraActive ? "LIVE FEED" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Interactive Mobile Browser HTTP Security Resolution Modal */}
      {showInsecureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-amber-400/50 rounded-2xl p-5 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <span>Mobile Camera Blocked on HTTP</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInsecureModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p>
                Mobile browsers (Chrome &amp; Safari) strictly require <strong>HTTPS</strong> to access the camera. Because this address starts with <code className="px-1.5 py-0.5 rounded bg-black text-amber-300 font-mono text-[11px]">http://</code>, the browser blocks camera access.
              </p>

              <div className="p-3 bg-black/60 rounded-xl border border-white/10 space-y-2">
                <span className="text-amber-400 font-bold text-[11px] block uppercase tracking-wider">
                  ⚡ 15-Second Fix for Android Chrome:
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-300">
                  <li>Open a new tab in Chrome on your phone.</li>
                  <li>
                    Paste this into the address bar:
                    <div className="flex items-center gap-1.5 mt-1">
                      <code className="px-2 py-1 rounded bg-zinc-800 text-amber-300 font-mono text-[10px] break-all flex-1">
                        chrome://flags/#unsafely-treat-insecure-origin-as-secure
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText("chrome://flags/#unsafely-treat-insecure-origin-as-secure");
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-2 py-1 bg-amber-400 text-black font-bold text-[10px] rounded flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                  </li>
                  <li>
                    Change setting to <strong>&ldquo;Enabled&rdquo;</strong>.
                  </li>
                  <li>
                    Paste this URL into the text box below it:
                    <div className="flex items-center gap-1.5 mt-1">
                      <code className="px-2 py-1 rounded bg-zinc-800 text-white font-mono text-[10px] flex-1">
                        {typeof window !== "undefined" ? window.location.origin : "http://192.168.1.66:3000"}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== "undefined" ? window.location.origin : "http://192.168.1.66:3000";
                          navigator.clipboard?.writeText(origin);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="px-2 py-1 bg-amber-400 text-black font-bold text-[10px] rounded flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copy IP
                      </button>
                    </div>
                  </li>
                  <li>
                    Tap the blue <strong>Relaunch</strong> button at the bottom of Chrome.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/20 text-[11px] text-amber-200">
                After relaunching Chrome, return to this tab and tap <strong>&ldquo;Start Camera&rdquo;</strong> — camera access will be 100% unlocked!
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowInsecureModal(false);
                  void startCamera(facingMode);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider text-center"
              >
                I Did It · Try Camera Now
              </button>
              <button
                type="button"
                onClick={() => setShowInsecureModal(false)}
                className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
