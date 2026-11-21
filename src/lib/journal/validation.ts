import { z } from "zod";
import { LIFE_DOMAINS } from "@/lib/life-domains";
import {
  addUtcCalendarDays,
  isValidCalendarDate,
  maxAllowedMeasuredOn,
  utcTodayISODate,
} from "@/lib/measurements/calendar-date";

const optionalLineSchema = z.preprocess(
  (value) => {
    if (value === undefined) return null;
    if (value === null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z
    .string()
    .min(1, "Must be at least 1 character.")
    .max(200, "Must be 200 characters or fewer.")
    .nullable(),
);

export const todaySchema = z
  .string({ message: "Today must be a string." })
  .trim()
  .min(1, "Today is required.")
  .refine(isValidCalendarDate, "Enter a valid calendar date (YYYY-MM-DD).")
  .refine((value) => {
    const min = addUtcCalendarDays(utcTodayISODate(), -1);
    const max = maxAllowedMeasuredOn();
    return value >= min && value <= max;
  }, "Today must be within one day of the current UTC date.");

const dateFilterSchema = z
  .string({ message: "Date filter must be a string." })
  .trim()
  .min(1, "Date filter cannot be empty.")
  .refine(isValidCalendarDate, "Enter a valid calendar date (YYYY-MM-DD).");

export const saveJournalEntrySchema = z
  .object({
    today: todaySchema,
    mood: z
      .number({ message: "Mood must be a number." })
      .int("Mood must be a whole number.")
      .min(1, "Mood must be between 1 and 10.")
      .max(10, "Mood must be between 1 and 10."),
    reflection: z
      .string({ message: "Reflection must be a string." })
      .trim()
      .min(1, "Reflection is required.")
      .max(2000, "Reflection must be 2000 characters or fewer."),
    domains: z
      .array(
        z.enum(LIFE_DOMAINS, {
          message: "Choose a valid life domain.",
        }),
      )
      .max(2, "Pick at most two domains.")
      .default([]),
    win: optionalLineSchema,
    grateful_for: optionalLineSchema,
  })
  .strict()
  .superRefine((input, context) => {
    if (new Set(input.domains).size !== input.domains.length) {
      context.addIssue({
        code: "custom",
        message: "Domain tags must be distinct.",
        path: ["domains"],
      });
    }
  });

export const listJournalEntriesSchema = z
  .object({
    start_date: dateFilterSchema.optional(),
    end_date: dateFilterSchema.optional(),
    limit: z
      .number({ message: "Limit must be a number." })
      .int("Limit must be a whole number.")
      .min(1, "Limit must be at least 1.")
      .max(100, "Limit must be 100 or fewer.")
      .default(25),
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

export function formatJournalValidationErrors(
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
      "Invalid journal data.";
  }

  return fieldErrors;
}
