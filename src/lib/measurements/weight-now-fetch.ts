import { listMeasurements } from "@/lib/measurements/actions";
import { addUtcCalendarDays } from "@/lib/measurements/calendar-date";
import type { Measurement } from "@/lib/types/measurement";

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

/**
 * Newest-first pages are enough once the last row is on or before the
 * 30-day lookback of the latest weight (latest is the first row of page 1).
 */
export function pageReachesWeightNowLookback(
  page: readonly Measurement[],
  latestMeasuredOn: string,
): boolean {
  if (page.length === 0) {
    return true;
  }
  const lookbackOn = addUtcCalendarDays(latestMeasuredOn, -30);
  return page[page.length - 1]!.measured_on <= lookbackOn;
}

export async function fetchWeightRowsForWeightNow(): Promise<
  | { ok: true; measurements: Measurement[] }
  | { ok: false; message: string }
> {
  const measurements: Measurement[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  let latestMeasuredOn: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const result = await listMeasurements({
      measurement_type: "weight",
      page_size: PAGE_SIZE,
      sort_order: "newest",
      ...(cursor ? { cursor } : {}),
    });

    if (!result.success) {
      return { ok: false, message: result.message };
    }

    const pageRows = result.measurements;
    measurements.push(...pageRows);

    if (pageRows.length === 0) {
      return { ok: true, measurements };
    }

    if (latestMeasuredOn === null) {
      latestMeasuredOn = pageRows[0]!.measured_on;
    }

    if (pageReachesWeightNowLookback(pageRows, latestMeasuredOn)) {
      return { ok: true, measurements };
    }

    if (!result.has_more || result.next_cursor === null) {
      return { ok: true, measurements };
    }
    if (seen.has(result.next_cursor)) {
      return { ok: true, measurements };
    }
    seen.add(result.next_cursor);
    cursor = result.next_cursor;
  }

  return { ok: true, measurements };
}
