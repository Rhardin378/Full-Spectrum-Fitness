import { isLifeDomain, type LifeDomain } from "@/lib/life-domains";
import type {
  IntentionOutcome,
  WeeklyCheckIn,
  WeeklyIntention,
} from "@/lib/weekly/types";

const OUTCOMES = new Set(["done", "partly", "not_done"]);

function asOutcome(value: unknown): IntentionOutcome | null {
  if (value == null) return null;
  const text = String(value);
  return OUTCOMES.has(text) ? (text as IntentionOutcome) : null;
}

export function normalizeWeeklyCheckIn(raw: unknown): WeeklyCheckIn {
  const row = raw as Record<string, unknown>;

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    week_start: String(row.week_start),
    stress: Number(row.stress),
    energy: Number(row.energy),
    physical_health: Number(row.physical_health),
    mental_health: Number(row.mental_health),
    family_relationships: Number(row.family_relationships),
    social: Number(row.social),
    career: Number(row.career),
    learning: Number(row.learning),
    leisure: Number(row.leisure),
    habits: row.habits == null ? null : Number(row.habits),
    notes: row.notes == null || row.notes === "" ? null : String(row.notes),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function normalizeWeeklyIntention(raw: unknown): WeeklyIntention {
  const row = raw as Record<string, unknown>;
  const domain = String(row.domain);

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    week_start: String(row.week_start),
    domain: (isLifeDomain(domain) ? domain : "physical_health") as LifeDomain,
    body: String(row.body),
    outcome: asOutcome(row.outcome),
    created_from_checkin_id: String(row.created_from_checkin_id),
    editable_until: String(row.editable_until),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
