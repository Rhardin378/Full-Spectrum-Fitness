"use client";

import { useEffect, useState } from "react";
import { listMeasurements } from "@/lib/measurements/actions";
import {
  formatMeasuredOnDisplay,
  formatMeasurementValue,
  measurementTypeLabel,
} from "@/lib/measurements/display";
import { WeightTrendCard } from "@/components/measurements/weight-trend-card";
import type { Measurement, MeasurementType } from "@/lib/types/measurement";

type TypeFilter = "all" | MeasurementType;

type MeasurementsTabPanelProps = {
  onLogMeasurementClick: () => void;
  refreshToken: number;
  showSaveSuccess?: boolean;
};

const FILTER_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "weight", label: "Weight" },
  { id: "waist", label: "Waist" },
];

export function MeasurementsTabPanel({
  onLogMeasurementClick,
  refreshToken,
  showSaveSuccess = false,
}: MeasurementsTabPanelProps) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      const result = await listMeasurements({
        measurement_type: filter === "all" ? undefined : filter,
        page_size: 25,
        sort_order: "newest",
      });

      if (cancelled) {
        return;
      }

      setLoading(false);

      if (!result.success) {
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
  }, [filter, refreshToken]);

  async function retryLoad() {
    setLoading(true);
    setError(null);

    const result = await listMeasurements({
      measurement_type: filter === "all" ? undefined : filter,
      page_size: 25,
      sort_order: "newest",
    });

    setLoading(false);

    if (!result.success) {
      setMeasurements([]);
      setError(result.message);
      return;
    }

    setMeasurements(result.measurements);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        className="rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm"
        aria-labelledby="recent-history-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="recent-history-heading"
              className="text-lg font-semibold text-text-primary"
            >
              Recent history
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Newest entries first
            </p>
          </div>
          <button
            type="button"
            onClick={onLogMeasurementClick}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-coral px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-coral-deep"
          >
            + Log measurement
          </button>
        </div>

        <div
          role="group"
          aria-label="Filter by measurement type"
          className="mt-4 flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-coral-light text-text-primary ring-1 ring-brand-coral"
                    : "bg-surface-page text-text-muted hover:text-text-primary"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {showSaveSuccess ? (
          <p
            role="status"
            className="mt-4 rounded-lg border border-brand-coral/25 bg-brand-coral-light/50 px-3 py-2 text-sm text-text-primary"
          >
            Measurement saved. Nice work — keep building the picture.
          </p>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-text-muted" aria-live="polite">
              Loading your measurements…
            </p>
          ) : error ? (
            <div className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/30 px-4 py-3">
              <p className="text-sm font-medium text-text-primary">
                Could not load history
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
          ) : measurements.length === 0 ? (
            <div className="rounded-xl bg-surface-page px-4 py-6 text-center">
              <p className="text-sm font-medium text-text-primary">
                No measurements yet
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Log your first weight or waist entry when you are ready — you are
                building a clear picture of progress, not chasing perfection.
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
            <ul className="divide-y divide-black/5">
              {measurements.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {measurementTypeLabel(entry.measurement_type)}
                    </p>
                    <p className="text-sm text-text-muted">
                      {formatMeasuredOnDisplay(entry.measured_on)}
                    </p>
                    {entry.notes ? (
                      <p className="mt-1 text-sm text-text-muted">
                        {entry.notes}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-text-primary sm:text-right">
                    {formatMeasurementValue(entry.value, entry.unit)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <WeightTrendCard
        refreshToken={refreshToken}
        onLogMeasurementClick={onLogMeasurementClick}
      />
    </div>
  );
}
