import type { StudioMediaItem } from "@ggm/types";
import { authFetch } from "@/lib/api/client";

export interface ServiceProjectDeck {
  id: string;
  name: string;
  date: string;
  items: StudioMediaItem[];
}

export const DEFAULT_CHURCH_SLIDES: StudioMediaItem[] = [
  {
    id: "welcome-slide",
    title: "WELCOME TO CHURCH · GRACE OF GOD MISSION",
    category: "flyer",
    url: "/images/flyers/sunday-celebration-hero.webp",
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "offering-slide",
    title: "TITHES & KINGDOM OFFERINGS · ZENITH BANK",
    category: "offering",
    url: "/images/flyers/communion-service-hero.webp",
    uploadedAt: new Date().toISOString(),
  },
  {
    id: "first-timers-slide",
    title: "WELCOME FIRST TIMERS · GLAD TO HAVE YOU",
    category: "announcement",
    url: "/images/flyers/miracle-vigil-hero.webp",
    uploadedAt: new Date().toISOString(),
  },
];

const DECKS_STORAGE_KEY = "ggm_broadcast_service_decks_v1";

export function loadSavedProjectDecks(): ServiceProjectDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // Provide initial default Sunday service project
  return [
    {
      id: "sunday-service-default",
      name: "Sunday Celebration Service Project",
      date: new Date().toISOString().split("T")[0],
      items: DEFAULT_CHURCH_SLIDES,
    },
  ];
}

export function saveProjectDeck(deck: ServiceProjectDeck): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadSavedProjectDecks();
    const index = existing.findIndex((d) => d.id === deck.id);
    if (index >= 0) {
      existing[index] = deck;
    } else {
      existing.unshift(deck);
    }
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(existing));
  } catch {}
}

export function exportDeckToJson(deck: ServiceProjectDeck): string {
  return JSON.stringify(deck, null, 2);
}

export function importDeckFromJson(jsonStr: string): ServiceProjectDeck | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.name === "string" && Array.isArray(parsed.items)) {
      return {
        id: parsed.id || `deck_${Date.now()}`,
        name: parsed.name,
        date: parsed.date || new Date().toISOString().split("T")[0],
        items: parsed.items,
      };
    }
  } catch {}
  return null;
}

/**
 * Upload an image file directly to Cloudinary using signed credentials
 */
export async function uploadMediaToCloudinary(
  file: File,
  scope: string = "gallery"
): Promise<string> {
  // 1. Request signed upload credentials from server
  const sigResponse = await authFetch("/api/v1/admin/uploads/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope }),
  });

  if (!sigResponse.ok) {
    const errorJson = await sigResponse.json().catch(() => null);
    throw new Error(errorJson?.message || "Failed to generate upload signature.");
  }

  const { data } = await sigResponse.json();

  // 2. Perform direct signed upload to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", data.apiKey);
  formData.append("timestamp", String(data.timestamp));
  formData.append("signature", data.signature);
  if (data.folder) formData.append("folder", data.folder);
  if (data.publicId) formData.append("public_id", data.publicId);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!uploadResponse.ok) {
    const uploadError = await uploadResponse.json().catch(() => null);
    throw new Error(uploadError?.error?.message || "Upload to Cloudinary failed.");
  }

  const uploadResult = await uploadResponse.json();
  return uploadResult.secure_url || uploadResult.url;
}
