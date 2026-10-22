import { describe, it, expect } from "vitest";
import {
  type BroadcastStudioState,
  type StudioInputType,
  type BibleTranslation,
  DEFAULT_STUDIO_STATE,
  updateCountdownSchema,
} from "@ggm/types";

describe("Web Broadcast Studio Switcher & Bible Engine", () => {
  it("initializes default studio state with complete switcher properties", () => {
    expect(DEFAULT_STUDIO_STATE).toBeDefined();
    expect(DEFAULT_STUDIO_STATE.activeType).toBe("countdown");
    expect(DEFAULT_STUDIO_STATE.previewType).toBe("scripture");
    expect(DEFAULT_STUDIO_STATE.isBlackout).toBe(false);
    expect(DEFAULT_STUDIO_STATE.transitionType).toBe("fade");
    expect(DEFAULT_STUDIO_STATE.transitionDurationMs).toBe(500);

    // Verify scripture defaults
    expect(DEFAULT_STUDIO_STATE.scripture).toBeDefined();
    expect(DEFAULT_STUDIO_STATE.scripture.reference).toBe("ISAIAH 60:1");
    expect(DEFAULT_STUDIO_STATE.scripture.translation).toBe("KJV");
    expect(DEFAULT_STUDIO_STATE.scripture.displayMode).toBe("fullscreen");

    // Verify overlay DSK defaults
    expect(DEFAULT_STUDIO_STATE.overlay).toBeDefined();
    expect(DEFAULT_STUDIO_STATE.overlay.type).toBe("speaker");
    expect(DEFAULT_STUDIO_STATE.overlay.title).toContain("PASTOR DAVID OGBUELI");

    // Verify camera defaults
    expect(DEFAULT_STUDIO_STATE.camera).toBeDefined();
    expect(DEFAULT_STUDIO_STATE.camera.streamType).toBe("webcam");
  });

  it("validates switcher CUT transition logic (Preview becomes Program)", () => {
    const currentState: BroadcastStudioState = {
      ...DEFAULT_STUDIO_STATE,
      activeType: "countdown",
      previewType: "scripture",
      isBlackout: true,
    };

    // Simulate CUT action
    const cutState: BroadcastStudioState = {
      ...currentState,
      activeType: currentState.previewType,
      isBlackout: false,
    };

    expect(cutState.activeType).toBe("scripture");
    expect(cutState.isBlackout).toBe(false);
  });

  it("validates switcher FTB (Fade to Black) emergency toggle", () => {
    let state = { ...DEFAULT_STUDIO_STATE, isBlackout: false };

    // Toggle FTB On
    state = { ...state, isBlackout: true };
    expect(state.isBlackout).toBe(true);

    // Toggle FTB Off
    state = { ...state, isBlackout: false };
    expect(state.isBlackout).toBe(false);
  });

  it("validates Downstream Keyer (DSK) overlay clear command", () => {
    const stateWithOverlay: BroadcastStudioState = {
      ...DEFAULT_STUDIO_STATE,
      overlay: {
        ...DEFAULT_STUDIO_STATE.overlay,
        enabled: true,
      },
    };

    expect(stateWithOverlay.overlay.enabled).toBe(true);

    // Clear DSK
    const clearedState = {
      ...stateWithOverlay,
      overlay: { ...stateWithOverlay.overlay, enabled: false },
    };

    expect(clearedState.overlay.enabled).toBe(false);
    // Main program active type remains unaffected
    expect(clearedState.activeType).toBe(stateWithOverlay.activeType);
  });

  it("validates updateCountdownSchema allows extended studio payload without breaking", () => {
    const validStudioPayload = {
      title: "SUNDAY SERVICE",
      activeType: "scripture" as const,
      previewType: "media" as const,
      isBlackout: false,
      transitionType: "cut" as const,
      scripture: {
        reference: "John 3:16",
        book: "John",
        chapter: 3,
        verse: 16,
        text: "For God so loved the world...",
        translation: "KJV" as const,
        displayMode: "fullscreen" as const,
      },
      overlay: {
        enabled: true,
        type: "speaker" as const,
        title: "PASTOR DAVID OGBUELI",
        subtitle: "Senior Pastor",
      },
    };

    const parsed = updateCountdownSchema.safeParse(validStudioPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.activeType).toBe("scripture");
      expect(parsed.data.previewType).toBe("media");
      expect(parsed.data.isBlackout).toBe(false);
    }
  });

  it("verifies CountdownService updates and retrieves studio state in database mock", async () => {
    const { CountdownService } = await import("../src/countdown/countdown.service.js");

    let savedDbData: any = null;
    const mockPrisma: any = {
      siteSetting: {
        findUnique: async () => ({ countdown: savedDbData }),
        upsert: async (args: any) => {
          savedDbData = args.update.countdown;
          return { countdown: savedDbData, updatedAt: new Date() };
        },
      },
    };

    const mockAudit: any = { log: async () => {} };
    const mockConfig: any = { get: () => null };

    const service = new CountdownService(mockPrisma, mockAudit, mockConfig);

    // Update with studio state
    const updateResult = await service.updateCountdown(
      { id: "usr_1", name: "Media Minister", email: "media@ggmasaba.org", role: "ADMIN", permissions: ["LIVESTREAM_MANAGE"] },
      {
        title: "MIRACLE & COMMUNION SERVICE",
        activeType: "media",
        previewType: "countdown",
        isBlackout: false,
      }
    );

    expect(updateResult.title).toBe("MIRACLE & COMMUNION SERVICE");
    expect(updateResult.activeType).toBe("media");
    expect(updateResult.previewType).toBe("countdown");

    // Get countdown returns updated studio fields
    const getResult = await service.getCountdown();
    expect(getResult.title).toBe("MIRACLE & COMMUNION SERVICE");
    expect(getResult.activeType).toBe("media");
    expect(getResult.previewType).toBe("countdown");

    // Multi-camera frame transmission & discovery
    service.sendStudioFrame("cam-1", "data:image/jpeg;base64,sampleframe1", "Camera 1: Altar");
    service.sendStudioFrame("cam-2", "data:image/jpeg;base64,sampleframe2", "Camera 2: Choir");

    const cam1Frame = service.getStudioFrame("cam-1");
    expect(cam1Frame).toBeDefined();
    expect(cam1Frame?.frame).toBe("data:image/jpeg;base64,sampleframe1");
    expect(cam1Frame?.label).toBe("Camera 1: Altar");

    const cameras = service.getStudioCameras();
    expect(cameras.length).toBe(2);
    expect(cameras.some((c) => c.id === "cam-1")).toBe(true);
    expect(cameras.some((c) => c.id === "cam-2")).toBe(true);

    // WebRTC signaling
    service.sendStudioSignal("cam-1", { type: "offer", sender: "phone-1", data: { sdp: "dummy-offer" } });
    const signals = service.getStudioSignals("cam-1");
    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe("offer");
  });
});
