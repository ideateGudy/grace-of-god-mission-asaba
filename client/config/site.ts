export const siteConfig = {
  name: "Grace of God Mission Asaba",
  tagline: "[TAGLINE - CONFIRM WITH CHURCH]",
  description: "[DESCRIPTION - CONFIRM WITH CHURCH]",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Contact
  phone: "[PHONE NUMBER - CONFIRM WITH CHURCH]",
  whatsapp: "[WHATSAPP NUMBER WITH COUNTRY CODE - e.g. +2348012345678]",
  email: "[EMAIL ADDRESS - CONFIRM WITH CHURCH]",
  address: "[STREET ADDRESS - CONFIRM WITH CHURCH]",
  city: "Asaba",
  state: "Delta State",
  country: "Nigeria",
  googleMapsUrl: "[GOOGLE MAPS LINK - CONFIRM WITH CHURCH]",

  // Services
  serviceTimes: "[SERVICE TIMES - e.g. Sundays 8:00 AM & 10:30 AM, Wednesdays 6:00 PM]",

  // Content
  vision: "[VISION STATEMENT - CONFIRM WITH CHURCH]",
  mission: "[MISSION STATEMENT - CONFIRM WITH CHURCH]",

  // Banking (for Give page)
  bankName: "[BANK NAME - CONFIRM WITH CHURCH]",
  accountName: "[ACCOUNT NAME - CONFIRM WITH CHURCH]",
  accountNumber: "[ACCOUNT NUMBER - CONFIRM WITH CHURCH]",

  // Social
  facebook: "[FACEBOOK PAGE URL - CONFIRM WITH CHURCH]",
  youtube: "[YOUTUBE CHANNEL URL - CONFIRM WITH CHURCH]",
  instagram: "[INSTAGRAM URL - CONFIRM WITH CHURCH]",

  // Leadership (array, can be empty)
  leadership: [] as Array<{ name: string; title: string; bio?: string; imageUrl?: string }>,

  // About
  foundedYear: "[FOUNDED YEAR - CONFIRM WITH CHURCH]",
  story: "[CHURCH STORY - CONFIRM WITH CHURCH]",
  beliefs: [] as string[],

  // Backward compatibility getters
  get churchAddress() {
    return this.address;
  },
  get directionsUrl() {
    return this.googleMapsUrl;
  },
  get facebookUrl() {
    return this.facebook;
  },
  get youtubeUrl() {
    return this.youtube;
  },
  get instagramUrl() {
    return this.instagram;
  },
};
