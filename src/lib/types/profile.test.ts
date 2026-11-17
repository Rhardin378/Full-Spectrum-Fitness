import { describe, expect, it } from "vitest";
import { mapStoredDomainPriorities } from "@/lib/types/profile";

describe("mapStoredDomainPriorities", () => {
  it("returns an empty list for a non-array", () => {
    expect(mapStoredDomainPriorities(null)).toEqual([]);
    expect(mapStoredDomainPriorities({ domain: "physical", priority: 1 })).toEqual(
      [],
    );
  });

  it("maps each wheel slug to its preferred Option B domain", () => {
    expect(
      mapStoredDomainPriorities([
        { domain: "emotional", priority: 1 },
        { domain: "physical", priority: 2 },
        { domain: "social", priority: 3 },
        { domain: "environmental", priority: 4 },
        { domain: "spiritual", priority: 5 },
      ]),
    ).toEqual([
      { domain: "mental_health", priority: 1 },
      { domain: "physical_health", priority: 2 },
      { domain: "social", priority: 3 },
      { domain: "family_relationships", priority: 4 },
      { domain: "leisure", priority: 5 },
    ]);
  });

  it("keeps career for the better rank when money and work both want it", () => {
    expect(
      mapStoredDomainPriorities([
        { domain: "financial", priority: 1 },
        { domain: "occupational", priority: 2 },
      ]),
    ).toEqual([
      { domain: "career", priority: 1 },
      { domain: "learning", priority: 2 },
    ]);

    expect(
      mapStoredDomainPriorities([
        { domain: "occupational", priority: 1 },
        { domain: "financial", priority: 2 },
      ]),
    ).toEqual([
      { domain: "career", priority: 1 },
      { domain: "learning", priority: 2 },
    ]);
  });

  it("maps a full wheel list without dropping a rank or using habits", () => {
    expect(
      mapStoredDomainPriorities([
        { domain: "emotional", priority: 1 },
        { domain: "physical", priority: 2 },
        { domain: "social", priority: 3 },
        { domain: "environmental", priority: 4 },
        { domain: "financial", priority: 5 },
        { domain: "occupational", priority: 6 },
        { domain: "spiritual", priority: 7 },
      ]),
    ).toEqual([
      { domain: "mental_health", priority: 1 },
      { domain: "physical_health", priority: 2 },
      { domain: "social", priority: 3 },
      { domain: "family_relationships", priority: 4 },
      { domain: "career", priority: 5 },
      { domain: "learning", priority: 6 },
      { domain: "leisure", priority: 7 },
    ]);
  });

  it("leaves Option B rows in place, including habits", () => {
    const stored = [
      { domain: "physical_health", priority: 2 },
      { domain: "habits", priority: 1 },
    ];

    expect(mapStoredDomainPriorities(stored)).toEqual([
      { domain: "habits", priority: 1 },
      { domain: "physical_health", priority: 2 },
    ]);
    expect(mapStoredDomainPriorities(mapStoredDomainPriorities(stored))).toEqual(
      mapStoredDomainPriorities(stored),
    );
  });

  it("drops unknown and malformed rows", () => {
    expect(
      mapStoredDomainPriorities([
        { domain: "physical", priority: 1 },
        { domain: "emotional", priority: "2" },
        { domain: "mindset", priority: 3 },
        { domain: 5, priority: 4 },
        null,
      ]),
    ).toEqual([{ domain: "physical_health", priority: 1 }]);
  });
});
