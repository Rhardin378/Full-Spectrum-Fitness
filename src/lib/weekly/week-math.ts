import {
  addUtcCalendarDays,
  isValidCalendarDate,
} from "@/lib/measurements/calendar-date";

/**
 * Monday of the UTC calendar week that contains `isoDate`.
 * Week is Monday–Sunday.
 */
export function mondayOnOrBefore(isoDate: string): string {
  if (!isValidCalendarDate(isoDate)) {
    throw new Error(`Invalid calendar date: ${isoDate}`);
  }

  const date = new Date(`${isoDate}T00:00:00.000Z`);
  // getUTCDay: 0 = Sunday … 6 = Saturday. Distance back to Monday:
  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return addUtcCalendarDays(isoDate, -daysSinceMonday);
}

/** True when `isoDate` is a Monday (ISO dow 1). */
export function isMonday(isoDate: string): boolean {
  if (!isValidCalendarDate(isoDate)) return false;
  return new Date(`${isoDate}T00:00:00.000Z`).getUTCDay() === 1;
}

/** True when `isoDate` is a Sunday (ISO dow 0). */
export function isSunday(isoDate: string): boolean {
  if (!isValidCalendarDate(isoDate)) return false;
  return new Date(`${isoDate}T00:00:00.000Z`).getUTCDay() === 0;
}

/**
 * Check-in week being submitted (and the week the due card watches).
 *
 * Ryan, Nov 22 2026: a Sunday closes the Monday–Sunday week ending that day.
 * Monday–Saturday still close the previous completed week.
 */
export function lastCompletedWeekStart(today: string): string {
  const weekStart = mondayOnOrBefore(today);
  if (isSunday(today)) {
    return weekStart;
  }
  return addUtcCalendarDays(weekStart, -7);
}

/**
 * Intention week created on check-in submit (not the Mind/Journal display).
 *
 * On Sunday the new intention is for the following Monday’s week; otherwise
 * it is the Monday of the week that contains `today`. Display uses
 * `mondayOnOrBefore(today)` via `getCurrentIntention` so the current week’s
 * intention stays visible through Sunday.
 */
export function currentIntentionWeekStart(today: string): string {
  const weekStart = mondayOnOrBefore(today);
  if (isSunday(today)) {
    return addUtcCalendarDays(weekStart, 7);
  }
  return weekStart;
}

/** Inclusive last day the intention body may change (`createdOn` + 3). */
export function editableUntil(createdOn: string): string {
  return addUtcCalendarDays(createdOn, 3);
}

/**
 * `editable_until` written on create: created + 3 days, capped at the
 * intention week's Sunday (`weekStart` + 6).
 */
export function cappedEditableUntil(
  createdOn: string,
  weekStart: string,
): string {
  const raw = editableUntil(createdOn);
  const weekEnd = addUtcCalendarDays(weekStart, 6);
  return raw <= weekEnd ? raw : weekEnd;
}

/** Due when there is no check-in row for last completed week. */
export function isCheckInDue(
  _today: string,
  hasCheckInForLastCompletedWeek: boolean,
): boolean {
  return !hasCheckInForLastCompletedWeek;
}
