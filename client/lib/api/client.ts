import type { PublicHero } from "@ggm/types";

const IS_SERVER = typeof window === "undefined";
const MOCK_API = process.env.USE_MOCK_API === "true";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(endpoint: string, options?: RequestInit & { tags?: string[], revalidate?: number }): Promise<T> {
  const url = IS_SERVER 
    ? `${process.env.API_INTERNAL_URL || 'http://localhost:5000'}/api/v1${endpoint}`
    : `/api/v1${endpoint}`;

  if (MOCK_API) {
    if (endpoint === "/hero") return { data: null } as T;
    return { data: [], meta: { page: 1, limit: 12, total: 0 } } as T;
  }

  const { tags, revalidate = 60, ...rest } = options || {};
  
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...rest.headers,
      },
      ...(IS_SERVER && rest.cache !== "no-store" ? { next: { tags, revalidate } } : {})
    });
  } catch {
    if (!rest.method && rest.cache !== "no-store") {
      await new Promise((resolve) => setTimeout(resolve, 900));
      try {
        res = await fetch(url, {
          ...rest,
          headers: { "Content-Type": "application/json", ...rest.headers },
          ...(IS_SERVER ? { next: { tags, revalidate } } : {})
        });
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
    login: (data: { email: string; password: string }) => fetcher<{ data: { id: string; email: string; name: string; role: string; permissions: string[]; mustChangePassword: boolean } }>("/auth/login", { method: "POST", body: JSON.stringify(data), cache: "no-store" }),
    me: () => fetcher<{ data: { id: string; email: string; name: string; role: string; permissions: string[]; mustChangePassword: boolean } }>("/auth/me", { cache: "no-store" }),
    logout: () => fetcher<{ data: null }>("/auth/logout", { method: "POST", cache: "no-store" }),
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => fetcher<{ data: { mustChangePassword: boolean } }>("/auth/change-password", { method: "POST", body: JSON.stringify(data), cache: "no-store" }),
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
