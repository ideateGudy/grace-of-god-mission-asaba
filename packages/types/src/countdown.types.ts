export type CountdownMode = "target-time" | "duration";

export type CountdownThemeId =
  | "royal-gold"
  | "pentecost-fire"
  | "celestial-blue"
  | "emerald-grace"
  | "obs-transparent";

export interface CountdownTheme {
  id: CountdownThemeId;
  name: string;
  tagline: string;
  bgDark: string;
  bgGradient: string;
  primaryAccent: string;
  secondaryAccent: string;
  accentGlow: string;
  digitColor: string;
  labelColor: string;
  borderColor: string;
}

export const COUNTDOWN_THEMES: Record<CountdownThemeId, CountdownTheme> = {
  "royal-gold": {
    id: "royal-gold",
    name: "Royal Gold & Obsidian",
    tagline: "Sacred gold, majestic black, and warm sanctuary ambient glows",
    bgDark: "#060714",
    bgGradient: "radial-gradient(ellipse at 50% 20%, #171B38 0%, #0B0E20 45%, #05060E 100%)",
    primaryAccent: "#D9A441",
    secondaryAccent: "#F59E0B",
    accentGlow: "rgba(217, 164, 65, 0.45)",
    digitColor: "#FFFFFF",
    labelColor: "#D9A441",
    borderColor: "rgba(217, 164, 65, 0.3)",
  },
  "pentecost-fire": {
    id: "pentecost-fire",
    name: "Pentecost Fire & Ember",
    tagline: "High-impact spiritual fire, deep volcanic crimson, and amber flare",
    bgDark: "#100406",
    bgGradient: "radial-gradient(ellipse at 50% 20%, #2D0B10 0%, #1A0508 50%, #0A0203 100%)",
    primaryAccent: "#F97316",
    secondaryAccent: "#EF4444",
    accentGlow: "rgba(249, 115, 22, 0.45)",
    digitColor: "#FFFFFF",
    labelColor: "#FBA765",
    borderColor: "rgba(249, 115, 22, 0.35)",
  },
  "celestial-blue": {
    id: "celestial-blue",
    name: "Midnight Celestial Glory",
    tagline: "Deep space sapphire, cyan aurora glows, and electric energy",
    bgDark: "#050A1A",
    bgGradient: "radial-gradient(ellipse at 50% 20%, #102354 0%, #091330 50%, #030612 100%)",
    primaryAccent: "#38BDF8",
    secondaryAccent: "#818CF8",
    accentGlow: "rgba(56, 189, 248, 0.45)",
    digitColor: "#FFFFFF",
    labelColor: "#38BDF8",
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  "emerald-grace": {
    id: "emerald-grace",
    name: "Living Waters & Emerald",
    tagline: "Deep sanctuary forest green with luminous mint and gold",
    bgDark: "#02150E",
    bgGradient: "radial-gradient(ellipse at 50% 20%, #093322 0%, #041E14 50%, #010D09 100%)",
    primaryAccent: "#10B981",
    secondaryAccent: "#6EE7B7",
    accentGlow: "rgba(16, 185, 129, 0.45)",
    digitColor: "#FFFFFF",
    labelColor: "#6EE7B7",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  "obs-transparent": {
    id: "obs-transparent",
    name: "OBS / Stage Keying Mode",
    tagline: "Pure matte dark background for HDMI capture cards, video switchers, and overlays",
    bgDark: "#000000",
    bgGradient: "linear-gradient(180deg, #050505 0%, #000000 100%)",
    primaryAccent: "#D9A441",
    secondaryAccent: "#FFFFFF",
    accentGlow: "rgba(217, 164, 65, 0.3)",
    digitColor: "#FFFFFF",
    labelColor: "#E2E8F0",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
};

import { z } from "zod";

export const updateCountdownSchema = z.object({
  title: z.string().trim().max(300).optional(),
  subtitle: z.string().trim().max(300).optional(),
  scriptureRef: z.string().trim().max(200).optional(),
  scriptureText: z.string().trim().max(1000).optional(),
  mode: z.enum(["target-time", "duration"]).optional(),
  targetTimeString: z.string().trim().max(20).optional(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
  theme: z.enum(["royal-gold", "pentecost-fire", "celestial-blue", "emerald-grace", "obs-transparent"]).optional(),
  soundEnabled: z.boolean().optional(),
  overtimeEnabled: z.boolean().optional(),
  showScripture: z.boolean().optional(),
  showLogo: z.boolean().optional(),
  stageMode: z.boolean().optional(),
  isRunning: z.boolean().optional(),
  remainingSeconds: z.number().int().optional(),
  targetEndTime: z.number().nullable().optional(),
});

export type UpdateCountdownDto = z.infer<typeof updateCountdownSchema>;

export interface PublicCountdownDto extends ChurchCountdownState {
  isRunning: boolean;
  remainingSeconds: number;
  targetEndTime: number | null;
  updatedAt: string;
}

export interface ChurchCountdownState {
  title: string;
  subtitle: string;
  scriptureRef: string;
  scriptureText: string;
  mode: CountdownMode;
  targetTimeString: string; // "HH:MM" e.g. "08:00"
  durationSeconds: number; // For duration mode, initial duration in seconds
  theme: CountdownThemeId;
  soundEnabled: boolean;
  overtimeEnabled: boolean;
  showScripture: boolean;
  showLogo: boolean;
  stageMode: boolean; // Hide controls for sanctuary screen
}

export interface ProgrammePreset {
  id: string;
  name: string;
  category: string;
  iconName: string;
  data: Partial<ChurchCountdownState>;
}

export interface CountdownColorPreset {
  id: CountdownThemeId;
  name: string;
  theme: CountdownThemeId;
}

export const COUNTDOWN_COLOR_PRESETS: CountdownColorPreset[] = [
  { id: "royal-gold", name: "Royal Gold", theme: "royal-gold" },
  { id: "pentecost-fire", name: "Pentecost Fire", theme: "pentecost-fire" },
  { id: "celestial-blue", name: "Celestial Blue", theme: "celestial-blue" },
  { id: "emerald-grace", name: "Emerald Grace", theme: "emerald-grace" },
  { id: "obs-transparent", name: "Obsidian Glow", theme: "obs-transparent" },
];

export const PROGRAMME_PRESETS: ProgrammePreset[] = [
  {
    id: "sunday-service",
    name: "Sunday Celebration Service",
    category: "Main Service",
    iconName: "Church",
    data: {
      title: "SUNDAY CELEBRATION SERVICE",
      subtitle: "Service Starts In...",
      scriptureRef: "ISAIAH 60:1",
      scriptureText: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
      mode: "target-time",
      targetTimeString: "08:00",
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "midweek-service",
    name: "Midweek Communion Service",
    category: "Bible Study",
    iconName: "BookOpen",
    data: {
      title: "MIDWEEK COMMUNION SERVICE",
      subtitle: "Word & Communion Encounter Begins In...",
      scriptureRef: "JOHN 6:54",
      scriptureText: "Whoso eateth my flesh, and drinketh my blood, hath eternal life; and I will raise him up at the last day.",
      mode: "target-time",
      targetTimeString: "17:30",
      theme: "emerald-grace",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "miracle-vigil",
    name: "All-Night Miracle Vigil",
    category: "Power Night",
    iconName: "Flame",
    data: {
      title: "ALL-NIGHT MIRACLE VIGIL",
      subtitle: "Midnight Deliverance Encounter Begins In...",
      scriptureRef: "ACTS 16:25",
      scriptureText: "And at midnight Paul and Silas prayed, and sang praises unto God: and the prisoners heard them.",
      mode: "target-time",
      targetTimeString: "22:00",
      theme: "pentecost-fire",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "youth-awakening",
    name: "Kingdom Youth Awakening",
    category: "Youth Ministry",
    iconName: "Sparkles",
    data: {
      title: "KINGDOM YOUTH AWAKENING",
      subtitle: "Praise, Fire & Destiny Explosion Begins In...",
      scriptureRef: "1 TIMOTHY 4:12",
      scriptureText: "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",
      mode: "target-time",
      targetTimeString: "16:30",
      theme: "celestial-blue",
      soundEnabled: true,
      overtimeEnabled: true,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "prelude-5min",
    name: "5-Minute Service Prelude",
    category: "Quick Timer",
    iconName: "Clock",
    data: {
      title: "PREPARE TO WORSHIP",
      subtitle: "Please Take Your Seats · Reverence the Presence of God",
      scriptureRef: "HABAKKUK 2:20",
      scriptureText: "The LORD is in his holy temple: let all the earth keep silence before him.",
      mode: "duration",
      durationSeconds: 300,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: false,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "countdown-10min",
    name: "10-Minute Sanctuary Gathering",
    category: "Quick Timer",
    iconName: "Clock",
    data: {
      title: "COUNTDOWN TO WORSHIP",
      subtitle: "Welcome to Church · Sanctuary Doors Open",
      scriptureRef: "PSALM 100:4",
      scriptureText: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
      mode: "duration",
      durationSeconds: 600,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: false,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "countdown-15min",
    name: "15-Minute Pre-Service Countdown",
    category: "Quick Timer",
    iconName: "Clock",
    data: {
      title: "CELEBRATION SERVICE COUNTDOWN",
      subtitle: "Inviting the Holy Spirit · Glorious Fellowship",
      scriptureRef: "PSALM 122:1",
      scriptureText: "I was glad when they said unto me, Let us go into the house of the LORD.",
      mode: "duration",
      durationSeconds: 900,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: false,
      showScripture: false,
      showLogo: true,
    },
  },
  {
    id: "word-of-the-month",
    name: "Word of the Month Declaration",
    category: "Prophetic Theme",
    iconName: "Crown",
    data: {
      title: "WORD FOR THE MONTH DECLARATION",
      subtitle: "Prophetic Decree & Covenant Impartation In...",
      scriptureRef: "GENESIS 26:12",
      scriptureText: "Then Isaac sowed in that land, and reaped in the same year a hundredfold; and the LORD blessed him.",
      mode: "duration",
      durationSeconds: 180,
      theme: "royal-gold",
      soundEnabled: true,
      overtimeEnabled: false,
      showScripture: false,
      showLogo: true,
    },
  },
];
