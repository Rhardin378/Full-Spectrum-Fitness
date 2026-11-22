import { describe, expect, it } from "vitest";
import type { Measurement } from "@/lib/types/measurement";
import {
  buildWeightNowSummary,
  calendarDaysBetween,
  formatLoggedRelative,
  formatToGoalLine,
  formatWeightNowDeltaLabel,
  isChangeTowardGoal,
  roundHalfAwayFromZeroOneDecimal,
} from "@/lib/measurements/weight-now";

function weight(
  overrides: Partial<Measurement> &
    Pick<Measurement, "id" | "measured_on" | "value">,
): Measurement {
  return {
    user_id: "user-1",
    measurement_type: "weight",
    unit: "lb",
    measured_at: `${overrides.measured_on}T00:00:00.000Z`,
    notes: null,
    created_at: `${overrides.measured_on}T12:00:00.000Z`,
    updated_at: `${overrides.measured_on}T12:00:00.000Z`,
    deleted_at: null,
    ...overrides,
  };
}

describe("formatLoggedRelative", () => {
  it("covers 0, 1, and 2 calendar days", () => {
    expect(formatLoggedRelative("2026-11-12", "2026-11-12")).toBe(
      "Logged today",
    );
    expect(formatLoggedRelative("2026-11-12", "2026-11-11")).toBe(
      "Logged yesterday",
    );
    expect(formatLoggedRelative("2026-11-12", "2026-11-10")).toBe(
      "Logged 2 days ago",
    );
  });

  it("does not call a future measured_on “Logged today”", () => {
    expect(formatLoggedRelative("2026-11-12", "2026-11-13")).toBe(
      "Logged 1 day from now",
    );
  });
});

describe("roundHalfAwayFromZeroOneDecimal", () => {
  it("rounds half away from zero", () => {
    expect(roundHalfAwayFromZeroOneDecimal(1.25)).toBe(1.3);
    expect(roundHalfAwayFromZeroOneDecimal(-1.25)).toBe(-1.3);
    expect(roundHalfAwayFromZeroOneDecimal(1.24)).toBe(1.2);
    expect(roundHalfAwayFromZeroOneDecimal(1.15)).toBe(1.2);
    expect(roundHalfAwayFromZeroOneDecimal(-1.15)).toBe(-1.2);
  });
});

describe("30-day change", () => {
  it("uses a baseline exactly 30 days back", () => {
    const summary = buildWeightNowSummary(
      [
        weight({ id: "a", measured_on: "2026-11-12", value: 180 }),
        weight({ id: "b", measured_on: "2026-10-13", value: 183.1 }),
      ],
      "2026-11-12",
    );
    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") return;
    expect(summary.change30d?.delta).toBe(-3.1);
    expect(summary.change30d?.label).toBe("−3.1 lb over 30 days");
    expect(summary.change30d?.tone).toBe("muted");
  });

  it("omits the 30-day line when history is shorter than the lookback", () => {
    const summary = buildWeightNowSummary(
      [
        weight({ id: "a", measured_on: "2026-11-12", value: 180 }),
        weight({ id: "b", measured_on: "2026-10-20", value: 182 }),
      ],
      "2026-11-12",
    );
    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") return;
    expect(summary.change30d).toBeNull();
  });

  it("formats the unicode minus for a decrease", () => {
    expect(formatWeightNowDeltaLabel(-3.1, "lb")).toBe("−3.1 lb over 30 days");
    expect(formatWeightNowDeltaLabel(1.25, "kg")).toBe("+1.3 kg over 30 days");
  });
});

describe("goal helpers", () => {
  it("marks toward-goal vs away-from-goal", () => {
    expect(isChangeTowardGoal(-2, 180, 170)).toBe(true);
    expect(isChangeTowardGoal(2, 180, 170)).toBe(false);
    expect(isChangeTowardGoal(2, 160, 170)).toBe(true);
    expect(isChangeTowardGoal(0, 180, 170)).toBe(false);
  });

  it("omits to-goal on unit mismatch and shows distance when units match", () => {
    expect(formatToGoalLine(180, "lb", { target: 170, unit: "kg" })).toBeNull();
    expect(formatToGoalLine(180, "lb", { target: 170, unit: "lb" })).toBe(
      "10.0 lb to goal",
    );
    expect(formatToGoalLine(170, "lb", { target: 170, unit: "lb" })).toBe(
      "At your goal",
    );
  });

  it("uses the green tone only when the change moves toward the goal", () => {
    const toward = buildWeightNowSummary(
      [
        weight({ id: "a", measured_on: "2026-11-12", value: 180 }),
        weight({ id: "b", measured_on: "2026-10-13", value: 183 }),
      ],
      "2026-11-12",
      { target: 170, unit: "lb" },
    );
    expect(toward.status).toBe("ready");
    if (toward.status !== "ready") return;
    expect(toward.change30d?.tone).toBe("toward_goal");
    expect(toward.toGoalLine).toBe("10.0 lb to goal");

    const away = buildWeightNowSummary(
      [
        weight({ id: "a", measured_on: "2026-11-12", value: 184 }),
        weight({ id: "b", measured_on: "2026-10-13", value: 180 }),
      ],
      "2026-11-12",
      { target: 170, unit: "lb" },
    );
    expect(away.status).toBe("ready");
    if (away.status !== "ready") return;
    expect(away.change30d?.tone).toBe("muted");
  });
});

describe("calendarDaysBetween", () => {
  it("counts whole days", () => {
    expect(calendarDaysBetween("2026-11-10", "2026-11-12")).toBe(2);
  });
});

describe("buildWeightNowSummary empty and relative line", () => {
  it("returns empty with no weights", () => {
    expect(buildWeightNowSummary([], "2026-11-12")).toEqual({
      status: "empty",
    });
  });

  it("builds the relative line with the short date", () => {
    const summary = buildWeightNowSummary(
      [weight({ id: "a", measured_on: "2026-11-10", value: 180 })],
      "2026-11-12",
    );
    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") return;
    expect(summary.relativeLine).toBe("Logged 2 days ago · Nov 10");
  });

  it("ignores deleted rows", () => {
    const summary = buildWeightNowSummary(
      [
        weight({
          id: "gone",
          measured_on: "2026-11-12",
          value: 999,
          deleted_at: "2026-11-12T12:00:00.000Z",
        }),
        weight({ id: "keep", measured_on: "2026-11-10", value: 180 }),
      ],
      "2026-11-12",
    );
    expect(summary.status).toBe("ready");
    if (summary.status !== "ready") return;
    expect(summary.latest.id).toBe("keep");
  });
});
