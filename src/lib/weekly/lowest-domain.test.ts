import { describe, expect, it } from "vitest";
import { lowestDomain } from "@/lib/weekly/lowest-domain";

describe("lowestDomain", () => {
  it("returns the lowest required score", () => {
    expect(
      lowestDomain({
        physical_health: 8,
        mental_health: 7,
        family_relationships: 6,
        social: 5,
        career: 3,
        learning: 9,
        leisure: 4,
      }),
    ).toBe("career");
  });

  it("breaks required-score ties with canonical order", () => {
    expect(
      lowestDomain({
        physical_health: 5,
        mental_health: 5,
        family_relationships: 8,
        social: 8,
        career: 8,
        learning: 8,
        leisure: 8,
      }),
    ).toBe("physical_health");
  });

  it("includes habits only when scored, and habits loses ties to earlier domains", () => {
    expect(
      lowestDomain({
        physical_health: 5,
        mental_health: 6,
        family_relationships: 6,
        social: 6,
        career: 6,
        learning: 6,
        leisure: 6,
        habits: null,
      }),
    ).toBe("physical_health");

    expect(
      lowestDomain({
        physical_health: 5,
        mental_health: 6,
        family_relationships: 6,
        social: 6,
        career: 6,
        learning: 6,
        leisure: 6,
        habits: 4,
      }),
    ).toBe("habits");

    expect(
      lowestDomain({
        physical_health: 5,
        mental_health: 6,
        family_relationships: 6,
        social: 6,
        career: 6,
        learning: 6,
        leisure: 6,
        habits: 5,
      }),
    ).toBe("physical_health");
  });
});
