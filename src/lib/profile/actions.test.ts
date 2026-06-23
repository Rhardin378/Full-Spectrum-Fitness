import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getOrCreateProfile, updateProfile } from "@/lib/profile/actions";

type ProfileRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  fitness_goal: string | null;
  wellness_goal: string | null;
  experience_level: string | null;
  sharing_preferences: string | null;
  domain_priorities: unknown;
  created_at: string;
  updated_at: string;
};

function makeProfileRow(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "profile-1",
    user_id: "user-1",
    display_name: "Alex",
    fitness_goal: "Build consistency",
    wellness_goal: "Reduce stress",
    experience_level: "beginner",
    sharing_preferences: "private",
    domain_priorities: [{ domain: "physical", priority: 1 }],
    created_at: "2026-06-23T00:00:00.000Z",
    updated_at: "2026-06-23T00:00:00.000Z",
    ...overrides,
  };
}

function makeAuthClient(
  user: { id: string; email?: string; user_metadata?: unknown } | null,
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn(),
  };
}

function makeReadClient(result: {
  data: ProfileRow | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    client: {
      auth: { getUser: vi.fn() },
      from,
    },
    spies: { from, select, eq, maybeSingle },
  };
}

function makeInsertClient(
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
  insertResult: {
    data: ProfileRow | null;
    error: { message: string; code?: string } | null;
  },
) {
  const single = vi.fn().mockResolvedValue(insertResult);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      },
      from,
    },
    spies: { from, insert, select, single },
  };
}

function makeUpdateClient(
  user: { id: string },
  updateResult: { data: ProfileRow | null; error: { message: string } | null },
) {
  const maybeSingle = vi.fn().mockResolvedValue(updateResult);
  const select = vi.fn(() => ({ maybeSingle }));
  const eq = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));

  return {
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
      },
      from,
    },
    spies: { from, update, eq, select, maybeSingle },
  };
}

describe("profile actions", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns unauthorized when user is not signed in for getOrCreateProfile", async () => {
    const authClient = makeAuthClient(null);
    createClientMock.mockResolvedValueOnce(authClient);

    const result = await getOrCreateProfile();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("unauthorized");
    }
  });

  it("returns existing profile when found", async () => {
    const user = { id: "user-1", email: "alex@example.com" };
    const authClient = makeAuthClient(user);
    const existingProfile = makeProfileRow();
    const readClient = makeReadClient({ data: existingProfile, error: null });

    createClientMock
      .mockResolvedValueOnce(authClient)
      .mockResolvedValueOnce(readClient.client);

    const result = await getOrCreateProfile();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.profile.id).toBe(existingProfile.id);
      expect(result.profile.user_id).toBe(user.id);
    }
    expect(readClient.spies.eq).toHaveBeenCalledWith("user_id", user.id);
  });

  it("handles duplicate insert race by retrying fetch", async () => {
    const user = {
      id: "user-1",
      email: "alex@example.com",
      user_metadata: { full_name: "Alex" },
    };

    const insertClient = makeInsertClient(user, {
      data: null,
      error: { message: "duplicate key value", code: "23505" },
    });
    const firstReadClient = makeReadClient({ data: null, error: null });
    const racedProfile = makeProfileRow();
    const retryReadClient = makeReadClient({ data: racedProfile, error: null });

    createClientMock
      .mockResolvedValueOnce(insertClient.client)
      .mockResolvedValueOnce(firstReadClient.client)
      .mockResolvedValueOnce(retryReadClient.client);

    const result = await getOrCreateProfile();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.profile.id).toBe(racedProfile.id);
    }
    expect(insertClient.spies.insert).toHaveBeenCalled();
    expect(retryReadClient.spies.eq).toHaveBeenCalledWith("user_id", user.id);
  });

  it("returns validation error before hitting DB when payload is invalid", async () => {
    const result = await updateProfile({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.message).toContain("At least one profile field");
    }
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it("updates using authenticated user scope", async () => {
    const user = { id: "user-1" };
    const updated = makeProfileRow({ display_name: "Updated Alex" });
    const updateClient = makeUpdateClient(user, { data: updated, error: null });

    createClientMock.mockResolvedValueOnce(updateClient.client);

    const result = await updateProfile({ display_name: "Updated Alex" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.profile.display_name).toBe("Updated Alex");
    }
    expect(updateClient.spies.update).toHaveBeenCalledWith({
      display_name: "Updated Alex",
    });
    expect(updateClient.spies.eq).toHaveBeenCalledWith("user_id", user.id);
  });
});
