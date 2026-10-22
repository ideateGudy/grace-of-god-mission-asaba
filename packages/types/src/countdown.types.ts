import { z } from "zod";

export type CountdownMode = "activity" | "event-date" | "target-time" | "duration";

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

export type StudioInputType =
  | "countdown"
  | "scripture"
  | "media"
  | "lower-third"
  | "camera"
  | "black";

export type BibleTranslation =
  | "KJV"
  | "NKJV"
  | "ESV"
  | "AMP"
  | "NIV"
  | "MSG"
  | "BSB";

export interface StudioScriptureState {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  text: string;
  translation: BibleTranslation;
  displayMode: "fullscreen" | "lower-third";
}

export interface StudioMediaItem {
  id: string;
  url: string;
  title: string;
  category: "flyer" | "sermon" | "offering" | "announcement" | "general";
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface StudioOverlayState {
  enabled: boolean;
  type: "speaker" | "giving" | "ticker" | "scripture" | "custom";
  title: string;
  subtitle: string;
  extra?: string;
}

export interface StudioCameraState {
  enabled: boolean;
  deviceId?: string;
  streamType: "webcam" | "youtube" | "ndi" | "phone";
  youtubeId?: string;
  roomCode?: string;
}

export const updateCountdownSchema = z.object({
  title: z.string().trim().max(300).optional(),
  subtitle: z.string().trim().max(300).optional(),
  scriptureRef: z.string().trim().max(200).optional(),
  scriptureText: z.string().trim().max(1000).optional(),
  mode: z.enum(["activity", "event-date", "target-time", "duration"]).optional(),
  targetTimeString: z.string().trim().max(20).optional(),
  targetDate: z.string().trim().max(100).optional(),
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
  // Extended studio fields (all optional for backward compatibility)
  activeType: z.enum(["countdown", "scripture", "media", "lower-third", "camera", "black"]).optional(),
  previewType: z.enum(["countdown", "scripture", "media", "lower-third", "camera", "black"]).optional(),
  scripture: z.any().optional(),
  mediaList: z.array(z.any()).optional(),
  activeMediaId: z.string().optional(),
  overlay: z.any().optional(),
  camera: z.any().optional(),
  isBlackout: z.boolean().optional(),
  transitionType: z.enum(["cut", "fade"]).optional(),
  transitionDurationMs: z.number().optional(),
});

export type UpdateCountdownDto = z.infer<typeof updateCountdownSchema>;

export interface PublicCountdownDto extends ChurchCountdownState {
  isRunning: boolean;
  remainingSeconds: number;
  targetEndTime: number | null;
  updatedAt: string;
  // Studio extensions (optional on base countdown DTO)
  activeType?: StudioInputType;
  previewType?: StudioInputType;
  scripture?: StudioScriptureState;
  mediaList?: StudioMediaItem[];
  activeMediaId?: string;
  overlay?: StudioOverlayState;
  camera?: StudioCameraState;
  isBlackout?: boolean;
  transitionType?: "cut" | "fade";
  transitionDurationMs?: number;
}

export interface BroadcastStudioState extends PublicCountdownDto {
  activeType: StudioInputType;
  previewType: StudioInputType;
  scripture: StudioScriptureState;
  mediaList: StudioMediaItem[];
  activeMediaId?: string;
  overlay: StudioOverlayState;
  camera: StudioCameraState;
  isBlackout: boolean;
  transitionType: "cut" | "fade";
  transitionDurationMs: number;
}

export const DEFAULT_STUDIO_STATE: BroadcastStudioState = {
  title: "SUNDAY CELEBRATION SERVICE",
  subtitle: "Service Starts In...",
  scriptureRef: "ISAIAH 60:1",
  scriptureText: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
  mode: "target-time",
  targetTimeString: "08:00",
  targetDate: "",
  durationSeconds: 1800,
  theme: "royal-gold",
  soundEnabled: true,
  overtimeEnabled: false,
  showScripture: false,
  showLogo: true,
  stageMode: false,
  isRunning: true,
  remainingSeconds: 1800,
  targetEndTime: null,
  updatedAt: new Date().toISOString(),
  activeType: "countdown",
  previewType: "scripture",
  scripture: {
    reference: "ISAIAH 60:1",
    book: "Isaiah",
    chapter: 60,
    verse: 1,
    text: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    translation: "KJV",
    displayMode: "fullscreen",
  },
  mediaList: [],
  activeMediaId: undefined,
  overlay: {
    enabled: false,
    type: "speaker",
    title: "PASTOR DAVID OGBUELI",
    subtitle: "Senior Pastor · Grace of God Mission Asaba",
    extra: "Theme: The Reigning Church",
  },
  camera: {
    enabled: false,
    streamType: "phone",
    roomCode: "cam-1",
  },
  isBlackout: false,
  transitionType: "fade",
  transitionDurationMs: 500,
};

export interface ChurchCountdownState {
  title: string;
  subtitle: string;
  scriptureRef: string;
  scriptureText: string;
  mode: CountdownMode;
  targetTimeString: string; // "HH:MM" e.g. "08:00"
  targetDate: string; // ISO date string e.g. "2026-12-31T23:59:59"
  durationSeconds: number; // For activity timer, initial duration in seconds
  theme: CountdownThemeId;
  soundEnabled: boolean;
  overtimeEnabled: boolean;
  showScripture: boolean;
  showLogo: boolean;
  stageMode: boolean; // Hide controls for sanctuary screen
}

export interface ActivityPreset {
  id: string;
  name: string;
  category: string;
  iconName: string;
  durationMinutes: number;
  title: string;
  subtitle: string;
  theme: CountdownThemeId;
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  {
    id: "sermon-30",
    name: "Sermon (30 Mins)",
    category: "Word Ministration",
    iconName: "BookOpen",
    durationMinutes: 30,
    title: "SERMON & EXHORTATION",
    subtitle: "Ministering the Undiluted Word of God",
    theme: "royal-gold",
  },
  {
    id: "sermon-45",
    name: "Sermon (45 Mins)",
    category: "Word Ministration",
    iconName: "BookOpen",
    durationMinutes: 45,
    title: "SERMON & EXHORTATION",
    subtitle: "Ministering the Undiluted Word of God",
    theme: "royal-gold",
  },
  {
    id: "praise-20",
    name: "Praise & Worship (20 Mins)",
    category: "Worship Session",
    iconName: "Flame",
    durationMinutes: 20,
    title: "HIGH PRAISE & WORSHIP",
    subtitle: "Lifting Holy Hands in Sanctuary Worship",
    theme: "pentecost-fire",
  },
  {
    id: "praise-30",
    name: "Praise & Worship (30 Mins)",
    category: "Worship Session",
    iconName: "Flame",
    durationMinutes: 30,
    title: "HIGH PRAISE & WORSHIP",
    subtitle: "Lifting Holy Hands in Sanctuary Worship",
    theme: "pentecost-fire",
  },
  {
    id: "announcements-10",
    name: "Announcements (10 Mins)",
    category: "Church Notice",
    iconName: "Clock",
    durationMinutes: 10,
    title: "CHURCH NOTICES & ANNOUNCEMENTS",
    subtitle: "Kingdom Updates & Weekly Activities",
    theme: "celestial-blue",
  },
  {
    id: "offering-10",
    name: "Offering & Tithes (10 Mins)",
    category: "Covenant Giving",
    iconName: "Crown",
    durationMinutes: 10,
    title: "COVENANT GIVING & TITHES",
    subtitle: "Honouring the Lord with Our Substance",
    theme: "emerald-grace",
  },
  {
    id: "prayer-15",
    name: "Opening Prayer (15 Mins)",
    category: "Sanctuary Prayer",
    iconName: "Flame",
    durationMinutes: 15,
    title: "OPENING PRAYER & INTERCESSION",
    subtitle: "Calling Upon the God of Grace",
    theme: "pentecost-fire",
  },
  {
    id: "testimonies-15",
    name: "Testimonies (15 Mins)",
    category: "Testimonies",
    iconName: "Sparkles",
    durationMinutes: 15,
    title: "SIGNS & WONDERS TESTIMONIES",
    subtitle: "Overcoming by the Blood and Our Testimony",
    theme: "royal-gold",
  },
];

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

/**
 * Calculates remaining seconds until a target "HH:MM" clock time in Church Sanctuary Time (Africa/Lagos, UTC+1).
 * If the target time passed earlier today by more than 2 hours, it rolls forward to tomorrow.
 */
export function calculateSecondsUntilTarget(targetHHMM: string): number {
  const [targetH, targetM] = (targetHHMM || "08:00").split(":").map(Number);
  const safeTargetH = isNaN(targetH) ? 8 : targetH;
  const safeTargetM = isNaN(targetM) ? 0 : targetM;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    let nowH = 0;
    let nowM = 0;
    let nowS = 0;

    for (const p of parts) {
      if (p.type === "hour") nowH = Number(p.value);
      if (p.type === "minute") nowM = Number(p.value);
      if (p.type === "second") nowS = Number(p.value);
    }
    if (nowH === 24) nowH = 0;

    const nowSecondsToday = nowH * 3600 + nowM * 60 + nowS;
    const targetSecondsToday = safeTargetH * 3600 + safeTargetM * 60;

    let diffSecs = targetSecondsToday - nowSecondsToday;

    // If target time passed earlier today by more than 2 hours (-7200s), roll forward to tomorrow (+86400s)
    if (diffSecs < -2 * 3600) {
      diffSecs += 86400;
    }

    return diffSecs;
  } catch {
    const now = new Date();
    const target = new Date(now);
    target.setHours(safeTargetH, safeTargetM, 0, 0);
    let diffMs = target.getTime() - now.getTime();
    if (diffMs < -2 * 60 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
      diffMs = target.getTime() - now.getTime();
    }
    return Math.round(diffMs / 1000);
  }
}

