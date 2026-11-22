import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getCurrentIntention } from "@/lib/weekly/actions";
import {
  currentIntentionWeekStart,
  mondayOnOrBefore,
} from "@/lib/weekly/week-math";

const USER_ID = "user-1";

type ChainResult = {
  data: unknown;
  error: { message: string } | null;
};

function makeChain(result: ChainResult) {
  const chain: Record<string, unknown> = {};
  const maybeSingle = vi.fn().mockResolvedValue(result);

  for (const method of ["select", "eq"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = maybeSingle;

  return chain as Record<string, ReturnType<typeof vi.fn>>;
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

function intentionRow(weekStart: string) {
  return {
    id: "int-1",
    user_id: USER_ID,
    week_start: weekStart,
    domain: "physical_health",
    body: "Walk after dinner",
    outcome: null,
    created_from_checkin_id: "ci-1",
    editable_until: "2026-11-04",
    created_at: "2026-10-26T12:00:00.000Z",
    updated_at: "2026-10-26T12:00:00.000Z",
  };
}

describe("getCurrentIntention display week", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("on Sunday before check-in loads mondayOnOrBefore, not next week", async () => {
    const today = "2026-11-01";
    vi.setSystemTime(new Date("2026-11-01T18:00:00.000Z"));
    const displayWeek = mondayOnOrBefore(today);
    expect(displayWeek).toBe("2026-10-26");
    expect(currentIntentionWeekStart(today)).toBe("2026-11-02");

    const client = makeClient({ id: USER_ID }, {
      data: intentionRow(displayWeek),
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await getCurrentIntention({ today });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intention?.week_start).toBe(displayWeek);
    }
    expect(client.chain.eq).toHaveBeenCalledWith("week_start", displayWeek);
    expect(client.chain.eq).not.toHaveBeenCalledWith(
      "week_start",
      currentIntentionWeekStart(today),
    );
  });

  it("on Sunday after check-in still shows this week’s intention", async () => {
    const today = "2026-11-01";
    vi.setSystemTime(new Date("2026-11-01T20:00:00.000Z"));
    const displayWeek = mondayOnOrBefore(today);
    // Submit created next week’s row; display must not flip yet.
    expect(currentIntentionWeekStart(today)).toBe("2026-11-02");

    const client = makeClient({ id: USER_ID }, {
      data: intentionRow(displayWeek),
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await getCurrentIntention({ today });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intention?.week_start).toBe("2026-10-26");
    }
    expect(client.chain.eq).toHaveBeenCalledWith("week_start", "2026-10-26");
  });

  it("on Monday loads the new week’s intention", async () => {
    const today = "2026-11-02";
    vi.setSystemTime(new Date("2026-11-02T18:00:00.000Z"));
    expect(mondayOnOrBefore(today)).toBe("2026-11-02");
    expect(currentIntentionWeekStart(today)).toBe("2026-11-02");

    const client = makeClient({ id: USER_ID }, {
      data: intentionRow("2026-11-02"),
      error: null,
    });
    createClientMock.mockResolvedValue(client);

    const result = await getCurrentIntention({ today });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intention?.week_start).toBe("2026-11-02");
    }
    expect(client.chain.eq).toHaveBeenCalledWith("week_start", "2026-11-02");
  });
});
