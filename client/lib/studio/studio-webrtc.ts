import { api } from "@/lib/api/client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

/**
 * Sender (Broadcaster on Phone):
 * Creates RTCPeerConnection, adds local stream track, creates offer or responds to receiver answer.
 */
export class WebRtcBroadcaster {
  private pc: RTCPeerConnection | null = null;
  private roomCode: string;
  private senderId: string;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastSignalTimestamp = 0;
  private stream: MediaStream | null = null;
  public onStateChange?: (state: RTCIceConnectionState | "disconnected" | "connected") => void;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.senderId = `broadcaster_${Math.random().toString(36).substring(2, 9)}`;
  }

  public async start(stream: MediaStream) {
    this.stop();
    this.stream = stream;

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

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

    // Create SDP Offer
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

    // Listen for Answer and ICE candidates from Receiver (PC Studio)
    this.pollInterval = setInterval(async () => {
      try {
        const res = await api.studio.getSignals(this.roomCode, this.lastSignalTimestamp);
        const signals = res?.data || [];
        for (const sig of signals) {
          if (sig.timestamp > this.lastSignalTimestamp) {
            this.lastSignalTimestamp = sig.timestamp;
          }
          if (sig.sender === this.senderId) continue;

          if (sig.type === "answer" && this.pc && this.pc.signalingState === "have-local-offer") {
            await this.pc.setRemoteDescription(new RTCSessionDescription(sig.data));
          } else if (sig.type === "ice-candidate" && this.pc && this.pc.remoteDescription) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(sig.data));
            } catch {}
          } else if (sig.type === "request-offer" && this.pc) {
            // Re-broadcast offer if receiver just joined or reloaded
            const freshOffer = await this.pc.createOffer();
            await this.pc.setLocalDescription(freshOffer);
            await api.studio.sendSignal(this.roomCode, {
              type: "offer",
              sender: this.senderId,
              data: freshOffer,
            }).catch(() => {});
          }
        }
      } catch {}
    }, 400);
  }

  public stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.onStateChange?.("disconnected");
  }
}

/**
 * Receiver (Studio Monitor on PC):
 * Listens for offer from phone, responds with answer, receives live low-latency remote MediaStream.
 */
export class WebRtcReceiver {
  private pc: RTCPeerConnection | null = null;
  private roomCode: string;
  private receiverId: string;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastSignalTimestamp = 0;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onStateChange?: (state: RTCIceConnectionState | "disconnected" | "connected") => void;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.receiverId = `receiver_${Math.random().toString(36).substring(2, 9)}`;
  }

  public start() {
    this.stop();
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.pc.oniceconnectionstatechange = () => {
      this.onStateChange?.(this.pc?.iceConnectionState || "disconnected");
    };

    this.pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.onRemoteStream?.(event.streams[0]);
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

    // Prompt phone transmitter to send offer if it's already running
    api.studio.sendSignal(this.roomCode, {
      type: "request-offer",
      sender: this.receiverId,
      data: {},
    }).catch(() => {});

    this.pollInterval = setInterval(async () => {
      try {
        const res = await api.studio.getSignals(this.roomCode, this.lastSignalTimestamp);
        const signals = res?.data || [];
        for (const sig of signals) {
          if (sig.timestamp > this.lastSignalTimestamp) {
            this.lastSignalTimestamp = sig.timestamp;
          }
          if (sig.sender === this.receiverId) continue;

          if (sig.type === "offer" && this.pc) {
            await this.pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            const answer = await this.pc.createAnswer();
            await this.pc.setLocalDescription(answer);

            await api.studio.sendSignal(this.roomCode, {
              type: "answer",
              sender: this.receiverId,
              data: answer,
            }).catch(() => {});
          } else if (sig.type === "ice-candidate" && this.pc && this.pc.remoteDescription) {
            try {
              await this.pc.addIceCandidate(new RTCIceCandidate(sig.data));
            } catch {}
          }
        }
      } catch {}
    }, 400);
  }

  public stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.onStateChange?.("disconnected");
  }
}
