/**
 * Utility functions for formatting sermon presentation details,
 * dates, and service labels.
 */

/**
 * Returns an accurate service badge label based on the sermon's series
 * or the actual day of the week it was preached.
 */
export function getSermonServiceBadge(preachedAt?: string | null, series?: string | null): string {
  if (series && series.trim()) {
    return series.trim();
  }

  if (!preachedAt) {
    return "Message";
  }

  try {
    const date = new Date(preachedAt);
    if (isNaN(date.getTime())) return "Message";

    // Format weekday in Nigeria Lagos timezone
    const day = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Africa/Lagos",
    }).format(date);

    switch (day) {
      case "Sunday":
        return "Sunday Message";
      case "Wednesday":
        return "Midweek Teaching";
      case "Friday":
        return "Friday Vigil";
      case "Saturday":
        return "Saturday Fellowship";
      case "Thursday":
        return "Thursday Teaching";
      case "Tuesday":
        return "Tuesday Fellowship";
      case "Monday":
        return "Monday Encounter";
      default:
        return `${day} Message`;
    }
  } catch {
    return "Message";
  }
}

/**
 * Formats a date with the accurate day of the week (e.g. "Sun, 25 Oct 2026", "Thu, 27 Aug 2020").
 */
export function formatSermonDate(preachedAt?: string | null, includeWeekday: boolean = true): string {
  if (!preachedAt) return "";

  try {
    const date = new Date(preachedAt);
    if (isNaN(date.getTime())) return "";

    if (includeWeekday) {
      return new Intl.DateTimeFormat("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Lagos",
      }).format(date);
    }

    return new Intl.DateTimeFormat("en-NG", {
      dateStyle: "medium",
      timeZone: "Africa/Lagos",
    }).format(date);
  } catch {
    return "";
  }
}
