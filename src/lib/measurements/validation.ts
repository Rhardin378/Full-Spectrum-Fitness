import { z } from "zod";
import {
  MEASUREMENT_SORT_ORDERS,
  MEASUREMENT_TYPES,
  MEASUREMENT_UNITS,
  WAIST_UNITS,
  WEIGHT_UNITS,
} from "@/lib/types/measurement";
import { decodeMeasurementCursor } from "@/lib/measurements/pagination";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

function isValidMeasuredAt(value: string): boolean {
  if (DATE_ONLY_PATTERN.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }

  return (
    ISO_DATETIME_PATTERN.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  );
}

const measuredAtSchema = z
  .string({ message: "Measurement date must be a string." })
  .trim()
  .min(1, "Measurement date is required.")
  .refine(
    isValidMeasuredAt,
    "Enter a valid date or ISO date-time with a timezone.",
  )
  .transform((value) =>
    new Date(
      DATE_ONLY_PATTERN.test(value) ? `${value}T00:00:00.000Z` : value,
    ).toISOString(),
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

function dateFilterSchema(boundary: "start" | "end") {
  return z
    .string({ message: "Date filter must be a string." })
    .trim()
    .min(1, "Date filter cannot be empty.")
    .refine(
      isValidMeasuredAt,
      "Enter a valid date or ISO date-time with a timezone.",
    )
    .transform((value) => {
      const dateOnly = DATE_ONLY_PATTERN.test(value);
      const date = new Date(dateOnly ? `${value}T00:00:00.000Z` : value);

      if (dateOnly && boundary === "end") {
        date.setUTCDate(date.getUTCDate() + 1);
      }

      return {
        value: date.toISOString(),
        dateOnly,
      };
    });
}

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
    measured_at: measuredAtSchema,
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
    start_date: dateFilterSchema("start").optional(),
    end_date: dateFilterSchema("end").optional(),
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

    const startTime = new Date(input.start_date.value).getTime();
    const endTime = new Date(input.end_date.value).getTime();
    const rangeIsInvalid = input.end_date.dateOnly
      ? startTime >= endTime
      : startTime > endTime;

    if (rangeIsInvalid) {
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
