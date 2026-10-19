import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UpdateMeasurementInput } from "@/lib/types/measurement";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import {
  softDeleteMeasurement,
  updateMeasurement,
} from "@/lib/measurements/actions";

const MEASUREMENT_ID = "11111111-1111-4111-8111-111111111111";

type MeasurementRow = {
  id: string;
  user_id: string;
  measurement_type: string;
  value: number | string;
  unit: string;
  measured_on: string;
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function makeMeasurementRow(
  overrides: Partial<MeasurementRow> = {},
): MeasurementRow {
  return {
    id: MEASUREMENT_ID,
    user_id: "user-1",
    measurement_type: "weight",
    value: "175.50",
    unit: "lb",
    measured_on: "2026-09-23",
    measured_at: "2026-09-23T00:00:00.000Z",
    notes: null,
    created_at: "2026-09-23T15:00:00.000Z",
    updated_at: "2026-09-23T15:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

const VALID_UPDATE: UpdateMeasurementInput = {
  id: MEASUREMENT_ID,
  measurement_type: "weight",
  value: 176,
  unit: "lb",
  measured_on: "2026-09-24",
  notes: "Corrected",
};

function makeLookupBuilder(result: {
  data: MeasurementRow | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle,
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function makeMutateBuilder(result: {
  data: MeasurementRow | null;
  error: { message: string } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ maybeSingle }));
  const builder = {
    update: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    select,
    maybeSingle,
  };
  builder.update.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  return builder;
}

function makeClient(
  user: { id: string } | null,
  options: {
    lookup?: { data: MeasurementRow | null; error: { message: string } | null };
    mutate?: { data: MeasurementRow | null; error: { message: string } | null };
  } = {},
) {
  const lookup = makeLookupBuilder(
    options.lookup ?? { data: null, error: null },
  );
  const mutate = makeMutateBuilder(
    options.mutate ?? { data: null, error: null },
  );
  const from = vi
    .fn()
    .mockReturnValueOnce(lookup)
    .mockReturnValue(mutate);

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
    spies: { from, lookup, mutate },
  };
}

describe("updateMeasurement", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects unauthenticated requests before reading", async () => {
    const testClient = makeClient(null);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement(VALID_UPDATE);

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns field errors without querying invalid input", async () => {
    const testClient = makeClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement({
      id: "not-a-uuid",
      measurement_type: "weight",
      value: -1,
      unit: "cm",
      measured_on: "not-a-date",
    } as UpdateMeasurementInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors).toMatchObject({
        id: "Measurement id must be a valid UUID.",
        value: "Value must be greater than zero.",
        measured_on: "Enter a valid calendar date (YYYY-MM-DD).",
      });
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("updates an active owner row using measured_on", async () => {
    const existing = makeMeasurementRow();
    const updated = makeMeasurementRow({
      value: "176.00",
      measured_on: "2026-09-24",
      measured_at: "2026-09-24T00:00:00.000Z",
      notes: "Corrected",
    });
    const testClient = makeClient(
      { id: "user-1" },
      {
        lookup: { data: existing, error: null },
        mutate: { data: updated, error: null },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement(VALID_UPDATE);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.measurement).toMatchObject({
        id: MEASUREMENT_ID,
        value: 176,
        measured_on: "2026-09-24",
        notes: "Corrected",
        deleted_at: null,
      });
    }
    expect(testClient.spies.lookup.eq).toHaveBeenCalledWith(
      "user_id",
      "user-1",
    );
    expect(testClient.spies.mutate.update).toHaveBeenCalledWith({
      measurement_type: "weight",
      value: 176,
      unit: "lb",
      measured_on: "2026-09-24",
      measured_at: "2026-09-24T00:00:00.000Z",
      notes: "Corrected",
    });
    expect(testClient.spies.mutate.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("rejects a missing or other user's row", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      { lookup: { data: null, error: null } },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement(VALID_UPDATE);

    expect(result).toMatchObject({
      success: false,
      error: "not_found",
    });
    expect(testClient.spies.mutate.update).not.toHaveBeenCalled();
  });

  it("rejects updating a soft-deleted row", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      {
        lookup: {
          data: makeMeasurementRow({
            deleted_at: "2026-09-24T12:00:00.000Z",
          }),
          error: null,
        },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement(VALID_UPDATE);

    expect(result).toMatchObject({
      success: false,
      error: "not_found",
    });
    expect(testClient.spies.mutate.update).not.toHaveBeenCalled();
  });

  it("returns a safe error when the update write fails", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      {
        lookup: { data: makeMeasurementRow(), error: null },
        mutate: { data: null, error: { message: "internal database detail" } },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await updateMeasurement(VALID_UPDATE);

    expect(result).toEqual({
      success: false,
      error: "database",
      message: "Unable to update your measurement. Please try again.",
    });
  });
});

describe("softDeleteMeasurement", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects unauthenticated requests before reading", async () => {
    const testClient = makeClient(null);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await softDeleteMeasurement({ id: MEASUREMENT_ID });

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("soft-deletes an active owner row", async () => {
    const existing = makeMeasurementRow();
    const deleted = makeMeasurementRow({
      deleted_at: "2026-09-24T12:00:00.000Z",
    });
    const testClient = makeClient(
      { id: "user-1" },
      {
        lookup: { data: existing, error: null },
        mutate: { data: deleted, error: null },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await softDeleteMeasurement({ id: MEASUREMENT_ID });

    expect(result).toEqual({ success: true });
    expect(testClient.spies.mutate.update).toHaveBeenCalledWith({
      deleted_at: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      ),
    });
    expect(testClient.spies.mutate.eq).toHaveBeenCalledWith(
      "user_id",
      "user-1",
    );
    expect(testClient.spies.mutate.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("is idempotent when the row is already deleted", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      {
        lookup: {
          data: makeMeasurementRow({
            deleted_at: "2026-09-24T12:00:00.000Z",
          }),
          error: null,
        },
      },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await softDeleteMeasurement({ id: MEASUREMENT_ID });

    expect(result).toEqual({ success: true });
    expect(testClient.spies.mutate.update).not.toHaveBeenCalled();
  });

  it("rejects a missing or other user's row", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      { lookup: { data: null, error: null } },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await softDeleteMeasurement({ id: MEASUREMENT_ID });

    expect(result).toMatchObject({
      success: false,
      error: "not_found",
    });
    expect(testClient.spies.mutate.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid id without querying", async () => {
    const testClient = makeClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await softDeleteMeasurement({ id: "measurement-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });
});
