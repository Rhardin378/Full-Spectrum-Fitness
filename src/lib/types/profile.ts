export const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const SHARING_PREFERENCES = ["private", "friends", "public"] as const;

export const DOMAIN_FOCUS_AREAS = [
  "emotional",
  "physical",
  "social",
  "environmental",
  "financial",
  "occupational",
  "spiritual",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type SharingPreference = (typeof SHARING_PREFERENCES)[number];

export type DomainPriority = {
  domain: string;
  priority: number;
};

export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  fitness_goal: string | null;
  wellness_goal: string | null;
  experience_level: ExperienceLevel | null;
  sharing_preferences: SharingPreference | null;
  domain_priorities: DomainPriority[];
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | "display_name"
    | "fitness_goal"
    | "wellness_goal"
    | "experience_level"
    | "sharing_preferences"
    | "domain_priorities"
  >
>;
