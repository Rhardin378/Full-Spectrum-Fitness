import { z } from "zod";
import { LIFE_DOMAINS } from "@/lib/life-domains";
import { todaySchema } from "@/lib/journal/validation";
import { isMonday } from "@/lib/weekly/week-math";

const scoreSchema = z
  .number({ message: "Score must be a number." })
  .int("Score must be a whole number.")
  .min(1, "Score must be between 1 and 10.")
  .max(10, "Score must be between 1 and 10.");

const optionalHabitsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) return null;
    return value;
  },
  scoreSchema.nullable(),
);

const optionalNotesSchema = z.preprocess(
  (value) => {
    if (value === undefined) return null;
    if (value === null) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  },
  z
    .string()
    .min(1, "Notes must be at least 1 character.")
    .max(1000, "Notes must be 1000 characters or fewer.")
    .nullable(),
);

const intentionOutcomeSchema = z.enum(["done", "partly", "not_done"], {
  message: "Outcome must be done, partly, or not_done.",
});

const mondayDateSchema = z
  .string({ message: "Week start must be a string." })
  .trim()
  .refine(isMonday, "Week start must be a Monday.");

export const submitWeeklyCheckInSchema = z
  .object({
    today: todaySchema,
    stress: scoreSchema,
    energy: scoreSchema,
    physical_health: scoreSchema,
    mental_health: scoreSchema,
    family_relationships: scoreSchema,
    social: scoreSchema,
    career: scoreSchema,
    learning: scoreSchema,
    leisure: scoreSchema,
    habits: optionalHabitsSchema,
    notes: optionalNotesSchema,
    intention_domain: z.enum(LIFE_DOMAINS, {
      message: "Choose a valid intention domain.",
    }),
    intention_body: z
      .string({ message: "Intention must be a string." })
      .trim()
      .min(1, "Intention is required.")
      .max(200, "Intention must be 200 characters or fewer."),
    intention_outcome: intentionOutcomeSchema.nullable().optional(),
  })
  .strict();

/** Validates RPC week arguments after the server derives them. */
export const submitWeekStartsSchema = z
  .object({
    week_start: mondayDateSchema,
    p_next_week_start: mondayDateSchema,
  })
  .strict();

export const listWeeklyCheckInsSchema = z
  .object({
    limit: z
      .number({ message: "Limit must be a number." })
      .int("Limit must be a whole number.")
      .min(1, "Limit must be at least 1.")
      .max(100, "Limit must be 100 or fewer.")
      .default(25),
  })
  .strict();

export const updateIntentionTextSchema = z
  .object({
    id: z
      .string({ message: "Intention id must be a string." })
      .trim()
      .uuid("Intention id must be a valid UUID."),
    today: todaySchema,
    body: z
      .string({ message: "Intention must be a string." })
      .trim()
      .min(1, "Intention is required.")
      .max(200, "Intention must be 200 characters or fewer."),
  })
  .strict();

export const getCurrentIntentionSchema = z
  .object({
    today: todaySchema,
  })
  .strict();

export function formatWeeklyValidationErrors(
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
      "Invalid check-in data.";
  }

  return fieldErrors;
}
