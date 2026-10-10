import {
  formatCalendarDate,
  todayLocalISODate,
} from "@/lib/measurements/calendar-date";
import type { MeasurementType, MeasurementUnit } from "@/lib/types/measurement";

export { formatCalendarDate, todayLocalISODate };

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

export function formatMeasuredOnDisplay(isoDate: string): string {
  return formatCalendarDate(isoDate);
}

/** Date-input value for the user's local calendar today. */
export function toDateInputValue(date: Date = new Date()): string {
  return todayLocalISODate(date);
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
