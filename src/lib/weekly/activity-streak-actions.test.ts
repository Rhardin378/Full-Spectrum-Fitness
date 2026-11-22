import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getActivityStreak } from "@/lib/weekly/actions";

const USER_ID = "user-1";

type ChainResult = {
  data: unknown;
  error: { message: string } | null;
};

function makeChain(result: ChainResult) {
  const chain: Record<string, unknown> = {};

  for (const method of [
    "select",
    "eq",
    "lte",
    "gte",
    "order",
    "limit",
  ]) {
    chain[method] = vi.fn(() => chain);
  }

  // Final await resolves the chain itself (supabase thenable pattern).
  chain.then = (
    onFulfilled: (value: ChainResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return chain as Record<string, ReturnType<typeof vi.fn>> & {
    then: typeof chain.then;
  };
}

function makeClient(user: { id: string } | null, result: ChainResult) {
  const chain = makeChain(result);
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: "no session" },
      }),
    },
    from: vi.fn(() => chain),
    chain,
  };
}

describe("getActivityStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T18:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("rejects signed-out callers", async () => {
    createClientMock.mockResolvedValue(
      makeClient(null, { data: [], error: null }),
    );
    const result = await getActivityStreak({ today: "2026-11-12" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("unauthorized");
    }
  });

  it("computes the streak from the session user’s journal dates only", async () => {
    const client = makeClient(
      { id: USER_ID },
      {
        data: [
          { entry_on: "2026-11-09" },
          { entry_on: "2026-11-10" },
          { entry_on: "2026-11-11" },
          { entry_on: "2026-11-12" },
        ],
        error: null,
      },
    );
    createClientMock.mockResolvedValue(client);

    const result = await getActivityStreak({ today: "2026-11-12" });
    expect(result).toEqual({
      success: true,
      streak: { days: 4, graceLeft: 1, countsWorkouts: false },
    });
    expect(client.from).toHaveBeenCalledWith("journal_entries");
  });

  it("orders newest first and bounds the query to today minus 400 days", async () => {
    const client = makeClient({ id: USER_ID }, { data: [], error: null });
    createClientMock.mockResolvedValue(client);

    await getActivityStreak({ today: "2026-11-12" });

    expect(client.chain.gte).toHaveBeenCalledWith("entry_on", "2025-10-08");
    expect(client.chain.lte).toHaveBeenCalledWith("entry_on", "2026-11-12");
    expect(client.chain.order).toHaveBeenCalledWith("entry_on", {
      ascending: false,
    });
  });

  it("returns a zero streak with hidden grace when there are no hits", async () => {
    createClientMock.mockResolvedValue(
      makeClient({ id: USER_ID }, { data: [], error: null }),
    );

    const result = await getActivityStreak({ today: "2026-11-12" });
    expect(result).toEqual({
      success: true,
      streak: { days: 0, graceLeft: null, countsWorkouts: false },
    });
  });
});