/**
 * Calculates remaining seconds until a target date/time string.
 * When the target date is reached or passed, it returns 0 (stays at zero, never goes negative).
 */
export function calculateSecondsUntilDate(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr).getTime();
  if (isNaN(target)) return 0;
  const now = Date.now();
  const diffSecs = Math.round((target - now) / 1000);
  return Math.max(0, diffSecs);
}

/**
 * Formats a Date to a local ISO string (YYYY-MM-DDTHH:mm:ss) compatible with datetime-local inputs.
 */
export function formatToLocalIso(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Returns the upcoming Sunday 08:00 AM date in local ISO format.
 */
export function getNextSundayServiceDate(): string {
  const now = new Date();
  const result = new Date(now);
  const day = result.getDay();
  let daysUntilSunday = (7 - day) % 7;
  if (day === 0 && (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0))) {
    daysUntilSunday = 7;
  }
  result.setDate(result.getDate() + daysUntilSunday);
  result.setHours(8, 0, 0, 0);
  return formatToLocalIso(result);
}

/**
 * Returns the upcoming Wednesday 17:30 Midweek Service date in local ISO format.
 */
export function getNextMidweekServiceDate(): string {
  const now = new Date();
  const result = new Date(now);
  const day = result.getDay();
  let daysUntilWed = (3 - day + 7) % 7;
  if (day === 3 && (now.getHours() > 17 || (now.getHours() === 17 && now.getMinutes() > 30))) {
    daysUntilWed = 7;
  }
  result.setDate(result.getDate() + daysUntilWed);
  result.setHours(17, 30, 0, 0);
  return formatToLocalIso(result);
}

