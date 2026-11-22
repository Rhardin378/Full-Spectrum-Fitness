import { describe, expect, it } from "vitest";
import type { JournalEntry } from "@/lib/journal/types";
import {
  buildMindWindowStats,
  rollingMindWindowStart,
  weekdayLettersForWindow,
} from "@/lib/journal/mind-window";

function entry(
  overrides: Partial<JournalEntry> & Pick<JournalEntry, "entry_on" | "mood">,
): JournalEntry {
  return {
    id: overrides.entry_on,
    user_id: "user-1",
    reflection: "note",
    stress: null,
    energy: null,
    win: null,
    grateful_for: null,
    domains: [],
    created_at: "2026-11-22T12:00:00.000Z",
    updated_at: "2026-11-22T12:00:00.000Z",
    ...overrides,
  };
}

describe("mind window", () => {
  it("starts six days before today", () => {
    expect(rollingMindWindowStart("2026-11-22")).toBe("2026-11-16");
  });

  it("averages mood and builds sparkline for the rolling window only", () => {
    const stats = buildMindWindowStats(
      [
        entry({ entry_on: "2026-11-15", mood: 2, domains: ["career"] }),
        entry({
          entry_on: "2026-11-16",
          mood: 8,
          domains: ["career", "learning"],
        }),
        entry({ entry_on: "2026-11-22", mood: 6, domains: ["family_relationships"] }),
      ],
      "2026-11-22",
    );

    expect(stats.windowStart).toBe("2026-11-16");
    expect(stats.averageMood).toBe(7);
    expect(stats.domainsTouched.map((item) => item.label)).toEqual([
      "Family",
      "Career",
      "Learning",
    ]);
    expect(stats.lastEntryOn).toBe("2026-11-22");
    expect(stats.sparkline).toEqual([8, null, null, null, null, null, 6]);
  });

  it("labels weekdays from the window start", () => {
    // 2026-11-16 is a Monday
    expect(weekdayLettersForWindow("2026-11-16")).toEqual([
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
      "S",
    ]);
    // 2026-11-15 is a Sunday
    expect(weekdayLettersForWindow("2026-11-15")).toEqual([
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ]);
  });
});
