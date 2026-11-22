"use server";

import { createClient } from "@/lib/supabase/server";
import {
  normalizeWeeklyCheckIn,
  normalizeWeeklyIntention,
} from "@/lib/weekly/normalize";
import type {
  GetCurrentIntentionInput,
  ListWeeklyCheckInsInput,
  SubmitWeeklyCheckInInput,
  UpdateIntentionTextInput,
  WeeklyCheckIn,
  WeeklyIntention,
} from "@/lib/weekly/types";
import {
  formatWeeklyValidationErrors,
  getCurrentIntentionSchema,
  listWeeklyCheckInsSchema,
  submitWeekStartsSchema,
  submitWeeklyCheckInSchema,
  updateIntentionTextSchema,
} from "@/lib/weekly/validation";
import {
  cappedEditableUntil,
  currentIntentionWeekStart,
  lastCompletedWeekStart,
} from "@/lib/weekly/week-math";

const CHECK_IN_COLUMNS =
  "id, user_id, week_start, stress, energy, physical_health, mental_health, family_relationships, social, career, learning, leisure, habits, notes, created_at, updated_at";

const INTENTION_COLUMNS =
  "id, user_id, week_start, domain, body, outcome, created_from_checkin_id, editable_until, created_at, updated_at";

export type SubmitWeeklyCheckInResult =
  | {
      success: true;
      checkIn: WeeklyCheckIn;
      intention: WeeklyIntention;
    }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type ListWeeklyCheckInsResult =
  | { success: true; checkIns: WeeklyCheckIn[] }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type UpdateIntentionTextResult =
  | { success: true; intention: WeeklyIntention }
  | {
      success: false;
      error: "unauthorized" | "validation" | "not_found" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type GetCurrentIntentionResult =
  | { success: true; intention: WeeklyIntention | null }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export async function submitWeeklyCheckIn(
  input: SubmitWeeklyCheckInInput,
): Promise<SubmitWeeklyCheckInResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to submit a check-in.",
    };
  }

  const parsed = submitWeeklyCheckInSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatWeeklyValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the highlighted check-in fields.",
      fieldErrors,
    };
  }

  const weekStart = lastCompletedWeekStart(parsed.data.today);
  const nextWeekStart = currentIntentionWeekStart(parsed.data.today);
  const weekStarts = submitWeekStartsSchema.safeParse({
    week_start: weekStart,
    p_next_week_start: nextWeekStart,
  });

  if (!weekStarts.success) {
    const fieldErrors = formatWeeklyValidationErrors(weekStarts.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Week start must be a Monday.",
      fieldErrors,
    };
  }

  const { data: existingIntention, error: existingIntentionError } =
    await supabase
      .from("weekly_intentions")
      .select("id")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .maybeSingle();

  if (existingIntentionError) {
    return {
      success: false,
      error: "database",
      message: "Unable to submit your check-in. Please try again.",
    };
  }

  if (existingIntention && parsed.data.intention_outcome == null) {
    return {
      success: false,
      error: "validation",
      message: "Please say how last week’s intention went.",
      fieldErrors: {
        intention_outcome: "Outcome is required for last week’s intention.",
      },
    };
  }

  const editableUntilDate = cappedEditableUntil(
    parsed.data.today,
    nextWeekStart,
  );

  const { data: rpcRows, error: rpcError } = await supabase.rpc(
    "submit_weekly_check_in",
    {
      p_week_start: weekStart,
      p_stress: parsed.data.stress,
      p_energy: parsed.data.energy,
      p_physical_health: parsed.data.physical_health,
      p_mental_health: parsed.data.mental_health,
      p_family_relationships: parsed.data.family_relationships,
      p_social: parsed.data.social,
      p_career: parsed.data.career,
      p_learning: parsed.data.learning,
      p_leisure: parsed.data.leisure,
      p_habits: parsed.data.habits,
      p_notes: parsed.data.notes,
      p_intention_outcome: existingIntention
        ? parsed.data.intention_outcome
        : null,
      p_next_week_start: nextWeekStart,
      p_next_domain: parsed.data.intention_domain,
      p_next_body: parsed.data.intention_body,
      p_editable_until: editableUntilDate,
    },
  );

  if (rpcError) {
    if (rpcError.code === "23505") {
      return {
        success: false,
        error: "validation",
        message: "You already submitted this week’s check-in.",
      };
    }

    return {
      success: false,
      error: "database",
      message: "Unable to submit your check-in. Please try again.",
    };
  }

  const rpcRow = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
  const checkInId =
    rpcRow && typeof rpcRow === "object" && "check_in_id" in rpcRow
      ? String((rpcRow as { check_in_id: string }).check_in_id)
      : null;
  const intentionId =
    rpcRow && typeof rpcRow === "object" && "intention_id" in rpcRow
      ? String((rpcRow as { intention_id: string }).intention_id)
      : null;

  if (!checkInId || !intentionId) {
    return {
      success: false,
      error: "database",
      message: "Unable to submit your check-in. Please try again.",
    };
  }

  const [{ data: checkInRow, error: checkInError }, { data: intentionRow, error: intentionError }] =
    await Promise.all([
      supabase
        .from("weekly_check_ins")
        .select(CHECK_IN_COLUMNS)
        .eq("id", checkInId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("weekly_intentions")
        .select(INTENTION_COLUMNS)
        .eq("id", intentionId)
        .eq("user_id", user.id)
        .single(),
    ]);

  if (checkInError || !checkInRow || intentionError || !intentionRow) {
    return {
      success: false,
      error: "database",
      message: "Unable to submit your check-in. Please try again.",
    };
  }

  return {
    success: true,
    checkIn: normalizeWeeklyCheckIn(checkInRow),
    intention: normalizeWeeklyIntention(intentionRow),
  };
}

