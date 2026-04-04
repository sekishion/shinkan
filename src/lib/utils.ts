export const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function getWeekDates(baseDate: Date): Date[] {
  const monday = new Date(baseDate);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isToday(d: Date): boolean {
  return toISO(d) === toISO(new Date());
}

/** "12:00〜13:00" → { start: 12, end: 13 } / "18:30〜" → { start: 18.5, end: 19.5 } */
export function parseTimeRange(time: string): { start: number; end: number } {
  const parts = time.split("〜");
  const startStr = parts[0].trim();
  const endStr = parts[1]?.trim();

  const parseHM = (s: string): number => {
    const [h, m] = s.split(":").map(Number);
    return h + (m || 0) / 60;
  };

  const start = parseHM(startStr);
  const end = endStr && endStr.includes(":") ? parseHM(endStr) : start + 1;
  return { start, end: end > start ? end : start + 1 };
}
