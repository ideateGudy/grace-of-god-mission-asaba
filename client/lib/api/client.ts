import type {
  PublicHero,
  SiteSettingsDto,
  UpdateSiteSettingsDto,
  PublicTestimonyDto,
  CreateTestimonyDto,
  DevotionDto,
  LivestreamStatusDto,
  UpdateLivestreamDto,
  PrayerWallItemDto,
} from "@ggm/types";

const IS_SERVER = typeof window === "undefined";
const MOCK_API = process.env.USE_MOCK_API === "true";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function silentRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("gom_refresh_token") : null;
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refreshToken ? { refreshToken } : {}),
        cache: "no-store",
      });
      if (res.ok) {
        const body = await res.json();
        if (typeof window !== "undefined") {
          if (body?.data?.accessToken) {
            localStorage.setItem("gom_access_token", body.data.accessToken);
          }
          if (body?.data?.refreshToken) {
            localStorage.setItem("gom_refresh_token", body.data.refreshToken);
          }
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const getHeaders = (token: string | null) => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type") && init?.method && init.method !== "GET" && init.method !== "HEAD") {
      headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("gom_access_token") : null;
  let res = await fetch(input, { ...init, headers: getHeaders(token) });

  if (res.status === 401 && typeof window !== "undefined") {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!urlStr.includes("/auth/login") && !urlStr.includes("/auth/refresh")) {
      const refreshed = await silentRefresh();
      if (refreshed) {
        const newToken = localStorage.getItem("gom_access_token");
        res = await fetch(input, { ...init, headers: getHeaders(newToken) });
      }
    }
  }

  return res;
}

