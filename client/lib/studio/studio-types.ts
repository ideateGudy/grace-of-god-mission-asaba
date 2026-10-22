import type {
  BroadcastStudioState,
  StudioInputType,
  BibleTranslation,
  StudioScriptureState,
  StudioMediaItem,
  StudioOverlayState,
  StudioCameraState,
  CountdownThemeId,
} from "@ggm/types";

export type {
  BroadcastStudioState,
  StudioInputType,
  BibleTranslation,
  StudioScriptureState,
  StudioMediaItem,
  StudioOverlayState,
  StudioCameraState,
  CountdownThemeId,
};

export type TallyState = "off" | "preview" | "program";

export interface SoundEffectTrigger {
  id: "chime" | "bell" | "tick" | "warning";
  timestamp: number;
}

export interface ObsWebsocketConfig {
  enabled: boolean;
  host: string; // e.g. "localhost:4455"
  password?: string;
  connected: boolean;
}

export interface CameraDeviceOption {
  deviceId: string;
  label: string;
  groupId?: string;
  isNdiOrVirtual?: boolean;
}
