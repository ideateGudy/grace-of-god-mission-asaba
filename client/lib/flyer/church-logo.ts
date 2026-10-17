/**
 * Church Logo Utility
 * Provides the official Grace of God Mission Asaba emblem
 * as both standard path and client-cached base64 Data URL for zero-taint canvas exports.
 */

export const CHURCH_LOGO_PATH = "/ggm_logo.png";

let memoryLogoDataUrl: string | null = null;

export async function getChurchLogoDataUrl(): Promise<string> {
  if (memoryLogoDataUrl) return memoryLogoDataUrl;
  if (typeof window === "undefined") return CHURCH_LOGO_PATH;

  try {
    const res = await fetch(CHURCH_LOGO_PATH);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        memoryLogoDataUrl = reader.result as string;
        resolve(memoryLogoDataUrl);
      };
      reader.onerror = () => resolve(CHURCH_LOGO_PATH);
      reader.readAsDataURL(blob);
    });
  } catch {
    return CHURCH_LOGO_PATH;
  }
}
