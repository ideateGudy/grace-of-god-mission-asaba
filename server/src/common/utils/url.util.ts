export function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  // Convert Google Drive sharing/viewing links to direct streaming/downloadable format
  const driveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^&]+&)*id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  return trimmed;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
