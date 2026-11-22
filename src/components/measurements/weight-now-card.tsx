"use client";

import { useEffect, useState } from "react";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import { formatMeasurementValue } from "@/lib/measurements/display";
import { fetchWeightRowsForWeightNow } from "@/lib/measurements/weight-now-fetch";
import {
  buildWeightNowSummary,
  type WeightNowSummary,
} from "@/lib/measurements/weight-now";

type WeightNowCardProps = {
  refreshToken: number;
  onLogMeasurementClick: () => void;
  className?: string;
  /** Test seam. */
  initialSummary?: WeightNowSummary;
};

export function WeightNowCard({
  refreshToken,
  onLogMeasurementClick,
  className = "",
  initialSummary,
}: WeightNowCardProps) {
  const skipFetch = initialSummary !== undefined;
  const [summary, setSummary] = useState<WeightNowSummary | null>(
    initialSummary ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!skipFetch);

  useEffect(() => {
    if (skipFetch) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      const loaded = await fetchWeightRowsForWeightNow();
      if (cancelled) return;
      if (!loaded.ok) {
        setSummary(null);
        setError(loaded.message);
        setLoading(false);
        return;
      }
      const today = todayLocalISODate();
      // G.1 not shipped — no active weight goal yet.
      setSummary(buildWeightNowSummary(loaded.measurements, today, null));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, skipFetch]);

  return (
    <section
      aria-labelledby="weight-now-heading"
      className={`rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm ${className}`}
    >
      <h2
        id="weight-now-heading"
        className="text-lg font-semibold text-text-primary"
      >
        Weight now
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-text-muted" role="status">
          Loading weight…
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-text-muted" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && summary?.status === "empty" ? (
        <div className="mt-4">
          <p className="text-base font-semibold text-text-primary">
            No weight logged yet.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Log a measurement to see your latest weight and the change over 30
            days.
          </p>
          <button
            type="button"
            onClick={onLogMeasurementClick}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2 text-sm font-semibold text-text-on-dark shadow-sm transition hover:bg-brand-coral-deep"
          >
            Log measurement
          </button>
        </div>
      ) : null}

      {!loading && !error && summary?.status === "ready" ? (
        <div className="mt-4 space-y-2">
          <p className="text-3xl font-semibold tabular-nums text-text-primary">
            {formatMeasurementValue(
              summary.latest.value,
              summary.latest.unit,
            )}
          </p>
          <p className="text-sm text-text-muted">{summary.relativeLine}</p>
          {summary.change30d ? (
            summary.change30d.tone === "toward_goal" ? (
              <p>
                <span className="inline-flex rounded-full bg-success px-2.5 py-1 text-sm font-medium text-text-primary">
                  {summary.change30d.label}
                </span>
              </p>
            ) : (
              <p className="text-sm text-text-muted">{summary.change30d.label}</p>
            )
          ) : null}
          {summary.toGoalLine ? (
            <p className="text-sm font-medium text-text-primary">
              {summary.toGoalLine}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
