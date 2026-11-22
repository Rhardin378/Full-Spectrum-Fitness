import { describe, expect, it } from "vitest";
import { calendarDateInTimeZone } from "@/lib/measurements/calendar-date";
import {
  cappedEditableUntil,
  currentIntentionWeekStart,
  editableUntil,
  isCheckInDue,
  isMonday,
  isSunday,
  lastCompletedWeekStart,
  mondayOnOrBefore,
} from "@/lib/weekly/week-math";

describe("week math", () => {
  it("locks the README Tuesday fixture", () => {
    const today = "2026-11-03";
    expect(mondayOnOrBefore(today)).toBe("2026-11-02");
    expect(lastCompletedWeekStart(today)).toBe("2026-10-26");
    expect(currentIntentionWeekStart(today)).toBe("2026-11-02");
    expect(editableUntil(today)).toBe("2026-11-06");
  });

  it("on Sunday closes the week ending that day and opens next week’s intention", () => {
    expect(mondayOnOrBefore("2026-11-01")).toBe("2026-10-26");
    expect(isSunday("2026-11-01")).toBe(true);
    expect(lastCompletedWeekStart("2026-11-01")).toBe("2026-10-26");
    expect(currentIntentionWeekStart("2026-11-01")).toBe("2026-11-02");
  });

  it("on Saturday still closes the previous week", () => {
    expect(mondayOnOrBefore("2026-10-31")).toBe("2026-10-26");
    expect(lastCompletedWeekStart("2026-10-31")).toBe("2026-10-19");
    expect(currentIntentionWeekStart("2026-10-31")).toBe("2026-10-26");
  });

  it("starts a new week on Monday", () => {
    expect(mondayOnOrBefore("2026-11-02")).toBe("2026-11-02");
    expect(isMonday("2026-11-02")).toBe(true);
    expect(lastCompletedWeekStart("2026-11-02")).toBe("2026-10-26");
    expect(currentIntentionWeekStart("2026-11-02")).toBe("2026-11-02");
  });

  it("treats a late Sunday in America/Chicago as that calendar Sunday", () => {
    // 2026-11-02 04:30 UTC = 2026-11-01 22:30 CDT (UTC−5; DST ends 02:00 local that night).
    const chicagoSunday = calendarDateInTimeZone(
      new Date("2026-11-02T04:30:00.000Z"),
      "America/Chicago",
    );
    expect(chicagoSunday).toBe("2026-11-01");
    expect(lastCompletedWeekStart(chicagoSunday)).toBe("2026-10-26");
    expect(currentIntentionWeekStart(chicagoSunday)).toBe("2026-11-02");
  });

  it("treats editable_until as inclusive through the end day", () => {
    const editable = editableUntil("2026-11-03");
    expect(editable).toBe("2026-11-06");
    expect("2026-11-06" <= editable).toBe(true);
    expect("2026-11-07" <= editable).toBe(false);
  });

  it("detects Mondays for hardening validation", () => {
    expect(isMonday("2026-11-02")).toBe(true);
    expect(isMonday("2026-11-03")).toBe(false);
    expect(isMonday("not-a-date")).toBe(false);
  });

  it("marks check-in due only when the last completed week has no row", () => {
    expect(isCheckInDue("2026-11-03", false)).toBe(true);
    expect(isCheckInDue("2026-11-03", true)).toBe(false);
  });

  it("caps editable_until at the intention week's Sunday", () => {
    const weekStart = "2026-11-02";
    expect(cappedEditableUntil("2026-11-02", weekStart)).toBe("2026-11-05"); // Mon → +3
    expect(cappedEditableUntil("2026-11-06", weekStart)).toBe("2026-11-08"); // Fri → Sun
    expect(cappedEditableUntil("2026-11-08", weekStart)).toBe("2026-11-08"); // Sun → same day
  });

  it("on Sunday submit caps editable_until against the following Monday’s week", () => {
    // Created Sunday 2026-11-01 for intention week 2026-11-02.
    expect(cappedEditableUntil("2026-11-01", "2026-11-02")).toBe("2026-11-04");
  });
});
