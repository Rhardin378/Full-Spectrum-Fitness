import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  nextResponseNextMock,
  nextResponseRedirectMock,
  createServerClientMock,
} = vi.hoisted(() => ({
  nextResponseNextMock: vi.fn(),
  nextResponseRedirectMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: nextResponseNextMock,
    redirect: nextResponseRedirectMock,
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

import { updateSession } from "@/lib/supabase/middleware";

type Cookie = { name: string; value: string; options?: Record<string, unknown> };

type MockRequest = {
  nextUrl: {
    pathname: string;
    clone: () => { pathname: string; search: string };
  };
  cookies: {
    getAll: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
};

function makeRequest(pathname: string, cookies: Cookie[] = []): MockRequest {
  return {
    nextUrl: {
      pathname,
      clone: () => ({ pathname, search: "" }),
    },
    cookies: {
      getAll: vi.fn(() => cookies),
      set: vi.fn(),
    },
  };
}

function makeAuthResult(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  };
}

function setCookiesThenReturn(user: { id: string } | null, cookies: Cookie[]) {
  createServerClientMock.mockImplementation(
    (
      _url: string,
      _key: string,
      options: { cookies: { setAll: (cookies: Cookie[]) => void } },
    ) => {
      options.cookies.setAll(cookies);
      return makeAuthResult(user);
    },
  );
}

function redirectUrl() {
  return nextResponseRedirectMock.mock.calls[0]?.[0] as
    | { pathname: string; search: string }
    | undefined;
}

describe("updateSession", () => {
  beforeEach(() => {
    let responseId = 0;

    nextResponseNextMock.mockReset();
    nextResponseRedirectMock.mockReset();
    createServerClientMock.mockReset();

    nextResponseNextMock.mockImplementation(() => {
      const jar: Cookie[] = [];
      return {
        kind: "next",
        id: ++responseId,
        cookies: {
          set: vi.fn((name: string, value: string, options?: Record<string, unknown>) =>
            jar.push({ name, value, options }),
          ),
          getAll: vi.fn(() => jar),
        },
      };
    });

    nextResponseRedirectMock.mockImplementation(
      (url: { pathname: string; search: string }) => ({
        kind: "redirect",
        url,
        cookies: {
          set: vi.fn(),
        },
      }),
    );
  });

  it("redirects unauthenticated users from protected routes", async () => {
    const request = makeRequest("/dashboard/settings");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    const response = await updateSession(request as never);

    expect(redirectUrl()).toEqual({ pathname: "/auth", search: "" });
    expect(response).toEqual(expect.objectContaining({ kind: "redirect" }));
  });

  it("redirects unauthenticated users from Mind routes", async () => {
    const request = makeRequest("/mind/journal");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(redirectUrl()).toEqual({ pathname: "/auth", search: "" });
  });

  it("does not treat /mindful as protected", async () => {
    const request = makeRequest("/mindful");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
  });

  it("adds reason=session when an auth cookie exists but the user does not", async () => {
    const request = makeRequest("/profile", [
      { name: "sb-abc123-auth-token", value: "stale" },
    ]);
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(redirectUrl()).toEqual({ pathname: "/auth", search: "?reason=session" });
  });

  it("treats chunked auth cookies as a session cookie", async () => {
    const request = makeRequest("/dashboard", [
      { name: "sb-abc123-auth-token.0", value: "stale" },
    ]);
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(redirectUrl()?.search).toBe("?reason=session");
  });

  it("ignores unrelated cookies when deciding the reason", async () => {
    const request = makeRequest("/dashboard", [
      { name: "theme", value: "dark" },
    ]);
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(redirectUrl()?.search).toBe("");
  });

  it("copies refreshed cookies onto redirect responses", async () => {
    const request = makeRequest("/dashboard", [
      { name: "sb-abc123-auth-token", value: "stale" },
    ]);
    setCookiesThenReturn(null, [
      { name: "sb-abc123-auth-token", value: "", options: { maxAge: 0 } },
    ]);

    const response = (await updateSession(request as never)) as unknown as {
      cookies: { set: ReturnType<typeof vi.fn> };
    };

    expect(response.cookies.set).toHaveBeenCalledWith({
      name: "sb-abc123-auth-token",
      value: "",
      options: { maxAge: 0 },
    });
  });

  it("redirects authenticated users away from the auth page", async () => {
    const request = makeRequest("/auth");
    createServerClientMock.mockReturnValue(makeAuthResult({ id: "user-1" }));

    const response = await updateSession(request as never);

    expect(redirectUrl()).toEqual({ pathname: "/dashboard", search: "" });
    expect(response).toEqual(expect.objectContaining({ kind: "redirect" }));
  });

  it("never redirects or checks the user on the auth callback", async () => {
    const request = makeRequest("/auth/callback");

    const response = await updateSession(request as never);

    expect(createServerClientMock).not.toHaveBeenCalled();
    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining({ kind: "next" }));
  });

  it("lets a recovery session open update-password", async () => {
    const request = makeRequest("/auth/update-password");
    createServerClientMock.mockReturnValue(makeAuthResult({ id: "user-1" }));

    const response = await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining({ kind: "next" }));
  });

  it("sends signed-out users on update-password to reset_expired", async () => {
    const request = makeRequest("/auth/update-password");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(redirectUrl()).toEqual({
      pathname: "/auth",
      search: "?reason=reset_expired",
    });
  });

  it("does not treat /authors as the auth page", async () => {
    const request = makeRequest("/authors");
    createServerClientMock.mockReturnValue(makeAuthResult({ id: "user-1" }));

    await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
  });

  it("does not treat /profiles as protected", async () => {
    const request = makeRequest("/profiles");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
  });

  it("allows unauthenticated users on public routes", async () => {
    const request = makeRequest("/about");
    createServerClientMock.mockReturnValue(makeAuthResult(null));

    const response = await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining({ kind: "next", id: 1 }));
  });

  it("allows authenticated users on protected routes", async () => {
    const request = makeRequest("/profile");
    createServerClientMock.mockReturnValue(makeAuthResult({ id: "user-1" }));

    const response = await updateSession(request as never);

    expect(nextResponseRedirectMock).not.toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining({ kind: "next", id: 1 }));
  });

  it("applies cookie updates through setAll", async () => {
    const request = makeRequest("/about");
    setCookiesThenReturn(null, [
      { name: "sb-auth-token", value: "token-value", options: { path: "/" } },
    ]);

    const response = await updateSession(request as never);

    expect(request.cookies.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "token-value",
    );
    expect(nextResponseNextMock).toHaveBeenCalledTimes(2);
    expect(response).toEqual(expect.objectContaining({ kind: "next", id: 2 }));
    expect(response.cookies.set).toHaveBeenCalledWith(
      "sb-auth-token",
      "token-value",
      { path: "/" },
    );
  });
});
