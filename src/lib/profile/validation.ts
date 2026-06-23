import { z } from "zod";
import {
  DOMAIN_FOCUS_AREAS,
  EXPERIENCE_LEVELS,
  SHARING_PREFERENCES,
  type ProfileUpdate,
} from "@/lib/types/profile";

const domainPrioritySchema = z.object({
  domain: z.enum(DOMAIN_FOCUS_AREAS, {
    message: "Choose one of the seven focus domains.",
  }),
  priority: z
    .number()
    .int("Priority must be a whole number.")
    .min(1, "Priority must be at least 1.")
    .max(
      DOMAIN_FOCUS_AREAS.length,
      `Priority must be ${DOMAIN_FOCUS_AREAS.length} or fewer.`,
    ),
});

const domainPrioritiesSchema = z
  .array(domainPrioritySchema)
  .max(
    DOMAIN_FOCUS_AREAS.length,
    `You can set at most ${DOMAIN_FOCUS_AREAS.length} domain priorities.`,
  )
  .superRefine((rows, context) => {
    const seenDomains = new Set<string>();
    const seenPriorities = new Set<number>();

    rows.forEach((row, index) => {
      if (seenDomains.has(row.domain)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each focus domain can only be selected once.",
          path: [index, "domain"],
        });
      }

      if (seenPriorities.has(row.priority)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Each priority rank can only be used once.",
          path: [index, "priority"],
        });
      }

      seenDomains.add(row.domain);
      seenPriorities.add(row.priority);
    });
  });

export const profileUpdateSchema = z
  .object({
    display_name: z
      .union([
        z
          .string()
          .trim()
          .min(1, "Display name must be at least 1 character.")
          .max(100, "Display name must be 100 characters or fewer."),
        z.null(),
      ])
      .optional(),
    fitness_goal: z
      .union([
        z
          .string()
          .trim()
          .min(1, "Fitness goal cannot be empty.")
          .max(500, "Fitness goal must be 500 characters or fewer."),
        z.null(),
      ])
      .optional(),
    wellness_goal: z
      .union([
        z
          .string()
          .trim()
          .min(1, "Wellness goal cannot be empty.")
          .max(500, "Wellness goal must be 500 characters or fewer."),
        z.null(),
      ])
      .optional(),
    experience_level: z.enum(EXPERIENCE_LEVELS).nullable().optional(),
    sharing_preferences: z.enum(SHARING_PREFERENCES).nullable().optional(),
    domain_priorities: domainPrioritiesSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "At least one profile field must be provided.",
  );

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function formatProfileValidationErrors(
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
      "Invalid profile data.";
  }

  return fieldErrors;
}

export function toProfileUpdatePayload(
  input: ProfileUpdateInput,
): ProfileUpdate {
  const payload: ProfileUpdate = {};

  if (input.display_name !== undefined) {
    payload.display_name = input.display_name;
  }
  if (input.fitness_goal !== undefined) {
    payload.fitness_goal = input.fitness_goal;
  }
  if (input.wellness_goal !== undefined) {
    payload.wellness_goal = input.wellness_goal;
  }
  if (input.experience_level !== undefined) {
    payload.experience_level = input.experience_level;
  }
  if (input.sharing_preferences !== undefined) {
    payload.sharing_preferences = input.sharing_preferences;
  }
  if (input.domain_priorities !== undefined) {
    payload.domain_priorities = input.domain_priorities;
  }

  return payload;
}
