"use server";

import { createClient } from "@/lib/supabase/server";
import { addUtcCalendarDays } from "@/lib/measurements/calendar-date";
import { normalizeJournalEntry } from "@/lib/journal/normalize";
import { buildWeekRecap, type WeekRecap } from "@/lib/journal/recap";
import type {
  JournalEntry,
  ListJournalEntriesInput,
  SaveJournalEntryInput,
} from "@/lib/journal/types";
import {
  formatJournalValidationErrors,
  getWeekRecapSchema,
  listJournalEntriesSchema,
  saveJournalEntrySchema,
} from "@/lib/journal/validation";
import { lastCompletedWeekStart } from "@/lib/weekly/week-math";

const JOURNAL_ENTRY_COLUMNS =
  "id, user_id, entry_on, mood, reflection, win, grateful_for, created_at, updated_at";

const JOURNAL_COLUMNS = `${JOURNAL_ENTRY_COLUMNS}, journal_entry_domains(domain)`;

const DATABASE_SAVE_MESSAGE =
  "Unable to save your journal entry. Please try again.";

export type SaveJournalEntryResult =
  | { success: true; entry: JournalEntry }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type ListJournalEntriesResult =
  | { success: true; entries: JournalEntry[] }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type GetWeekRecapResult =
  | { success: true; recap: WeekRecap }
  | {
      success: false;
      error: "unauthorized" | "validation" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export async function saveJournalEntry(
  input: SaveJournalEntryInput,
): Promise<SaveJournalEntryResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to save a journal entry.",
    };
  }

  const parsed = saveJournalEntrySchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatJournalValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the highlighted journal fields.",
      fieldErrors,
    };
  }

  const entryOn = parsed.data.today;
  const allowedFields = {
    mood: parsed.data.mood,
    reflection: parsed.data.reflection,
    win: parsed.data.win,
    grateful_for: parsed.data.grateful_for,
  };

  const { data: existing, error: lookupError } = await supabase
    .from("journal_entries")
    .select(JOURNAL_ENTRY_COLUMNS)
    .eq("user_id", user.id)
    .eq("entry_on", entryOn)
    .maybeSingle();

  if (lookupError) {
    return {
      success: false,
      error: "database",
      message: DATABASE_SAVE_MESSAGE,
    };
  }

  let savedRow: unknown = null;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("journal_entries")
      .update(allowedFields)
      .eq("id", String((existing as { id: string }).id))
      .eq("user_id", user.id)
      .select(JOURNAL_ENTRY_COLUMNS)
      .single();

    if (updateError || !updated) {
      return {
        success: false,
        error: "database",
        message: DATABASE_SAVE_MESSAGE,
      };
    }

    savedRow = updated;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        entry_on: entryOn,
        ...allowedFields,
      })
      .select(JOURNAL_ENTRY_COLUMNS)
      .single();

    if (insertError?.code === "23505") {
      const { data: raced, error: raceLookupError } = await supabase
        .from("journal_entries")
        .select(JOURNAL_ENTRY_COLUMNS)
        .eq("user_id", user.id)
        .eq("entry_on", entryOn)
        .maybeSingle();

      if (raceLookupError || !raced) {
        return {
          success: false,
          error: "database",
          message: DATABASE_SAVE_MESSAGE,
        };
      }

      const { data: racedUpdate, error: raceUpdateError } = await supabase
        .from("journal_entries")
        .update(allowedFields)
        .eq("id", String((raced as { id: string }).id))
        .eq("user_id", user.id)
        .select(JOURNAL_ENTRY_COLUMNS)
        .single();

      if (raceUpdateError || !racedUpdate) {
        return {
          success: false,
          error: "database",
          message: DATABASE_SAVE_MESSAGE,
        };
      }

      savedRow = racedUpdate;
    } else if (insertError || !inserted) {
      return {
        success: false,
        error: "database",
        message: DATABASE_SAVE_MESSAGE,
      };
    } else {
      savedRow = inserted;
    }
  }

  const entryId = String((savedRow as { id: string }).id);

  const { error: deleteTagsError } = await supabase
    .from("journal_entry_domains")
    .delete()
    .eq("journal_entry_id", entryId)
    .eq("user_id", user.id);

  if (deleteTagsError) {
    return {
      success: false,
      error: "database",
      message: DATABASE_SAVE_MESSAGE,
    };
  }

  if (parsed.data.domains.length > 0) {
    const { error: insertTagsError } = await supabase
      .from("journal_entry_domains")
      .insert(
        parsed.data.domains.map((domain) => ({
          journal_entry_id: entryId,
          user_id: user.id,
          domain,
        })),
      );

    if (insertTagsError) {
      return {
        success: false,
        error: "database",
        message: DATABASE_SAVE_MESSAGE,
      };
    }
  }

  const { data: withTags, error: reloadError } = await supabase
    .from("journal_entries")
    .select(JOURNAL_COLUMNS)
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (reloadError || !withTags) {
    return {
      success: false,
      error: "database",
      message: DATABASE_SAVE_MESSAGE,
    };
  }

  return {
    success: true,
    entry: normalizeJournalEntry(withTags),
  };
}

export async function listJournalEntries(
  input: ListJournalEntriesInput = {},
): Promise<ListJournalEntriesResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to view journal entries.",
    };
  }

  const parsed = listJournalEntriesSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatJournalValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the journal filters and try again.",
      fieldErrors,
    };
  }

  let query = supabase
    .from("journal_entries")
    .select(JOURNAL_COLUMNS)
    .eq("user_id", user.id)
    .order("entry_on", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.start_date) {
    query = query.gte("entry_on", parsed.data.start_date);
  }
  if (parsed.data.end_date) {
    query = query.lte("entry_on", parsed.data.end_date);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      error: "database",
      message: "Unable to load journal entries. Please try again.",
    };
  }

  return {
    success: true,
    entries: (data ?? []).map(normalizeJournalEntry),
  };
}

export async function getWeekRecap(input: {
  today: string;
}): Promise<GetWeekRecapResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to view the week recap.",
    };
  }

  const parsed = getWeekRecapSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = formatJournalValidationErrors(parsed.error);
    return {
      success: false,
      error: "validation",
      message: fieldErrors.today ?? "Please provide a valid today date.",
      fieldErrors,
    };
  }

  const weekStart = lastCompletedWeekStart(parsed.data.today);
  const weekEnd = addUtcCalendarDays(weekStart, 6);

  const { data, error } = await supabase
    .from("journal_entries")
    .select(JOURNAL_COLUMNS)
    .eq("user_id", user.id)
    .gte("entry_on", weekStart)
    .lte("entry_on", weekEnd)
    .order("entry_on", { ascending: true });

  if (error) {
    return {
      success: false,
      error: "database",
      message: "Unable to load the week recap. Please try again.",
    };
  }

  const entries = (data ?? []).map(normalizeJournalEntry);
  return {
    success: true,
    recap: buildWeekRecap(
      entries.map((entry) => ({
        entry_on: entry.entry_on,
        mood: entry.mood,
        domains: entry.domains,
      })),
      weekStart,
    ),
  };
}
