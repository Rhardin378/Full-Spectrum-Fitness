/**
 * Option B life domains, canonical order.
 * ADR-013 in docs/ARCHITECTURE_DECISIONS.md.
 * Wheel slugs are not valid beside this set.
 */
export const LIFE_DOMAINS = [
  "physical_health",
  "mental_health",
  "family_relationships",
  "social",
  "career",
  "learning",
  "leisure",
  "habits",
] as const;

export type LifeDomain = (typeof LIFE_DOMAINS)[number];

/** Profile focus-area alias of the shared Option B type. */
export type DomainFocusArea = LifeDomain;

/** Profile-facing name for the shared Option B slug list. */
export const DOMAIN_FOCUS_AREAS = LIFE_DOMAINS;

export const LIFE_DOMAIN_LABELS: Record<LifeDomain, string> = {
  physical_health: "Physical health",
  mental_health: "Mental health",
  family_relationships: "Family & relationships",
  social: "Social",
  career: "Career",
  learning: "Learning",
  leisure: "Leisure",
  habits: "Habits",
};

/** Profile-facing labels for the shared Option B set. */
export const DOMAIN_FOCUS_LABELS = LIFE_DOMAIN_LABELS;

/** Required check-in score domains (Habits is optional). */
export const REQUIRED_CHECKIN_DOMAINS = [
  "physical_health",
  "mental_health",
  "family_relationships",
  "social",
  "career",
  "learning",
  "leisure",
] as const satisfies readonly Exclude<LifeDomain, "habits">[];

export type RequiredCheckInDomain = (typeof REQUIRED_CHECKIN_DOMAINS)[number];

/** Recap chip short label. Score rows and tag buttons use the full label. */
export function lifeDomainChipLabel(domain: LifeDomain): string {
  if (domain === "family_relationships") return "Family";
  return LIFE_DOMAIN_LABELS[domain];
}

export function isLifeDomain(value: string): value is LifeDomain {
  return (LIFE_DOMAINS as readonly string[]).includes(value);
}
