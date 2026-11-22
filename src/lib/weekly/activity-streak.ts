import { addUtcCalendarDays, isValidCalendarDate } from "@/lib/measurements/calendar-date";
import { mondayOnOrBefore } from "@/lib/weekly/week-math";

export type ActivityStreakGraceLeft = 0 | 1;

export type ActivityStreakResult = {
  /** Hit days counted in the current streak (forgiven misses add 0). */
  days: number;
  /**
   * Grace remaining in the current Monday–Sunday week.
   * `null` when `days` is 0 (UI hides the grace line).
   */
  graceLeft: ActivityStreakGraceLeft | null;
};

/**
 * Union journal and workout calendar days into one hit set.
 * The same day from both sources counts once. Empty workout list is fine.
 */
export function unionActivityHitDates(
  journalDates: readonly string[],
  workoutDates: readonly string[] = [],
): string[] {
  const hits = new Set<string>();
  for (const date of journalDates) {
    if (isValidCalendarDate(date)) {
      hits.add(date);
    }
  }
  for (const date of workoutDates) {
    if (isValidCalendarDate(date)) {
      hits.add(date);
    }
  }
  return [...hits].sort();
}

/**
 * Activity streak (ADR-014). Pure: no clock, no database.
 * Walks backward from today (if hit) or yesterday (if today is open).
 * One grace miss per Monday–Sunday week; a second miss in that week stops.
 */
export function computeActivityStreak(
  today: string,
  hitDates: readonly string[],
): ActivityStreakResult {
  if (!isValidCalendarDate(today)) {
    throw new Error(`Invalid calendar date: ${today}`);
  }

  const hitSet = new Set<string>();
  for (const date of hitDates) {
    if (!isValidCalendarDate(date)) continue;
    if (date > today) continue;
    hitSet.add(date);
  }

  if (hitSet.size === 0) {
    return { days: 0, graceLeft: null };
  }

  let earliest = today;
  for (const date of hitSet) {
    if (date < earliest) earliest = date;
  }

  const todayIsHit = hitSet.has(today);
  let cursor = todayIsHit ? today : addUtcCalendarDays(today, -1);
  let days = 0;
  const graceUsedByWeek = new Map<string, boolean>();

  while (cursor >= earliest) {
    if (hitSet.has(cursor)) {
      days += 1;
    } else {
      const weekStart = mondayOnOrBefore(cursor);
      if (graceUsedByWeek.get(weekStart)) {
        break;
      }
      graceUsedByWeek.set(weekStart, true);
    }
    cursor = addUtcCalendarDays(cursor, -1);
  }

  if (days === 0) {
    return { days: 0, graceLeft: null };
  }

  return {
    days,
    graceLeft: graceLeftForWeek(today, earliest, hitSet),
  };
}

/**
 * Grace left for the current week: any miss from week_start through yesterday
 * that is on or after `earliest` consumes the week’s grace display.
 */
function graceLeftForWeek(
  today: string,
  earliest: string,
  hitSet: ReadonlySet<string>,
): ActivityStreakGraceLeft {
  const weekStart = mondayOnOrBefore(today);
  const yesterday = addUtcCalendarDays(today, -1);
  let cursor = weekStart;

  while (cursor <= yesterday) {
    if (cursor >= earliest && !hitSet.has(cursor)) {
      return 0;
    }
    cursor = addUtcCalendarDays(cursor, 1);
  }

  return 1;
}
