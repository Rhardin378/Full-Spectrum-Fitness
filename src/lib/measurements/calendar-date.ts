export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidCalendarDate(value: string): boolean {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function utcTodayISODate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addUtcCalendarDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Shift a YYYY-MM-DD by whole calendar months in UTC.
 * The day clamps to the target month (Mar 31 minus 1 month is Feb 28/29)
 * so the result stays a real calendar day in every timezone.
 */
export function addUtcCalendarMonths(isoDate: string, months: number): string {
  if (!isValidCalendarDate(isoDate) || !Number.isInteger(months)) {
    return isoDate;
  }

  const year = Number(isoDate.slice(0, 4));
  const monthIndex = Number(isoDate.slice(5, 7)) - 1;
  const day = Number(isoDate.slice(8, 10));
  const targetMonthIndex = monthIndex + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(
    Date.UTC(targetYear, normalizedMonth + 1, 0),
  ).getUTCDate();
  const clampedDay = Math.min(day, lastDay);

  return new Date(Date.UTC(targetYear, normalizedMonth, clampedDay))
    .toISOString()
    .slice(0, 10);
}

export function calendarDateInTimeZone(
  now: Date,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return utcTodayISODate(now);
  }

  return `${year}-${month}-${day}`;
}

/** Local calendar date for date pickers. Follows the runtime timezone. */
export function todayLocalISODate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatCalendarDate(
  isoDate: string,
  locale = "en-US",
): string {
  if (!isValidCalendarDate(isoDate)) {
    return isoDate;
  }

  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function calendarDateToUtcMidnight(isoDate: string): string {
  return `${isoDate}T00:00:00.000Z`;
}

export function calendarDateTimestamp(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00.000Z`).getTime();
}

export function maxAllowedMeasuredOn(now: Date = new Date()): string {
  return addUtcCalendarDays(utcTodayISODate(now), 1);
}
