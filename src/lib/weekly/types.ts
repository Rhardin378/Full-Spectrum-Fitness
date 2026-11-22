import type { LifeDomain, RequiredCheckInDomain } from "@/lib/life-domains";

export type IntentionOutcome = "done" | "partly" | "not_done";

export type WeeklyCheckIn = {
  id: string;
  user_id: string;
  week_start: string;
  stress: number;
  energy: number;
  physical_health: number;
  mental_health: number;
  family_relationships: number;
  social: number;
  career: number;
  learning: number;
  leisure: number;
  habits: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WeeklyIntention = {
  id: string;
  user_id: string;
  week_start: string;
  domain: LifeDomain;
  body: string;
  outcome: IntentionOutcome | null;
  created_from_checkin_id: string;
  editable_until: string;
  created_at: string;
  updated_at: string;
};

export type SubmitWeeklyCheckInInput = {
  today: string;
  stress: number;
  energy: number;
  physical_health: number;
  mental_health: number;
  family_relationships: number;
  social: number;
  career: number;
  learning: number;
  leisure: number;
  habits?: number | null;
  notes?: string | null;
  intention_domain: LifeDomain;
  intention_body: string;
  /** Required when an intention already exists for the check-in week. */
  intention_outcome?: IntentionOutcome | null;
};

export type ListWeeklyCheckInsInput = {
  limit?: number;
};

export type UpdateIntentionTextInput = {
  id: string;
  today: string;
  body: string;
};

export type GetCurrentIntentionInput = {
  today: string;
};

export type GetActivityStreakInput = {
  today: string;
};

export type GetCheckInDueStatusInput = {
  today: string;
};

export type ActivityStreakView = {
  days: number;
  /** `null` when days is 0 — UI hides the grace line. */
  graceLeft: 0 | 1 | null;
  /** False until the workouts slice supplies calendar days. */
  countsWorkouts: boolean;
};

export type RequiredScoreKey = RequiredCheckInDomain;
