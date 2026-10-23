import {
  type BroadcastStudioState,
  DEFAULT_STUDIO_STATE,
} from "@ggm/types";

export const COUNTDOWN_STORAGE_KEY = "ggm_church_countdown_state_v1";
export const COUNTDOWN_RUNNING_KEY = "ggm_church_countdown_running_v1";
export const COUNTDOWN_SECS_KEY = "ggm_church_countdown_seconds_v1";
export const COUNTDOWN_ZEROED_KEY = "ggm_church_countdown_zeroed_v1";

export const STUDIO_STORAGE_KEY = "ggm_broadcast_studio_state_v1";
export const STUDIO_SYNC_CHANNEL = "ggm_broadcast_studio_sync";

export interface StudioSyncPayload {
  type: "SYNC_STUDIO" | "TRIGGER_SOUND" | "CUT" | "FADE" | "BLACKOUT" | "PING" | "PONG";
  state: BroadcastStudioState;
  sound?: "chime" | "bell" | "tick" | "warning";
  timestamp: number;
}

/**
 * Broadcast an updated studio state across all open windows/tabs (e.g. /studio/live, /countdown/live, OBS browser sources)
 * and persist runtime execution state to localStorage so refreshes never lose state.
 */
export function broadcastStudioState(
  channel: BroadcastChannel | null,
  payload: Omit<StudioSyncPayload, "timestamp">
): void {
  if (typeof window === "undefined") return;

  const fullPayload: StudioSyncPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  // 1. Post via BroadcastChannel (0ms local window sync)
  try {
    if (channel) {
      channel.postMessage(fullPayload);
    }
  } catch {
    // Ignore BroadcastChannel errors in restrictive contexts
  }

  // 2. Persist to localStorage for cross-window & offline recovery
  try {
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(fullPayload.state));

    // Also mirror to legacy countdown keys for 100% backward compatibility
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(fullPayload.state));
    localStorage.setItem(COUNTDOWN_RUNNING_KEY, JSON.stringify(fullPayload.state.isRunning));

    const isDurationBased =
      fullPayload.state.mode === "activity" || fullPayload.state.mode === "duration";
    if (isDurationBased) {
      localStorage.setItem(COUNTDOWN_SECS_KEY, JSON.stringify(fullPayload.state.remainingSeconds));
    } else {
      localStorage.removeItem(COUNTDOWN_SECS_KEY);
    }

    if (fullPayload.state.remainingSeconds === 0 && !fullPayload.state.isRunning) {
      localStorage.setItem(COUNTDOWN_ZEROED_KEY, "true");
    } else {
      localStorage.removeItem(COUNTDOWN_ZEROED_KEY);
    }
  } catch {
    // Ignore localStorage quota errors
  }
}

/**
 * Restore studio state from local storage with graceful fallbacks
 */
export function loadStudioStateFromStorage(): BroadcastStudioState {
  if (typeof window === "undefined") return DEFAULT_STUDIO_STATE;

  try {
    const isZeroed = localStorage.getItem(COUNTDOWN_ZEROED_KEY) === "true";
    let state: BroadcastStudioState | null = null;

    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...DEFAULT_STUDIO_STATE,
        ...parsed,
        scripture: {
          ...DEFAULT_STUDIO_STATE.scripture,
          ...(parsed.scripture || {}),
        },
        overlay: {
          ...DEFAULT_STUDIO_STATE.overlay,
          ...(parsed.overlay || {}),
        },
        camera: {
          ...DEFAULT_STUDIO_STATE.camera,
          ...(parsed.camera || {}),
        },
      };
    } else {
      // Fallback to legacy countdown storage if available
      const legacyRaw = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        state = {
          ...DEFAULT_STUDIO_STATE,
          ...legacyParsed,
        };
      }
    }

    if (state) {
      // If timer reached zero and was marked zeroed, preserve 0 and stopped state
      if (isZeroed || state.remainingSeconds === 0) {
        state.remainingSeconds = 0;
        state.isRunning = false;
        state.targetEndTime = null;
      } else if (
        (state.mode === "activity" || state.mode === "duration") &&
        state.isRunning &&
        state.targetEndTime
      ) {
        const calculated = Math.round((state.targetEndTime - Date.now()) / 1000);
        if (!state.overtimeEnabled && calculated <= 0) {
          state.remainingSeconds = 0;
          state.isRunning = false;
          state.targetEndTime = null;
        } else {
          state.remainingSeconds = calculated;
        }
      }
      return state;
    }
  } catch {}

  return DEFAULT_STUDIO_STATE;
}
