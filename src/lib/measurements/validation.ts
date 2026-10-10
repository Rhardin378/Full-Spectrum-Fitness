import { z } from "zod";
import {
  MEASUREMENT_SORT_ORDERS,
  MEASUREMENT_TYPES,
  MEASUREMENT_UNITS,
  WAIST_UNITS,
  WEIGHT_UNITS,
} from "@/lib/types/measurement";
import {
  isValidCalendarDate,
  maxAllowedMeasuredOn,
} from "@/lib/measurements/calendar-date";
import { decodeMeasurementCursor } from "@/lib/measurements/pagination";

const measuredOnSchema = z
  .string({ message: "Measurement date must be a string." })
  .trim()
  .min(1, "Measurement date is required.")
  .refine(isValidCalendarDate, "Enter a valid calendar date (YYYY-MM-DD).")
  .refine(
    (value) => value <= maxAllowedMeasuredOn(),
    "Measurement date cannot be in the future.",
  );

const notesSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z
    .string()
    .max(500, "Notes must be 500 characters or fewer.")
    .nullable()
    .optional(),
);

const dateFilterSchema = z
  .string({ message: "Date filter must be a string." })
  .trim()
  .min(1, "Date filter cannot be empty.")
  .refine(isValidCalendarDate, "Enter a valid calendar date (YYYY-MM-DD).");

export const createMeasurementSchema = z
  .object({
    measurement_type: z.enum(MEASUREMENT_TYPES, {
      message: "Measurement type must be weight or waist.",
    }),
    value: z
      .number({ message: "Value must be a number." })
      .gt(0, "Value must be greater than zero.")
      .max(999999.99, "Value must be 999999.99 or less.")
      .refine(
        (value) =>
          Math.abs(value * 100 - Math.round(value * 100)) < 0.00000001,
        "Value must have no more than two decimal places.",
      ),
    unit: z.enum(MEASUREMENT_UNITS, {
      message: "Unit must be lb, kg, in, or cm.",
    }),
    measured_on: measuredOnSchema,
    notes: notesSchema,
  })
  .strict()
  .superRefine((input, context) => {
    const validUnits =
      input.measurement_type === "weight" ? WEIGHT_UNITS : WAIST_UNITS;

    if (!validUnits.includes(input.unit as never)) {
      context.addIssue({
        code: "custom",
        message:
          input.measurement_type === "weight"
            ? "Weight unit must be lb or kg."
            : "Waist unit must be in or cm.",
        path: ["unit"],
      });
    }
  });

export const listMeasurementsSchema = z
  .object({
    measurement_type: z
      .enum(MEASUREMENT_TYPES, {
        message: "Measurement type must be weight or waist.",
      })
      .optional(),
    start_date: dateFilterSchema.optional(),
    end_date: dateFilterSchema.optional(),
    sort_order: z
      .enum(MEASUREMENT_SORT_ORDERS, {
        message: "Sort order must be newest or oldest.",
      })
      .default("newest"),
    page_size: z
      .number({ message: "Page size must be a number." })
      .int("Page size must be a whole number.")
      .min(1, "Page size must be at least 1.")
      .max(100, "Page size must be 100 or fewer.")
      .default(25),
    cursor: z
      .string()
      .min(1, "Cursor cannot be empty.")
      .max(2048, "Cursor is too long.")
      .refine(
        (cursor) => decodeMeasurementCursor(cursor) !== null,
        "Cursor is invalid or expired.",
      )
      .optional(),
  })
  .strict()
  .superRefine((input, context) => {
    if (!input.start_date || !input.end_date) return;

    if (input.start_date > input.end_date) {
      context.addIssue({
        code: "custom",
        message: "End date must be on or after start date.",
        path: ["end_date"],
      });
    }
  });

export type ValidatedCreateMeasurementInput = z.infer<
  typeof createMeasurementSchema
>;

export function formatMeasurementValidationErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  if (
    !fieldErrors._form &&
    error.issues.some((issue) => issue.path.length === 0)
  ) {
    fieldErrors._form =
      error.issues.find((issue) => issue.path.length === 0)?.message ??
      "Invalid measurement data.";
  }

  return fieldErrors;
}
