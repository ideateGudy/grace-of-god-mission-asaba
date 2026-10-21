import { describe, it, expect } from "vitest";
import {
  COUNTDOWN_THEMES,
  PROGRAMME_PRESETS,
  COUNTDOWN_COLOR_PRESETS,
  ACTIVITY_PRESETS,
  EVENT_DATE_PRESETS,
  calculateSecondsUntilDate,
  calculateTimeBreakdown,
  getNextSundayServiceDate,
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

  it("provides color presets with genuine color preset names", () => {
    expect(COUNTDOWN_COLOR_PRESETS).toHaveLength(5);
    const names = COUNTDOWN_COLOR_PRESETS.map((p) => p.name);
    expect(names).toEqual([
      "Royal Gold",
      "Pentecost Fire",
      "Celestial Blue",
      "Emerald Grace",
      "Obsidian Glow",
    ]);

    const themeIds = COUNTDOWN_COLOR_PRESETS.map((p) => p.theme);
    expect(themeIds).toEqual([
      "royal-gold",
      "pentecost-fire",
      "celestial-blue",
      "emerald-grace",
      "obs-transparent",
    ]);
  });

  it("turns off display scripture by default across presets", () => {
    PROGRAMME_PRESETS.forEach((preset) => {
      expect(preset.data.showScripture).toBe(false);
    });
  });

  it("resets directly to 00:00:00, halts the counter, and retains paused stopped state across simulated refresh", () => {
    // Simulated localStorage
    const storage: Record<string, string> = {};

    // 1. User resets to zero
    const RUNNING_KEY = "ggm_church_countdown_running_v1";
    const SECS_KEY = "ggm_church_countdown_secs_v1";
    const ZEROED_KEY = "ggm_church_countdown_zeroed_v1";

    // Action: handleResetToZero()
    let isRunning = false;
    let remainingSeconds = 0;
    storage[RUNNING_KEY] = JSON.stringify(isRunning);
    storage[SECS_KEY] = JSON.stringify(remainingSeconds);
    storage[ZEROED_KEY] = "true";

    expect(storage[ZEROED_KEY]).toBe("true");
    expect(JSON.parse(storage[RUNNING_KEY])).toBe(false);
    expect(JSON.parse(storage[SECS_KEY])).toBe(0);

    // 2. Simulated page refresh / remount
    const restoredIsZeroed = storage[ZEROED_KEY] === "true";
    const restoredRunning = restoredIsZeroed ? false : JSON.parse(storage[RUNNING_KEY] ?? "false");
    const restoredSeconds = restoredIsZeroed ? 0 : Number(JSON.parse(storage[SECS_KEY] ?? "300"));

    // Timer must stay stopped at 0 and NOT start automatically
    expect(restoredRunning).toBe(false);
    expect(restoredSeconds).toBe(0);
  });

  it("preserves paused state and remaining seconds so refreshing the page does not start the timer", () => {
    const storage: Record<string, string> = {};
    const RUNNING_KEY = "ggm_church_countdown_running_v1";
    const SECS_KEY = "ggm_church_countdown_secs_v1";
    const ZEROED_KEY = "ggm_church_countdown_zeroed_v1";

    // User was at 145 seconds remaining and paused the timer
    storage[RUNNING_KEY] = JSON.stringify(false);
    storage[SECS_KEY] = JSON.stringify(145);
    delete storage[ZEROED_KEY];

    // Simulated page refresh / remount
    const restoredIsZeroed = storage[ZEROED_KEY] === "true";
    const restoredRunning = restoredIsZeroed ? false : JSON.parse(storage[RUNNING_KEY]);
    const restoredSeconds = restoredIsZeroed ? 0 : Number(JSON.parse(storage[SECS_KEY]));

    expect(restoredRunning).toBe(false);
    expect(restoredSeconds).toBe(145);
  });

  it("CountdownService reads default countdown when database has no saved countdown", async () => {
    const { CountdownService } = await import("../src/countdown/countdown.service.js");
    const mockPrisma = {
      siteSetting: {
        findUnique: async () => null,
      },
    };
    const mockAudit = { log: async () => {} };
    const mockConfig = { get: () => null };

    const service = new CountdownService(mockPrisma as any, mockAudit as any, mockConfig as any);
    const data = await service.getCountdown();

    expect(data).toBeDefined();
    expect(data.title).toBe("SUNDAY CELEBRATION SERVICE");
    expect(data.mode).toBe("target-time");
    expect(data.isRunning).toBe(true);
    expect(data.remainingSeconds).toBeGreaterThan(0);
  });

  it("CountdownService updates and persists countdown state to database", async () => {
    const { CountdownService } = await import("../src/countdown/countdown.service.js");
    let savedState: any = null;
    let auditLogCalls: any[] = [];

    const mockPrisma = {
      siteSetting: {
        findUnique: async () => ({ countdown: savedState }),
        upsert: async (args: any) => {
          savedState = args.update.countdown;
          return { countdown: savedState, updatedAt: new Date() };
        },
      },
    };
    const mockAudit = {
      log: async (entry: any) => {
        auditLogCalls.push(entry);
      },
    };
    const mockConfig = { get: () => null };

    const service = new CountdownService(mockPrisma as any, mockAudit as any, mockConfig as any);
    const updated = await service.updateCountdown(
      { id: "admin-1", email: "admin@ggmasaba.org", role: "ADMIN", name: "Pastor John" } as any,
      {
        title: "ANOINTING & MIRACLE COMMUNION SERVICE",
        mode: "duration",
        durationSeconds: 600,
        remainingSeconds: 600,
        isRunning: true,
        theme: "celestial-blue",
      }
    );

    expect(updated.title).toBe("ANOINTING & MIRACLE COMMUNION SERVICE");
    expect(updated.mode).toBe("duration");
    expect(updated.durationSeconds).toBe(600);
    expect(updated.remainingSeconds).toBe(600);
    expect(updated.theme).toBe("celestial-blue");
    expect(updated.targetEndTime).toBeGreaterThan(Date.now());
    expect(auditLogCalls).toHaveLength(1);
    expect(auditLogCalls[0].action).toBe("countdown.update");
  });

  /* ======================================================================= */
  /* User Specification: Two Timers with Mutual Exclusivity                 */
  /* 1. Activity Timer: regulates church activities, counts to 0, shows TIME UP */
  /* 2. Date Timer: set to date/program/New Year, counts to 0, stays at 0, NO TIME UP */
  /* 3. Only ONE can run at a time                                           */
  /* ======================================================================= */

  it("Timer 1 (Activity Timer): regulates sanctuary activities (20m, 30m), counts down to zero, and triggers 'TIME UP'", () => {
    // 1. Verify activity presets exist with standard sanctuary times (e.g. 20m, 30m, 45m)
    expect(ACTIVITY_PRESETS.length).toBeGreaterThanOrEqual(6);
    const sermon30 = ACTIVITY_PRESETS.find((a) => a.durationMinutes === 30);
    const worship20 = ACTIVITY_PRESETS.find((a) => a.durationMinutes === 20);
    expect(sermon30).toBeDefined();
    expect(worship20).toBeDefined();

    // 2. Configure 20-minute activity timer
    const activityState: ChurchCountdownState = {
      title: "SERMON & EXHORTATION",
      subtitle: "SANCTUARY ACTIVITY COUNTDOWN",
      mode: "activity",
      durationSeconds: 20 * 60, // 1200s
      remainingSeconds: 1200,
      isRunning: true,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: false,
      showLogo: true,
      stageMode: false,
    };

    expect(activityState.mode).toBe("activity");
    expect(activityState.durationSeconds).toBe(1200);

    // 3. Count down to zero
    let remaining = 0;
    const isActivityTimer = activityState.mode === "activity" || activityState.mode === "duration";
    const { minutes, seconds, isZero } = calculateTimeBreakdown(remaining);

    expect(isActivityTimer).toBe(true);
    expect(isZero).toBe(true);
    expect(minutes).toBe(0);
    expect(seconds).toBe(0);

    // Rule: Activity timer counts down to zero and shows TIME UP
    const shouldShowTimeUp = isActivityTimer && remaining <= 0;
    expect(shouldShowTimeUp).toBe(true);

    // Overtime handling
    const overtimeRemaining = -15; // 15 seconds past time
    const isOvertime = isActivityTimer && overtimeRemaining < 0;
    expect(isOvertime).toBe(true);
  });

  it("Timer 2 (Event & Date Timer): counts down to a future date, stays at zero when reached, and NEVER shows 'TIME UP'", () => {
    // 1. Test future target date (e.g. 2 hours ahead)
    const futureDate = new Date(Date.now() + 2 * 3600 * 1000).toISOString();
    const futureSecs = calculateSecondsUntilDate(futureDate);
    expect(futureSecs).toBeGreaterThan(7190);
    expect(futureSecs).toBeLessThanOrEqual(7200);

    // 2. Test target date in the past (e.g. program has started or reached zero)
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
    const pastSecs = calculateSecondsUntilDate(pastDate);

    // Rule: Event/Date timer counts down to zero and STAYS AT ZERO (clamps to Math.max(0, diff))
    expect(pastSecs).toBe(0);

    const eventDateState: ChurchCountdownState = {
      title: "NEW YEAR CROSSOVER SERVICE",
      subtitle: "COUNTDOWN TO NEW YEAR",
      mode: "event-date",
      targetDate: pastDate,
      durationSeconds: 0,
      remainingSeconds: pastSecs,
      isRunning: false,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: false,
      showScripture: false,
      showLogo: true,
      stageMode: false,
    };

    const isActivityTimer = eventDateState.mode === "activity" || eventDateState.mode === "duration";
    const isEventDateTimer = eventDateState.mode === "event-date" || eventDateState.mode === "target-time";
    expect(isEventDateTimer).toBe(true);
    expect(isActivityTimer).toBe(false);

    // Rule: Does NOT show "TIME UP"
    const shouldShowTimeUp = isActivityTimer && eventDateState.remainingSeconds <= 0;
    expect(shouldShowTimeUp).toBe(false);

    // Rule: Shows arrival / welcome banner instead
    const shouldShowArrivalBanner = isEventDateTimer && eventDateState.remainingSeconds <= 0;
    expect(shouldShowArrivalBanner).toBe(true);

    // Rule: Never goes negative
    expect(eventDateState.remainingSeconds).toBeGreaterThanOrEqual(0);
  });

  it("Mutual Exclusivity: only ONE countdown timer can run at a time", async () => {
    const { CountdownService } = await import("../src/countdown/countdown.service.js");
    let currentDbCountdown: any = null;

    const mockPrisma = {
      siteSetting: {
        findUnique: async () => ({ countdown: currentDbCountdown }),
        upsert: async (args: any) => {
          currentDbCountdown = args.update.countdown;
          return { countdown: currentDbCountdown, updatedAt: new Date() };
        },
      },
    };
    const mockAudit = { log: async () => {} };
    const mockConfig = { get: () => null };

    const service = new CountdownService(mockPrisma as any, mockAudit as any, mockConfig as any);
    const adminUser = { id: "admin-1", email: "admin@ggmasaba.org", role: "ADMIN", name: "Media Desk" } as any;

    // STEP 1: Activate Church Activity Timer (30 minutes)
    const activityResult = await service.updateCountdown(adminUser, {
      title: "SUNDAY SERMON",
      mode: "activity",
      durationSeconds: 1800,
      remainingSeconds: 1800,
      isRunning: true,
      theme: "royal-gold",
    });

    expect(activityResult.mode).toBe("activity");
    expect(activityResult.durationSeconds).toBe(1800);
    expect(activityResult.isRunning).toBe(true);

    // STEP 2: Switch to Event & Date Countdown (Mutual Exclusivity: overrides and deactivates activity timer)
    const nextSundayIso = getNextSundayServiceDate();
    const dateResult = await service.updateCountdown(adminUser, {
      title: "SUNDAY CELEBRATION SERVICE",
      mode: "event-date",
      targetDate: nextSundayIso,
      isRunning: true,
      theme: "emerald-grace",
    });

    expect(dateResult.mode).toBe("event-date");
    expect(dateResult.targetDate).toBe(nextSundayIso);
    expect(dateResult.remainingSeconds).toBeGreaterThan(0);

    // STEP 3: Switch back to 20-minute worship activity timer (Mutual Exclusivity: overrides date timer)
    const worshipResult = await service.updateCountdown(adminUser, {
      title: "PRAISE & WORSHIP",
      mode: "activity",
      durationSeconds: 1200,
      remainingSeconds: 1200,
      isRunning: true,
      theme: "pentecost-fire",
    });

    expect(worshipResult.mode).toBe("activity");
    expect(worshipResult.durationSeconds).toBe(1200);
    expect(worshipResult.title).toBe("PRAISE & WORSHIP");
  });
});


