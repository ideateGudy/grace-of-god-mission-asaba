import type { SiteSettingsDto } from "@ggm/types";
import { api } from "@/lib/api/client";

export const defaultSiteConfig = {
  name: "Grace of God Mission Asaba",
  logoUrl: "/ggm_logo.png",
  tagline: "A Sanctuary of Grace, Truth, and Loving Community",
  description:
    "Join Grace of God Mission Asaba for vibrant Sunday and Midweek worship, Bible teaching, community fellowship, and prayer in Asaba, Delta State, Nigeria.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Contact
  phone: "+2349075602319",
  whatsapp: "+2349075602319",
  email: "info@ggmasaba.org",
  address: "No. 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State",
  city: "Asaba",
  state: "Delta State",
  country: "Nigeria",
  googleMapsUrl:
    "https://www.google.com/maps/place/Grace+of+God+Mission+Asaba+Hq/@6.1763103,6.7464769,17z/data=!4m6!3m5!1s0x1043ed616ce913ef:0x5cda51b288ccb076!8m2!3d6.1764146!4d6.748862!16s%2Fg%2F11tf999ctn?entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3053.4168993678427!2d6.746476945982947!3d6.1763103233292345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1043ed616ce913ef%3A0x5cda51b288ccb076!2sGrace%20of%20God%20Mission%20Asaba%20Hq!5e0!3m2!1sen!2sng!4v1792062152635!5m2!1sen!2sng",

  // Services
  serviceTimes: "Sundays 7:00 AM · Wednesdays 5:00 PM",
  sundayServiceTime: "7:00 AM",
  midweekServiceTime: "5:00 PM",
  sundaySchedule: "Regular services, special monthly celebrations, and African Praise Sundays start at 7:00 AM.",
  midweekSchedule: "Regular prayer and word encounters are held on Wednesdays at 5:00 PM.",

  // Content
  vision: "To reconcile men unto God through the gospel of grace, establishing believers in faith, holiness, and purpose.",
  mission: "Preaching Christ in all His fullness, discipling believers, transforming our community in Asaba, and impacting nations for God's glory.",

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
  foundedYear: "1994",
  story:
    "Grace of God Mission Asaba is a vibrant fellowship of believers situated in the capital city of Delta State. Committed to preaching Christ in all His fullness, the church has stood as a beacon of truth, hope, and prayer for families, youth, and workers across Asaba and the surrounding communities.",
  beliefs: [] as string[],
};

export function normalizeWhatsAppNumber(raw?: string | null): string {
  if (!raw || raw.startsWith("[")) return "2349075602319";
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits.length < 7) return "2349075602319";
  if (digits.length === 11 && digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }
  if (digits.length === 10 && (digits.startsWith("8") || digits.startsWith("7") || digits.startsWith("9"))) {
    return `234${digits}`;
  }
  return digits;
}

export function normalizePhoneNumber(raw?: string | null): string {
  if (!raw || raw.startsWith("[")) return "+2349075602319";
  const cleaned = raw.trim();
  if (!cleaned) return "+2349075602319";
  if (cleaned.startsWith("+")) {
    const digits = cleaned.replace(/\D/g, "");
    return `+${digits}`;
  }
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }
  if (digits.length === 10 && (digits.startsWith("8") || digits.startsWith("7") || digits.startsWith("9"))) {
    return `+234${digits}`;
  }
  return `+${digits}`;
}

let activeSiteSettings: SiteSettingsDto | null = null;

export function setActiveSiteSettings(settings: SiteSettingsDto | null) {
  activeSiteSettings = settings;
}

export function getActiveSiteSettings(): SiteSettingsDto | null {
  return activeSiteSettings;
}

