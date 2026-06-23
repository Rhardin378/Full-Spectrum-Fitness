import { describe, expect, it } from "vitest";
import { normalizeProfile } from "@/lib/profile/normalize";

describe("normalizeProfile", () => {
  it("coerces unknown enum values to null", () => {
    const profile = normalizeProfile({
      id: "p1",
      user_id: "u1",
      display_name: "Alex",
      fitness_goal: null,
      wellness_goal: null,
      experience_level: "expert",
      sharing_preferences: "everyone",
      domain_priorities: [],
      created_at: "2026-06-23T00:00:00.000Z",
      updated_at: "2026-06-23T00:00:00.000Z",
    });

    expect(profile.experience_level).toBeNull();
    expect(profile.sharing_preferences).toBeNull();
  });

  it("filters invalid domain priority entries", () => {
    const profile = normalizeProfile({
      id: "p1",
      user_id: "u1",
      display_name: null,
      fitness_goal: null,
      wellness_goal: null,
      experience_level: "beginner",
      sharing_preferences: "private",
      domain_priorities: [
        { domain: "physical", priority: 1 },
        { domain: "emotional", priority: "2" },
        { domain: 5, priority: 3 },
        null,
      ],
      created_at: "2026-06-23T00:00:00.000Z",
      updated_at: "2026-06-23T00:00:00.000Z",
    });

    expect(profile.domain_priorities).toEqual([
      { domain: "physical", priority: 1 },
    ]);
  });

  it("returns empty domain priorities when input is not an array", () => {
    const profile = normalizeProfile({
      id: "p1",
      user_id: "u1",
      display_name: null,
      fitness_goal: null,
      wellness_goal: null,
      experience_level: "advanced",
      sharing_preferences: "public",
      domain_priorities: { domain: "physical", priority: 1 },
      created_at: "2026-06-23T00:00:00.000Z",
      updated_at: "2026-06-23T00:00:00.000Z",
    });

    expect(profile.domain_priorities).toEqual([]);
  });
});
