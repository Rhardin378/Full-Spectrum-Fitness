import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import {
  listWeeklyCheckIns,
  submitWeeklyCheckIn,
  updateIntentionText,
} from "@/lib/weekly/actions";

const USER_ID = "user-1";
const CHECK_IN_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const INTENTION_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const TODAY = "2026-11-03";

type ChainResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
};

type CallPlan = {
  result: ChainResult;
  capture?: {
    update?: (payload: unknown) => void;
    rpc?: (args: unknown) => void;
  };
};

function makeCheckInRow(overrides: Record<string, unknown> = {}) {
  return {
    id: CHECK_IN_ID,
    user_id: USER_ID,
    week_start: "2026-10-26",
    stress: 6,
    energy: 7,
    physical_health: 7,
    mental_health: 6,
    family_relationships: 5,
    social: 6,
    career: 4,
    learning: 7,
    leisure: 8,
    habits: null,
    notes: null,
    created_at: "2026-11-03T15:00:00.000Z",
    updated_at: "2026-11-03T15:00:00.000Z",
    ...overrides,
  };
}

function makeIntentionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: INTENTION_ID,
    user_id: USER_ID,
    week_start: "2026-11-02",
    domain: "career",
    body: "Ship the check-in screen",
    outcome: null,
    created_from_checkin_id: CHECK_IN_ID,
    editable_until: "2026-11-05",
    created_at: "2026-11-03T15:00:00.000Z",
    updated_at: "2026-11-03T15:00:00.000Z",
    ...overrides,
  };
}

function makeChain(result: ChainResult, capture?: CallPlan["capture"]) {
  const chain: Record<string, unknown> = {};
  const terminal = vi.fn().mockResolvedValue(result);

  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "gte",
    "lte",
    "order",
    "limit",
  ]) {
    chain[method] = vi.fn(() => chain);
  }

  if (capture?.update) {
    const onUpdate = capture.update;
    chain.update = vi.fn((payload: unknown) => {
      onUpdate(payload);
      return chain;
    });
  }

  chain.single = terminal;
  chain.maybeSingle = terminal;
  // List queries await the builder after .limit().
  chain.then = (
    onFulfilled: (value: ChainResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);

  return { chain, terminal };
}

function makeClient(
  user: { id: string } | null,
  plans: CallPlan[],
  rpcPlan?: CallPlan,
) {
  let callIndex = 0;
  const from = vi.fn(() => {
    const plan = plans[callIndex] ?? plans[plans.length - 1];
    callIndex += 1;
    return makeChain(plan.result, plan.capture).chain;
  });

  const rpc = vi.fn((fnName: string, args: unknown) => {
    if (rpcPlan?.capture?.rpc) {
      rpcPlan.capture.rpc({ fnName, args });
    }
    return Promise.resolve(rpcPlan?.result ?? { data: null, error: null });
  });

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: user ? null : { message: "no session" },
        }),
      },
      from,
      rpc,
    },
    spies: { from, rpc },
  };
}

const validSubmitInput = {
  today: TODAY,
  stress: 6,
  energy: 7,
  physical_health: 7,
  mental_health: 6,
  family_relationships: 5,
  social: 6,
  career: 4,
  learning: 7,
  leisure: 8,
  habits: null,
  notes: null,
  intention_domain: "career" as const,
  intention_body: "Ship the check-in screen",
  intention_outcome: null,
};

