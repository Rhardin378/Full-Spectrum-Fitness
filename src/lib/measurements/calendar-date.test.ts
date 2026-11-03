import { describe, expect, it } from "vitest";
import {
  addUtcCalendarMonths,
  calendarDateInTimeZone,
  formatCalendarDate,
  isValidCalendarDate,
  maxAllowedMeasuredOn,
  todayLocalISODate,
  utcTodayISODate,
} from "@/lib/measurements/calendar-date";

describe("calendar dates", () => {
  const eveningUtc = new Date("2026-10-05T00:30:00.000Z");

  it("accepts real calendar days and rejects impossible ones", () => {
    expect(isValidCalendarDate("2026-10-04")).toBe(true);
    expect(isValidCalendarDate("2026-02-30")).toBe(false);
    expect(isValidCalendarDate("2026-10-04T00:00:00.000Z")).toBe(false);
  });

  it("formats YYYY-MM-DD as the same calendar day in every timezone", () => {
    expect(formatCalendarDate("2026-10-04")).toBe("Oct 4, 2026");
  });

  it("keeps Oct 4 as Oct 4 after 7 PM US Central (UTC already Oct 5)", () => {
    expect(utcTodayISODate(eveningUtc)).toBe("2026-10-05");
    expect(calendarDateInTimeZone(eveningUtc, "America/Chicago")).toBe(
      "2026-10-04",
    );
    expect(calendarDateInTimeZone(eveningUtc, "Pacific/Auckland")).toBe(
      "2026-10-05",
    );
    expect(calendarDateInTimeZone(eveningUtc, "UTC")).toBe("2026-10-05");
  });

  it("uses the runtime local date for the picker default", () => {
    expect(todayLocalISODate(eveningUtc)).toBe(
      calendarDateInTimeZone(
        eveningUtc,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ),
    );
  });

  it("allows at most one day past UTC today", () => {
    expect(maxAllowedMeasuredOn(eveningUtc)).toBe("2026-10-06");
  });

  it("shifts calendar months in UTC and clamps short months", () => {
    expect(addUtcCalendarMonths("2026-11-03", -6)).toBe("2026-05-03");
    expect(addUtcCalendarMonths("2026-11-03", -12)).toBe("2025-11-03");
    expect(addUtcCalendarMonths("2026-03-31", -6)).toBe("2025-09-30");
    expect(addUtcCalendarMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(addUtcCalendarMonths("2024-02-29", -12)).toBe("2023-02-28");
    expect(addUtcCalendarMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addUtcCalendarMonths("2026-01-15", -6)).toBe("2025-07-15");
  });
});
