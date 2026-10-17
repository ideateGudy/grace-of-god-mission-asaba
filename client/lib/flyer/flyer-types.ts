export type FlyerAspectRatio = "square" | "story" | "landscape";

export interface FlyerDimensions {
  width: number;
  height: number;
  label: string;
  sublabel: string;
}

export const FLYER_DIMENSIONS: Record<FlyerAspectRatio, FlyerDimensions> = {
  square: {
    width: 1080,
    height: 1080,
    label: "Square (1:1)",
    sublabel: "Instagram Feed · Facebook Post · WhatsApp",
  },
  story: {
    width: 1080,
    height: 1920,
    label: "Story / Status (9:16)",
    sublabel: "WhatsApp Status · Instagram Story · Mobile",
  },
  landscape: {
    width: 1920,
    height: 1080,
    label: "Screen / Banner (16:9)",
    sublabel: "Projector Screen · Sanctuary TV · YouTube",
  },
};

export type FlyerTemplateId =
  | "royal-gold"
  | "midnight-glory"
  | "pentecost-fire"
  | "emerald-grace"
  | "holy-minimal";

export interface FlyerTemplateStyle {
  id: FlyerTemplateId;
  name: string;
  tagline: string;
  bgDark: string;
  bgGradient: string;
  primaryAccent: string;
  secondaryAccent: string;
  accentGlow: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  titleFont: string;
  bodyFont: string;
  badgeBg: string;
  badgeText: string;
  patternType: "radial-rays" | "aurora" | "fire-burst" | "sacred-waves" | "fine-mesh";
}

export interface FlyerData {
  templateId: FlyerTemplateId;
  aspectRatio: FlyerAspectRatio;
  churchName: string;
  category: string;
  title: string;
  subtitle: string;
  scriptureRef: string;
  scriptureText: string;
  date: string;
  time: string;
  venue: string;
  minister: string;
  guestMinister: string;
  badgeText: string;
  broadcastBadge: string;
  speakerPhotoUrl?: string;
  showChurchLogo: boolean;
}

export interface FlyerPreset {
  id: string;
  name: string;
  iconName: string;
  description: string;
  data: Partial<FlyerData>;
}

export const FLYER_TEMPLATES: Record<FlyerTemplateId, FlyerTemplateStyle> = {
  "royal-gold": {
    id: "royal-gold",
    name: "Royal Gold & Obsidian",
    tagline: "Sacred metallic gold, volumetric lighting, and royal dignity",
    bgDark: "#060714",
    bgGradient: "linear-gradient(135deg, #060714 0%, #0D102A 50%, #161208 100%)",
    primaryAccent: "#D9A441",
    secondaryAccent: "#F59E0B",
    accentGlow: "rgba(217, 164, 65, 0.35)",
    borderColor: "rgba(217, 164, 65, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#E2E8F0",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(217, 164, 65, 0.15)",
    badgeText: "#FBBF24",
    patternType: "radial-rays",
  },
  "midnight-glory": {
    id: "midnight-glory",
    name: "Midnight Celestial Glory",
    tagline: "Deep space indigo with vibrant violet and cyan aurora glows",
    bgDark: "#080B1E",
    bgGradient: "linear-gradient(135deg, #080B1E 0%, #0E1338 50%, #1B0F33 100%)",
    primaryAccent: "#818CF8",
    secondaryAccent: "#C084FC",
    accentGlow: "rgba(129, 140, 248, 0.4)",
    borderColor: "rgba(168, 85, 247, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#CBD5E1",
    titleFont: "sans-serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(99, 102, 241, 0.2)",
    badgeText: "#A5B4FC",
    patternType: "aurora",
  },
  "pentecost-fire": {
    id: "pentecost-fire",
    name: "Pentecost Fire & Ember",
    tagline: "High-impact spiritual fire, dark volcanic crimson, and amber flares",
    bgDark: "#130608",
    bgGradient: "linear-gradient(135deg, #130608 0%, #200B0E 50%, #2B1104 100%)",
    primaryAccent: "#F97316",
    secondaryAccent: "#FBBF24",
    accentGlow: "rgba(249, 115, 22, 0.45)",
    borderColor: "rgba(249, 115, 22, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#FED7AA",
    titleFont: "sans-serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(234, 88, 12, 0.2)",
    badgeText: "#FDBA74",
    patternType: "fire-burst",
  },
  "emerald-grace": {
    id: "emerald-grace",
    name: "Living Waters & Emerald",
    tagline: "Deep forest sanctuary green with luminous mint and pale gold",
    bgDark: "#031710",
    bgGradient: "linear-gradient(135deg, #031710 0%, #08281E 50%, #0B1F24 100%)",
    primaryAccent: "#10B981",
    secondaryAccent: "#6EE7B7",
    accentGlow: "rgba(16, 185, 129, 0.4)",
    borderColor: "rgba(52, 211, 153, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#D1FAE5",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(16, 185, 129, 0.18)",
    badgeText: "#6EE7B7",
    patternType: "sacred-waves",
  },
  "holy-minimal": {
    id: "holy-minimal",
    name: "Sacred Elegance / Minimal Luxury",
    tagline: "Architectural graphite, warm ivory serif, and delicate gold filigree",
    bgDark: "#0F1015",
    bgGradient: "linear-gradient(135deg, #0F1015 0%, #151720 50%, #0B0C0E 100%)",
    primaryAccent: "#E2C485",
    secondaryAccent: "#E5E7EB",
    accentGlow: "rgba(226, 196, 133, 0.25)",
    borderColor: "rgba(226, 196, 133, 0.3)",
    textColor: "#F8FAFC",
    mutedColor: "#94A3B8",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(255, 255, 255, 0.08)",
    badgeText: "#E2C485",
    patternType: "fine-mesh",
  },
};

