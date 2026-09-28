import { describe, expect, it } from "vitest";
import {
  formatMeasurementValue,
  measurementTypeLabel,
  parsePositiveDecimal,
} from "@/lib/measurements/display";

describe("measurement display helpers", () => {
  it("labels measurement types", () => {
    expect(measurementTypeLabel("weight")).toBe("Weight");
    expect(measurementTypeLabel("waist")).toBe("Waist");
  });

  it("formats values with units", () => {
    expect(formatMeasurementValue(182.4, "lb")).toBe("182.4 lb");
    expect(formatMeasurementValue(32, "in")).toBe("32 in");
  });

  it("parses positive decimals with up to two places", () => {
    expect(parsePositiveDecimal("182.4")).toBe(182.4);
    expect(parsePositiveDecimal("0")).toBeNull();
    expect(parsePositiveDecimal("-1")).toBeNull();
    expect(parsePositiveDecimal("1.234")).toBeNull();
    expect(parsePositiveDecimal("")).toBeNull();
  });
});
