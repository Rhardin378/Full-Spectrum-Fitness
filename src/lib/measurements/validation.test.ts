import { describe, expect, it } from "vitest";
import {
  createMeasurementSchema,
  formatMeasurementValidationErrors,
} from "@/lib/measurements/validation";

describe("createMeasurementSchema", () => {
  it("normalizes valid weight input", () => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: "weight",
      value: 175.5,
      unit: "lb",
      measured_at: "2026-09-23",
      notes: "  Morning reading  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.measured_at).toBe("2026-09-23T00:00:00.000Z");
      expect(result.data.notes).toBe("Morning reading");
    }
  });

  it("accepts and normalizes a valid waist date-time", () => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: "waist",
      value: 82.25,
      unit: "cm",
      measured_at: "2026-09-23T08:30:00-04:00",
      notes: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.measured_at).toBe("2026-09-23T12:30:00.000Z");
      expect(result.data.notes).toBeNull();
    }
  });

  it.each([
    ["weight", "cm", "Weight unit must be lb or kg."],
    ["waist", "kg", "Waist unit must be in or cm."],
  ])("rejects %s with the incompatible unit %s", (type, unit, message) => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: type,
      value: 100,
      unit,
      measured_at: "2026-09-23",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatMeasurementValidationErrors(result.error).unit).toBe(
        message,
      );
    }
  });

  it.each([
    [0, "Value must be greater than zero."],
    [-1, "Value must be greater than zero."],
    [1.234, "Value must have no more than two decimal places."],
    [1000000, "Value must be 999999.99 or less."],
  ])("rejects invalid value %s", (value, message) => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: "weight",
      value,
      unit: "lb",
      measured_at: "2026-09-23",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatMeasurementValidationErrors(result.error).value).toBe(
        message,
      );
    }
  });

  it.each([
    "not-a-date",
    "2026-02-30",
    "2026-09-23T08:30:00",
    "",
  ])("rejects invalid or ambiguous date %s", (measuredAt) => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: "weight",
      value: 175,
      unit: "lb",
      measured_at: measuredAt,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        formatMeasurementValidationErrors(result.error).measured_at,
      ).toBeTruthy();
    }
  });

  it("rejects a caller-supplied user_id", () => {
    const result = createMeasurementSchema.safeParse({
      user_id: "another-user",
      measurement_type: "weight",
      value: 175,
      unit: "lb",
      measured_at: "2026-09-23",
    });

    expect(result.success).toBe(false);
  });

  it("rejects notes that exceed the database limit", () => {
    const result = createMeasurementSchema.safeParse({
      measurement_type: "waist",
      value: 32,
      unit: "in",
      measured_at: "2026-09-23",
      notes: "x".repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatMeasurementValidationErrors(result.error).notes).toBe(
        "Notes must be 500 characters or fewer.",
      );
    }
  });
});
