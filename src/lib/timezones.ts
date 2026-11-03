export const GUADELOUPE_TZ = "America/Guadeloupe";

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimezone(tz?: string | null): string {
  return tz && isValidTimezone(tz) ? tz : GUADELOUPE_TZ;
}

export function getTimezoneOffsetLabel(tz: string, date = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value;
    return part || "";
  } catch {
    return "";
  }
}

export function getTimezoneLabel(tz: string): string {
  const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;
  const offset = getTimezoneOffsetLabel(tz);
  return offset ? `${city} (${offset})` : city;
}

export function dateKeyInTimezone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

export function formatDateLabel(date: Date, timeZone: string): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Décale une clé de date « YYYY-MM-DD » de N jours (sans passer par UTC local). */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

function offsetMinutesAt(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second)
  );
  return (asUtc - at.getTime()) / 60000;
}

/**
 * Instant UTC correspondant à 00:00 locales d'une clé de date.
 * Sert à découper « demain » dans le fuseau de la boutique, jamais dans celui
 * du serveur (qui est en UTC).
 */
export function zonedMidnight(dateKey: string, timeZone: string): Date {
  const naive = new Date(`${dateKey}T00:00:00Z`);
  const offset = offsetMinutesAt(timeZone, naive);
  return new Date(naive.getTime() - offset * 60000);
}

/** Libellé long d'une clé de date dans un fuseau : « mercredi 5 novembre 2026 ». */
export function dateKeyLabel(dateKey: string, timeZone: string): string {
  const at = new Date(`${dateKey}T12:00:00Z`);
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(at);
}
