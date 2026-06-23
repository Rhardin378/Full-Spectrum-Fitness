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

type MockRequest = {
  nextUrl: {
    pathname: string;
    clone: () => { pathname: string };
  };
  cookies: {
    getAll: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
};

function makeRequest(pathname: string): MockRequest {
  return {
    nextUrl: {
      pathname,
      clone: () => ({ pathname }),
    },
    cookies: {
      getAll: vi.fn(() => []),
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

describe("updateSession", () => {
  beforeEach(() => {
    let responseId = 0;

    nextResponseNextMock.mockReset();
    nextResponseRedirectMock.mockReset();
    createServerClientMock.mockReset();

    nextResponseNextMock.mockImplementation(() => ({
      kind: "next",
      id: ++responseId,
      cookies: {
        set: vi.fn(),
      },
    }));

    nextResponseRedirectMock.mockImplementation(
      (url: { pathname: string }) => ({
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

    expect(nextResponseRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/auth" }),
    );
    expect(response).toEqual(
      expect.objectContaining({
        kind: "redirect",
        url: expect.objectContaining({ pathname: "/auth" }),
      }),
    );
  });

  it("redirects authenticated users away from auth page", async () => {
    const request = makeRequest("/auth");
    createServerClientMock.mockReturnValue(makeAuthResult({ id: "user-1" }));

    const response = await updateSession(request as never);

    expect(nextResponseRedirectMock).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/dashboard" }),
    );
    expect(response).toEqual(
      expect.objectContaining({
        kind: "redirect",
        url: expect.objectContaining({ pathname: "/dashboard" }),
      }),
    );
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

    createServerClientMock.mockImplementation(
      (
        _url: string,
        _key: string,
        options: {
          cookies: {
            setAll: (
              cookies: Array<{
                name: string;
                value: string;
                options?: Record<string, unknown>;
              }>,
            ) => void;
          };
        },
      ) => {
        options.cookies.setAll([
          {
            name: "sb-auth-token",
            value: "token-value",
            options: { path: "/" },
          },
        ]);

        return makeAuthResult(null);
      },
    );

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
