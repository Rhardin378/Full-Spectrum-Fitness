import { describe, expect, it } from "vitest";
import {
  buildWeightTrendSummary,
  formatWeightTrendDelta,
  getWeightTrendDateRange,
} from "@/lib/measurements/trend";
import type { Measurement } from "@/lib/types/measurement";

function weightRow(
  overrides: Partial<Measurement> & Pick<Measurement, "id" | "value" | "measured_at">,
): Measurement {
  return {
    user_id: "user-1",
    measurement_type: "weight",
    unit: "lb",
    notes: null,
    created_at: overrides.measured_at,
    updated_at: overrides.measured_at,
    ...overrides,
  };
}

describe("getWeightTrendDateRange", () => {
  it("returns 30 inclusive calendar days in UTC", () => {
    const range = getWeightTrendDateRange(new Date("2026-09-28T15:00:00.000Z"));
    expect(range.end_date).toBe("2026-09-28");
    expect(range.start_date).toBe("2026-08-30");
  });
});

describe("buildWeightTrendSummary", () => {
  it("returns empty when no weight entries", () => {
    expect(
      buildWeightTrendSummary([
        {
          id: "w1",
          user_id: "u",
          measurement_type: "waist",
          value: 34,
          unit: "in",
          measured_at: "2026-09-01T00:00:00.000Z",
          notes: null,
          created_at: "2026-09-01T00:00:00.000Z",
          updated_at: "2026-09-01T00:00:00.000Z",
        },
      ]).status,
    ).toBe("empty");
  });

  it("charts only the latest entry unit and computes delta", () => {
    const summary = buildWeightTrendSummary([
      weightRow({
        id: "a",
        value: 183.1,
        measured_at: "2026-09-05T00:00:00.000Z",
      }),
      weightRow({
        id: "b",
        value: 180,
        measured_at: "2026-09-01T00:00:00.000Z",
        unit: "kg",
      }),
      weightRow({
        id: "c",
        value: 182.4,
        measured_at: "2026-09-12T00:00:00.000Z",
      }),
    ]);

    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") {
      return;
    }

    expect(summary.unit).toBe("lb");
    expect(summary.latestValue).toBe(182.4);
    expect(summary.points).toHaveLength(2);
    expect(summary.delta).toBe(-0.7);
    expect(formatWeightTrendDelta(summary.delta!, "lb")).toBe("-0.7 lb vs 30 days");
  });

  it("returns null delta with a single point", () => {
    const summary = buildWeightTrendSummary([
      weightRow({
        id: "solo",
        value: 182.4,
        measured_at: "2026-09-12T00:00:00.000Z",
      }),
    ]);

    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") {
      return;
    }

    expect(summary.delta).toBeNull();
    expect(summary.points).toHaveLength(1);
  });
});
