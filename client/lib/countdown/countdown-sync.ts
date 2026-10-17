import type { ChurchCountdownState } from "./countdown-types";

export const COUNTDOWN_STORAGE_KEY = "ggm_church_countdown_v1";
export const COUNTDOWN_SYNC_CHANNEL = "ggm_church_countdown_sync";

export interface CountdownSyncPayload {
  type: "SYNC_STATE" | "PING" | "PONG";
  state: ChurchCountdownState;
  remainingSeconds: number;
  isRunning: boolean;
  timestamp: number;
}

/**
 * Broadcast an updated countdown state to all open windows/tabs (e.g. /countdown/live).
 */
export function broadcastCountdownState(
  channel: BroadcastChannel | null,
  payload: Omit<CountdownSyncPayload, "timestamp">
): void {
  if (typeof window === "undefined") return;

  const fullPayload: CountdownSyncPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  // 1. Post via BroadcastChannel
  try {
    if (channel) {
      channel.postMessage(fullPayload);
    }
  } catch {
    // Ignore BroadcastChannel errors
  }

  // 2. Persist to localStorage for cross-window & offline recovery
  try {
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(fullPayload.state));
  } catch {
    // Ignore localStorage quota errors
  }
}
