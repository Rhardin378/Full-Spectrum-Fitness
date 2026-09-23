import { describe, expect, it } from "vitest";
import {
  decodeMeasurementCursor,
  encodeMeasurementCursor,
} from "@/lib/measurements/pagination";

describe("measurement pagination cursors", () => {
  it("round-trips an opaque cursor with canonical timestamps", () => {
    const cursor = encodeMeasurementCursor(
      {
        id: "11111111-1111-4111-8111-111111111111",
        measured_at: "2026-09-23T08:30:00-04:00",
        created_at: "2026-09-23T13:00:00Z",
      },
      "newest",
      '{"measurement_type":"weight"}',
    );

    expect(cursor).not.toContain("{");
    expect(decodeMeasurementCursor(cursor)).toEqual({
      version: 1,
      id: "11111111-1111-4111-8111-111111111111",
      measured_at: "2026-09-23T12:30:00.000Z",
      created_at: "2026-09-23T13:00:00.000Z",
      sort_order: "newest",
      filter_key: '{"measurement_type":"weight"}',
    });
  });

  it.each([
    "",
    "not-base64-json",
    Buffer.from(JSON.stringify({ version: 2 })).toString("base64url"),
    Buffer.from(
      JSON.stringify({
        version: 1,
        id: "not-a-uuid",
        measured_at: "2026-09-23T12:30:00.000Z",
        created_at: "2026-09-23T13:00:00.000Z",
        sort_order: "newest",
        filter_key: "",
      }),
    ).toString("base64url"),
  ])("rejects malformed cursor %s", (cursor) => {
    expect(decodeMeasurementCursor(cursor)).toBeNull();
  });
});