/**
 * Returns the upcoming New Year date (Dec 31 23:59:59) in local ISO format.
 */
export function getUpcomingNewYearDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const target = new Date(year, 11, 31, 23, 59, 59, 0);
  if (now.getTime() > target.getTime()) {
    target.setFullYear(year + 1);
  }
  return formatToLocalIso(target);
}

export interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOvertime: boolean;
  isZero: boolean;
}

export function calculateTimeBreakdown(totalSeconds: number): TimeBreakdown {
  const isOvertime = totalSeconds < 0;
  const absSecs = Math.abs(totalSeconds);
  const days = Math.floor(absSecs / 86400);
  const hours = Math.floor((absSecs % 86400) / 3600);
  const minutes = Math.floor((absSecs % 3600) / 60);
  const seconds = absSecs % 60;
  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isOvertime,
    isZero: totalSeconds === 0,
  };
}

export interface EventDatePreset {
  id: string;
  name: string;
  category: string;
  iconName: string;
  title: string;
  subtitle: string;
  theme: CountdownThemeId;
  getTargetDate: () => string;
}

export const EVENT_DATE_PRESETS: EventDatePreset[] = [
  {
    id: "sunday-celebration",
    name: "Sunday Celebration Service",
    category: "Weekly Encounter",
    iconName: "Church",
    title: "SUNDAY CELEBRATION SERVICE",
    subtitle: "Sanctuary Doors Open · Service Starts In...",
    theme: "royal-gold",
    getTargetDate: getNextSundayServiceDate,
  },
  {
    id: "midweek-communion",
    name: "Midweek Communion Service",
    category: "Bible Study",
    iconName: "BookOpen",
    title: "MIDWEEK COMMUNION SERVICE",
    subtitle: "Word & Communion Encounter Begins In...",
    theme: "emerald-grace",
    getTargetDate: getNextMidweekServiceDate,
  },
  {
    id: "new-year-crossover",
    name: "New Year Crossover Service",
    category: "Annual Prophetic Vigil",
    iconName: "Sparkles",
    title: "NEW YEAR CROSSOVER SERVICE",
    subtitle: "Stepping into Greater Glory · Countdown to New Year In...",
    theme: "celestial-blue",
    getTargetDate: getUpcomingNewYearDate,
  },
];

