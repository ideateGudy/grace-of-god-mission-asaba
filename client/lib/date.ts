const dateTimeParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function toLagosDateTimeInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const parts = Object.fromEntries(dateTimeParts.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fromLagosDateTimeInput(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // If already an ISO 8601 string (e.g., from DB: 2026-10-28T10:00:00.000Z), parse directly
  if (trimmed.includes("Z") || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // If from HTML datetime-local: "YYYY-MM-DDTHH:mm" or "YYYY-MM-DDTHH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/.test(trimmed)) {
    const hasSeconds = /:\d{2}:\d{2}/.test(trimmed);
    const withSec = hasSeconds ? trimmed : `${trimmed}:00`;
    // Lagos is UTC+1 (WAT)
    const d = new Date(`${withSec}+01:00`);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }

  // Fallback direct Date parse
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback.toISOString();
}
