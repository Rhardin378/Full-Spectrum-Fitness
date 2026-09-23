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
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizeMeasurement(row: MeasurementRow): Measurement {
  return {
    id: row.id,
    user_id: row.user_id,
    measurement_type: row.measurement_type as MeasurementType,
    value: Number(row.value),
    unit: row.unit as MeasurementUnit,
    measured_at: row.measured_at,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
