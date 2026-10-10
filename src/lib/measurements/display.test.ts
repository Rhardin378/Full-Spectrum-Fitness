import { describe, expect, it } from "vitest";
import {
  formatMeasuredOnDisplay,
  formatMeasurementValue,
  measurementTypeLabel,
  parsePositiveDecimal,
  toDateInputValue,
} from "@/lib/measurements/display";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";

describe("measurement display helpers", () => {
  it("labels measurement types", () => {
    expect(measurementTypeLabel("weight")).toBe("Weight");
    expect(measurementTypeLabel("waist")).toBe("Waist");
  });

  it("formats values with units", () => {
    expect(formatMeasurementValue(182.4, "lb")).toBe("182.4 lb");
    expect(formatMeasurementValue(32, "in")).toBe("32 in");
  });

  it("parses positive decimals with up to two places", () => {
    expect(parsePositiveDecimal("182.4")).toBe(182.4);
    expect(parsePositiveDecimal("0")).toBeNull();
    expect(parsePositiveDecimal("-1")).toBeNull();
    expect(parsePositiveDecimal("1.234")).toBeNull();
    expect(parsePositiveDecimal("")).toBeNull();
  });

  it("displays a calendar date without shifting the day", () => {
    expect(formatMeasuredOnDisplay("2026-10-04")).toBe("Oct 4, 2026");
  });

  it("defaults the date picker to local today, not UTC today", () => {
    const eveningUtc = new Date("2026-10-05T00:30:00.000Z");
    expect(toDateInputValue(eveningUtc)).toBe(todayLocalISODate(eveningUtc));
  });
});
