import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ListMeasurementsInput } from "@/lib/types/measurement";
import {
  decodeMeasurementCursor,
  encodeMeasurementCursor,
} from "@/lib/measurements/pagination";

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
    or: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
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
    or: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };

  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.gte.mockReturnValue(builder);
  builder.lt.mockReturnValue(builder);
  builder.lte.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);

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

const DEFAULT_FILTER_KEY = JSON.stringify({
  measurement_type: null,
  start_date: null,
  end_date: null,
  end_date_is_date_only: null,
});

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
      expect(result.has_more).toBe(false);
      expect(result.next_cursor).toBeNull();
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
    expect(testClient.spies.limit).toHaveBeenCalledWith(26);
  });

  it("returns an opaque cursor and uses it to seek the next page", async () => {
    const rows = [
      makeMeasurementRow({
        id: "11111111-1111-4111-8111-111111111111",
        measured_at: "2026-09-23T08:00:00.000Z",
        created_at: "2026-09-23T08:06:00.000Z",
      }),
      makeMeasurementRow({
        id: "22222222-2222-4222-8222-222222222222",
        measured_at: "2026-09-23T08:00:00.000Z",
        created_at: "2026-09-23T08:05:00.000Z",
      }),
      makeMeasurementRow({
        id: "33333333-3333-4333-8333-333333333333",
        measured_at: "2026-09-22T08:00:00.000Z",
      }),
    ];
    const firstClient = makeListClient(
      { id: "user-1" },
      { data: rows, error: null },
    );
    createClientMock.mockResolvedValueOnce(firstClient.client);

    const firstPage = await listMeasurements({ page_size: 2 });

    expect(firstPage.success).toBe(true);
    if (!firstPage.success) return;
    expect(firstPage.measurements).toHaveLength(2);
    expect(firstPage.has_more).toBe(true);
    expect(firstPage.next_cursor).not.toBeNull();
    expect(decodeMeasurementCursor(firstPage.next_cursor!)).toMatchObject({
      id: "22222222-2222-4222-8222-222222222222",
      sort_order: "newest",
      filter_key: DEFAULT_FILTER_KEY,
    });
    expect(firstClient.spies.limit).toHaveBeenCalledWith(3);

    const secondClient = makeListClient(
      { id: "user-1" },
      { data: [rows[2]], error: null },
    );
    createClientMock.mockResolvedValueOnce(secondClient.client);

    const secondPage = await listMeasurements({
      page_size: 2,
      cursor: firstPage.next_cursor!,
    });

    expect(secondPage.success).toBe(true);
    if (secondPage.success) {
      expect(secondPage.measurements.map(({ id }) => id)).toEqual([
        "33333333-3333-4333-8333-333333333333",
      ]);
      expect(secondPage.has_more).toBe(false);
      expect(secondPage.next_cursor).toBeNull();
    }
    expect(secondClient.spies.or).toHaveBeenCalledWith(
      [
        "measured_at.lt.2026-09-23T08:00:00.000Z",
        "and(measured_at.eq.2026-09-23T08:00:00.000Z,created_at.lt.2026-09-23T08:05:00.000Z)",
        "and(measured_at.eq.2026-09-23T08:00:00.000Z,created_at.eq.2026-09-23T08:05:00.000Z,id.lt.22222222-2222-4222-8222-222222222222)",
      ].join(","),
    );
  });

  it("uses forward cursor comparisons for oldest-first pages", async () => {
    const cursor = encodeMeasurementCursor(
      {
        id: "11111111-1111-4111-8111-111111111111",
        measured_at: "2026-09-23T08:00:00.000Z",
        created_at: "2026-09-23T08:05:00.000Z",
      },
      "oldest",
      DEFAULT_FILTER_KEY,
    );
    const testClient = makeListClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements({
      sort_order: "oldest",
      cursor,
    });

    expect(result.success).toBe(true);
    expect(testClient.spies.or).toHaveBeenCalledWith(
      expect.stringContaining("measured_at.gt."),
    );
  });

  it("rejects a cursor reused with different filters", async () => {
    const cursor = encodeMeasurementCursor(
      {
        id: "11111111-1111-4111-8111-111111111111",
        measured_at: "2026-09-23T08:00:00.000Z",
        created_at: "2026-09-23T08:05:00.000Z",
      },
      "newest",
      DEFAULT_FILTER_KEY,
    );
    const testClient = makeListClient({ id: "user-1" });
    createClientMock.mockResolvedValueOnce(testClient.client);

    const result = await listMeasurements({
      measurement_type: "weight",
      cursor,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("validation");
      expect(result.fieldErrors?.cursor).toBe(
        "Cursor does not match the current filters or sort order.",
      );
    }
    expect(testClient.spies.from).not.toHaveBeenCalled();
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
