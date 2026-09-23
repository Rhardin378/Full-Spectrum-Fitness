export const MEASUREMENT_TYPES = ["weight", "waist"] as const;
export const WEIGHT_UNITS = ["lb", "kg"] as const;
export const WAIST_UNITS = ["in", "cm"] as const;
export const MEASUREMENT_UNITS = [...WEIGHT_UNITS, ...WAIST_UNITS] as const;
export const MEASUREMENT_SORT_ORDERS = ["newest", "oldest"] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];
export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];
export type MeasurementSortOrder = (typeof MEASUREMENT_SORT_ORDERS)[number];

export type Measurement = {
  id: string;
  user_id: string;
  measurement_type: MeasurementType;
  value: number;
  unit: MeasurementUnit;
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateMeasurementInput = {
  measurement_type: MeasurementType;
  value: number;
  unit: MeasurementUnit;
  measured_at: string;
  notes?: string | null;
};

export type ListMeasurementsInput = {
  measurement_type?: MeasurementType;
  start_date?: string;
  end_date?: string;
  sort_order?: MeasurementSortOrder;
};
