"use client";

import { useEffect, useState } from "react";
import { listMeasurements } from "@/lib/measurements/actions";
import { formatMeasurementValue } from "@/lib/measurements/display";
import {
  buildWeightTrendSummary,
  formatWeightTrendDelta,
  getWeightTrendDateRange,
} from "@/lib/measurements/trend";
import { WeightTrendChart } from "@/components/measurements/weight-trend-chart";

type WeightTrendCardProps = {
  refreshToken: number;
  onLogMeasurementClick: () => void;
};

export function WeightTrendCard({
  refreshToken,
  onLogMeasurementClick,
}: WeightTrendCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState(
    buildWeightTrendSummary([]),
  );

  useEffect(() => {
    let cancelled = false;
    const range = getWeightTrendDateRange();

    const run = async () => {
      setLoading(true);
      setError(null);

      const result = await listMeasurements({
        measurement_type: "weight",
        start_date: range.start_date,
        end_date: range.end_date,
        page_size: 100,
        sort_order: "newest",
      });

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!result.success) {
        setSummary(buildWeightTrendSummary([]));
        setError(result.message);
        return;
      }

      setSummary(buildWeightTrendSummary(result.measurements));
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
    const range = getWeightTrendDateRange();

    const result = await listMeasurements({
      measurement_type: "weight",
      start_date: range.start_date,
      end_date: range.end_date,
      page_size: 100,
      sort_order: "newest",
    });

    setLoading(false);

    if (!result.success) {
      setSummary(buildWeightTrendSummary([]));
      setError(result.message);
      return;
    }

    setSummary(buildWeightTrendSummary(result.measurements));
  }

  return (
    <section
      className="rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm"
      aria-labelledby="weight-trend-heading"
    >
      <h2
        id="weight-trend-heading"
        className="text-lg font-semibold text-text-primary"
      >
        Weight trend
      </h2>
      <p className="mt-1 text-xs text-text-muted">Last 30 days</p>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-text-muted" aria-live="polite">
            Loading weight trend…
          </p>
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
              No weight entries in the last 30 days
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Log a weight check-in when you are ready — your trend will appear
              here as you build history.
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
                  summary.delta < 0
                    ? "text-success"
                    : summary.delta > 0
                      ? "text-text-muted"
                      : "text-text-muted"
                }`}
              >
                {formatWeightTrendDelta(summary.delta, summary.unit)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-muted">
                Log another weigh-in to see your trend over this window.
              </p>
            )}
            <WeightTrendChart points={summary.points} />
          </>
        )}
      </div>
    </section>
  );
}
