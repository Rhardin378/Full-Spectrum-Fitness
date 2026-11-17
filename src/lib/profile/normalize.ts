import {
  EXPERIENCE_LEVELS,
  SHARING_PREFERENCES,
  mapStoredDomainPriorities,
  type ExperienceLevel,
  type Profile,
  type SharingPreference,
} from "@/lib/types/profile";

type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  fitness_goal: string | null;
  wellness_goal: string | null;
  experience_level: string | null;
  sharing_preferences: string | null;
  domain_priorities: unknown;
  created_at: string;
  updated_at: string;
};

function parseExperienceLevel(value: string | null): ExperienceLevel | null {
  if (!value) return null;
  return EXPERIENCE_LEVELS.includes(value as ExperienceLevel)
    ? (value as ExperienceLevel)
    : null;
}

function parseSharingPreference(value: string | null): SharingPreference | null {
  if (!value) return null;
  return SHARING_PREFERENCES.includes(value as SharingPreference)
    ? (value as SharingPreference)
    : null;
}

export function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    user_id: row.user_id,
    display_name: row.display_name,
    fitness_goal: row.fitness_goal,
    wellness_goal: row.wellness_goal,
    experience_level: parseExperienceLevel(row.experience_level),
    sharing_preferences: parseSharingPreference(row.sharing_preferences),
    domain_priorities: mapStoredDomainPriorities(row.domain_priorities),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
