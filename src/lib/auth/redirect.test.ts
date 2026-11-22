import { describe, expect, it } from "vitest";
import {
  AUTH_REASON_MESSAGES,
  authPathWithReason,
  dashboardPathToFitness,
  getAuthReasonMessage,
  getPasswordResetRedirectUrl,
  getSafeNextPath,
  getSignUpRedirectUrl,
  matchesPath,
} from "@/lib/auth/redirect";

describe("getSafeNextPath", () => {
  it("accepts same-origin paths", () => {
    expect(getSafeNextPath("/auth/update-password")).toBe("/auth/update-password");
    expect(getSafeNextPath("/profile?tab=1")).toBe("/profile?tab=1");
  });

  it.each([
    null,
    undefined,
    "",
    "dashboard",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/foo\\bar",
    "/\tevil",
    "/foo\nbar",
    "/foo\u007f",
  ])("falls back for %j", (value) => {
    expect(getSafeNextPath(value)).toBe("/fitness");
  });

  it("rewrites legacy dashboard paths to fitness", () => {
    expect(dashboardPathToFitness("/dashboard")).toBe("/fitness");
    expect(dashboardPathToFitness("/dashboard/settings")).toBe(
      "/fitness/settings",
    );
    expect(dashboardPathToFitness("/fitness")).toBeNull();
  });

  it("uses a custom fallback", () => {
    expect(getSafeNextPath("//x", "/auth/update-password")).toBe(
      "/auth/update-password",
    );
  });
});

describe("getAuthReasonMessage", () => {
  it("returns the message for known reasons", () => {
    expect(getAuthReasonMessage("session")).toBe(AUTH_REASON_MESSAGES.session);
    expect(getAuthReasonMessage(["link_invalid"])).toBe(
      AUTH_REASON_MESSAGES.link_invalid,
    );
    expect(getAuthReasonMessage("reset_expired")).toBe(
      AUTH_REASON_MESSAGES.reset_expired,
    );
  });

  it("ignores unknown or missing reasons", () => {
    expect(getAuthReasonMessage("<script>")).toBeNull();
    expect(getAuthReasonMessage(undefined)).toBeNull();
  });
});

describe("redirect URLs", () => {
  it("sends reset emails through the callback to update-password", () => {
    expect(getPasswordResetRedirectUrl("https://app.example")).toBe(
      "https://app.example/auth/callback?next=%2Fauth%2Fupdate-password",
    );
  });

  it("sends sign-up confirmation to the callback", () => {
    expect(getSignUpRedirectUrl("https://app.example")).toBe(
      "https://app.example/auth/callback",
    );
  });

  it("builds reason paths", () => {
    expect(authPathWithReason("session")).toBe("/auth?reason=session");
  });
});

describe("matchesPath", () => {
  it("matches exactly or by slash prefix", () => {
    expect(matchesPath("/auth", "/auth")).toBe(true);
    expect(matchesPath("/auth/callback", "/auth")).toBe(true);
    expect(matchesPath("/authors", "/auth")).toBe(false);
    expect(matchesPath("/profiles", "/profile")).toBe(false);
  });
});
