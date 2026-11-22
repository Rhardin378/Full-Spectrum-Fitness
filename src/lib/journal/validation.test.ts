import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatJournalValidationErrors,
  getWeekRecapSchema,
  saveJournalEntrySchema,
} from "@/lib/journal/validation";

describe("saveJournalEntrySchema", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts optional win and grateful_for as null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const parsed = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 7,
      reflection: "A solid day",
      domains: ["career"],
      win: "   ",
      grateful_for: null,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.win).toBeNull();
      expect(parsed.data.grateful_for).toBeNull();
    }
  });

  it("rejects mood outside 1–10 and reflection over 2000", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const mood = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 0,
      reflection: "ok",
    });
    expect(mood.success).toBe(false);
    if (!mood.success) {
      expect(formatJournalValidationErrors(mood.error).mood).toMatch(/1 and 10/);
    }

    const reflection = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 5,
      reflection: "x".repeat(2001),
    });
    expect(reflection.success).toBe(false);
  });

  it("accepts three domains, rejects four, and rejects today outside the slack window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const threeDomains = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 5,
      reflection: "ok",
      domains: ["career", "learning", "leisure"],
    });
    expect(threeDomains.success).toBe(true);

    const domains = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 5,
      reflection: "ok",
      domains: ["career", "learning", "leisure", "social"],
    });
    expect(domains.success).toBe(false);

    const today = saveJournalEntrySchema.safeParse({
      today: "2026-11-01",
      mood: 5,
      reflection: "ok",
    });
    expect(today.success).toBe(false);
    if (!today.success) {
      expect(formatJournalValidationErrors(today.error).today).toMatch(
        /one day/,
      );
    }
  });

  it("rejects a win longer than 200 characters", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    const parsed = saveJournalEntrySchema.safeParse({
      today: "2026-11-03",
      mood: 5,
      reflection: "ok",
      win: "w".repeat(201),
    });
    expect(parsed.success).toBe(false);
  });
});

describe("getWeekRecapSchema", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects null or non-object input via .strict()", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));

    expect(getWeekRecapSchema.safeParse(null).success).toBe(false);
    expect(getWeekRecapSchema.safeParse(undefined).success).toBe(false);
    expect(
      getWeekRecapSchema.safeParse({ today: "2026-11-03", extra: true }).success,
    ).toBe(false);
    expect(getWeekRecapSchema.safeParse({ today: "2026-11-03" }).success).toBe(
      true,
    );
  });
});
