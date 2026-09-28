import { describe, expect, it } from "vitest";
import { getProfileInitials, getProfileMenuLabel } from "@/lib/profile/display-name";

describe("getProfileInitials", () => {
  it("uses first letters of first and last name", () => {
    expect(getProfileInitials("Alex Rivera", null)).toBe("AR");
  });

  it("uses first two characters for a single name", () => {
    expect(getProfileInitials("Alex", null)).toBe("AL");
  });

  it("falls back to email local part", () => {
    expect(getProfileInitials(null, "alex@example.com")).toBe("AL");
  });

  it("returns U when no name or email", () => {
    expect(getProfileInitials(null, null)).toBe("U");
  });
});

describe("getProfileMenuLabel", () => {
  it("prefers display name", () => {
    expect(getProfileMenuLabel("Alex Rivera", "a@b.com")).toBe("Alex Rivera");
  });

  it("falls back to email local part", () => {
    expect(getProfileMenuLabel(null, "alex@example.com")).toBe("alex");
  });
});
