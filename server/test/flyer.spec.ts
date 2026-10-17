import { describe, it, expect } from "vitest";
import {
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
  DEFAULT_PRESETS,
  type FlyerAspectRatio,
  type FlyerTemplateId,
} from "../../client/lib/flyer/flyer-types.js";

describe("Church Flyer Generator Engine", () => {
  it("provides valid dimension definitions for all 3 aspect ratios", () => {
    const ratios: FlyerAspectRatio[] = ["square", "story", "landscape"];

    ratios.forEach((ratio) => {
      const dim = FLYER_DIMENSIONS[ratio];
      expect(dim).toBeDefined();
      expect(dim.width).toBeGreaterThanOrEqual(1080);
      expect(dim.height).toBeGreaterThanOrEqual(1080);
      expect(dim.label).toBeTruthy();
    });

    expect(FLYER_DIMENSIONS.square).toEqual({
      width: 1080,
      height: 1080,
      label: "Square (1:1)",
      sublabel: "Instagram Feed · Facebook Post · WhatsApp",
    });

    expect(FLYER_DIMENSIONS.story).toEqual({
      width: 1080,
      height: 1920,
      label: "Story / Status (9:16)",
      sublabel: "WhatsApp Status · Instagram Story · Mobile",
    });

    expect(FLYER_DIMENSIONS.landscape).toEqual({
      width: 1920,
      height: 1080,
      label: "Screen / Banner (16:9)",
      sublabel: "Projector Screen · Sanctuary TV · YouTube",
    });
  });

  it("contains all 5 handcrafted graphic templates with complete design tokens", () => {
    const templateIds: FlyerTemplateId[] = [
      "royal-gold",
      "midnight-glory",
      "pentecost-fire",
      "emerald-grace",
      "holy-minimal",
    ];

    expect(Object.keys(FLYER_TEMPLATES)).toHaveLength(5);

    templateIds.forEach((id) => {
      const t = FLYER_TEMPLATES[id];
      expect(t).toBeDefined();
      expect(t.name).toBeTruthy();
      expect(t.bgDark.startsWith("#")).toBe(true);
      expect(t.primaryAccent.startsWith("#")).toBe(true);
      expect(t.secondaryAccent.startsWith("#")).toBe(true);
      expect(t.accentGlow).toBeTruthy();
      expect(t.borderColor).toBeTruthy();
      expect(t.patternType).toBeTruthy();
    });
  });

  it("contains pre-populated church presets with ready-to-use content", () => {
    expect(DEFAULT_PRESETS.length).toBeGreaterThanOrEqual(5);

    const sundayPreset = DEFAULT_PRESETS.find((p) => p.id === "sunday-service");
    expect(sundayPreset).toBeDefined();
    expect(sundayPreset?.data.title).toContain("SUPERNATURAL");
    expect(sundayPreset?.data.churchName).toBe("GRACE OF GOD MISSION ASABA");
    expect(sundayPreset?.data.venue).toContain("Asaba");

    const devotionPreset = DEFAULT_PRESETS.find((p) => p.id === "daily-devotion");
    expect(devotionPreset).toBeDefined();
    expect(devotionPreset?.data.category).toBe("DAILY GRACE DEVOTIONAL");
    expect(devotionPreset?.data.templateId).toBe("emerald-grace");

    const vigilPreset = DEFAULT_PRESETS.find((p) => p.id === "miracle-vigil");
    expect(vigilPreset).toBeDefined();
    expect(vigilPreset?.data.templateId).toBe("pentecost-fire");
    expect(vigilPreset?.data.aspectRatio).toBe("story");
  });
});
