import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "@/app/api/profile/route";

describe("GET /api/profile", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("does not return Postgres error text when the profile read fails", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'relation "profiles" does not exist' },
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));

    createClientMock
      .mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn(),
      })
      .mockResolvedValueOnce({
        auth: { getUser: vi.fn() },
        from: vi.fn(() => ({ select })),
      });

    const response = await GET();
    const body = (await response.json()) as { message?: string };

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message: "Unable to load your profile. Please try again.",
    });
    expect(JSON.stringify(body)).not.toContain("profiles");
  });

  it("returns 401 when signed out", async () => {
    createClientMock.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      from: vi.fn(),
    });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns a null profile without inserting one", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    createClientMock
      .mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
          }),
        },
        from: vi.fn(),
      })
      .mockResolvedValueOnce({ auth: { getUser: vi.fn() }, from });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile: null });
    expect(from).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalled();
  });
});
