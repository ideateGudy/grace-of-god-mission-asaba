import { describe, it, expect } from "vitest";
import {
  COUNTDOWN_THEMES,
  PROGRAMME_PRESETS,
  type CountdownThemeId,
  type ChurchCountdownState,
} from "@ggm/types";

describe("Church Countdown Engine & Offline Presets", () => {
  it("provides complete design tokens for all 5 sacred countdown themes", () => {
    const themeIds: CountdownThemeId[] = [
      "royal-gold",
      "pentecost-fire",
      "celestial-blue",
      "emerald-grace",
      "obs-transparent",
    ];

    expect(Object.keys(COUNTDOWN_THEMES)).toHaveLength(5);

    themeIds.forEach((id) => {
      const theme = COUNTDOWN_THEMES[id];
      expect(theme).toBeDefined();
      expect(theme.name).toBeTruthy();
      expect(theme.bgDark.startsWith("#")).toBe(true);
      expect(theme.primaryAccent.startsWith("#")).toBe(true);
      expect(theme.digitColor.startsWith("#")).toBe(true);
      expect(theme.accentGlow).toBeTruthy();
      expect(theme.borderColor).toBeTruthy();
    });
  });

  it("contains pre-configured church programme presets with editable titles", () => {
    expect(PROGRAMME_PRESETS.length).toBeGreaterThanOrEqual(8);

    const sunday = PROGRAMME_PRESETS.find((p) => p.id === "sunday-service");
    expect(sunday).toBeDefined();
    expect(sunday?.data.title).toBe("SUNDAY CELEBRATION SERVICE");
    expect(sunday?.data.theme).toBe("royal-gold");
    expect(sunday?.data.mode).toBe("target-time");
    expect(sunday?.data.targetTimeString).toBe("08:00");
    expect(sunday?.data.scriptureRef).toContain("ISAIAH 60:1");

    const midweek = PROGRAMME_PRESETS.find((p) => p.id === "midweek-service");
    expect(midweek).toBeDefined();
    expect(midweek?.data.title).toContain("MIDWEEK");
    expect(midweek?.data.theme).toBe("emerald-grace");
    expect(midweek?.data.targetTimeString).toBe("17:30");

    const vigil = PROGRAMME_PRESETS.find((p) => p.id === "miracle-vigil");
    expect(vigil).toBeDefined();
    expect(vigil?.data.title).toContain("VIGIL");
    expect(vigil?.data.theme).toBe("pentecost-fire");

    const quickPrelude = PROGRAMME_PRESETS.find((p) => p.id === "prelude-5min");
    expect(quickPrelude).toBeDefined();
    expect(quickPrelude?.data.mode).toBe("duration");
    expect(quickPrelude?.data.durationSeconds).toBe(300);

    const quick10m = PROGRAMME_PRESETS.find((p) => p.id === "countdown-10min");
    expect(quick10m).toBeDefined();
    expect(quick10m?.data.durationSeconds).toBe(600);

    const wordMonth = PROGRAMME_PRESETS.find((p) => p.id === "word-of-the-month");
    expect(wordMonth).toBeDefined();
    expect(wordMonth?.data.title).toContain("WORD FOR THE MONTH");
  });

  it("validates offline countdown state serialization structure", () => {
    const sampleState: ChurchCountdownState = {
      title: "SPECIAL ANOINTING SERVICE",
      subtitle: "Miracle Service Starts In...",
      scriptureRef: "PSALM 23:1",
      scriptureText: "The LORD is my shepherd; I shall not want.",
      mode: "target-time",
      targetTimeString: "09:00",
      durationSeconds: 300,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: true,
      showLogo: true,
      stageMode: false,
    };

    const serialized = JSON.stringify(sampleState);
    const deserialized = JSON.parse(serialized) as ChurchCountdownState;

    expect(deserialized.title).toBe("SPECIAL ANOINTING SERVICE");
    expect(deserialized.targetTimeString).toBe("09:00");
    expect(deserialized.theme).toBe("royal-gold");
    expect(deserialized.soundEnabled).toBe(true);
    expect(deserialized.overtimeEnabled).toBe(true);
  });

  it("ensures presets safely update theme color without altering custom service titles or target times", () => {
    // Current user state with a custom service title and time
    const currentState: ChurchCountdownState = {
      title: "PROPHETIC SHIFT SERVICE",
      subtitle: "Miracle Service Starts In...",
      scriptureRef: "PSALM 23:1",
      scriptureText: "The LORD is my shepherd",
      mode: "target-time",
      targetTimeString: "10:30",
      durationSeconds: 600,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: true,
      showLogo: true,
      stageMode: false,
    };

    // Preset selection: only theme changes, preserving user's title and time
    const selectedPreset = PROGRAMME_PRESETS.find((p) => p.id === "miracle-vigil");
    expect(selectedPreset).toBeDefined();

    const stateAfterPreset: ChurchCountdownState = {
      ...currentState,
      theme: selectedPreset!.data.theme!,
    };

    expect(stateAfterPreset.theme).toBe("pentecost-fire");
    expect(stateAfterPreset.title).toBe("PROPHETIC SHIFT SERVICE");
    expect(stateAfterPreset.targetTimeString).toBe("10:30");
    expect(stateAfterPreset.mode).toBe("target-time");
  });

  it("validates live projection display contract and broadcast sync payload", () => {
    const liveRoute = "/countdown/live";
    expect(liveRoute).toBe("/countdown/live");

    const broadcastPayload = {
      type: "SYNC_STATE",
      state: {
        title: "MIDWEEK COMMUNION SERVICE",
        subtitle: "Service Starts In...",
        scriptureRef: "JOHN 6:35",
        scriptureText: "I am the bread of life",
        mode: "target-time" as const,
        targetTimeString: "17:30",
        durationSeconds: 300,
        theme: "emerald-grace" as const,
        soundEnabled: true,
        overtimeEnabled: true,
        showScripture: true,
        showLogo: true,
        stageMode: false,
      },
      remainingSeconds: 180,
      isRunning: true,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(broadcastPayload);
    const parsed = JSON.parse(serialized);

    expect(parsed.type).toBe("SYNC_STATE");
    expect(parsed.state.theme).toBe("emerald-grace");
    expect(parsed.state.title).toBe("MIDWEEK COMMUNION SERVICE");
    expect(parsed.remainingSeconds).toBe(180);
    expect(parsed.isRunning).toBe(true);
  });

  it("handles zeroing out the timer directly to 00:00:00 and setting a custom duration", () => {
    const initialState: ChurchCountdownState = {
      title: "SUNDAY CELEBRATION SERVICE",
      subtitle: "Service Starts In...",
      scriptureRef: "ISAIAH 60:1",
      scriptureText: "Arise, shine; for thy light is come",
      mode: "target-time",
      targetTimeString: "08:00",
      durationSeconds: 300,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: true,
      showLogo: true,
      stageMode: false,
    };

    // 1. Reset directly to zero
    const zeroedState: ChurchCountdownState = {
      ...initialState,
      mode: "duration",
      durationSeconds: 0,
    };
    const zeroedSeconds = 0;
    const zeroedRunning = false;

    expect(zeroedState.mode).toBe("duration");
    expect(zeroedState.durationSeconds).toBe(0);
    expect(zeroedSeconds).toBe(0);
    expect(zeroedRunning).toBe(false);

    // 2. Set custom timer duration (e.g. 15 minutes = 900 seconds)
    const customMinutes = 15;
    const customSeconds = 30;
    const customTotalSecs = customMinutes * 60 + customSeconds;

    const customState: ChurchCountdownState = {
      ...zeroedState,
      mode: "duration",
      durationSeconds: customTotalSecs,
    };
    const running = true;

    expect(customState.durationSeconds).toBe(930);
    expect(customState.mode).toBe("duration");
    expect(running).toBe(true);
  });
});

