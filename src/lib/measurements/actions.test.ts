import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateMeasurementInput } from "@/lib/types/measurement";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { createMeasurement } from "@/lib/measurements/actions";

type MeasurementRow = {
  id: string;
  user_id: string;
  measurement_type: string;
  value: number | string;
  unit: string;
  measured_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function makeMeasurementRow(
  overrides: Partial<MeasurementRow> = {},
): MeasurementRow {
  return {
    id: "measurement-1",
    user_id: "user-1",
    measurement_type: "weight",
    value: "175.50",
    unit: "lb",
    measured_at: "2026-09-23T00:00:00.000Z",
    notes: null,
    created_at: "2026-09-23T15:00:00.000Z",
    updated_at: "2026-09-23T15:00:00.000Z",
    ...overrides,
  };
}

function makeClient(
  user: { id: string } | null,
  insertResult: {
    data: MeasurementRow | null;
    error: { message: string } | null;
  } = { data: null, error: null },
) {
  const single = vi.fn().mockResolvedValue(insertResult);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert }));

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
    spies: { from, insert, select, single },
  };
}

describe("createMeasurement", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects unauthenticated requests before writing", async () => {
    const testClient = makeClient(null);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await createMeasurement({
      measurement_type: "weight",
      value: 175,
      unit: "lb",
      measured_at: "2026-09-23",
    });

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it.each([
    {
      input: {
        measurement_type: "weight",
        value: 175.5,
        unit: "lb",
        measured_at: "2026-09-23",
      } satisfies CreateMeasurementInput,
      row: makeMeasurementRow(),
    },
    {
      input: {
        measurement_type: "waist",
        value: 32.25,
        unit: "in",
        measured_at: "2026-09-23T08:30:00Z",
        notes: "Morning",
      } satisfies CreateMeasurementInput,
      row: makeMeasurementRow({
        measurement_type: "waist",
        value: "32.25",
        unit: "in",
        measured_at: "2026-09-23T08:30:00.000Z",
        notes: "Morning",
      }),
    },
  ])("creates an owner-scoped $input.measurement_type measurement", async ({
    input,
    row,
  }) => {
    const testClient = makeClient({ id: "user-1" }, { data: row, error: null });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await createMeasurement(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.measurement).toMatchObject({
        user_id: "user-1",
        measurement_type: input.measurement_type,
        value: input.value,
        unit: input.unit,
      });
      expect(typeof result.measurement.value).toBe("number");
    }

    expect(testClient.spies.from).toHaveBeenCalledWith("measurements");
    expect(testClient.spies.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      measurement_type: input.measurement_type,
      value: input.value,
      unit: input.unit,
      measured_at:
        input.measurement_type === "weight"
          ? "2026-09-23T00:00:00.000Z"
          : "2026-09-23T08:30:00.000Z",
      notes: input.notes ?? null,
    });
  });

  it("returns field errors without writing invalid input", async () => {
    const testClient = makeClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await createMeasurement({
      measurement_type: "weight",
      value: -1,
      unit: "cm",
      measured_at: "not-a-date",
    } as CreateMeasurementInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors).toMatchObject({
        value: "Value must be greater than zero.",
        unit: "Weight unit must be lb or kg.",
        measured_at: "Enter a valid date or ISO date-time with a timezone.",
      });
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("rejects caller-supplied ownership instead of writing it", async () => {
    const testClient = makeClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await createMeasurement({
      user_id: "user-2",
      measurement_type: "weight",
      value: 175,
      unit: "lb",
      measured_at: "2026-09-23",
    } as unknown as CreateMeasurementInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns a safe error when the database insert fails", async () => {
    const testClient = makeClient(
      { id: "user-1" },
      { data: null, error: { message: "internal database detail" } },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await createMeasurement({
      measurement_type: "weight",
      value: 175,
      unit: "kg",
      measured_at: "2026-09-23",
    });

    expect(result).toEqual({
      success: false,
      error: "database",
      message: "Unable to save your measurement. Please try again.",
    });
  });
});
