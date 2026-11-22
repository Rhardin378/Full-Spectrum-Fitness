import {
  addUtcCalendarDays,
  calendarDateTimestamp,
  formatCalendarDate,
  isValidCalendarDate,
} from "@/lib/measurements/calendar-date";
import type { Measurement, MeasurementUnit } from "@/lib/types/measurement";

/** Optional active weight goal from G.1. Absent until that ticket ships. */
export type WeightNowGoal = {
  target: number;
  unit: MeasurementUnit;
};

export type WeightNowChangeTone = "muted" | "toward_goal";

export type WeightNowSummary =
  | { status: "empty" }
  | {
      status: "ready";
      latest: Measurement;
      relativeLine: string;
      change30d: {
        delta: number;
        label: string;
        tone: WeightNowChangeTone;
      } | null;
      toGoalLine: string | null;
    };

/** Whole calendar days from `from` to `to` (to − from). */
export function calendarDaysBetween(from: string, to: string): number {
  if (!isValidCalendarDate(from) || !isValidCalendarDate(to)) {
    throw new Error(`Invalid calendar date: ${from} / ${to}`);
  }
  const ms =
    calendarDateTimestamp(to) - calendarDateTimestamp(from);
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/** “Nov 10” — month and day only, UTC calendar (no year). */
export function formatCalendarMonthDay(
  isoDate: string,
  locale = "en-US",
): string {
  if (!isValidCalendarDate(isoDate)) {
    return isoDate;
  }
  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Relative logged copy from validated local today to measured_on.
 * Future dates (slack window) use the day count and are never “Logged today”.
 */
export function formatLoggedRelative(
  today: string,
  measuredOn: string,
): string {
  const days = calendarDaysBetween(measuredOn, today);
  if (days === 0) return "Logged today";
  if (days === 1) return "Logged yesterday";
  if (days > 1) return `Logged ${days} days ago`;
  const ahead = -days;
  return ahead === 1 ? "Logged 1 day from now" : `Logged ${ahead} days from now`;
}

/** Half away from zero to one decimal (1.25 → 1.3, −1.25 → −1.3). */
export function roundHalfAwayFromZeroOneDecimal(value: number): number {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(value) * 10)) / 10;
}

function formatOneDecimal(value: number): string {
  const rounded = roundHalfAwayFromZeroOneDecimal(value);
  return rounded.toFixed(1);
}

/** Ticket copy uses the Unicode minus (U+2212). */
export function formatWeightNowDeltaLabel(
  delta: number,
  unit: MeasurementUnit,
): string {
  const rounded = roundHalfAwayFromZeroOneDecimal(delta);
  const abs = formatOneDecimal(Math.abs(rounded));
  if (rounded < 0) {
    return `−${abs} ${unit} over 30 days`;
  }
  if (rounded > 0) {
    return `+${abs} ${unit} over 30 days`;
  }
  return `0.0 ${unit} over 30 days`;
}

export function isChangeTowardGoal(
  delta: number,
  latestValue: number,
  target: number,
): boolean {
  if (delta === 0) return false;
  if (target < latestValue) return delta < 0;
  if (target > latestValue) return delta > 0;
  return false;
}

export function formatToGoalLine(
  latestValue: number,
  unit: MeasurementUnit,
  goal: WeightNowGoal | null | undefined,
): string | null {
  if (!goal || goal.unit !== unit) {
    return null;
  }

  // Direction: down when target is lower than latest, up when higher.
  if (goal.target < latestValue) {
    // Still above a lower target.
    const remaining = roundHalfAwayFromZeroOneDecimal(
      latestValue - goal.target,
    );
    return `${formatOneDecimal(remaining)} ${unit} to goal`;
  }
  if (goal.target > latestValue) {
    const remaining = roundHalfAwayFromZeroOneDecimal(
      goal.target - latestValue,
    );
    return `${formatOneDecimal(remaining)} ${unit} to goal`;
  }
  return "At your goal";
}

function compareNewestFirst(a: Measurement, b: Measurement): number {
  const measuredDiff = b.measured_on.localeCompare(a.measured_on);
  if (measuredDiff !== 0) return measuredDiff;
  const createdDiff =
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (createdDiff !== 0) return createdDiff;
  return b.id.localeCompare(a.id);
}

/**
 * Latest weight on or before `lookbackOn` (newest-first tie-break matches the list).
 */
export function findBaselineWeight(
  weights: readonly Measurement[],
  lookbackOn: string,
): Measurement | null {
  const candidates = weights
    .filter(
      (row) =>
        row.measurement_type === "weight" &&
        row.deleted_at == null &&
        row.measured_on <= lookbackOn,
    )
    .sort(compareNewestFirst);
  return candidates[0] ?? null;
}

export function pickLatestWeight(
  measurements: readonly Measurement[],
): Measurement | null {
  const weights = measurements
    .filter(
      (row) => row.measurement_type === "weight" && row.deleted_at == null,
    )
    .sort(compareNewestFirst);
  return weights[0] ?? null;
}

export function buildWeightNowSummary(
  measurements: readonly Measurement[],
  today: string,
  goal: WeightNowGoal | null = null,
): WeightNowSummary {
  const weights = measurements.filter(
    (row) => row.measurement_type === "weight" && row.deleted_at == null,
  );
  const latest = pickLatestWeight(weights);
  if (!latest) {
    return { status: "empty" };
  }

  const relative =
    formatLoggedRelative(today, latest.measured_on);
  const relativeLine = `${relative} · ${formatCalendarMonthDay(latest.measured_on)}`;

  const lookbackOn = addUtcCalendarDays(latest.measured_on, -30);
  const baseline = findBaselineWeight(weights, lookbackOn);

  let change30d: {
    delta: number;
    label: string;
    tone: WeightNowChangeTone;
  } | null = null;

  if (baseline && baseline.unit === latest.unit) {
    const delta = roundHalfAwayFromZeroOneDecimal(
      latest.value - baseline.value,
    );
    const toward =
      goal && goal.unit === latest.unit
        ? isChangeTowardGoal(delta, latest.value, goal.target)
        : false;
    change30d = {
      delta,
      label: formatWeightNowDeltaLabel(delta, latest.unit),
      tone: toward ? "toward_goal" : "muted",
    };
  }

  return {
    status: "ready",
    latest,
    relativeLine,
    change30d,
    toGoalLine: formatToGoalLine(latest.value, latest.unit, goal),
  };
}

/** Keeps formatCalendarDate available for callers that want the full date. */
export { formatCalendarDate };
