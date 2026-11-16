import { describe, expect, it } from "vitest";
import {
  formatAuthErrors,
  forgotPasswordSchema,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/auth/validation";

describe("newPasswordSchema", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = newPasswordSchema.safeParse("1234567");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("accepts 8 and 72 characters", () => {
    expect(newPasswordSchema.safeParse("a".repeat(8)).success).toBe(true);
    expect(newPasswordSchema.safeParse("a".repeat(72)).success).toBe(true);
  });

  it("rejects passwords longer than 72 characters", () => {
    expect(newPasswordSchema.safeParse("a".repeat(73)).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("rejects a 7-character password", () => {
    const result = signUpSchema.safeParse({
      email: "a@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("trims the email", () => {
    const result = signUpSchema.safeParse({
      email: "  a@example.com ",
      password: "12345678",
    });
    expect(result.success && result.data.email).toBe("a@example.com");
  });
});

describe("signInSchema", () => {
  it("accepts a legacy 6-character password", () => {
    const result = signInSchema.safeParse({
      email: "a@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password and an invalid email", () => {
    const result = signInSchema.safeParse({ email: "nope", password: "" });
    expect(result.success).toBe(false);
    expect(formatAuthErrors(result.error!)).toEqual({
      email: "Please enter a valid email address",
      password: "Please enter your password",
    });
  });
});

describe("forgotPasswordSchema", () => {
  it("requires a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "x" }).success).toBe(false);
    expect(
      forgotPasswordSchema.safeParse({ email: "x@example.com" }).success,
    ).toBe(true);
  });
});

describe("updatePasswordSchema", () => {
  it("rejects mismatched confirmation on the confirm field", () => {
    const result = updatePasswordSchema.safeParse({
      password: "12345678",
      confirmPassword: "12345679",
    });
    expect(result.success).toBe(false);
    expect(formatAuthErrors(result.error!)).toEqual({
      confirmPassword: "Passwords do not match",
    });
  });

  it("accepts matching passwords of valid length", () => {
    expect(
      updatePasswordSchema.safeParse({
        password: "12345678",
        confirmPassword: "12345678",
      }).success,
    ).toBe(true);
  });
});
