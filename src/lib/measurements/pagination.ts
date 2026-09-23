import { z } from "zod";
import {
  MEASUREMENT_SORT_ORDERS,
  type Measurement,
  type MeasurementSortOrder,
} from "@/lib/types/measurement";

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const measurementCursorSchema = z
  .object({
    version: z.literal(1),
    measured_at: z
      .string()
      .regex(ISO_TIMESTAMP_PATTERN)
      .refine((value) => !Number.isNaN(new Date(value).getTime())),
    created_at: z
      .string()
      .regex(ISO_TIMESTAMP_PATTERN)
      .refine((value) => !Number.isNaN(new Date(value).getTime())),
    id: z.string().regex(UUID_PATTERN),
    sort_order: z.enum(MEASUREMENT_SORT_ORDERS),
    filter_key: z.string().max(1000),
  })
  .strict();

export type MeasurementCursor = z.infer<typeof measurementCursorSchema>;

export function encodeMeasurementCursor(
  measurement: Pick<Measurement, "id" | "measured_at" | "created_at">,
  sortOrder: MeasurementSortOrder,
  filterKey: string,
): string {
  const cursor: MeasurementCursor = {
    version: 1,
    measured_at: new Date(measurement.measured_at).toISOString(),
    created_at: new Date(measurement.created_at).toISOString(),
    id: measurement.id,
    sort_order: sortOrder,
    filter_key: filterKey,
  };

  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeMeasurementCursor(
  encodedCursor: string,
): MeasurementCursor | null {
  try {
    const decoded = Buffer.from(encodedCursor, "base64url").toString("utf8");
    const parsed = measurementCursorSchema.safeParse(JSON.parse(decoded));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
