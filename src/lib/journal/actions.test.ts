import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import {
  getWeekRecap,
  listJournalEntries,
  saveJournalEntry,
} from "@/lib/journal/actions";

const ENTRY_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "user-1";

type EntryRow = {
  id: string;
  user_id: string;
  entry_on: string;
  mood: number;
  reflection: string;
  stress: number | null;
  energy: number | null;
  win: string | null;
  grateful_for: string | null;
  created_at: string;
  updated_at: string;
  journal_entry_domains?: Array<{ domain: string }>;
};

function makeEntryRow(overrides: Partial<EntryRow> = {}): EntryRow {
  return {
    id: ENTRY_ID,
    user_id: USER_ID,
    entry_on: "2026-11-03",
    mood: 7,
    reflection: "A solid day",
    stress: null,
    energy: null,
    win: null,
    grateful_for: null,
    created_at: "2026-11-03T15:00:00.000Z",
    updated_at: "2026-11-03T15:00:00.000Z",
    journal_entry_domains: [],
    ...overrides,
  };
}

type ChainResult = {
  data: unknown;
  error: { message: string; code?: string } | null;
};

function makeChain(result: ChainResult) {
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

  chain.single = terminal;
  chain.maybeSingle = terminal;
  // List / recap queries await the builder after .limit() / .order().
  chain.then = (
    onFulfilled: (value: ChainResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return { chain, terminal };
}

type CallPlan = {
  result: ChainResult;
  capture?: {
    insert?: (payload: unknown) => void;
    update?: (payload: unknown) => void;
  };
};

function makeClient(user: { id: string } | null, plans: CallPlan[]) {
  let callIndex = 0;
  const from = vi.fn(() => {
    const plan = plans[callIndex] ?? plans[plans.length - 1];
    callIndex += 1;
    const { chain } = makeChain(plan.result);

    if (plan.capture?.insert) {
      const onInsert = plan.capture.insert;
      chain.insert = vi.fn((payload: unknown) => {
        onInsert(payload);
        return chain;
      });
    }

    if (plan.capture?.update) {
      const onUpdate = plan.capture.update;
      chain.update = vi.fn((payload: unknown) => {
        onUpdate(payload);
        return chain;
      });
    }

    return chain;
  });

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
      from,
    },
    spies: { from },
  };
}

const validInput = {
  today: "2026-11-03",
  mood: 7,
  reflection: "A solid day",
  stress: 4,
  energy: 7,
  domains: ["career" as const],
  win: null,
  grateful_for: null,
};

