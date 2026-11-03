import {
  addUtcCalendarDays,
  addUtcCalendarMonths,
  isValidCalendarDate,
} from "@/lib/measurements/calendar-date";

export const WEIGHT_TREND_RANGES = ["30d", "90d", "6m", "1y", "all"] as const;

export type WeightTrendRange = (typeof WEIGHT_TREND_RANGES)[number];

export const DEFAULT_WEIGHT_TREND_RANGE: WeightTrendRange = "90d";

export interface WeightTrendRangeOption {
  id: WeightTrendRange;
  label: string;
  subtitle: string;
  periodLabel: string;
  chartDescription: string;
  emptyTitle: string;
  emptyBody: string;
}

const RANGE_EMPTY_BODY =
  "Nothing in this range yet. Try a longer range, or log a weight check-in and your trend will show up here.";

export const WEIGHT_TREND_RANGE_OPTIONS: readonly WeightTrendRangeOption[] = [
  {
    id: "30d",
    label: "30D",
    subtitle: "Last 30 days",
    periodLabel: "30 days",
    chartDescription: "the last 30 days",
    emptyTitle: "No weight entries in the last 30 days",
    emptyBody: RANGE_EMPTY_BODY,
  },
  {
    id: "90d",
    label: "90D",
    subtitle: "Last 90 days",
    periodLabel: "90 days",
    chartDescription: "the last 90 days",
    emptyTitle: "No weight entries in the last 90 days",
    emptyBody: RANGE_EMPTY_BODY,
  },
  {
    id: "6m",
    label: "6M",
    subtitle: "Last 6 months",
    periodLabel: "6 months",
    chartDescription: "the last 6 months",
    emptyTitle: "No weight entries in the last 6 months",
    emptyBody: RANGE_EMPTY_BODY,
  },
  {
    id: "1y",
    label: "1Y",
    subtitle: "Last year",
    periodLabel: "1 year",
    chartDescription: "the last year",
    emptyTitle: "No weight entries in the last year",
    emptyBody: RANGE_EMPTY_BODY,
  },
  {
    id: "all",
    label: "All",
    subtitle: "All time",
    periodLabel: "all time",
    chartDescription: "all time",
    emptyTitle: "No weight entries yet",
    emptyBody:
      "Log a weight check-in when you are ready — your trend will appear here as you build history.",
  },
];

export function getWeightTrendRangeOption(
  range: WeightTrendRange,
): WeightTrendRangeOption {
  const option = WEIGHT_TREND_RANGE_OPTIONS.find((item) => item.id === range);
  if (!option) {
    throw new Error(`Unknown weight trend range: ${range}`);
  }
  return option;
}

/**
 * Inclusive start of a trend window as a YYYY-MM-DD calendar day.
 * 30D and 90D count today plus the previous 29 or 89 days.
 * 6M and 1Y step whole calendar months and clamp short months.
 * All has no start. An invalid `today` returns null.
 */
export function weightTrendRangeStartDate(
  range: WeightTrendRange,
  today: string,
): string | null {
  if (range === "all" || !isValidCalendarDate(today)) {
    return null;
  }

  switch (range) {
    case "30d":
      return addUtcCalendarDays(today, -29);
    case "90d":
      return addUtcCalendarDays(today, -89);
    case "6m":
      return addUtcCalendarMonths(today, -6);
    case "1y":
      return addUtcCalendarMonths(today, -12);
    default: {
      const neverRange: never = range;
      return neverRange;
    }
  }
}

/**
 * Keep entries whose `measured_on` calendar day falls in the selected window.
 * Comparison uses the YYYY-MM-DD string, matching how measurement dates are
 * stored, so a UTC timestamp cannot move a day across a timezone boundary.
 * Days outside a bounded window are dropped. All returns every entry.
 * A window with fewer points than its length returns those points as-is.
 */
export function filterMeasurementsByWeightTrendRange<
  T extends { measured_on: string },
>(measurements: readonly T[], range: WeightTrendRange, today: string): T[] {
  if (range === "all") {
    return [...measurements];
  }

  const start = weightTrendRangeStartDate(range, today);
  if (start === null || !isValidCalendarDate(today)) {
    return [];
  }

  return measurements.filter((entry) => {
    if (!isValidCalendarDate(entry.measured_on)) {
      return false;
    }
    return entry.measured_on >= start && entry.measured_on <= today;
  });
}
