import type { MeasurementType, MeasurementUnit } from "@/lib/types/measurement";

export function measurementTypeLabel(type: MeasurementType): string {
  return type === "weight" ? "Weight" : "Waist";
}

export function formatMeasurementValue(value: number, unit: MeasurementUnit): string {
  const formatted =
    Math.abs(value * 10 - Math.round(value * 10)) < 0.00000001
      ? value.toString()
      : value.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted} ${unit}`;
}

export function formatMeasuredAtDisplay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function toDateInputValue(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parsePositiveDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  if (Math.abs(parsed * 100 - Math.round(parsed * 100)) >= 0.00000001) {
    return null;
  }
  return parsed;
}
