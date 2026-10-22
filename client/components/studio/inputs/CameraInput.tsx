"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Smartphone,
  Video,
  Wifi,
  QrCode,
  Radio,
  RefreshCw,
  Tv,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  type BroadcastStudioState,
  type StudioCameraState,
} from "@ggm/types";

interface CameraInputProps {
  state: BroadcastStudioState;
  onChange: (updater: (prev: BroadcastStudioState) => BroadcastStudioState) => void;
  onTakeLive?: () => void;
}

interface VideoDevice {
  deviceId: string;
  label: string;
  isNdiOrVirtual: boolean;
  isManyCam: boolean;
}

export function CameraInput({ state, onChange, onTakeLive }: CameraInputProps) {
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [ipCameraUrl, setIpCameraUrl] = useState<string>("");
  const [youtubeInput, setYoutubeInput] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>(() => {
    return state.camera?.roomCode || "ggm-cam";
  });

  const cameraState = state.camera;

  const refreshDevices = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    try {
      // Trigger temporary stream to request permission so labels appear
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setPermissionGranted(true);
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices
        .filter((d) => d.kind === "videoinput")
        .map((d, index) => {
          const label = d.label || `Camera ${index + 1}`;
          const isManyCam = label.toLowerCase().includes("manycam");
          const isNdi =
            isManyCam ||
            label.toLowerCase().includes("ndi") ||
            label.toLowerCase().includes("obs") ||
            label.toLowerCase().includes("vmix") ||
            label.toLowerCase().includes("iriun") ||
            label.toLowerCase().includes("droidcam") ||
            label.toLowerCase().includes("virtual");

          return {
            deviceId: d.deviceId,
            label,
            isNdiOrVirtual: isNdi,
            isManyCam,
          };
        });

      setDevices(videoInputs);
      if (videoInputs.length > 0 && !cameraState.deviceId) {
        // Prioritize physical camera (e.g. HP HD Camera) first over virtual loopbacks
        const preferred = videoInputs.find((d) => !d.isNdiOrVirtual) || videoInputs[0];
        onChange((prev) => ({
          ...prev,
          camera: {
            ...prev.camera,
            deviceId: preferred.deviceId,
            enabled: true,
          },
        }));
      }
    } catch (err) {
      console.warn("Could not enumerate camera devices:", err);
    }
  };

  useEffect(() => {
    void refreshDevices();
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    onChange((prev) => ({
      ...prev,
      previewType: "camera",
      camera: {
        ...prev.camera,
        deviceId,
        streamType: "webcam",
        enabled: true,
      },
    }));
  };

  const handleApplyIpCamera = () => {
    if (!ipCameraUrl.trim()) return;
    onChange((prev) => ({
      ...prev,
      previewType: "camera",
      camera: {
        ...prev.camera,
        streamType: "webcam",
        enabled: true,
      },
    }));
  };

  const handleApplyYoutube = () => {
    let cleanId = youtubeInput.trim();
    if (cleanId.includes("youtube.com/watch?v=")) {
      cleanId = cleanId.split("v=")[1]?.split("&")[0] || cleanId;
    } else if (cleanId.includes("youtu.be/")) {
      cleanId = cleanId.split("youtu.be/")[1]?.split("?")[0] || cleanId;
    }

    onChange((prev) => ({
      ...prev,
      previewType: "camera",
      camera: {
        ...prev.camera,
        streamType: "youtube",
        youtubeId: cleanId,
        enabled: true,
      },
    }));
  };

  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const [networkHost, setNetworkHost] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // If on localhost, default to LAN IP if detectable or current host
      return window.location.host;
    }
    return "localhost:3000";
  });

  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const effectiveProtocol = networkHost.includes("vercel.app") ? "https:" : protocol;
  const phoneCamUrl = `${effectiveProtocol}//${networkHost}/studio/cam?room=${roomCode}`;

  return (
    <div className="space-y-4 text-white">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 rounded-xl border border-white/5">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Video className="w-4 h-4 text-amber-400" />
            Live Camera, NDI & Wireless Phone Ingestion
          </h4>
          <p className="text-[11px] text-zinc-400">
            Ingest local webcams, HDMI capture cards, NDI inputs, or connect mobile phones over Wi-Fi.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDevices}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Scan Devices
        </button>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              previewType: "camera",
              camera: { ...prev.camera, streamType: "webcam", enabled: true },
            }))
          }
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            cameraState.streamType === "webcam"
              ? "border-amber-400 bg-amber-400/10 text-amber-300"
              : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-xs font-bold">USB / NDI / HDMI Capture</span>
          <span className="text-[10px] text-zinc-400">Connected physical devices</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowQrModal(true);
            onChange((prev) => ({
              ...prev,
              previewType: "camera",
              camera: { ...prev.camera, streamType: "phone", roomCode, enabled: true },
            }));
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            cameraState.streamType === "phone"
              ? "border-amber-400 bg-amber-400/10 text-amber-300"
              : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-xs font-bold">Wi-Fi Phone Camera</span>
          <span className="text-[10px] text-zinc-400">Scan QR code on iPhone/Android</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              previewType: "camera",
              camera: { ...prev.camera, streamType: "youtube", enabled: true },
            }))
          }
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            cameraState.streamType === "youtube"
              ? "border-amber-400 bg-amber-400/10 text-amber-300"
              : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
          }`}
        >
          <Tv className="w-4 h-4" />
          <span className="text-xs font-bold">YouTube / Stream Monitor</span>
          <span className="text-[10px] text-zinc-400">Online church stream feed</span>
        </button>
      </div>

      {/* Mode 1: USB / NDI / Virtual Device Selector */}
      {cameraState.streamType === "webcam" && (
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/10 space-y-3">
          <label className="block text-xs font-semibold text-zinc-300">
            Select Detected Video Input Device:
          </label>
          {devices.length === 0 ? (
            <div className="p-3 bg-black/40 rounded-lg text-xs text-zinc-400 border border-white/5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                No camera devices detected or browser permission pending. Click &quot;Scan Devices&quot; above
                to grant camera access.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => {
                const isSelected = cameraState.deviceId === device.deviceId && cameraState.streamType === "webcam";
                return (
                  <button
                    key={device.deviceId}
                    type="button"
                    onClick={() => handleDeviceSelect(device.deviceId)}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/50"
                        : "bg-zinc-900/90 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-amber-400 text-black font-bold" : "bg-black/50 text-zinc-400"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{device.label}</span>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black uppercase tracking-wider flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> STAGED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {device.isManyCam
                            ? "Previews live output set in your ManyCam Windows desktop app"
                            : device.isNdiOrVirtual
                            ? "Software / NDI virtual camera input source"
                            : "Direct physical webcam hardware capture"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {device.isManyCam ? (
                        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold uppercase tracking-wider">
                          ManyCam App Feed
                        </span>
                      ) : device.isNdiOrVirtual ? (
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold uppercase tracking-wider">
                          NDI / Virtual
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wider">
                          Physical Webcam
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Wi-Fi Phone Camera Pairing QR Code */}
      {(cameraState.streamType === "phone" || showQrModal) && (
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-amber-400/30 space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* QR Code Container */}
            <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center flex-shrink-0 shadow-lg">
              {/* SVG QR Code representation using Google Charts API or inline render */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  phoneCamUrl
                )}`}
                alt="Scan to pair mobile phone camera"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> Wireless Phone Camera Transmitter
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Scan this QR code with any smartphone camera connected to the church Wi-Fi. The phone
                will instantly open the transmitter page and stream high-definition video into this switcher!
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-black text-zinc-300 font-mono border border-white/10">
                  Room: {roomCode}
                </span>
                <a
                  href={phoneCamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-400 hover:underline font-bold"
                >
                  Open Phone Cam Link Manually &rarr;
                </a>
              </div>

              {/* Wi-Fi LAN IP Helper for Local Testing */}
              {isLocalhost && (
                <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-amber-400/20 text-[11px] space-y-1.5">
                  <span className="text-amber-400 font-bold block">
                    📱 Mobile Phone Wi-Fi Pairing IP:
                  </span>
                  <p className="text-zinc-400 text-[10px] leading-tight">
                    Smartphones cannot reach &ldquo;localhost&rdquo;. Select your PC&apos;s Wi-Fi network IP so the QR code points to your computer:
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNetworkHost("192.168.1.66:3000")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        networkHost.startsWith("192.168")
                          ? "bg-amber-400 text-black border-amber-400 font-bold"
                          : "bg-zinc-800 text-zinc-300 border-white/10 hover:border-amber-400"
                      }`}
                    >
                      192.168.1.66:3000 (Wi-Fi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetworkHost("ggmasaba.vercel.app")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        networkHost.includes("vercel.app")
                          ? "bg-amber-400 text-black border-amber-400 font-bold"
                          : "bg-zinc-800 text-zinc-300 border-white/10 hover:border-amber-400"
                      }`}
                    >
                      ggmasaba.vercel.app (Cloud)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetworkHost(typeof window !== "undefined" ? window.location.host : "localhost:3000")}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        networkHost === (typeof window !== "undefined" ? window.location.host : "localhost:3000")
                          ? "bg-zinc-700 text-white border-white/20"
                          : "bg-zinc-800 text-zinc-300 border-white/10"
                      }`}
                    >
                      localhost:3000
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-zinc-500">Target IP:</span>
                    <input
                      type="text"
                      value={networkHost}
                      onChange={(e) => setNetworkHost(e.target.value.trim())}
                      placeholder="e.g. 192.168.1.66:3000"
                      className="px-2 py-0.5 bg-black border border-white/10 rounded text-[10px] text-white font-mono flex-1 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: YouTube Stream Monitor */}
      {cameraState.streamType === "youtube" && (
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/10 space-y-3">
          <label className="block text-xs font-semibold text-zinc-300">
            YouTube Live Stream URL or Video ID:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or video ID..."
              className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleApplyYoutube}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors"
            >
              Monitor Stream
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
