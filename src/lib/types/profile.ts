export const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const SHARING_PREFERENCES = ["private", "friends", "public"] as const;

/**
 * Option B life domains, canonical order.
 * ADR-013 in docs/ARCHITECTURE_DECISIONS.md.
 * Wheel slugs are not valid beside this set.
 */
export const DOMAIN_FOCUS_AREAS = [
  "physical_health",
  "mental_health",
  "family_relationships",
  "social",
  "career",
  "learning",
  "leisure",
  "habits",
] as const;

export type DomainFocusArea = (typeof DOMAIN_FOCUS_AREAS)[number];

export const DOMAIN_FOCUS_LABELS: Record<DomainFocusArea, string> = {
  physical_health: "Physical health",
  mental_health: "Mental health",
  family_relationships: "Family & relationships",
  social: "Social",
  career: "Career",
  learning: "Learning",
  leisure: "Leisure",
  habits: "Habits",
};

/**
 * Preferred Option B slug for a saved wellness-wheel slug.
 * `financial` and `occupational` both prefer `career`. The better rank keeps it.
 * Habits is never a preferred target. See ADR-013.
 */
export const WHEEL_DOMAIN_PREFERRED_OPTION_B: Record<string, DomainFocusArea> = {
  emotional: "mental_health",
  physical: "physical_health",
  social: "social",
  environmental: "family_relationships",
  financial: "career",
  occupational: "career",
  spiritual: "leisure",
};

/** First free slug when a row's preferred domain is already taken. */
export const DOMAIN_PRIORITY_OVERFLOW: readonly DomainFocusArea[] = [
  "learning",
  "habits",
  ...DOMAIN_FOCUS_AREAS,
];

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type SharingPreference = (typeof SHARING_PREFERENCES)[number];

export type DomainPriority = {
  domain: string;
  priority: number;
};

function isDomainFocusArea(value: string): value is DomainFocusArea {
  return (DOMAIN_FOCUS_AREAS as readonly string[]).includes(value);
}

/**
 * Rewrite saved focus-area rows onto the Option B slugs.
 * Keeps every ranked row. The rank number stays. Unknown slugs are dropped.
 * The same rules are applied in
 * `supabase/migrations/20261117170000_map_domain_priorities_to_option_b.sql`.
 */
export function mapStoredDomainPriorities(value: unknown): DomainPriority[] {
  if (!Array.isArray(value)) return [];

  const candidates: Array<{
    preferred: DomainFocusArea;
    priority: number;
    index: number;
  }> = [];

  value.forEach((item, index) => {
    if (typeof item !== "object" || item === null) return;

    const domain = (item as DomainPriority).domain;
    const priority = (item as DomainPriority).priority;
    if (typeof domain !== "string" || typeof priority !== "number") return;

    const preferred = isDomainFocusArea(domain)
      ? domain
      : WHEEL_DOMAIN_PREFERRED_OPTION_B[domain];
    if (!preferred) return;

    candidates.push({ preferred, priority, index });
  });

  const order = [...candidates].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.index - b.index;
  });

  const used = new Set<DomainFocusArea>();
  const assigned = new Map<number, DomainFocusArea>();

  for (const row of order) {
    const slug = used.has(row.preferred)
      ? DOMAIN_PRIORITY_OVERFLOW.find((candidate) => !used.has(candidate))
      : row.preferred;
    if (!slug) continue;

    used.add(slug);
    assigned.set(row.index, slug);
  }

  return order
    .filter((row) => assigned.has(row.index))
    .map((row) => ({
      domain: assigned.get(row.index) ?? row.preferred,
      priority: row.priority,
    }));
}

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
