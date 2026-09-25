import { describe, expect, it } from "vitest";
import {
  createMeasurementSchema,
  formatMeasurementValidationErrors,
  listMeasurementsSchema,
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

describe("listMeasurementsSchema", () => {
  it("defaults to newest-first with no filters", () => {
    const result = listMeasurementsSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        sort_order: "newest",
        page_size: 25,
      });
    }
  });

  it("normalizes type, date-only bounds, and oldest-first sorting", () => {
    const result = listMeasurementsSchema.safeParse({
      measurement_type: "weight",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      sort_order: "oldest",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        measurement_type: "weight",
        start_date: {
          value: "2026-09-01T00:00:00.000Z",
          dateOnly: true,
        },
        end_date: {
          value: "2026-10-01T00:00:00.000Z",
          dateOnly: true,
        },
        sort_order: "oldest",
        page_size: 25,
      });
    }
  });

  it("keeps date-time end bounds inclusive", () => {
    const result = listMeasurementsSchema.safeParse({
      start_date: "2026-09-23T08:00:00-04:00",
      end_date: "2026-09-23T17:00:00-04:00",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.start_date).toEqual({
        value: "2026-09-23T12:00:00.000Z",
        dateOnly: false,
      });
      expect(result.data.end_date).toEqual({
        value: "2026-09-23T21:00:00.000Z",
        dateOnly: false,
      });
    }
  });

  it.each([
    [{ measurement_type: "height" }, "measurement_type"],
    [{ sort_order: "largest" }, "sort_order"],
    [{ start_date: "not-a-date" }, "start_date"],
    [{ page_size: 0 }, "page_size"],
    [{ page_size: 101 }, "page_size"],
    [{ page_size: 1.5 }, "page_size"],
    [{ cursor: "not-a-cursor" }, "cursor"],
  ])("rejects invalid filter %#", (input, field) => {
    const result = listMeasurementsSchema.safeParse(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatMeasurementValidationErrors(result.error)[field]).toBeTruthy();
    }
  });

  it("rejects a date range whose end precedes its start", () => {
    const result = listMeasurementsSchema.safeParse({
      start_date: "2026-10-01",
      end_date: "2026-09-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatMeasurementValidationErrors(result.error).end_date).toBe(
        "End date must be on or after start date.",
      );
    }
  });
});
