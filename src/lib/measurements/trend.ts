import { toDateInputValue } from "@/lib/measurements/display";
import type { Measurement, MeasurementUnit } from "@/lib/types/measurement";

export type WeightTrendPoint = {
  id: string;
  value: number;
  measuredAt: string;
  timestamp: number;
};

export type WeightTrendSummary =
  | { status: "empty" }
  | {
      status: "ready";
      unit: MeasurementUnit;
      latestValue: number;
      points: WeightTrendPoint[];
      delta: number | null;
    };

/** Rolling 30 calendar days inclusive (today and prior 29 days), UTC date strings. */
export function getWeightTrendDateRange(referenceDate: Date = new Date()): {
  start_date: string;
  end_date: string;
} {
  const end = new Date(referenceDate);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  return {
    start_date: toDateInputValue(start),
    end_date: toDateInputValue(end),
  };
}

function compareMeasurementsAsc(a: Measurement, b: Measurement): number {
  const measuredDiff =
    new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime();
  if (measuredDiff !== 0) {
    return measuredDiff;
  }
  const createdDiff =
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  if (createdDiff !== 0) {
    return createdDiff;
  }
  return a.id.localeCompare(b.id);
}

function compareMeasurementsDesc(a: Measurement, b: Measurement): number {
  return -compareMeasurementsAsc(a, b);
}

function formatSignedDelta(value: number): string {
  const abs =
    Math.abs(value * 10 - Math.round(value * 10)) < 0.00000001
      ? Math.abs(value).toString()
      : Math.abs(value).toFixed(2).replace(/\.?0+$/, "");
  if (value > 0) {
    return `+${abs}`;
  }
  if (value < 0) {
    return `-${abs}`;
  }
  return "0";
}

export function formatWeightTrendDelta(
  delta: number,
  unit: MeasurementUnit,
): string {
  return `${formatSignedDelta(delta)} ${unit} vs 30 days`;
}

export function buildWeightTrendSummary(
  measurements: Measurement[],
): WeightTrendSummary {
  const weights = measurements
    .filter((entry) => entry.measurement_type === "weight")
    .sort(compareMeasurementsDesc);

  if (weights.length === 0) {
    return { status: "empty" };
  }

  const latest = weights[0];
  const unit = latest.unit;

  const points: WeightTrendPoint[] = weights
    .filter((entry) => entry.unit === unit)
    .sort(compareMeasurementsAsc)
    .map((entry) => ({
      id: entry.id,
      value: entry.value,
      measuredAt: entry.measured_at,
      timestamp: new Date(entry.measured_at).getTime(),
    }));

  if (points.length === 0) {
    return { status: "empty" };
  }

  const latestValue = points[points.length - 1].value;
  const delta =
    points.length >= 2
      ? Math.round((latestValue - points[0].value) * 100) / 100
      : null;

  return {
    status: "ready",
    unit,
    latestValue,
    points,
    delta,
  };
}
