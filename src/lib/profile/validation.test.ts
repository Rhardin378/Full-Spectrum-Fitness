import { describe, expect, it } from "vitest";
import {
  formatProfileValidationErrors,
  profileUpdateSchema,
} from "@/lib/profile/validation";

describe("profileUpdateSchema", () => {
  it("accepts a valid partial update", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "Alex",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty payloads", () => {
    const result = profileUpdateSchema.safeParse({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatProfileValidationErrors(result.error)._form).toContain(
        "At least one profile field",
      );
    }
  });

  it("rejects duplicate focus domains", () => {
    const result = profileUpdateSchema.safeParse({
      domain_priorities: [
        { domain: "physical", priority: 1 },
        { domain: "physical", priority: 2 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find(
        (issue) =>
          issue.path[0] === "domain_priorities" && issue.path[2] === "domain",
      )?.message;
      expect(message).toBe("Each focus domain can only be selected once.");
    }
  });

  it("rejects duplicate priority ranks", () => {
    const result = profileUpdateSchema.safeParse({
      domain_priorities: [
        { domain: "physical", priority: 1 },
        { domain: "emotional", priority: 1 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues.find(
        (issue) =>
          issue.path[0] === "domain_priorities" && issue.path[2] === "priority",
      )?.message;
      expect(message).toBe("Each priority rank can only be used once.");
    }
  });

  it("rejects invalid focus domain values", () => {
    const result = profileUpdateSchema.safeParse({
      domain_priorities: [{ domain: "mindset", priority: 1 }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects display name over 100 characters", () => {
    const result = profileUpdateSchema.safeParse({
      display_name: "a".repeat(101),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        formatProfileValidationErrors(result.error).display_name,
      ).toContain("100 characters");
    }
  });
});
