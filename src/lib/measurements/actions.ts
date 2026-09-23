"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizeMeasurement } from "@/lib/measurements/normalize";
import {
  createMeasurementSchema,
  formatMeasurementValidationErrors,
} from "@/lib/measurements/validation";
import type {
  CreateMeasurementInput,
  Measurement,
} from "@/lib/types/measurement";

export type CreateMeasurementResult =
  | { success: true; measurement: Measurement }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

const MEASUREMENT_COLUMNS =
  "id, user_id, measurement_type, value, unit, measured_at, notes, created_at, updated_at";

export async function createMeasurement(
  input: CreateMeasurementInput,
): Promise<CreateMeasurementResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to log a measurement.",
    };
  }

  const parsed = createMeasurementSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatMeasurementValidationErrors(parsed.error);

    return {
      success: false,
      error: "validation",
      message:
        fieldErrors._form ?? "Please fix the highlighted measurement fields.",
      fieldErrors,
    };
  }

  const { data: createdMeasurement, error: insertError } = await supabase
    .from("measurements")
    .insert({
      user_id: user.id,
      measurement_type: parsed.data.measurement_type,
      value: parsed.data.value,
      unit: parsed.data.unit,
      measured_at: parsed.data.measured_at,
      notes: parsed.data.notes ?? null,
    })
    .select(MEASUREMENT_COLUMNS)
    .single();

  if (insertError || !createdMeasurement) {
    return {
      success: false,
      error: "database",
      message: "Unable to save your measurement. Please try again.",
    };
  }

  return {
    success: true,
    measurement: normalizeMeasurement(createdMeasurement),
  };
}
