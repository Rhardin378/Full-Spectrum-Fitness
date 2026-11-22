import { afterEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const { listMeasurements } = vi.hoisted(() => ({
  listMeasurements: vi.fn(),
}));

vi.mock("@/lib/measurements/actions", () => ({
  listMeasurements,
}));

import {
  fetchWeightRowsForWeightNow,
  pageReachesWeightNowLookback,
} from "@/lib/measurements/weight-now-fetch";

function weight(
  id: string,
  measured_on: string,
  value = 180,
): Measurement {
  return {
    id,
    user_id: "user-1",
    measurement_type: "weight",
    value,
    unit: "lb",
    measured_on,
    measured_at: `${measured_on}T00:00:00.000Z`,
    notes: null,
    created_at: `${measured_on}T12:00:00.000Z`,
    updated_at: `${measured_on}T12:00:00.000Z`,
    deleted_at: null,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("pageReachesWeightNowLookback", () => {
  it("is true when the last row is on or before latest − 30 days", () => {
    expect(
      pageReachesWeightNowLookback(
        [weight("a", "2026-11-12"), weight("b", "2026-10-13")],
        "2026-11-12",
      ),
    ).toBe(true);
    expect(
      pageReachesWeightNowLookback(
        [weight("a", "2026-11-12"), weight("b", "2026-10-14")],
        "2026-11-12",
      ),
    ).toBe(false);
  });
});

describe("fetchWeightRowsForWeightNow", () => {
  it("stops paging once a page reaches the 30-day lookback", async () => {
    const page1 = Array.from({ length: 100 }, (_, index) =>
      weight(
        `p1-${index}`,
        // Newest first: Nov 12 down toward mid-October (still after lookback Oct 13)
        `2026-11-${String(12 - Math.floor(index / 20)).padStart(2, "0")}`,
      ),
    );
    // Force last row of page 1 still after lookback so we need page 2.
    page1[99] = weight("p1-last", "2026-10-20");

    const page2 = [
      weight("p2-0", "2026-10-15"),
      weight("p2-1", "2026-10-13"), // reaches lookback
      weight("p2-2", "2026-09-01"),
    ];

    listMeasurements
      .mockResolvedValueOnce({
        success: true,
        measurements: page1,
        next_cursor: "cursor-2",
        has_more: true,
      })
      .mockResolvedValueOnce({
        success: true,
        measurements: page2,
        next_cursor: "cursor-3",
        has_more: true,
      })
      .mockResolvedValueOnce({
        success: true,
        measurements: [weight("should-not-fetch", "2026-01-01")],
        next_cursor: null,
        has_more: false,
      });

    const result = await fetchWeightRowsForWeightNow();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(listMeasurements).toHaveBeenCalledTimes(2);
    expect(result.measurements).toHaveLength(103);
    expect(result.measurements.at(-1)?.id).toBe("p2-2");
  });
});
