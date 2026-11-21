import { describe, expect, it } from "vitest";
import {
  currentIntentionWeekStart,
  editableUntil,
  isCheckInDue,
  isMonday,
  lastCompletedWeekStart,
  mondayOnOrBefore,
} from "@/lib/weekly/week-math";

describe("week math", () => {
  it("locks the README Tuesday fixture", () => {
    const today = "2026-11-03";
    expect(mondayOnOrBefore(today)).toBe("2026-11-02");
    expect(lastCompletedWeekStart(today)).toBe("2026-10-26");
    expect(currentIntentionWeekStart(today)).toBe("2026-11-02");
    expect(editableUntil(today)).toBe("2026-11-06");
  });

  it("keeps Sunday with the in-progress week", () => {
    expect(mondayOnOrBefore("2026-11-01")).toBe("2026-10-26");
    expect(lastCompletedWeekStart("2026-11-01")).toBe("2026-10-19");
    expect(currentIntentionWeekStart("2026-11-01")).toBe("2026-10-26");
  });

  it("starts a new week on Monday", () => {
    expect(mondayOnOrBefore("2026-11-02")).toBe("2026-11-02");
    expect(lastCompletedWeekStart("2026-11-02")).toBe("2026-10-26");
    expect(currentIntentionWeekStart("2026-11-02")).toBe("2026-11-02");
  });

  it("treats editable_until as inclusive through the end day", () => {
    const editable = editableUntil("2026-11-03");
    expect(editable).toBe("2026-11-06");
    expect("2026-11-06" <= editable).toBe(true);
    expect("2026-11-07" <= editable).toBe(false);
  });

  it("detects Mondays for hardening validation", () => {
    expect(isMonday("2026-11-02")).toBe(true);
    expect(isMonday("2026-11-03")).toBe(false);
    expect(isMonday("not-a-date")).toBe(false);
  });

  it("marks check-in due only when the last completed week has no row", () => {
    expect(isCheckInDue("2026-11-03", false)).toBe(true);
    expect(isCheckInDue("2026-11-03", true)).toBe(false);
  });
});
