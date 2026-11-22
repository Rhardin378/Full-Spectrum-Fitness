import { describe, expect, it } from "vitest";
import {
  computeActivityStreak,
  unionActivityHitDates,
} from "@/lib/weekly/activity-streak";
import { mondayOnOrBefore } from "@/lib/weekly/week-math";

describe("unionActivityHitDates", () => {
  it("unions journal and workout days once, and leaves journal alone when workouts are empty", () => {
    expect(
      unionActivityHitDates(
        ["2026-11-10", "2026-11-12"],
        ["2026-11-12", "2026-11-11"],
      ),
    ).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);

    expect(unionActivityHitDates(["2026-11-09", "2026-11-10"], [])).toEqual([
      "2026-11-09",
      "2026-11-10",
    ]);
  });
});

describe("mondayOnOrBefore (Slice 2 Sunday/Monday fixture)", () => {
  it("keeps Sunday with the prior Monday and starts a week on Monday", () => {
    expect(mondayOnOrBefore("2026-11-01")).toBe("2026-10-26");
    expect(mondayOnOrBefore("2026-11-02")).toBe("2026-11-02");
  });
});

describe("computeActivityStreak", () => {
  const fixtures: Array<{
    today: string;
    hits: string[];
    days: number;
    graceLeft: 0 | 1 | null;
    label: string;
  }> = [
    {
      today: "2026-11-12",
      hits: ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12"],
      days: 4,
      graceLeft: 1,
      label: "four solid days, grace intact",
    },
    {
      today: "2026-11-12",
      hits: ["2026-11-09", "2026-11-10", "2026-11-12"],
      days: 3,
      graceLeft: 0,
      label: "one miss this week uses grace",
    },
    {
      today: "2026-11-12",
      hits: ["2026-11-11", "2026-11-12"],
      // Ticket table said grace 0; ADR-014 filters grace by earliest, so Mon/Tue
      // before the first hit do not consume grace → 1.
      days: 2,
      graceLeft: 1,
      label: "started mid-week; days before earliest are outside the streak",
    },
    {
      today: "2026-11-12",
      hits: [
        "2026-11-06",
        "2026-11-07",
        "2026-11-10",
        "2026-11-11",
        "2026-11-12",
      ],
      days: 5,
      graceLeft: 0,
      label: "Sunday and Monday misses are different weeks",
    },
    {
      today: "2026-11-12",
      hits: ["2026-11-09", "2026-11-10", "2026-11-11"],
      days: 3,
      graceLeft: 1,
      label: "today open does not add a day or use grace",
    },
    {
      today: "2026-11-12",
      hits: ["2026-11-09", "2026-11-10"],
      days: 2,
      graceLeft: 0,
      label: "today open and yesterday missed uses grace",
    },
    {
      today: "2026-11-12",
      hits: [],
      days: 0,
      graceLeft: null,
      label: "no hits",
    },
    {
      today: "2026-11-09",
      hits: [],
      days: 0,
      graceLeft: null,
      label: "Monday with no hits",
    },
    {
      today: "2026-11-09",
      hits: ["2026-11-09"],
      days: 1,
      graceLeft: 1,
      label: "Monday only",
    },
    {
      today: "2026-11-09",
      hits: ["2026-11-06", "2026-11-09"],
      days: 1,
      graceLeft: 1,
      label: "second miss in prior week stops before older hit",
    },
    {
      today: "2026-11-09",
      hits: ["2026-11-06", "2026-11-07", "2026-11-09"],
      days: 3,
      graceLeft: 1,
      label: "one miss in prior week is forgiven",
    },
    {
      today: "2026-11-12",
      hits: ["2026-11-12", "2026-11-13"],
      days: 1,
      graceLeft: 1,
      label: "hits after today are ignored",
    },
  ];

  it.each(fixtures)(
    "$label → $days days, grace $graceLeft",
    ({ today, hits, days, graceLeft }) => {
      expect(computeActivityStreak(today, hits)).toEqual({ days, graceLeft });
    },
  );

  it("lets Sunday and the following Monday each use one grace day", () => {
    // Week of 11-02: miss Sun 11-08 (grace). Week of 11-09: miss Mon 11-09 (grace).
    expect(
      computeActivityStreak("2026-11-10", [
        "2026-11-06",
        "2026-11-07",
        "2026-11-10",
      ]),
    ).toEqual({ days: 3, graceLeft: 0 });
  });
});
