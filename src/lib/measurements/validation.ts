import { z } from "zod";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_UNITS,
  WAIST_UNITS,
  WEIGHT_UNITS,
} from "@/lib/types/measurement";

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
