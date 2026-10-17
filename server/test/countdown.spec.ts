import { describe, it, expect } from "vitest";
import {
  COUNTDOWN_THEMES,
  PROGRAMME_PRESETS,
  type CountdownMode,
  type CountdownThemeId,
  type ChurchCountdownState,
} from "../../client/lib/countdown/countdown-types.js";

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
});
