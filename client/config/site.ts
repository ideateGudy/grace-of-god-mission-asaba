export const siteConfig = {
  name: "Grace of God Mission Asaba",
  logoUrl: "/ggm_logo.png",
  tagline: "[TAGLINE - CONFIRM WITH CHURCH]",
  description: "[DESCRIPTION - CONFIRM WITH CHURCH]",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Contact
  phone: "[PHONE NUMBER - CONFIRM WITH CHURCH]",
  whatsapp: "[WHATSAPP NUMBER WITH COUNTRY CODE - e.g. +2348012345678]",
  email: "[EMAIL ADDRESS - CONFIRM WITH CHURCH]",
  address: "Grace of God Mission Asaba Hq, Asaba, Delta State, Nigeria",
  city: "Asaba",
  state: "Delta State",
  country: "Nigeria",
  googleMapsUrl: "https://www.google.com/maps/place/Grace+of+God+Mission+Asaba+Hq/@6.1763103,6.7464769,17z",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3053.4168993678427!2d6.746476945982947!3d6.1763103233292345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1043ed616ce913ef%3A0x5cda51b288ccb076!2sGrace%20of%20God%20Mission%20Asaba%20Hq!5e0!3m2!1sen!2sng!4v1792062152635!5m2!1sen!2sng",

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
