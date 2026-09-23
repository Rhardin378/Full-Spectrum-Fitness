import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ListMeasurementsInput } from "@/lib/types/measurement";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { listMeasurements } from "@/lib/measurements/actions";

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
    measured_at: "2026-09-23T08:00:00.000Z",
    notes: null,
    created_at: "2026-09-23T08:05:00.000Z",
    updated_at: "2026-09-23T08:05:00.000Z",
    ...overrides,
  };
}

function makeListClient(
  user: { id: string } | null,
  result: {
    data: MeasurementRow[] | null;
    error: { message: string } | null;
  } = { data: [], error: null },
) {
  const builder: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    gte: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
    lte: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    then: (
      resolve: (value: typeof result) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise<unknown>;
  } = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.gte.mockReturnValue(builder);
  builder.lt.mockReturnValue(builder);
  builder.lte.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);

  const from = vi.fn(() => builder);

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
    spies: { from, ...builder },
  };
}

describe("listMeasurements", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("rejects unauthenticated requests before querying", async () => {
    const testClient = makeListClient(null);
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements();

    expect(result).toMatchObject({
      success: false,
      error: "unauthorized",
    });
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns only the authenticated user's rows newest-first by default", async () => {
    const rows = [
      makeMeasurementRow(),
      makeMeasurementRow({
        id: "measurement-2",
        measurement_type: "waist",
        value: "32.25",
        unit: "in",
        measured_at: "2026-09-22T08:00:00.000Z",
      }),
    ];
    const testClient = makeListClient(
      { id: "user-1" },
      { data: rows, error: null },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.measurements.map(({ id }) => id)).toEqual([
        "measurement-1",
        "measurement-2",
      ]);
      expect(result.measurements[0].value).toBe(175.5);
    }
    expect(testClient.spies.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(testClient.spies.order).toHaveBeenNthCalledWith(
      1,
      "measured_at",
      { ascending: false },
    );
    expect(testClient.spies.order).toHaveBeenNthCalledWith(2, "created_at", {
      ascending: false,
    });
    expect(testClient.spies.order).toHaveBeenNthCalledWith(3, "id", {
      ascending: false,
    });
  });

  it("applies type, date-only range, and oldest-first filters", async () => {
    const testClient = makeListClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements({
      measurement_type: "weight",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      sort_order: "oldest",
    });

    expect(result.success).toBe(true);
    expect(testClient.spies.eq).toHaveBeenCalledWith(
      "measurement_type",
      "weight",
    );
    expect(testClient.spies.gte).toHaveBeenCalledWith(
      "measured_at",
      "2026-09-01T00:00:00.000Z",
    );
    expect(testClient.spies.lt).toHaveBeenCalledWith(
      "measured_at",
      "2026-10-01T00:00:00.000Z",
    );
    expect(testClient.spies.lte).not.toHaveBeenCalled();
    expect(testClient.spies.order).toHaveBeenNthCalledWith(
      1,
      "measured_at",
      { ascending: true },
    );
  });

  it("uses an inclusive end bound for an exact date-time", async () => {
    const testClient = makeListClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements({
      end_date: "2026-09-23T17:00:00-04:00",
    });

    expect(result.success).toBe(true);
    expect(testClient.spies.lte).toHaveBeenCalledWith(
      "measured_at",
      "2026-09-23T21:00:00.000Z",
    );
    expect(testClient.spies.lt).not.toHaveBeenCalled();
  });

  it("returns field errors without querying invalid filters", async () => {
    const testClient = makeListClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements({
      measurement_type: "height",
      start_date: "2026-10-01",
      end_date: "2026-09-01",
      sort_order: "largest",
    } as unknown as ListMeasurementsInput);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors?.measurement_type).toBeTruthy();
      expect(result.fieldErrors?.sort_order).toBeTruthy();
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
  });

  it("returns a safe error when the database query fails", async () => {
    const testClient = makeListClient(
      { id: "user-1" },
      { data: null, error: { message: "internal database detail" } },
    );
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements();

    expect(result).toEqual({
      success: false,
      error: "database",
      message: "Unable to load your measurements. Please try again.",
    });
  });
});
