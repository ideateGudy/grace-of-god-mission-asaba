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
  | "holy-minimal"
  | "prophetic-word"
  | "covenant-glory"
  | "prophetic-decree"
  | "mountain-glory"
  | "doxa-worship";

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
  patternType:
    | "radial-rays"
    | "aurora"
    | "fire-burst"
    | "sacred-waves"
    | "fine-mesh"
    | "prophetic-stars"
    | "crown-rays"
    | "spotlight-koinonia"
    | "mountain-encounter"
    | "stage-wash";
}

export type LayerBlendMode =
  | "normal"
  | "screen"
  | "multiply"
  | "overlay"
  | "soft-light"
  | "color-dodge"
  | "lighten"
  | "luminosity";

export type LayerMaskShape = "rect" | "circle" | "rounded" | "feathered";

export interface FlyerImageLayer {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blendMode: LayerBlendMode;
  maskShape: LayerMaskShape;
  locked?: boolean;
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
  layers?: FlyerImageLayer[];
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
  "prophetic-word": {
    id: "prophetic-word",
    name: "Prophetic Word & Covenant",
    tagline: "Deep midnight sapphire, golden halo starburst, and covenant decree",
    bgDark: "#04091A",
    bgGradient: "linear-gradient(135deg, #04091A 0%, #0B1E4E 50%, #150F2C 100%)",
    primaryAccent: "#F59E0B",
    secondaryAccent: "#38BDF8",
    accentGlow: "rgba(245, 158, 11, 0.45)",
    borderColor: "rgba(245, 158, 11, 0.45)",
    textColor: "#FFFFFF",
    mutedColor: "#BAE6FD",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    badgeText: "#FCD34D",
    patternType: "prophetic-stars",
  },
  "covenant-glory": {
    id: "covenant-glory",
    name: "Covenant Dawn / Prophetic Theme",
    tagline: "Royal amethyst dawn, radiant solar gold, and monthly decree",
    bgDark: "#0D0518",
    bgGradient: "linear-gradient(135deg, #0D0518 0%, #22093C 50%, #301018 100%)",
    primaryAccent: "#EAB308",
    secondaryAccent: "#E879F9",
    accentGlow: "rgba(234, 179, 8, 0.45)",
    borderColor: "rgba(232, 121, 249, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#F5D0FE",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(232, 121, 249, 0.2)",
    badgeText: "#FDE047",
    patternType: "crown-rays",
  },
  "prophetic-decree": {
    id: "prophetic-decree",
    name: "Koinonia Spotlight Encounter",
    tagline: "Volumetric dual corner spotlights, fiery crimson title accents, and descending Holy Spirit rays",
    bgDark: "#090205",
    bgGradient: "linear-gradient(135deg, #090205 0%, #1A050B 50%, #260A0A 100%)",
    primaryAccent: "#EF4444",
    secondaryAccent: "#F59E0B",
    accentGlow: "rgba(239, 68, 68, 0.45)",
    borderColor: "rgba(239, 68, 68, 0.45)",
    textColor: "#FFFFFF",
    mutedColor: "#FECACA",
    titleFont: "sans-serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(239, 68, 68, 0.2)",
    badgeText: "#FCA5A5",
    patternType: "spotlight-koinonia",
  },
  "mountain-glory": {
    id: "mountain-glory",
    name: "Divine Encounter & Mountain Peak",
    tagline: "Spiritual mountain ridges, heavenly god rays, and 3D extruded metallic typography",
    bgDark: "#060A18",
    bgGradient: "linear-gradient(135deg, #060A18 0%, #0D1B36 50%, #15274A 100%)",
    primaryAccent: "#EAB308",
    secondaryAccent: "#38BDF8",
    accentGlow: "rgba(234, 179, 8, 0.45)",
    borderColor: "rgba(234, 179, 8, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#BAE6FD",
    titleFont: "serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(234, 179, 8, 0.2)",
    badgeText: "#FDE047",
    patternType: "mountain-encounter",
  },
  "doxa-worship": {
    id: "doxa-worship",
    name: "Doxa Worship & Stage Wash",
    tagline: "Deep emerald sanctuary stage wash, concert light beams, and multi-service time chips",
    bgDark: "#02170F",
    bgGradient: "linear-gradient(135deg, #02170F 0%, #06281B 50%, #0B3A28 100%)",
    primaryAccent: "#10B981",
    secondaryAccent: "#FBBF24",
    accentGlow: "rgba(16, 185, 129, 0.45)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    textColor: "#FFFFFF",
    mutedColor: "#A7F3D0",
    titleFont: "sans-serif",
    bodyFont: "sans-serif",
    badgeBg: "rgba(16, 185, 129, 0.2)",
    badgeText: "#6EE7B7",
    patternType: "stage-wash",
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
  {
    id: "word-of-the-month",
    name: "Word of the Month (Harvest & Acceleration)",
    iconName: "Sparkles",
    description: "Monthly prophetic theme declaration with covenant scripture and pastoral decree",
    data: {
      templateId: "prophetic-word",
      aspectRatio: "square",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "PROPHETIC THEME // OCTOBER 2026",
      title: "OUR MONTH OF SUPERNATURAL HARVEST & UNCOMMON ACCELERATION",
      subtitle: "Every closed gate is lifted. Whatever took years to accomplish shall manifest in days by the grace of God.",
      scriptureRef: "GENESIS 26:12",
      scriptureText: "Then Isaac sowed in that land, and reaped in the same year a hundredfold; and the LORD blessed him.",
      date: "OCTOBER 2026 // PROPHETIC THEME",
      time: "MONTHLY PROPHETIC DECREE",
      venue: "Grace of God Mission, 12 Jesus Saves Road, Asaba",
      minister: "DECLARED BY: PASTOR CHUKWUDI EZE",
      guestMinister: "",
      badgeText: "WORD FOR THE MONTH",
      broadcastBadge: "COVENANT BLESSING OF THE MONTH",
      showChurchLogo: true,
    },
  },
  {
    id: "word-of-the-month-exceeding",
    name: "Word of the Month (Open Heavens & Favour)",
    iconName: "Crown",
    description: "Prophetic declaration of divine favour, supernatural open doors, and peace",
    data: {
      templateId: "covenant-glory",
      aspectRatio: "story",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "PROPHETIC THEME // NOVEMBER 2026",
      title: "OUR MONTH OF OPEN HEAVENS & SURPASSING FAVOUR",
      subtitle: "The hand of the Lord is mighty upon you for good. Kings and nations shall come to the brightness of your rising.",
      scriptureRef: "EPHESIANS 3:20",
      scriptureText: "Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us.",
      date: "NOVEMBER 2026 // PROPHETIC THEME",
      time: "MONTHLY THEME & DECLARATION",
      venue: "Grace of God Mission, 12 Jesus Saves Road, Asaba",
      minister: "HOST: PASTOR CHUKWUDI EZE",
      guestMinister: "",
      badgeText: "PROPHETIC WORD OF THE MONTH",
      broadcastBadge: "SEASON OF SUPERNATURAL REST",
      showChurchLogo: true,
    },
  },
  {
    id: "koinonia-encounter",
    name: "Koinonia Glory (Wonders of His Presence)",
    iconName: "Flame",
    description: "Volumetric dual spotlights, Holy Spirit dove, and fiery duotone apostolic title (Inspired by Koinonia)",
    data: {
      templateId: "prophetic-decree",
      aspectRatio: "square",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "KOINONIA APOSTOLIC SERVICE // ABUJA & ASABA",
      title: "THE WONDERS OF HIS PRESENCE & UNSTOPPABLE POWER",
      subtitle: "Experience the transformative glory of God's tangible presence, apostolic impartation, and divine wisdom.",
      scriptureRef: "EXODUS 33:14",
      scriptureText: "My presence shall go with thee, and I will give thee rest.",
      date: "SUNDAY, 1ST NOVEMBER 2026",
      time: "5:00 PM PROMPT (DOORS OPEN 4:00 PM)",
      venue: "Auditorium of Grace, 12 Jesus Saves Road, Asaba",
      minister: "HOST: PASTOR CHUKWUDI EZE",
      guestMinister: "MINISTERING: APOSTLE JOSHUA SELMAN",
      badgeText: "APOSTOLIC & PROPHETIC IMPARTATION",
      broadcastBadge: "GLOBAL LIVE BROADCAST · KOINONIA TV",
      showChurchLogo: true,
    },
  },
  {
    id: "divine-encounter",
    name: "Divine Encounter Revival (Mountain of Grace)",
    iconName: "Sparkles",
    description: "Mountain peak atmosphere, heavenly god-rays, 3D extruded metallic title, and revival seal",
    data: {
      templateId: "mountain-glory",
      aspectRatio: "story",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "ANNUAL HARVEST OF REVIVAL // 2026",
      title: "DIVINE ENCOUNTER & SUPERNATURAL VISITATION",
      subtitle: "Ascend the mountain of prayer and power. A sacred season of answered prayers, signs, and great deliverance.",
      scriptureRef: "EXODUS 3:2",
      scriptureText: "And the angel of the LORD appeared unto him in a flame of fire out of the midst of a bush.",
      date: "18TH - 22ND NOVEMBER 2026",
      time: "5:30 PM DAILY & 8:00 AM SUNDAY",
      venue: "Cathedral of Grace, 12 Jesus Saves Road, Asaba",
      minister: "CHIEF HOST: REV. DR. CHUKWUDI EZE",
      guestMinister: "GUEST: BISHOP & ANOINTED EVANGELISTS",
      badgeText: "ANOINTING · SIGNS & WONDERS",
      broadcastBadge: "LIVESTREAMING ON YOUTUBE & FACEBOOK",
      showChurchLogo: true,
    },
  },
  {
    id: "doxa-worship-night",
    name: "Doxa Worship Night & Holy Communion",
    iconName: "HeartHandshake",
    description: "Emerald stage wash, concert light beams, praying hands atmosphere, and multi-service dot pills",
    data: {
      templateId: "doxa-worship",
      aspectRatio: "landscape",
      churchName: "GRACE OF GOD MISSION ASABA",
      category: "DOXA WORSHIP ENCOUNTER // PRAISE BANQUET",
      title: "WORSHIP IN THE BEAUTY OF HIS HOLINESS",
      subtitle: "Unbroken praise, deep prophetic worship, miraculous healing, and the holy communion table.",
      scriptureRef: "PSALM 29:2",
      scriptureText: "Give unto the LORD the glory due unto his name; worship the LORD in the beauty of holiness.",
      date: "FRIDAY, 27TH NOVEMBER 2026",
      time: "● 1ST SERVICE 8:00 AM  ● 2ND SERVICE 10:00 AM",
      venue: "Main Sanctuary of Grace, 12 Jesus Saves Road, Asaba",
      minister: "WORSHIP LEADER: PASTOR EZE & GGM MASS CHOIR",
      guestMinister: "GUEST: GOSPEL WORSHIP ENSEMBLE",
      badgeText: "INTENSIVE WORSHIP & MIRACLE COMMUNION",
      broadcastBadge: "DOORS OPEN 4:30 PM · ADMISSION FREE",
      showChurchLogo: true,
    },
  },
];