export async function listWeeklyCheckIns(
  input: ListWeeklyCheckInsInput = {},
): Promise<ListWeeklyCheckInsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to view check-ins.",
    };
  }

  const parsed = listWeeklyCheckInsSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatWeeklyValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the check-in filters and try again.",
      fieldErrors,
    };
  }

  const { data, error } = await supabase
    .from("weekly_check_ins")
    .select(CHECK_IN_COLUMNS)
    .eq("user_id", user.id)
    .order("week_start", { ascending: false })
    .limit(parsed.data.limit);

  if (error) {
    return {
      success: false,
      error: "database",
      message: "Unable to load check-ins. Please try again.",
    };
  }

  return {
    success: true,
    checkIns: (data ?? []).map(normalizeWeeklyCheckIn),
  };
}

export async function updateIntentionText(
  input: UpdateIntentionTextInput,
): Promise<UpdateIntentionTextResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to edit an intention.",
    };
  }

  const parsed = updateIntentionTextSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatWeeklyValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the intention and try again.",
      fieldErrors,
    };
  }

  const { data: existing, error: loadError } = await supabase
    .from("weekly_intentions")
    .select(INTENTION_COLUMNS)
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError) {
    return {
      success: false,
      error: "database",
      message: "Unable to update the intention. Please try again.",
    };
  }

  if (!existing) {
    return {
      success: false,
      error: "not_found",
      message: "Intention not found.",
    };
  }

  const intention = normalizeWeeklyIntention(existing);

  if (parsed.data.today > intention.editable_until) {
    return {
      success: false,
      error: "validation",
      message: "This intention can no longer be edited.",
      fieldErrors: {
        body: "Intention text is locked after the edit window.",
      },
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("weekly_intentions")
    .update({ body: parsed.data.body })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select(INTENTION_COLUMNS)
    .single();

  if (updateError || !updated) {
    return {
      success: false,
      error: "database",
      message: "Unable to update the intention. Please try again.",
    };
  }

  return {
    success: true,
    intention: normalizeWeeklyIntention(updated),
  };
}

async function loadIntentionForWeekStart(
  weekStart: string,
): Promise<GetCurrentIntentionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to view the intention.",
    };
  }

  const { data, error } = await supabase
    .from("weekly_intentions")
    .select(INTENTION_COLUMNS)
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: "database",
      message: "Unable to load the intention. Please try again.",
    };
  }

  return {
    success: true,
    intention: data ? normalizeWeeklyIntention(data) : null,
  };
}

export async function getCurrentIntention(
  input: GetCurrentIntentionInput,
): Promise<GetCurrentIntentionResult> {
  const parsed = getCurrentIntentionSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatWeeklyValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please provide a valid today date.",
      fieldErrors,
    };
  }

  return loadIntentionForWeekStart(
    currentIntentionWeekStart(parsed.data.today),
  );
}

/** Intention for the check-in week (`lastCompletedWeekStart`), if any. */
export async function getCheckInWeekIntention(
  input: GetCurrentIntentionInput,
): Promise<GetCurrentIntentionResult> {
  const parsed = getCurrentIntentionSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatWeeklyValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please provide a valid today date.",
      fieldErrors,
    };
  }

  return loadIntentionForWeekStart(lastCompletedWeekStart(parsed.data.today));
}
