import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatWeeklyValidationErrors,
  submitWeekStartsSchema,
  submitWeeklyCheckInSchema,
  updateIntentionTextSchema,
} from "@/lib/weekly/validation";

const baseCheckIn = {
  today: "2026-11-03",
  stress: 5,
  energy: 6,
  physical_health: 7,
  mental_health: 7,
  family_relationships: 7,
  social: 7,
  career: 3,
  learning: 7,
  leisure: 7,
  intention_domain: "career" as const,
  intention_body: "Ship the schema",
};

describe("weekly validation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts omitted notes and habits as null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const parsed = submitWeeklyCheckInSchema.safeParse({
      ...baseCheckIn,
      notes: "  ",
      habits: null,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.notes).toBeNull();
      expect(parsed.data.habits).toBeNull();
    }
  });

  it("rejects notes over 1000 and intention body over 200", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const notes = submitWeeklyCheckInSchema.safeParse({
      ...baseCheckIn,
      notes: "n".repeat(1001),
    });
    expect(notes.success).toBe(false);

    const body = submitWeeklyCheckInSchema.safeParse({
      ...baseCheckIn,
      intention_body: "b".repeat(201),
    });
    expect(body.success).toBe(false);
  });

  it("requires Monday week starts for the derived RPC args", () => {
    expect(
      submitWeekStartsSchema.safeParse({
        week_start: "2026-10-26",
        p_next_week_start: "2026-11-02",
      }).success,
    ).toBe(true);

    const bad = submitWeekStartsSchema.safeParse({
      week_start: "2026-10-27",
      p_next_week_start: "2026-11-02",
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(formatWeeklyValidationErrors(bad.error).week_start).toMatch(
        /Monday/,
      );
    }
  });

  it("rejects unknown keys and domain on intention text updates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const withDomain = updateIntentionTextSchema.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      today: "2026-11-03",
      body: "Reword",
      domain: "career",
    });
    expect(withDomain.success).toBe(false);
  });
});