describe("submitWeeklyCheckIn", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects unauthenticated callers before writing", async () => {
    const testClient = makeClient(null, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await submitWeeklyCheckIn(validSubmitInput);

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
    expect(testClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("rejects today outside the slack window before writing", async () => {
    const testClient = makeClient({ id: USER_ID }, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await submitWeeklyCheckIn({
      ...validSubmitInput,
      today: "2026-10-30",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors?.today).toMatch(/one day/);
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
    expect(testClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("maps a unique violation to the already-submitted message", async () => {
    const testClient = makeClient(
      { id: USER_ID },
      [{ result: { data: null, error: null } }],
      {
        result: {
          data: null,
          error: { message: "duplicate", code: "23505" },
        },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await submitWeeklyCheckIn(validSubmitInput);

    expect(result).toEqual({
      success: false,
      error: "validation",
      message: "You already submitted this week’s check-in.",
    });
  });

  it("stores omitted notes as null and returns the created rows", async () => {
    const rpcCapture = vi.fn();
    const checkIn = makeCheckInRow({ notes: null });
    const intention = makeIntentionRow();

    const testClient = makeClient(
      { id: USER_ID },
      [
        { result: { data: null, error: null } }, // prior intention lookup
        { result: { data: checkIn, error: null } }, // reload check-in
        { result: { data: intention, error: null } }, // reload intention
      ],
      {
        result: {
          data: [{ check_in_id: CHECK_IN_ID, intention_id: INTENTION_ID }],
          error: null,
        },
        capture: { rpc: rpcCapture },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await submitWeeklyCheckIn({
      ...validSubmitInput,
      notes: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.checkIn.notes).toBeNull();
      expect(result.intention.body).toBe("Ship the check-in screen");
    }

    expect(rpcCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        fnName: "submit_weekly_check_in",
        args: expect.objectContaining({
          p_week_start: "2026-10-26",
          p_next_week_start: "2026-11-02",
          p_notes: null,
          p_intention_outcome: null,
          p_habits: null,
        }),
      }),
    );
  });

  it("accepts notes at 1000 characters and rejects 1001", async () => {
    const okClient = makeClient(
      { id: USER_ID },
      [
        { result: { data: null, error: null } },
        { result: { data: makeCheckInRow({ notes: "n".repeat(1000) }), error: null } },
        { result: { data: makeIntentionRow(), error: null } },
      ],
      {
        result: {
          data: [{ check_in_id: CHECK_IN_ID, intention_id: INTENTION_ID }],
          error: null,
        },
      },
    );
    createClientMock.mockResolvedValueOnce(okClient.client);

    const ok = await submitWeeklyCheckIn({
      ...validSubmitInput,
      notes: "n".repeat(1000),
    });
    expect(ok.success).toBe(true);

    const failClient = makeClient({ id: USER_ID }, []);
    createClientMock.mockResolvedValueOnce(failClient.client);

    const tooLong = await submitWeeklyCheckIn({
      ...validSubmitInput,
      notes: "n".repeat(1001),
    });
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.error).toBe("validation");
      expect(tooLong.fieldErrors?.notes).toMatch(/1000/);
    }
    expect(failClient.spies.rpc).not.toHaveBeenCalled();
  });

  it("requires an outcome when a prior intention exists for the check-in week", async () => {
    const testClient = makeClient({ id: USER_ID }, [
      {
        result: {
          data: { id: "prior-intention" },
          error: null,
        },
      },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await submitWeeklyCheckIn({
      ...validSubmitInput,
      intention_outcome: null,
    });

    expect(result).toMatchObject({
      success: false,
      error: "validation",
      fieldErrors: {
        intention_outcome: "Outcome is required for last week’s intention.",
      },
    });
    expect(testClient.spies.rpc).not.toHaveBeenCalled();
  });
});

describe("listWeeklyCheckIns", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects signed-out callers", async () => {
    const testClient = makeClient(null, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listWeeklyCheckIns();

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns only the session user’s rows", async () => {
    const rows = [
      makeCheckInRow({ notes: "Kept it light" }),
      makeCheckInRow({
        id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        week_start: "2026-10-19",
        notes: null,
      }),
    ];
    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: rows, error: null } },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listWeeklyCheckIns({ limit: 25 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.checkIns).toHaveLength(2);
      expect(result.checkIns[0]?.notes).toBe("Kept it light");
      expect(result.checkIns[1]?.notes).toBeNull();
      expect(result.checkIns.every((row) => row.user_id === USER_ID)).toBe(
        true,
      );
    }
    expect(testClient.spies.from).toHaveBeenCalledWith("weekly_check_ins");
  });
});

describe("updateIntentionText", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects unauthenticated callers before writing", async () => {
    const testClient = makeClient(null, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateIntentionText({
      id: INTENTION_ID,
      today: TODAY,
      body: "New intention text",
    });

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("rejects a body update after editable_until", async () => {
    const testClient = makeClient({ id: USER_ID }, [
      {
        result: {
          data: makeIntentionRow({ editable_until: "2026-11-02" }),
          error: null,
        },
      },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateIntentionText({
      id: INTENTION_ID,
      today: TODAY,
      body: "Too late to edit",
    });

    expect(result).toMatchObject({
      success: false,
      error: "validation",
      message: "This intention can no longer be edited.",
      fieldErrors: {
        body: "Intention text is locked after the edit window.",
      },
    });
  });

  it("updates body inside the window and rejects domain on the payload", async () => {
    const updatePayload = vi.fn();
    const existing = makeIntentionRow({ editable_until: "2026-11-05" });
    const updated = makeIntentionRow({ body: "Lift 3x this week" });

    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: existing, error: null } },
      {
        result: { data: updated, error: null },
        capture: { update: updatePayload },
      },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateIntentionText({
      id: INTENTION_ID,
      today: TODAY,
      body: "Lift 3x this week",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.intention.body).toBe("Lift 3x this week");
    }
    expect(updatePayload).toHaveBeenCalledWith({ body: "Lift 3x this week" });
    expect(updatePayload.mock.calls[0][0]).not.toHaveProperty("domain");

    const strictClient = makeClient({ id: USER_ID }, []);
    createClientMock.mockResolvedValueOnce(strictClient.client);

    const rejected = await updateIntentionText({
      id: INTENTION_ID,
      today: TODAY,
      body: "Lift 3x this week",
      // @ts-expect-error intentional unknown key for .strict()
      domain: "career",
    });
    expect(rejected.success).toBe(false);
    if (!rejected.success) {
      expect(rejected.error).toBe("validation");
    }
    expect(strictClient.spies.from).not.toHaveBeenCalled();
  });
});
