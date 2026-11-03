"use client";

import { useEffect, useState } from "react";
import { listMeasurements } from "@/lib/measurements/actions";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import { formatMeasurementValue } from "@/lib/measurements/display";
import {
  buildWeightTrendSummary,
  formatWeightTrendDelta,
} from "@/lib/measurements/trend";
import {
  DEFAULT_WEIGHT_TREND_RANGE,
  filterMeasurementsByWeightTrendRange,
  getWeightTrendRangeOption,
  type WeightTrendRange,
} from "@/lib/measurements/trend-range";
import type { Measurement } from "@/lib/types/measurement";
import { WeightTrendChart } from "@/components/measurements/weight-trend-chart";
import { WeightTrendRangeToggle } from "@/components/measurements/weight-trend-range-toggle";

interface WeightTrendCardProps {
  refreshToken: number;
  onLogMeasurementClick: () => void;
  className?: string;
}

const WEIGHT_TREND_PAGE_SIZE = 100;
const WEIGHT_TREND_MAX_PAGES = 50;

type LoadedWeights =
  | { ok: true; measurements: Measurement[] }
  | { ok: false; message: string };

async function fetchWeightTrendMeasurements(): Promise<LoadedWeights> {
  const measurements: Measurement[] = [];
  let cursor: string | undefined;
  const seenCursors = new Set<string>();

  for (let page = 0; page < WEIGHT_TREND_MAX_PAGES; page += 1) {
    const result = await listMeasurements({
      measurement_type: "weight",
      page_size: WEIGHT_TREND_PAGE_SIZE,
      sort_order: "newest",
      ...(cursor ? { cursor } : {}),
    });

    if (!result.success) {
      return { ok: false, message: result.message };
    }

    measurements.push(...result.measurements);

    if (!result.has_more || result.next_cursor === null) {
      return { ok: true, measurements };
    }

    if (seenCursors.has(result.next_cursor)) {
      return { ok: true, measurements };
    }

    seenCursors.add(result.next_cursor);
    cursor = result.next_cursor;
  }

  return { ok: true, measurements };
}

function weighInCountLabel(count: number): string {
  return count === 1 ? "1 weigh-in" : `${count} weigh-ins`;
}

export function WeightTrendCard({
  refreshToken,
  onLogMeasurementClick,
  className,
}: WeightTrendCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [range, setRange] = useState<WeightTrendRange>(
    DEFAULT_WEIGHT_TREND_RANGE,
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchWeightTrendMeasurements();
      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!result.ok) {
        setMeasurements([]);
        setError(result.message);
        return;
      }

      setMeasurements(result.measurements);
    };

    const frame = window.requestAnimationFrame(() => {
      void run();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [refreshToken]);

  async function retryLoad() {
    setLoading(true);
    setError(null);

    const result = await fetchWeightTrendMeasurements();
    setLoading(false);

    if (!result.ok) {
      setMeasurements([]);
      setError(result.message);
      return;
    }

    setMeasurements(result.measurements);
  }

  const rangeOption = getWeightTrendRangeOption(range);
  const summary = buildWeightTrendSummary(
    filterMeasurementsByWeightTrendRange(
      measurements,
      range,
      todayLocalISODate(),
    ),
  );

  return (
    <section
      className={[
        "rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="weight-trend-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            id="weight-trend-heading"
            className="text-lg font-semibold text-text-primary"
          >
            Weight trend
          </h2>
          <p className="mt-1 text-xs text-text-muted">{rangeOption.subtitle}</p>
        </div>
        <WeightTrendRangeToggle value={range} onChange={setRange} />
      </div>

      <div className="mt-4" aria-live="polite">
        {loading ? (
          <p className="text-sm text-text-muted">Loading weight trend…</p>
        ) : error ? (
          <div className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/30 px-4 py-3">
            <p className="text-sm font-medium text-text-primary">
              Could not load trend
            </p>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
            <button
              type="button"
              onClick={() => void retryLoad()}
              className="mt-3 text-sm font-semibold text-brand-coral hover:text-brand-coral-deep"
            >
              Try again
            </button>
          </div>
        ) : summary.status === "empty" ? (
          <div className="rounded-xl bg-surface-page px-4 py-6 text-center">
            <p className="text-sm font-medium text-text-primary">
              {rangeOption.emptyTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {rangeOption.emptyBody}
            </p>
            <button
              type="button"
              onClick={onLogMeasurementClick}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-coral-deep"
            >
              + Log measurement
            </button>
          </div>
        ) : (
          <>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-text-primary">
              {formatMeasurementValue(summary.latestValue, summary.unit)}
            </p>
            {summary.delta !== null ? (
              <p
                className={`mt-1 text-sm font-medium tabular-nums ${
                  summary.delta < 0 ? "text-success" : "text-text-muted"
                }`}
              >
                {formatWeightTrendDelta(
                  summary.delta,
                  summary.unit,
                  rangeOption.periodLabel,
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-muted">
                Log another weigh-in to see your trend over this window.
              </p>
            )}
            <p className="mt-1 text-sm text-text-muted">
              {weighInCountLabel(summary.points.length)}
            </p>
            <WeightTrendChart
              points={summary.points}
              rangeDescription={rangeOption.chartDescription}
            />
          </>
        )}
      </div>
    </section>
  );
}