describe("saveJournalEntry", () => {
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

    const result = await saveJournalEntry(validInput);

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("inserts when no row exists for the day", async () => {
    const insertPayload = vi.fn();
    const updatePayload = vi.fn();
    const row = makeEntryRow();
    const withTags = makeEntryRow({
      journal_entry_domains: [{ domain: "career" }],
    });

    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: null, error: null } }, // lookup
      {
        result: { data: row, error: null },
        capture: { insert: insertPayload, update: updatePayload },
      }, // insert
      { result: { data: null, error: null } }, // delete tags
      { result: { data: null, error: null } }, // insert tags
      { result: { data: withTags, error: null } }, // reload
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await saveJournalEntry(validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.entry.id).toBe(ENTRY_ID);
      expect(result.entry.domains).toEqual(["career"]);
    }

    expect(insertPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        entry_on: "2026-11-03",
        mood: 7,
        reflection: "A solid day",
        stress: 4,
        energy: 7,
        win: null,
        grateful_for: null,
      }),
    );
    expect(updatePayload).not.toHaveBeenCalled();
  });

  it("updates only the six allowed columns when a row already exists", async () => {
    const insertPayload = vi.fn();
    const updatePayload = vi.fn();
    const existing = makeEntryRow({ mood: 4, reflection: "Earlier" });
    const updated = makeEntryRow({ mood: 8, reflection: "Updated note" });
    const withTags = makeEntryRow({
      mood: 8,
      reflection: "Updated note",
      journal_entry_domains: [],
    });

    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: existing, error: null } },
      {
        result: { data: updated, error: null },
        capture: { insert: insertPayload, update: updatePayload },
      },
      { result: { data: null, error: null } }, // delete tags
      { result: { data: withTags, error: null } }, // reload (no tag insert)
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await saveJournalEntry({
      today: "2026-11-03",
      mood: 8,
      reflection: "Updated note",
      domains: [],
    });

    expect(result.success).toBe(true);
    expect(updatePayload).toHaveBeenCalledWith({
      mood: 8,
      reflection: "Updated note",
      stress: null,
      energy: null,
      win: null,
      grateful_for: null,
    });
    expect(updatePayload.mock.calls[0][0]).not.toHaveProperty("user_id");
    expect(updatePayload.mock.calls[0][0]).not.toHaveProperty("entry_on");
    expect(insertPayload).not.toHaveBeenCalled();
  });

  it("falls back to update when insert hits unique violation 23505", async () => {
    const insertPayload = vi.fn();
    const updatePayload = vi.fn();
    const raced = makeEntryRow({ mood: 3 });
    const updated = makeEntryRow({ mood: 9, reflection: "Race winner" });
    const withTags = makeEntryRow({
      mood: 9,
      reflection: "Race winner",
      journal_entry_domains: [],
    });

    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: null, error: null } }, // lookup miss
      {
        result: {
          data: null,
          error: { message: "duplicate", code: "23505" },
        },
        capture: { insert: insertPayload },
      }, // insert race
      { result: { data: raced, error: null } }, // race lookup
      {
        result: { data: updated, error: null },
        capture: { update: updatePayload },
      }, // race update
      { result: { data: null, error: null } }, // delete tags
      { result: { data: withTags, error: null } }, // reload
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await saveJournalEntry({
      today: "2026-11-03",
      mood: 9,
      reflection: "Race winner",
      domains: [],
    });

    expect(result.success).toBe(true);
    expect(insertPayload).toHaveBeenCalled();
    expect(updatePayload).toHaveBeenCalledWith({
      mood: 9,
      reflection: "Race winner",
      stress: null,
      energy: null,
      win: null,
      grateful_for: null,
    });
  });

  it("stores blank win and grateful_for as null, and accepts 200 characters", async () => {
    const insertPayload = vi.fn();
    const win = "w".repeat(200);
    const row = makeEntryRow({ win, grateful_for: null });
    const withTags = makeEntryRow({
      win,
      grateful_for: null,
      journal_entry_domains: [],
    });

    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: null, error: null } },
      {
        result: { data: row, error: null },
        capture: { insert: insertPayload },
      },
      { result: { data: null, error: null } },
      { result: { data: withTags, error: null } },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await saveJournalEntry({
      today: "2026-11-03",
      mood: 7,
      reflection: "A solid day",
      domains: [],
      win,
      grateful_for: "   ",
    });

    expect(result.success).toBe(true);
    expect(insertPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        win,
        grateful_for: null,
      }),
    );
  });

  it("rejects a win longer than 200 characters before writing", async () => {
    const testClient = makeClient({ id: USER_ID }, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await saveJournalEntry({
      today: "2026-11-03",
      mood: 7,
      reflection: "A solid day",
      win: "w".repeat(201),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors?.win).toMatch(/200/);
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });
});

describe("listJournalEntries", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects signed-out callers", async () => {
    const testClient = makeClient(null, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listJournalEntries();

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns only the session user’s rows including win and grateful_for", async () => {
    const rows = [
      makeEntryRow({
        win: "Shipped",
        grateful_for: null,
        journal_entry_domains: [{ domain: "career" }],
      }),
      makeEntryRow({
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        entry_on: "2026-11-02",
        win: null,
        grateful_for: "Quiet evening",
        journal_entry_domains: [],
      }),
    ];
    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: rows, error: null } },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listJournalEntries({ limit: 25 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]?.win).toBe("Shipped");
      expect(result.entries[0]?.grateful_for).toBeNull();
      expect(result.entries[0]?.domains).toEqual(["career"]);
      expect(result.entries[1]?.grateful_for).toBe("Quiet evening");
      expect(result.entries.every((entry) => entry.user_id === USER_ID)).toBe(
        true,
      );
    }
    expect(testClient.spies.from).toHaveBeenCalledWith("journal_entries");
  });
});

describe("getWeekRecap", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-03T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects signed-out callers", async () => {
    const testClient = makeClient(null, []);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await getWeekRecap({ today: "2026-11-03" });

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("builds the recap from the last completed week’s journal rows", async () => {
    const rows = [
      makeEntryRow({
        entry_on: "2026-10-26",
        mood: 4,
        stress: 8,
        energy: null,
        journal_entry_domains: [{ domain: "career" }],
      }),
      makeEntryRow({
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        entry_on: "2026-10-28",
        mood: 6,
        stress: 4,
        energy: 7,
        journal_entry_domains: [{ domain: "learning" }],
      }),
    ];
    const testClient = makeClient({ id: USER_ID }, [
      { result: { data: rows, error: null } },
    ]);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await getWeekRecap({ today: "2026-11-03" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.recap.weekStart).toBe("2026-10-26");
      expect(result.recap.weekEnd).toBe("2026-11-01");
      expect(result.recap.daysJournaled).toBe(2);
      expect(result.recap.averageMood).toBe(5);
      expect(result.recap.averageStress).toBe(6);
      expect(result.recap.averageEnergy).toBe(7);
    }
  });
});
