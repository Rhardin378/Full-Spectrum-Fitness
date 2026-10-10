import { DATE_ONLY_PATTERN } from "@/lib/measurements/calendar-date";
import type {
  Measurement,
  MeasurementType,
  MeasurementUnit,
} from "@/lib/types/measurement";

export type MeasurementRow = {
  id: string;
  user_id: string;
  measurement_type: string;
  value: number | string;
  unit: string;
  measured_on: string;
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toCalendarDate(value: string): string {
  if (DATE_ONLY_PATTERN.test(value)) {
    return value;
  }

  return value.slice(0, 10);
}

export function normalizeMeasurement(row: MeasurementRow): Measurement {
  return {
    id: row.id,
    user_id: row.user_id,
    measurement_type: row.measurement_type as MeasurementType,
    value: Number(row.value),
    unit: row.unit as MeasurementUnit,
    measured_on: toCalendarDate(row.measured_on),
    measured_at: row.measured_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
