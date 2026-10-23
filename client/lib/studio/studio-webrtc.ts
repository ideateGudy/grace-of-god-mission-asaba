import { api } from "@/lib/api/client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:openrelay.metered.ca:80" },
];

/**
 * Sender (Broadcaster on Phone):
 * Creates RTCPeerConnection, adds local stream track, creates offer or responds to receiver answer.
 * Uses real-time SSE event stream for instant signal delivery + fallback polling.
 */
export class WebRtcBroadcaster {
  private pc: RTCPeerConnection | null = null;
  private roomCode: string;
  private senderId: string;
  private pollInterval: NodeJS.Timeout | null = null;
  private sseSource: EventSource | null = null;
  private lastSignalTimestamp = 0;
  private stream: MediaStream | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  public onStateChange?: (state: RTCIceConnectionState | "disconnected" | "connected") => void;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.senderId = `broadcaster_${Math.random().toString(36).substring(2, 9)}`;
  }

  public async start(stream: MediaStream) {
    this.stop();
    this.stream = stream;
    this.pendingCandidates = [];

    this.pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    });

    this.pc.oniceconnectionstatechange = () => {
      this.onStateChange?.(this.pc?.iceConnectionState || "disconnected");
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        api.studio.sendSignal(this.roomCode, {
          type: "ice-candidate",
          sender: this.senderId,
          data: event.candidate,
        }).catch(() => {});
      }
    };

    stream.getTracks().forEach((track) => {
      if (this.pc) {
        this.pc.addTrack(track, stream);
      }
    });

    // Handle Incoming Signal
    const handleIncomingSignal = async (sig: any) => {
      if (!sig || sig.sender === this.senderId) return;
      if (sig.timestamp && sig.timestamp > this.lastSignalTimestamp) {
        this.lastSignalTimestamp = sig.timestamp;
      }

      if (sig.type === "answer" && this.pc && this.pc.signalingState === "have-local-offer") {
        await this.pc.setRemoteDescription(new RTCSessionDescription(sig.data));
        // Flush any buffered ICE candidates
        while (this.pendingCandidates.length > 0) {
          const cand = this.pendingCandidates.shift();
          if (cand) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
          }
        }
      } else if (sig.type === "ice-candidate" && this.pc) {
        if (this.pc.remoteDescription) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(sig.data));
          } catch {}
        } else {
          this.pendingCandidates.push(sig.data);
        }
      } else if (sig.type === "request-offer" && this.pc) {
        const freshOffer = await this.pc.createOffer({
          offerToReceiveVideo: false,
          offerToReceiveAudio: false,
        });
        await this.pc.setLocalDescription(freshOffer);
        await api.studio.sendSignal(this.roomCode, {
          type: "offer",
          sender: this.senderId,
          data: freshOffer,
        }).catch(() => {});
      }
    };

    // 1. Instant Real-time Server-Sent Events (SSE) Signaling
    try {
      if (typeof window !== "undefined" && typeof EventSource !== "undefined") {
        const sse = new EventSource(`/api/v1/studio/stream/${encodeURIComponent(this.roomCode)}`);
        sse.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "signal") {
              void handleIncomingSignal(parsed);
            }
          } catch {}
        };
        this.sseSource = sse;
      }
    } catch {}

    // 2. Initial Offer Broadcast
    const offer = await this.pc.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false,
    });
    await this.pc.setLocalDescription(offer);

    await api.studio.sendSignal(this.roomCode, {
      type: "offer",
      sender: this.senderId,
      data: offer,
    }).catch(() => {});

    // 3. Fast Poll backup (1000ms) to ensure handshake never gets dropped
    this.pollInterval = setInterval(async () => {
      try {
        const res = await api.studio.getSignals(this.roomCode, this.lastSignalTimestamp);
        const signals = res?.data || [];
        for (const sig of signals) {
          await handleIncomingSignal(sig);
        }
      } catch {}
    }, 1000);
  }

  /**
   * Seamlessly replace the video track in-place when flipping between front and back cameras,
   * avoiding WebRTC renegotiation, teardown, or screen flashes.
   */
  public async replaceStream(newStream: MediaStream) {
    this.stream = newStream;
    const newVideoTrack = newStream.getVideoTracks()[0];
    if (!newVideoTrack || !this.pc) return;

    const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === "video");
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }
  }

  public stop() {
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.pendingCandidates = [];
    this.onStateChange?.("disconnected");
  }
}