export const DEFAULT_PRESETS: FlyerPreset[] = [
  {
    id: "sunday-service",
    name: "Sunday Celebration Service",
    iconName: "Church",
    description: "Weekly worship encounter, communion, and anointed word",
    data: {
      templateId: "royal-gold",
      aspectRatio: "square",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "SUNDAY CELEBRATION SERVICE",
      title: "SUPERNATURAL BREAKTHROUGH & UNSTOPPABLE FAVOUR",
      subtitle: "Come experience the tangible presence of God and step into your ordained season of victory.",
      scriptureRef: "ISAIAH 60:1",
      scriptureText: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
      date: "SUNDAY, 25TH OCTOBER 2026",
      time: "8:00 AM & 10:00 AM (2 POWER SERVICES)",
      venue: "Auditorium of Grace, 12 Jesus Saves Road, Asaba, Delta State",
      minister: "Host: Pastor Chukwudi Eze",
      guestMinister: "",
      badgeText: "ANOINTING & MIRACLE BANQUET",
      broadcastBadge: "LIVE STREAMING ON YOUTUBE & FACEBOOK",
      showChurchLogo: true,
    },
  },
  {
    id: "miracle-vigil",
    name: "All-Night Miracle Vigil",
    iconName: "Flame",
    description: "Midnight prayer surge, deliverance, and power encounters",
    data: {
      templateId: "pentecost-fire",
      aspectRatio: "story",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "POWER NIGHT OF GLORY",
      title: "BREAKING INVISIBLE BARRIERS & SATANIC EMBARGOES",
      subtitle: "A night of violent prayers, angelic intervention, and total liberty in Christ Jesus.",
      scriptureRef: "ACTS 16:25-26",
      scriptureText: "And at midnight Paul and Silas prayed, and sang praises unto God... and immediately all the doors were opened.",
      date: "FRIDAY, 30TH OCTOBER 2026",
      time: "10:00 PM TILL DAWN",
      venue: "Sanctuary of Deliverance, 12 Jesus Saves Road, Asaba",
      minister: "Host: Pastor Chukwudi Eze",
      guestMinister: "Guest: Apostle Emmanuel Okonkwo",
      badgeText: "DELIVERANCE & PROPHETIC NIGHT",
      broadcastBadge: "DOORS OPEN 9:00 PM · FREE TRANSPORTATION",
      showChurchLogo: true,
    },
  },
  {
    id: "daily-devotion",
    name: "Daily Grace Devotional Card",
    iconName: "BookOpen",
    description: "Social share card for today's scripture and pastoral reflection",
    data: {
      templateId: "emerald-grace",
      aspectRatio: "square",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "DAILY GRACE DEVOTIONAL",
      title: "LET GOD TRANSFORM YOUR LIFE",
      subtitle: "Tapping into God's power does not have to be complicated; make prayer your daily spiritual priority.",
      scriptureRef: "2 CORINTHIANS 5:17",
      scriptureText: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
      date: "DAILY GRACE · OCTOBER 2026",
      time: "DAILY REFLECTION & PRAYER",
      venue: "Grace of God Mission International · Asaba Church",
      minister: "Rev. Dr. & Pastor Eze",
      guestMinister: "",
      badgeText: "VERSE OF THE DAY",
      broadcastBadge: "READ FULL DEVOTION: GGMASABA.ORG/DEVOTION",
      showChurchLogo: true,
    },
  },
  {
    id: "youth-awakening",
    name: "Youth Awakening Rally",
    iconName: "Sparkles",
    description: "Young adults, praise night, and destiny alignment",
    data: {
      templateId: "midnight-glory",
      aspectRatio: "story",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "KINGDOM YOUTH EXPLOSION",
      title: "IGNITED FOR DESTINY & KINGDOM REIGN",
      subtitle: "Unleashing the supernatural potential of young believers for global leadership.",
      scriptureRef: "1 TIMOTHY 4:12",
      scriptureText: "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",
      date: "SATURDAY, 24TH OCTOBER 2026",
      time: "4:00 PM RED CARPET · 4:30 PM MAIN EVENT",
      venue: "The Youth Arena · GGM Sanctuary Asaba",
      minister: "Youth Pastor & Guest Worship Ministers",
      guestMinister: "",
      badgeText: "FREE ADMISSION · MUSIC · SPOKEN WORD · DRAMA",
      broadcastBadge: "TAG A FRIEND & BRING A SOUL",
      showChurchLogo: true,
    },
  },
  {
    id: "midweek-service",
    name: "Midweek Communion Service",
    iconName: "HeartHandshake",
    description: "Wednesday Bible study, communion table, and answered prayers",
    data: {
      templateId: "holy-minimal",
      aspectRatio: "landscape",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "MIDWEEK COMMUNION SERVICE",
      title: "THE MYSTERY OF THE COVENANT MEAL",
      subtitle: "Deep fellowship, spiritual illumination in the Scriptures, and holy communion for divine health.",
      scriptureRef: "JOHN 6:54",
      scriptureText: "Whoso eateth my flesh, and drinketh my blood, hath eternal life; and I will raise him up at the last day.",
      date: "EVERY WEDNESDAY EVENING",
      time: "5:30 PM - 7:00 PM PROMPT",
      venue: "Grace of God Mission Auditorium, Asaba",
      minister: "Pastoral Teaching Team",
      guestMinister: "",
      badgeText: "HOLY COMMUNION TABLE",
      broadcastBadge: "STREAMING LIVE GLOBALLY",
      showChurchLogo: true,
    },
  },
];
