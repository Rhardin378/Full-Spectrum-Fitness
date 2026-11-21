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

/** Check-in week being submitted: Monday of last completed week. */
export function lastCompletedWeekStart(today: string): string {
  return addUtcCalendarDays(mondayOnOrBefore(today), -7);
}

/** Intention week for journal/Mind and the next intention on submit. */
export function currentIntentionWeekStart(today: string): string {
  return mondayOnOrBefore(today);
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
