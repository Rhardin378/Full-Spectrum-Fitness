import { describe, expect, it } from "vitest";
import { buildWeekRecap, roundMoodAverage } from "@/lib/journal/recap";

describe("buildWeekRecap", () => {
  it("rounds average mood half away from zero to one decimal", () => {
    expect(roundMoodAverage(5 / 3)).toBe(1.7);
    expect(roundMoodAverage(4 / 3)).toBe(1.3);

    const withEntries = buildWeekRecap(
      [
        { entry_on: "2026-10-26", mood: 1, domains: [] },
        { entry_on: "2026-10-27", mood: 2, domains: [] },
        { entry_on: "2026-10-28", mood: 2, domains: [] },
      ],
      "2026-10-26",
    );
    expect(withEntries.averageMood).toBe(1.7);

    const other = buildWeekRecap(
      [
        { entry_on: "2026-10-26", mood: 1, domains: [] },
        { entry_on: "2026-10-27", mood: 1, domains: [] },
        { entry_on: "2026-10-28", mood: 2, domains: [] },
      ],
      "2026-10-26",
    );
    expect(other.averageMood).toBe(1.3);
  });

  it("returns null average and empty tops for an empty week", () => {
    const recap = buildWeekRecap([], "2026-10-26");
    expect(recap.averageMood).toBeNull();
    expect(recap.daysJournaled).toBe(0);
    expect(recap.topDomains).toEqual([]);
    expect(recap.sparkline).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("breaks top-domain ties with canonical slug order and short Family label", () => {
    const recap = buildWeekRecap(
      [
        {
          entry_on: "2026-10-26",
          mood: 5,
          domains: ["leisure", "family_relationships"],
        },
        {
          entry_on: "2026-10-27",
          mood: 6,
          domains: ["career", "family_relationships"],
        },
        {
          entry_on: "2026-10-28",
          mood: 7,
          domains: ["career", "leisure"],
        },
      ],
      "2026-10-26",
    );

    // family, career, leisure each appear twice → canonical order wins ties
    expect(recap.topDomains).toEqual([
      { domain: "family_relationships", label: "Family", count: 2 },
      { domain: "career", label: "Career", count: 2 },
    ]);
    expect(recap.daysJournaled).toBe(3);
    expect(recap.sparkline[0]).toBe(5);
    expect(recap.sparkline[1]).toBe(6);
    expect(recap.sparkline[2]).toBe(7);
    expect(recap.sparkline[3]).toBeNull();
  });

  it("ignores entries outside the check-in week window", () => {
    const recap = buildWeekRecap(
      [
        { entry_on: "2026-10-25", mood: 10, domains: ["career"] },
        { entry_on: "2026-10-26", mood: 4, domains: ["learning"] },
        { entry_on: "2026-11-02", mood: 9, domains: ["social"] },
      ],
      "2026-10-26",
    );

    expect(recap.daysJournaled).toBe(1);
    expect(recap.averageMood).toBe(4);
    expect(recap.topDomains).toEqual([
      { domain: "learning", label: "Learning", count: 1 },
    ]);
  });
});
