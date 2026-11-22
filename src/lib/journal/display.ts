import { isValidCalendarDate } from "@/lib/measurements/calendar-date";

/** "Tuesday, Nov 3" for a YYYY-MM-DD, formatted in UTC so the day cannot shift. */
export function formatJournalDay(isoDate: string, locale = "en-US"): string {
  if (!isValidCalendarDate(isoDate)) {
    return isoDate;
  }

  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
