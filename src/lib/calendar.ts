export const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function monthLabel(yearMonth: string): string {
  const [y, m] = (yearMonth || "").split("-").map(Number);
  if (!y || !m) return "";
  return capitalize(
    new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(new Date(y, m - 1, 1))
  );
}

interface Slot {
  timeLabel: string;
}

export function groupSlots<T extends Slot>(
  slots: T[]
): { label: string; slots: T[] }[] {
  const groups = [
    { label: "Matin", slots: [] as T[] },
    { label: "Après-midi", slots: [] as T[] },
    { label: "Soir", slots: [] as T[] },
  ];
  for (const s of slots) {
    const h = parseInt(s.timeLabel.split(":")[0], 10);
    if (h < 12) groups[0].slots.push(s);
    else if (h < 18) groups[1].slots.push(s);
    else groups[2].slots.push(s);
  }
  return groups.filter((g) => g.slots.length > 0);
}

export interface MonthCell {
  day: number;
  dateKey: string;
  available: boolean;
}

export function buildMonthGrid(
  yearMonth: string,
  availableDates: Set<string>
): (MonthCell | null)[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;

  const cells: (MonthCell | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${y}-${pad2(m)}-${pad2(d)}`;
    cells.push({ day: d, dateKey, available: availableDates.has(dateKey) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