/**
 * Receiver (Studio Monitor on PC & Live Sanctuary Output):
 * Listens for offer from phone, responds with answer, receives live low-latency remote MediaStream.
 */
export class WebRtcReceiver {
  private pc: RTCPeerConnection | null = null;
  private roomCode: string;
  private receiverId: string;
  private pollInterval: NodeJS.Timeout | null = null;
  private sseSource: EventSource | null = null;
  private lastSignalTimestamp = 0;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  public onRemoteStream?: (stream: MediaStream) => void;
  public onStateChange?: (state: RTCIceConnectionState | "disconnected" | "connected") => void;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.receiverId = `receiver_${Math.random().toString(36).substring(2, 9)}`;
  }

  public start() {
    this.stop();
    this.pendingCandidates = [];
    this.pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 4,
    });

    // Explicitly add video transceiver for fast track negotiation
    try {
      this.pc.addTransceiver("video", { direction: "recvonly" });
    } catch {}

    this.pc.oniceconnectionstatechange = () => {
      this.onStateChange?.(this.pc?.iceConnectionState || "disconnected");
    };

    this.pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream?.(event.streams[0]);
      } else if (event.track) {
        const stream = new MediaStream([event.track]);
        this.onRemoteStream?.(stream);
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        api.studio.sendSignal(this.roomCode, {
          type: "ice-candidate",
          sender: this.receiverId,
          data: event.candidate,
        }).catch(() => {});
      }
    };

    const handleIncomingSignal = async (sig: any) => {
      if (!sig || sig.sender === this.receiverId) return;
      if (sig.timestamp && sig.timestamp > this.lastSignalTimestamp) {
        this.lastSignalTimestamp = sig.timestamp;
      }

      if (sig.type === "offer" && this.pc) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(sig.data));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        await api.studio.sendSignal(this.roomCode, {
          type: "answer",
          sender: this.receiverId,
          data: answer,
        }).catch(() => {});

        // Flush any buffered candidates received before offer
        while (this.pendingCandidates.length > 0) {
          const cand = this.pendingCandidates.shift();
          if (cand) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {}
          }
        }
      } else if (sig.type === "ice-candidate" && this.pc) {
        if (this.pc.remoteDescription) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(sig.data));
          } catch {}
        } else {
          this.pendingCandidates.push(sig.data);
        }
      }
    };

    // 1. Instant Real-time SSE Connection
    try {
      if (typeof window !== "undefined" && typeof EventSource !== "undefined") {
        const sse = new EventSource(`/api/v1/studio/stream/${encodeURIComponent(this.roomCode)}`);
        sse.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "signal") {
              void handleIncomingSignal(parsed);
            }
          } catch {}
        };
        this.sseSource = sse;
      }
    } catch {}

    // 2. Prompt phone transmitter to send offer if it's already active
    api.studio.sendSignal(this.roomCode, {
      type: "request-offer",
      sender: this.receiverId,
      data: {},
    }).catch(() => {});

    // 3. Fast Poll backup (1000ms)
    this.pollInterval = setInterval(async () => {
      try {
        const res = await api.studio.getSignals(this.roomCode, this.lastSignalTimestamp);
        const signals = res?.data || [];
        for (const sig of signals) {
          await handleIncomingSignal(sig);
        }
      } catch {}
    }, 1000);
  }

  public stop() {
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.pendingCandidates = [];
    this.onStateChange?.("disconnected");
  }
}
