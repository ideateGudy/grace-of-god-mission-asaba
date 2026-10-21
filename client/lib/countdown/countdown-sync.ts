import type { ChurchCountdownState } from "./countdown-types";

export const COUNTDOWN_STORAGE_KEY = "ggm_church_countdown_v1";
export const COUNTDOWN_RUNNING_KEY = "ggm_church_countdown_running_v1";
export const COUNTDOWN_SECS_KEY = "ggm_church_countdown_secs_v1";
export const COUNTDOWN_ZEROED_KEY = "ggm_church_countdown_zeroed_v1";
export const COUNTDOWN_SYNC_CHANNEL = "ggm_church_countdown_sync";

export interface CountdownSyncPayload {
  type: "SYNC_STATE" | "PING" | "PONG";
  state: ChurchCountdownState;
  remainingSeconds: number;
  isRunning: boolean;
  timestamp: number;
}

/**
 * Broadcast an updated countdown state to all open windows/tabs (e.g. /countdown/live)
 * and persist runtime execution state to localStorage so refresh never starts unexpectedly.
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
    localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(fullPayload.isRunning));
    const isDurationBased = fullPayload.state.mode === "activity" || fullPayload.state.mode === "duration";
    if (isDurationBased) {
      localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(fullPayload.remainingSeconds));
    } else {
      localStorage.removeItem(COUNTDOWN_SECS_KEY);
    }

    if (fullPayload.remainingSeconds === 0 && !fullPayload.isRunning) {
      localStorage.setItem(COUNTDOWN_ZEROED_KEY, "true");
    } else if (fullPayload.remainingSeconds > 0 || fullPayload.isRunning) {
      localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
    }
  } catch {
    // Ignore localStorage quota errors
  }
}
