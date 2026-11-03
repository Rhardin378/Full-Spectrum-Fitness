import { describe, expect, it } from "vitest";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import { getWeightTrendDateRange } from "@/lib/measurements/trend";
import {
  filterMeasurementsByWeightTrendRange,
  weightTrendRangeStartDate,
  type WeightTrendRange,
} from "@/lib/measurements/trend-range";

interface DatedEntry {
  id: string;
  measured_on: string;
  measured_at?: string;
}

const TODAY = "2026-11-03";

function entry(
  id: string,
  measuredOn: string,
  measuredAt = `${measuredOn}T00:00:00.000Z`,
): DatedEntry {
  return { id, measured_on: measuredOn, measured_at: measuredAt };
}

function ids(
  measurements: readonly DatedEntry[],
  range: WeightTrendRange,
  today = TODAY,
): string[] {
  return filterMeasurementsByWeightTrendRange(measurements, range, today).map(
    (item) => item.id,
  );
}

describe("weightTrendRangeStartDate", () => {
  it("matches the existing inclusive 30-day window", () => {
    const reference = new Date(2026, 10, 3, 12, 0, 0);
    const today = todayLocalISODate(reference);

    expect(weightTrendRangeStartDate("30d", today)).toBe(
      getWeightTrendDateRange(reference).start_date,
    );
    expect(weightTrendRangeStartDate("30d", TODAY)).toBe("2026-10-05");
    expect(weightTrendRangeStartDate("90d", TODAY)).toBe("2026-08-06");
  });

  it("steps calendar months and clamps month ends", () => {
    expect(weightTrendRangeStartDate("6m", TODAY)).toBe("2026-05-03");
    expect(weightTrendRangeStartDate("1y", TODAY)).toBe("2025-11-03");
    expect(weightTrendRangeStartDate("6m", "2026-03-31")).toBe("2025-09-30");
    expect(weightTrendRangeStartDate("1y", "2024-02-29")).toBe("2023-02-28");
    expect(weightTrendRangeStartDate("all", TODAY)).toBeNull();
    expect(weightTrendRangeStartDate("90d", "not-a-date")).toBeNull();
  });
});

describe("filterMeasurementsByWeightTrendRange", () => {
  const entries = [
    entry("before-30", "2026-10-04"),
    entry("start-30", "2026-10-05"),
    entry("before-90", "2026-08-05"),
    entry("start-90", "2026-08-06"),
    entry("today", "2026-11-03"),
    entry("tomorrow", "2026-11-04"),
    entry("before-6m", "2026-05-02"),
    entry("start-6m", "2026-05-03"),
    entry("before-1y", "2025-11-02"),
    entry("start-1y", "2025-11-03"),
    entry("ancient", "2020-01-01"),
  ];

  it("includes the start day and today, and excludes the days outside", () => {
    expect(ids(entries, "30d")).toEqual(["start-30", "today"]);
    expect(ids(entries, "90d")).toEqual([
      "before-30",
      "start-30",
      "start-90",
      "today",
    ]);
    expect(ids(entries, "6m")).toEqual([
      "before-30",
      "start-30",
      "before-90",
      "start-90",
      "today",
      "start-6m",
    ]);
    expect(ids(entries, "1y")).toEqual([
      "before-30",
      "start-30",
      "before-90",
      "start-90",
      "today",
      "before-6m",
      "start-6m",
      "start-1y",
    ]);
  });

  it("clamps 6M and 1Y boundaries on short months", () => {
    const monthEnd = [
      entry("clamp-in", "2025-09-30"),
      entry("clamp-out", "2025-09-29"),
      entry("today", "2026-03-31"),
    ];
    expect(ids(monthEnd, "6m", "2026-03-31")).toEqual(["clamp-in", "today"]);

    const leap = [
      entry("leap-in", "2023-02-28"),
      entry("leap-out", "2023-02-27"),
      entry("today", "2024-02-29"),
    ];
    expect(ids(leap, "1y", "2024-02-29")).toEqual(["leap-in", "today"]);
  });

  it("uses measured_on instead of a timestamp that would shift a timezone", () => {
    const eveningBeforeLocalDay = [
      entry("stored-day", "2026-10-05", "2026-10-05T00:00:00.000Z"),
      entry("previous-calendar-day", "2026-10-04", "2026-10-04T23:30:00.000Z"),
    ];

    expect(ids(eveningBeforeLocalDay, "30d")).toEqual(["stored-day"]);
  });

  it("returns every entry for All, including future and older days", () => {
    expect(ids(entries, "all")).toEqual(entries.map((item) => item.id));
  });

  it("returns an empty list when nothing was recorded", () => {
    expect(filterMeasurementsByWeightTrendRange([], "90d", TODAY)).toEqual([]);
    expect(filterMeasurementsByWeightTrendRange([], "all", TODAY)).toEqual([]);
  });

  it("returns an empty list when the window contains no entries", () => {
    const older = [entry("old", "2026-01-01")];
    expect(ids(older, "30d")).toEqual([]);
    expect(ids(older, "90d")).toEqual([]);
    expect(ids(older, "6m")).toEqual([]);
  });

  it("returns the points that exist when history is shorter than the range", () => {
    const sparse = [entry("one", "2026-11-01"), entry("two", "2026-11-03")];
    const filtered = filterMeasurementsByWeightTrendRange(sparse, "1y", TODAY);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((item) => item.id)).toEqual(["one", "two"]);
  });

  it("does not mutate the input list", () => {
    const snapshot = entries.map((item) => item.id);
    filterMeasurementsByWeightTrendRange(entries, "30d", TODAY);
    filterMeasurementsByWeightTrendRange(entries, "all", TODAY);
    expect(entries.map((item) => item.id)).toEqual(snapshot);
  });

  it("drops invalid calendar days from bounded ranges and keeps them for All", () => {
    const mixed = [
      entry("valid", "2026-11-03"),
      entry("invalid", "2026-11-03T00:00:00.000Z"),
    ];

    expect(ids(mixed, "30d")).toEqual(["valid"]);
    expect(ids(mixed, "all")).toEqual(["valid", "invalid"]);
  });

  it("returns nothing for a bounded range when today is not a calendar day", () => {
    expect(
      filterMeasurementsByWeightTrendRange(entries, "90d", "yesterday"),
    ).toEqual([]);
  });
});
