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
  address: "No. 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State",
  city: "Asaba",
  state: "Delta State",
  country: "Nigeria",
  googleMapsUrl: "https://www.google.com/maps/place/Grace+of+God+Mission+Asaba+Hq/@6.1763103,6.7464769,17.38z/data=!4m6!3m5!1s0x1043ed616ce913ef:0x5cda51b288ccb076!8m2!3d6.1764146!4d6.748862!16s%2Fg%2F11tf999ctn?entry=ttu&g_ep=EgoyMDI2MTAxMi4wIKXMDSoASAFQAw%3D%3D",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3053.4168993678427!2d6.746476945982947!3d6.1763103233292345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1043ed616ce913ef%3A0x5cda51b288ccb076!2sGrace%20of%20God%20Mission%20Asaba%20Hq!5e0!3m2!1sen!2sng!4v1792062152635!5m2!1sen!2sng",

  // Services
  serviceTimes: "Sundays 7:00 AM · Wednesdays 5:00 PM",
  sundayServiceTime: "7:00 AM",
  midweekServiceTime: "5:00 PM",
  sundaySchedule: "Regular services, special monthly celebrations, and African Praise Sundays start at 7:00 AM.",
  midweekSchedule: "Regular prayer and word encounters are held on Wednesdays at 5:00 PM.",

  // Content
  vision: "[VISION STATEMENT - CONFIRM WITH CHURCH]",
  mission: "[MISSION STATEMENT - CONFIRM WITH CHURCH]",

  // Banking (for Give page)
  bankName: "Zenith Bank",
  accountName: "Grace of God Mission Asaba 1",
  accountNumber: "1214552398",

  // Social
  facebook: "https://www.facebook.com/profile.php?id=61594831403921",
  tiktok: "https://www.tiktok.com/@graceofgodmissionasaba?_r=1&_t=ZS-9AcSfnQD7yO",
  youtube: "",
  instagram: "",

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
  get tiktokUrl() {
    return this.tiktok;
  },
  get youtubeUrl() {
    return this.youtube;
  },
  get instagramUrl() {
    return this.instagram;
  },
};