async function fetcher<T>(endpoint: string, options?: RequestInit & { tags?: string[], revalidate?: number; timeoutMs?: number }): Promise<T> {
  const url = IS_SERVER 
    ? `${process.env.API_INTERNAL_URL || 'http://127.0.0.1:5000'}/api/v1${endpoint}`
    : `/api/v1${endpoint}`;

  if (MOCK_API) {
    if (endpoint === "/hero") return { data: null } as T;
    return { data: [], meta: { page: 1, limit: 12, total: 0 } } as T;
  }

  const { tags, revalidate = 60, timeoutMs = 4000, ...rest } = options || {};
  
  const getSignal = () => {
    if (rest.signal) return rest.signal;
    if (IS_SERVER && typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      return AbortSignal.timeout(timeoutMs);
    }
    return undefined;
  };

  let res: Response;
  try {
    if (IS_SERVER) {
      res = await fetch(url, {
        ...rest,
        signal: getSignal(),
        headers: {
          "Content-Type": "application/json",
          ...rest.headers,
        },
        ...(rest.cache !== "no-store" ? { next: { tags, revalidate } } : {})
      });
    } else {
      res = await authFetch(url, {
        ...rest,
        signal: getSignal(),
      });
    }
  } catch {
    if (!rest.method && rest.cache !== "no-store") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        if (IS_SERVER) {
          res = await fetch(url, {
            ...rest,
            signal: getSignal(),
            headers: { "Content-Type": "application/json", ...rest.headers },
            next: { tags, revalidate }
          });
        } else {
          res = await authFetch(url, {
            ...rest,
            signal: getSignal(),
          });
        }
      } catch {
        throw new ApiError(503, "The church website is waking up. Please try again shortly.");
      }
    } else {
      throw new ApiError(503, "The church website is temporarily unavailable.");
    }
  }

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const errBody = await res.json();
      msg = errBody.message || msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  auth: {
    login: async (data: { email: string; password: string; twoFactorCode?: string }) => {
      const result = await fetcher<{ data: { id: string; email: string; name: string; role: string; permissions: string[]; mustChangePassword: boolean; twoFactorEnabled?: boolean; requires2FA?: boolean; accessToken?: string; refreshToken?: string } }>("/auth/login", { method: "POST", body: JSON.stringify(data), cache: "no-store" });
      if (!IS_SERVER) {
        if (result?.data?.accessToken) localStorage.setItem("gom_access_token", result.data.accessToken);
        if (result?.data?.refreshToken) localStorage.setItem("gom_refresh_token", result.data.refreshToken);
      }
      return result;
    },
    refresh: async () => {
      const result = await fetcher<{ data: { id: string; email: string; name: string; role: string; permissions: string[]; mustChangePassword: boolean; twoFactorEnabled?: boolean; accessToken?: string; refreshToken?: string } }>("/auth/refresh", { method: "POST", cache: "no-store" });
      if (!IS_SERVER) {
        if (result?.data?.accessToken) localStorage.setItem("gom_access_token", result.data.accessToken);
        if (result?.data?.refreshToken) localStorage.setItem("gom_refresh_token", result.data.refreshToken);
      }
      return result;
    },
    me: () => fetcher<{ data: { id: string; email: string; name: string; role: string; permissions: string[]; mustChangePassword: boolean; twoFactorEnabled?: boolean } }>("/auth/me", { cache: "no-store" }),
    logout: async () => {
      try {
        await fetcher<{ data: null }>("/auth/logout", { method: "POST", cache: "no-store" });
      } finally {
        if (!IS_SERVER) {
          localStorage.removeItem("gom_access_token");
          localStorage.removeItem("gom_refresh_token");
        }
      }
      return { data: null };
    },
    changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword?: string }) => {
      const result = await fetcher<{ data: { mustChangePassword: boolean; accessToken?: string; refreshToken?: string } }>("/auth/change-password", { method: "POST", body: JSON.stringify(data), cache: "no-store" });
      if (!IS_SERVER) {
        if (result?.data?.accessToken) localStorage.setItem("gom_access_token", result.data.accessToken);
        if (result?.data?.refreshToken) localStorage.setItem("gom_refresh_token", result.data.refreshToken);
      }
      return result;
    },
    setup2fa: () => fetcher<{ data: { secret: string; otpauthUrl: string; qrCodeDataUrl: string } }>("/auth/2fa/setup", { method: "POST", cache: "no-store" }),
    enable2fa: (code: string) => fetcher<{ data: { success: boolean; twoFactorEnabled: boolean } }>("/auth/2fa/enable", { method: "POST", body: JSON.stringify({ code }), cache: "no-store" }),
    disable2fa: (code: string) => fetcher<{ data: { success: boolean; twoFactorEnabled: boolean } }>("/auth/2fa/disable", { method: "POST", body: JSON.stringify({ code }), cache: "no-store" }),
  },
  settings: {
    get: () => fetcher<{ data: SiteSettingsDto }>("/settings", { tags: ["settings"] }),
    update: (data: UpdateSiteSettingsDto) => fetcher<{ data: SiteSettingsDto }>("/admin/settings", { method: "PATCH", body: JSON.stringify(data), cache: "no-store" }),
  },
  hero: {
    getPublic: () => fetcher<{ data: PublicHero | null }>("/hero", { tags: ["hero"] }),
  },
  public: {
    sermons: (query = "") => fetcher<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/sermons${query}`, { tags: ["sermons"] }),
    sermon: (slug: string) => fetcher<{ data: Record<string, unknown> }>(`/sermons/${encodeURIComponent(slug)}`, { tags: ["sermons"] }),
    events: (query = "") => fetcher<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/events${query}`, { tags: ["events"] }),
    event: (slug: string) => fetcher<{ data: Record<string, unknown> }>(`/events/${encodeURIComponent(slug)}`, { tags: ["events"] }),
    announcements: () => fetcher<{ data: Record<string, unknown>[] }>("/announcements", { tags: ["announcements"] }),
    gallery: (query = "") => fetcher<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/gallery${query}`, { tags: ["gallery"] }),
    projects: (query = "") => fetcher<{ data: any[]; meta: { page: number; limit: number; total: number } }>(`/projects${query}`, { tags: ["projects"] }),
    project: (slug: string) => fetcher<{ data: any }>(`/projects/${encodeURIComponent(slug)}`, { tags: ["projects"] }),
    projectContributions: (slug: string, query = "") => fetcher<{ data: any[]; meta: { page: number; limit: number; total: number } }>(`/projects/${encodeURIComponent(slug)}/contributions${query}`, { tags: ["projects"] }),
  },
  testimonies: {
    list: (query = "") => fetcher<{ data: PublicTestimonyDto[]; meta: { page: number; limit: number; total: number } }>(`/testimonies${query}`, { tags: ["testimonies"] }),
    submit: (data: CreateTestimonyDto) => fetcher<{ success: boolean }>("/testimonies", { method: "POST", body: JSON.stringify(data), cache: "no-store" }),
  },
  devotions: {
    getToday: () => fetcher<{ data: DevotionDto | null }>("/devotions/today", { tags: ["devotions"] }),
    list: (query = "") => fetcher<{ data: DevotionDto[]; meta: { page: number; limit: number; total: number } }>(`/devotions${query}`, { tags: ["devotions"] }),
    get: (id: string) => fetcher<{ data: DevotionDto }>(`/devotions/${encodeURIComponent(id)}`, { tags: ["devotions"] }),
  },
  livestream: {
    get: () => fetcher<{ data: LivestreamStatusDto }>("/livestream", { tags: ["livestream"] }),
    update: (data: UpdateLivestreamDto) => fetcher<{ data: LivestreamStatusDto }>("/admin/livestream", { method: "PATCH", body: JSON.stringify(data), cache: "no-store" }),
  },
  giving: {
    getStatus: (reference: string) => fetcher<{ data: { status: string; reference: string; amountKobo: string; projectTitle: string; displayName: string; createdAt: string } }>(`/giving/status/${encodeURIComponent(reference)}`, { cache: "no-store" }),
  },
  prayerWall: {
    list: (query = "") => fetcher<{ data: PrayerWallItemDto[]; meta: { page: number; limit: number; total: number } }>(`/prayer-wall${query}`, { tags: ["prayer-wall"] }),
    pray: (id: string) => fetcher<{ data: { id: string; prayedCount: number } }>(`/prayer-wall/${encodeURIComponent(id)}/pray`, { method: "POST", cache: "no-store" }),
    updateApproval: (id: string, wallApproved: boolean) => fetcher<{ data: any }>(`/admin/prayer-requests/${encodeURIComponent(id)}/wall`, { method: "PATCH", body: JSON.stringify({ wallApproved }), cache: "no-store" }),
  },
  admin: {
    list: <T>(resource: string, query = "") => fetcher<{ data: T[]; meta?: { page: number; limit: number; total: number } }>(`/admin/${resource}${query}`, { cache: "no-store" }),
    get: <T>(resource: string, id: string) => fetcher<{ data: T }>(`/admin/${resource}/${encodeURIComponent(id)}`, { cache: "no-store" }),
    create: <T>(resource: string, data: unknown) => fetcher<{ data: T }>(`/admin/${resource}`, { method: "POST", body: JSON.stringify(data), cache: "no-store" }),
    update: <T>(resource: string, id: string, data: unknown) => fetcher<{ data: T }>(`/admin/${resource}/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data), cache: "no-store" }),
    remove: (resource: string, id: string) => fetcher<{ data: null }>(`/admin/${resource}/${encodeURIComponent(id)}`, { method: "DELETE", cache: "no-store" }),
    getUploadSignature: (scope = "gallery") => fetcher<{ data: { cloudName: string; apiKey: string; timestamp: number; folder: string; publicId: string; allowedFormats: string; signature: string } }>("/admin/uploads/signature", { method: "POST", body: JSON.stringify({ scope }), cache: "no-store" }),
  },
};
