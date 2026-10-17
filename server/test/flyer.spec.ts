import { describe, it, expect } from "vitest";
import {
  FLYER_TEMPLATES,
  FLYER_DIMENSIONS,
  DEFAULT_PRESETS,
  CURATED_ASSETS,
  type FlyerAspectRatio,
  type FlyerTemplateId,
  type FlyerImageLayer,
  type LayerBlendMode,
  type LayerMaskShape,
} from "@ggm/types";

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

  it("contains all 10 handcrafted graphic templates with complete design tokens", () => {
    const templateIds: FlyerTemplateId[] = [
      "royal-gold",
      "midnight-glory",
      "pentecost-fire",
      "emerald-grace",
      "holy-minimal",
      "prophetic-word",
      "covenant-glory",
      "prophetic-decree",
      "mountain-glory",
      "doxa-worship",
    ];

    expect(Object.keys(FLYER_TEMPLATES)).toHaveLength(10);

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

  it("contains pre-populated church presets with ready-to-use content including reference-inspired presets", () => {
    expect(DEFAULT_PRESETS.length).toBeGreaterThanOrEqual(10);

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

    const wordMonthPreset = DEFAULT_PRESETS.find((p) => p.id === "word-of-the-month");
    expect(wordMonthPreset).toBeDefined();
    expect(wordMonthPreset?.data.badgeText).toBe("WORD FOR THE MONTH");
    expect(wordMonthPreset?.data.templateId).toBe("prophetic-word");
    expect(wordMonthPreset?.data.category).toContain("PROPHETIC THEME");

    const exceedingPreset = DEFAULT_PRESETS.find((p) => p.id === "word-of-the-month-exceeding");
    expect(exceedingPreset).toBeDefined();
    expect(exceedingPreset?.data.templateId).toBe("covenant-glory");
    expect(exceedingPreset?.data.aspectRatio).toBe("story");

    // Reference-inspired presets
    const koinoniaPreset = DEFAULT_PRESETS.find((p) => p.id === "koinonia-encounter");
    expect(koinoniaPreset).toBeDefined();
    expect(koinoniaPreset?.data.templateId).toBe("prophetic-decree");
    expect(koinoniaPreset?.data.title).toContain("WONDERS OF HIS PRESENCE");
    expect(koinoniaPreset?.data.guestMinister).toContain("APOSTLE JOSHUA SELMAN");

    const divinePreset = DEFAULT_PRESETS.find((p) => p.id === "divine-encounter");
    expect(divinePreset).toBeDefined();
    expect(divinePreset?.data.templateId).toBe("mountain-glory");
    expect(divinePreset?.data.title).toContain("DIVINE ENCOUNTER");

    const doxaPreset = DEFAULT_PRESETS.find((p) => p.id === "doxa-worship-night");
    expect(doxaPreset).toBeDefined();
    expect(doxaPreset?.data.templateId).toBe("doxa-worship");
    expect(doxaPreset?.data.time).toContain("●");
  });

  it("provides curated graphic design assets with appropriate blend modes for instant flyer overlay", () => {
    expect(CURATED_ASSETS.length).toBeGreaterThanOrEqual(9);

    const flare = CURATED_ASSETS.find((a) => a.id === "asset-light-flare");
    expect(flare).toBeDefined();
    expect(flare?.defaultBlendMode).toBe("screen");
    expect(flare?.defaultMaskShape).toBe("feathered");
    expect(flare?.url).toContain("data:image/svg+xml");

    const dove = CURATED_ASSETS.find((a) => a.id === "asset-holy-dove");
    expect(dove).toBeDefined();
    expect(dove?.defaultBlendMode).toBe("screen");

    const spotlight = CURATED_ASSETS.find((a) => a.id === "asset-stage-spotlight");
    expect(spotlight).toBeDefined();
    expect(spotlight?.defaultBlendMode).toBe("screen");

    const mountain = CURATED_ASSETS.find((a) => a.id === "asset-mountain-peak");
    expect(mountain).toBeDefined();
    expect(mountain?.defaultBlendMode).toBe("screen");

    const hands = CURATED_ASSETS.find((a) => a.id === "asset-celestial-hands");
    expect(hands).toBeDefined();
    expect(hands?.defaultBlendMode).toBe("screen");

    const seal = CURATED_ASSETS.find((a) => a.id === "asset-revival-seal");
    expect(seal).toBeDefined();
    expect(seal?.defaultBlendMode).toBe("overlay");

    const ember = CURATED_ASSETS.find((a) => a.id === "asset-pentecost-fire");
    expect(ember).toBeDefined();
    expect(ember?.defaultBlendMode).toBe("color-dodge");

    const mist = CURATED_ASSETS.find((a) => a.id === "asset-sacred-mist");
    expect(mist).toBeDefined();
    expect(mist?.defaultBlendMode).toBe("screen");

    const stamp = CURATED_ASSETS.find((a) => a.id === "asset-church-stamp");
    expect(stamp).toBeDefined();
    expect(stamp?.defaultBlendMode).toBe("overlay");
  });

  it("validates full layer structure with blend modes and edge feathering masks", () => {
    const validBlendModes: LayerBlendMode[] = [
      "normal",
      "screen",
      "multiply",
      "overlay",
      "soft-light",
      "color-dodge",
      "lighten",
      "luminosity",
    ];

    const validMaskShapes: LayerMaskShape[] = [
      "rect",
      "circle",
      "rounded",
      "feathered",
    ];

    const sampleLayer: FlyerImageLayer = {
      id: "layer-test-1",
      name: "Pastor Portrait",
      url: "data:image/png;base64,sample",
      x: 100,
      y: 150,
      width: 400,
      height: 400,
      rotation: 0,
      opacity: 0.9,
      blendMode: "screen",
      maskShape: "feathered",
    };

    expect(validBlendModes).toContain(sampleLayer.blendMode);
    expect(validMaskShapes).toContain(sampleLayer.maskShape);
    expect(sampleLayer.opacity).toBeGreaterThan(0);
    expect(sampleLayer.opacity).toBeLessThanOrEqual(1);
  });
});
