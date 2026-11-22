import {
  formatCalendarDate,
  isValidCalendarDate,
} from "@/lib/measurements/calendar-date";

/** "Week of Oct 26, 2026 – Nov 1, 2026" using calendar-date formatting. */
export function formatWeekOfRange(weekStart: string, weekEnd: string): string {
  if (!isValidCalendarDate(weekStart) || !isValidCalendarDate(weekEnd)) {
    return `Week of ${weekStart} – ${weekEnd}`;
  }

  return `Week of ${formatCalendarDate(weekStart)} – ${formatCalendarDate(weekEnd)}`;
}

/** Intention label dates: "Oct 26, 2026–Nov 1, 2026" (en dash, no spaces around it). */
export function formatIntentionWeekLabel(
  weekStart: string,
  weekEnd: string,
): string {
  if (!isValidCalendarDate(weekStart) || !isValidCalendarDate(weekEnd)) {
    return `${weekStart}–${weekEnd}`;
  }

  return `${formatCalendarDate(weekStart)}–${formatCalendarDate(weekEnd)}`;
}
