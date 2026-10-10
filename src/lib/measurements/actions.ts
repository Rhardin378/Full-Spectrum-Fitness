"use server";

import { createClient } from "@/lib/supabase/server";
import { calendarDateToUtcMidnight } from "@/lib/measurements/calendar-date";
import { normalizeMeasurement } from "@/lib/measurements/normalize";
import {
  decodeMeasurementCursor,
  encodeMeasurementCursor,
  type MeasurementCursor,
} from "@/lib/measurements/pagination";
import {
  createMeasurementSchema,
  formatMeasurementValidationErrors,
  listMeasurementsSchema,
} from "@/lib/measurements/validation";
import type {
  CreateMeasurementInput,
  ListMeasurementsInput,
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

export type ListMeasurementsResult =
  | {
      success: true;
      measurements: Measurement[];
      next_cursor: string | null;
      has_more: boolean;
    }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

const MEASUREMENT_COLUMNS =
  "id, user_id, measurement_type, value, unit, measured_on, measured_at, notes, created_at, updated_at";

function buildMeasurementCursorFilter(
  cursor: MeasurementCursor,
  ascending: boolean,
): string {
  const operator = ascending ? "gt" : "lt";

  return [
    `measured_on.${operator}.${cursor.measured_on}`,
    `and(measured_on.eq.${cursor.measured_on},created_at.${operator}.${cursor.created_at})`,
    `and(measured_on.eq.${cursor.measured_on},created_at.eq.${cursor.created_at},id.${operator}.${cursor.id})`,
  ].join(",");
}

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
      measured_on: parsed.data.measured_on,
      measured_at: calendarDateToUtcMidnight(parsed.data.measured_on),
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

export async function listMeasurements(
  input: ListMeasurementsInput = {},
): Promise<ListMeasurementsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to view measurements.",
    };
  }

  const parsed = listMeasurementsSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatMeasurementValidationErrors(parsed.error);

    return {
      success: false,
      error: "validation",
      message:
        fieldErrors._form ?? "Please fix the measurement filters and try again.",
      fieldErrors,
    };
  }

  const filterKey = JSON.stringify({
    measurement_type: parsed.data.measurement_type ?? null,
    start_date: parsed.data.start_date ?? null,
    end_date: parsed.data.end_date ?? null,
  });
  const cursor = parsed.data.cursor
    ? decodeMeasurementCursor(parsed.data.cursor)
    : null;

  if (
    cursor &&
    (cursor.sort_order !== parsed.data.sort_order ||
      cursor.filter_key !== filterKey)
  ) {
    return {
      success: false,
      error: "validation",
      message: "Please fix the measurement filters and try again.",
      fieldErrors: {
        cursor: "Cursor does not match the current filters or sort order.",
      },
    };
  }

  let query = supabase
    .from("measurements")
    .select(MEASUREMENT_COLUMNS)
    .eq("user_id", user.id);

  if (parsed.data.measurement_type) {
    query = query.eq("measurement_type", parsed.data.measurement_type);
  }

  if (parsed.data.start_date) {
    query = query.gte("measured_on", parsed.data.start_date);
  }

  if (parsed.data.end_date) {
    query = query.lte("measured_on", parsed.data.end_date);
  }

  const ascending = parsed.data.sort_order === "oldest";
  if (cursor) {
    query = query.or(buildMeasurementCursorFilter(cursor, ascending));
  }

  const { data: measurements, error: selectError } = await query
    .order("measured_on", { ascending })
    .order("created_at", { ascending })
    .order("id", { ascending })
    .limit(parsed.data.page_size + 1);

  if (selectError || !measurements) {
    return {
      success: false,
      error: "database",
      message: "Unable to load your measurements. Please try again.",
    };
  }

  const hasMore = measurements.length > parsed.data.page_size;
  const normalizedMeasurements = measurements
    .slice(0, parsed.data.page_size)
    .map(normalizeMeasurement);
  const lastMeasurement =
    normalizedMeasurements[normalizedMeasurements.length - 1];

  return {
    success: true,
    measurements: normalizedMeasurements,
    next_cursor:
      hasMore && lastMeasurement
        ? encodeMeasurementCursor(
            lastMeasurement,
            parsed.data.sort_order,
            filterKey,
          )
        : null,
    has_more: hasMore,
  };
}
