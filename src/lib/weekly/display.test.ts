import { describe, expect, it } from "vitest";
import {
  formatIntentionWeekLabel,
  formatWeekOfRange,
} from "@/lib/weekly/display";

describe("weekly display", () => {
  it("formats the check-in week subtitle with calendar dates", () => {
    expect(formatWeekOfRange("2026-10-26", "2026-11-01")).toBe(
      "Week of Oct 26, 2026 – Nov 1, 2026",
    );
  });

  it("formats the intention week label with an en dash", () => {
    expect(formatIntentionWeekLabel("2026-11-02", "2026-11-08")).toBe(
      "Nov 2, 2026–Nov 8, 2026",
    );
  });
});
