import { describe, expect, it } from "vitest";
import { formatJournalDay } from "@/lib/journal/display";

describe("formatJournalDay", () => {
  it("formats the weekday and day in UTC", () => {
    expect(formatJournalDay("2026-11-03")).toBe("Tuesday, Nov 3");
    expect(formatJournalDay("2026-11-01")).toBe("Sunday, Nov 1");
  });

  it("returns invalid input unchanged", () => {
    expect(formatJournalDay("not-a-date")).toBe("not-a-date");
  });
});