export async function getLiveSiteSettings(): Promise<SiteSettingsDto | null> {
  try {
    const res = await api.settings.get();
    if (res?.data) {
      setActiveSiteSettings(res.data);
    }
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export function resolveSiteConfig(settings?: SiteSettingsDto | null) {
  const current = settings || activeSiteSettings;
  const name = current?.churchName || defaultSiteConfig.name;
  const phone = current?.phone || defaultSiteConfig.phone;
  const whatsapp = current?.whatsapp || defaultSiteConfig.whatsapp;
  const email = current?.email || defaultSiteConfig.email;
  const address = current?.address || defaultSiteConfig.address;
  const bankName = current?.bankName || defaultSiteConfig.bankName;
  const accountName = current?.accountName || defaultSiteConfig.accountName;
  const accountNumber = current?.accountNumber || defaultSiteConfig.accountNumber;
  const googleMapsUrl = current?.googleMapsUrl || defaultSiteConfig.googleMapsUrl;
  const facebook = current?.facebookUrl ?? defaultSiteConfig.facebook;
  const tiktok = current?.tiktokUrl ?? defaultSiteConfig.tiktok;
  const youtube = current?.youtubeUrl ?? defaultSiteConfig.youtube;
  const instagram = current?.instagramUrl ?? defaultSiteConfig.instagram;

  const whatsAppNumber = normalizeWhatsAppNumber(whatsapp);
  const telNumber = normalizePhoneNumber(phone);
  const whatsAppUrl = whatsAppNumber ? `https://wa.me/${whatsAppNumber}` : "https://wa.me/2349075602319";
  const telUrl = telNumber ? `tel:${telNumber}` : "tel:+2349075602319";

  return {
    ...defaultSiteConfig,
    name,
    phone,
    whatsapp,
    email,
    address,
    bankName,
    accountName,
    accountNumber,
    googleMapsUrl,
    facebook,
    tiktok,
    youtube,
    instagram,
    // Formatted action URLs
    whatsAppUrl,
    telUrl,
    // Backward compatibility aliases
    churchAddress: address,
    directionsUrl: googleMapsUrl,
    facebookUrl: facebook,
    tiktokUrl: tiktok,
    youtubeUrl: youtube,
    instagramUrl: instagram,
  };
}

export const siteConfig = {
  get name() {
    return activeSiteSettings?.churchName || defaultSiteConfig.name;
  },
  get logoUrl() {
    return defaultSiteConfig.logoUrl;
  },
  get tagline() {
    return defaultSiteConfig.tagline;
  },
  get description() {
    return defaultSiteConfig.description;
  },
  get url() {
    return defaultSiteConfig.url;
  },
  get phone() {
    return activeSiteSettings?.phone || defaultSiteConfig.phone;
  },
  get whatsapp() {
    return activeSiteSettings?.whatsapp || defaultSiteConfig.whatsapp;
  },
  get email() {
    return activeSiteSettings?.email || defaultSiteConfig.email;
  },
  get address() {
    return activeSiteSettings?.address || defaultSiteConfig.address;
  },
  get city() {
    return defaultSiteConfig.city;
  },
  get state() {
    return defaultSiteConfig.state;
  },
  get country() {
    return defaultSiteConfig.country;
  },
  get googleMapsUrl() {
    return activeSiteSettings?.googleMapsUrl || defaultSiteConfig.googleMapsUrl;
  },
  get googleMapsEmbedUrl() {
    return defaultSiteConfig.googleMapsEmbedUrl;
  },
  get serviceTimes() {
    return defaultSiteConfig.serviceTimes;
  },
  get sundayServiceTime() {
    return defaultSiteConfig.sundayServiceTime;
  },
  get midweekServiceTime() {
    return defaultSiteConfig.midweekServiceTime;
  },
  get sundaySchedule() {
    return defaultSiteConfig.sundaySchedule;
  },
  get midweekSchedule() {
    return defaultSiteConfig.midweekSchedule;
  },
  get vision() {
    return defaultSiteConfig.vision;
  },
  get mission() {
    return defaultSiteConfig.mission;
  },
  get bankName() {
    return activeSiteSettings?.bankName || defaultSiteConfig.bankName;
  },
  get accountName() {
    return activeSiteSettings?.accountName || defaultSiteConfig.accountName;
  },
  get accountNumber() {
    return activeSiteSettings?.accountNumber || defaultSiteConfig.accountNumber;
  },
  get facebook() {
    return activeSiteSettings?.facebookUrl ?? defaultSiteConfig.facebook;
  },
  get tiktok() {
    return activeSiteSettings?.tiktokUrl ?? defaultSiteConfig.tiktok;
  },
  get youtube() {
    return activeSiteSettings?.youtubeUrl ?? defaultSiteConfig.youtube;
  },
  get instagram() {
    return activeSiteSettings?.instagramUrl ?? defaultSiteConfig.instagram;
  },
  get leadership() {
    return defaultSiteConfig.leadership;
  },
  get foundedYear() {
    return defaultSiteConfig.foundedYear;
  },
  get story() {
    return defaultSiteConfig.story;
  },
  get beliefs() {
    return defaultSiteConfig.beliefs;
  },

  // Formatted Action URLs
  get whatsAppUrl() {
    const num = normalizeWhatsAppNumber(this.whatsapp);
    return num ? `https://wa.me/${num}` : "https://wa.me/2349075602319";
  },
  get telUrl() {
    const num = normalizePhoneNumber(this.phone);
    return num ? `tel:${num}` : "tel:+2349075602319";
  },

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
