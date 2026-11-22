/** Next 14 calendar days starting today (local). */
export function nextFourteenDays(from = new Date()): Date[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * Standard slots — max 6 for choice overload (§7 UX laws).
 * Midday window 10:00–15:00.
 */
export function standardTimeSlots(): number[] {
  return [10, 11, 12, 13, 14, 15];
}

/** Next 3 whole hours from now (ceil to next hour), for emergency. */
export function emergencyTimeSlots(from = new Date()): { date: Date; hour: number }[] {
  const slots: { date: Date; hour: number }[] = [];
  const cursor = new Date(from);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1);

  for (let i = 0; i < 3; i++) {
    const d = new Date(cursor);
    d.setHours(cursor.getHours() + i);
    slots.push({ date: d, hour: d.getHours() });
  }
  return slots;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Deterministic labels — avoids SSR/client locale hydration mismatches. */
export function formatDayLabel(date: Date, today = new Date()): string {
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

export function combineDateAndHour(date: Date, hour: number): Date {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
