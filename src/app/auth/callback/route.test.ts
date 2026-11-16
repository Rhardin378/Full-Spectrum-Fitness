import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, exchangeCodeForSession, verifyOtp } = vi.hoisted(
  () => ({
    createClientMock: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    verifyOtp: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

function callback(query: string) {
  return GET(new NextRequest(`http://localhost:3000/auth/callback${query}`));
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClientMock.mockResolvedValue({
      auth: { exchangeCodeForSession, verifyOtp },
    });
  });

  it("exchanges a code and redirects to next with a relative Location", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callback(
      "?code=abc&next=%2Fauth%2Fupdate-password",
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/auth/update-password");
  });

  it("defaults to the dashboard when next is missing", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callback("?code=abc");

    expect(response.headers.get("location")).toBe("/dashboard");
  });

  it("ignores an off-site next", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await callback("?code=abc&next=%2F%2Fevil.example");

    expect(response.headers.get("location")).toBe("/dashboard");
  });

  it("verifies a recovery token_hash and defaults to update-password", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    const response = await callback("?token_hash=hash&type=recovery");

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash",
      type: "recovery",
    });
    expect(response.headers.get("location")).toBe("/auth/update-password");
  });

  it("redirects to link_invalid when the exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: "expired" },
    });

    const response = await callback("?code=bad");

    expect(response.headers.get("location")).toBe("/auth?reason=link_invalid");
  });

  it("redirects to link_invalid for an unknown otp type or no params", async () => {
    const unknownType = await callback("?token_hash=hash&type=bogus");
    const empty = await callback("");

    expect(verifyOtp).not.toHaveBeenCalled();
    expect(unknownType.headers.get("location")).toBe("/auth?reason=link_invalid");
    expect(empty.headers.get("location")).toBe("/auth?reason=link_invalid");
  });
});
