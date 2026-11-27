import { describe, expect, it } from "vitest";
import {
  DOMAIN_FOCUS_AREAS as PROFILE_DOMAIN_FOCUS_AREAS,
  DOMAIN_FOCUS_LABELS as PROFILE_DOMAIN_FOCUS_LABELS,
} from "@/lib/types/profile";
import {
  DOMAIN_FOCUS_AREAS,
  DOMAIN_FOCUS_LABELS,
  LIFE_DOMAIN_LABELS,
  LIFE_DOMAINS,
  REQUIRED_CHECKIN_DOMAINS,
  isLifeDomain,
  lifeDomainChipLabel,
} from "@/lib/life-domains";

describe("life-domains", () => {
  it("exports eight Option B slugs in canonical order", () => {
    expect(LIFE_DOMAINS).toEqual([
      "physical_health",
      "mental_health",
      "family_relationships",
      "social",
      "career",
      "learning",
      "leisure",
      "habits",
    ]);
    expect(LIFE_DOMAINS).toHaveLength(8);
  });

  it("keeps profile aliases as the same shared lists", () => {
    expect(DOMAIN_FOCUS_AREAS).toBe(LIFE_DOMAINS);
    expect(DOMAIN_FOCUS_LABELS).toBe(LIFE_DOMAIN_LABELS);
    expect(PROFILE_DOMAIN_FOCUS_AREAS).toBe(LIFE_DOMAINS);
    expect(PROFILE_DOMAIN_FOCUS_LABELS).toBe(LIFE_DOMAIN_LABELS);
  });

  it("labels Family short for chips and leaves Habits optional on check-in", () => {
    expect(LIFE_DOMAIN_LABELS.family_relationships).toBe(
      "Family & relationships",
    );
    expect(lifeDomainChipLabel("family_relationships")).toBe("Family");
    expect(lifeDomainChipLabel("career")).toBe("Career");
    expect(REQUIRED_CHECKIN_DOMAINS).not.toContain("habits");
    expect(REQUIRED_CHECKIN_DOMAINS).toHaveLength(7);
  });

  it("accepts only known slugs", () => {
    expect(isLifeDomain("career")).toBe(true);
    expect(isLifeDomain("emotional")).toBe(false);
    expect(isLifeDomain("physical_wellbeing")).toBe(false);
  });
});
