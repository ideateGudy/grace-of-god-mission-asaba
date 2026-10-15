const dateTimeParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function toLagosDateTimeInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const parts = Object.fromEntries(dateTimeParts.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fromLagosDateTimeInput(value: string) {
  return value ? new Date(`${value}:00+01:00`).toISOString() : null;
}
