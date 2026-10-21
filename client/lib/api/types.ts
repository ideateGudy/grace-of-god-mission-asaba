export type AdminRole = "SUPER_ADMIN" | "ADMIN";
export type Permission =
  | "SERMONS_MANAGE"
  | "EVENTS_MANAGE"
  | "ANNOUNCEMENTS_MANAGE"
  | "GALLERY_MANAGE"
  | "HERO_MANAGE"
  | "CONTACT_INBOX"
  | "PRAYER_INBOX"
  | "PROJECTS_MANAGE"
  | "GIVING_MANAGE"
  | "TESTIMONIES_MANAGE"
  | "DEVOTIONS_MANAGE"
  | "LIVESTREAM_MANAGE";

export type SessionUser = {
  id: string; email: string; name: string; role: AdminRole;
  permissions: Permission[];
  mustChangePassword: boolean;
};

export type HeroSlideDto = {
  id?: string; sortOrder: number;
  layout: "FULL_BLEED" | "SPLIT" | "TEXT_ONLY";
  align: "START" | "CENTER" | "END";
  title: string; subtitle: string | null;
  primaryLabel: string | null; primaryUrl: string | null;
  secondaryLabel: string | null; secondaryUrl: string | null;
  bgType: "IMAGE" | "COLOR" | "GRADIENT";
  bgColor: string | null; bgGradient: "dawn" | "daybreak" | "glow" | null;
  imageUrl: string | null; mobileImageUrl: string | null;
  imageAlt: string | null; imageDecorative: boolean;
  focalX: number; focalY: number; overlay: number;
  textTone: "LIGHT" | "DARK";
};

export type HeroDto = {
  id: string; name: string; mode: "SINGLE" | "CAROUSEL";
  autoplay: boolean; intervalSeconds: number;
  published: boolean; startsAt: string | null; endsAt: string | null;
  slides: HeroSlideDto[];
};

export type PublicHero = Omit<HeroDto, "name" | "published" | "startsAt" | "endsAt">;
export type HeroListItem = Pick<HeroDto, "id" | "name" | "mode" | "published" | "startsAt" | "endsAt"> & {
  status: "LIVE" | "SCHEDULED" | "DRAFT" | "ENDED"; slideCount: number; thumbnailUrl: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
};
