"use client";

import { useEffect, useRef, useState } from "react";
import { listMeasurements } from "@/lib/measurements/actions";
import {
  formatMeasuredOnDisplay,
  formatMeasurementValue,
  measurementTypeLabel,
} from "@/lib/measurements/display";
import { DeleteMeasurementDialog } from "@/components/measurements/delete-measurement-dialog";
import { LogMeasurementModal } from "@/components/measurements/log-measurement-modal";
import { WeightTrendCard } from "@/components/measurements/weight-trend-card";
import type { Measurement, MeasurementType } from "@/lib/types/measurement";

type TypeFilter = "all" | MeasurementType;

type HistoryStatusBanner = "updated" | "deleted" | "missing";

const STATUS_BANNER_COPY: Record<HistoryStatusBanner, string> = {
  updated: "Measurement updated.",
  deleted: "Measurement removed from your history.",
  missing: "That measurement is no longer in your history.",
};

const ROW_ACTION_CLASS_NAME =
  "inline-flex min-h-11 min-w-11 -my-2 items-center justify-center rounded-lg px-3 text-xs font-semibold transition disabled:opacity-60";

function historyActionName(
  action: "Edit" | "Delete",
  entry: Measurement,
): string {
  return `${action} ${measurementTypeLabel(entry.measurement_type)} on ${formatMeasuredOnDisplay(entry.measured_on)}`;
}

type MeasurementsTabPanelProps = {
  onLogMeasurementClick: () => void;
  refreshToken: number;
  showSaveSuccess?: boolean;
  onHistoryRefresh: () => void;
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
  onHistoryRefresh,
}: MeasurementsTabPanelProps) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);
  const [deletingMeasurement, setDeletingMeasurement] =
    useState<Measurement | null>(null);
  const [statusBanner, setStatusBanner] = useState<HistoryStatusBanner | null>(
    null,
  );
  const statusTimerRef = useRef<number | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const historyHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current !== null) {
        window.clearTimeout(statusTimerRef.current);
      }
      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  function showStatusBanner(kind: HistoryStatusBanner) {
    setStatusBanner(kind);
    if (statusTimerRef.current !== null) {
      window.clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = window.setTimeout(() => {
      statusTimerRef.current = null;
      setStatusBanner(null);
    }, 5000);
  }

  function focusHistoryHeading() {
    if (focusFrameRef.current !== null) {
      window.cancelAnimationFrame(focusFrameRef.current);
    }
    // The dialog focus trap restores the row button on close. Move focus
    // after that, because a successful delete removes the button.
    focusFrameRef.current = window.requestAnimationFrame(() => {
      focusFrameRef.current = null;
      historyHeadingRef.current?.focus();
    });
  }

  function handleEditSaved() {
    onHistoryRefresh();
    showStatusBanner("updated");
    setEditingMeasurement(null);
  }

  function handleDeleteConfirmed() {
    onHistoryRefresh();
    showStatusBanner("deleted");
    setDeletingMeasurement(null);
    focusHistoryHeading();
  }

  function handleMeasurementMissing() {
    onHistoryRefresh();
    showStatusBanner("missing");
    setEditingMeasurement(null);
    setDeletingMeasurement(null);
    focusHistoryHeading();
  }

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
    <>
      <LogMeasurementModal
        key={editingMeasurement?.id ?? "edit-closed"}
        mode="edit"
        measurement={editingMeasurement}
        open={editingMeasurement !== null}
        onClose={() => setEditingMeasurement(null)}
        onSaved={handleEditSaved}
        onNotFound={handleMeasurementMissing}
      />

      <DeleteMeasurementDialog
        key={deletingMeasurement?.id ?? "delete-closed"}
        measurement={deletingMeasurement}
        open={deletingMeasurement !== null}
        onClose={() => setDeletingMeasurement(null)}
        onDeleted={handleDeleteConfirmed}
        onNotFound={handleMeasurementMissing}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm"
          aria-labelledby="recent-history-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2
                id="recent-history-heading"
                ref={historyHeadingRef}
                tabIndex={-1}
                className="rounded-sm text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-coral/40"
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

          {statusBanner ? (
            <p
              role="status"
              className="mt-4 rounded-lg border border-brand-coral/25 bg-brand-coral-light/50 px-3 py-2 text-sm text-text-primary"
            >
              {STATUS_BANNER_COPY[statusBanner]}
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
                {measurements.map((entry) => {
                  const rowBusy =
                    editingMeasurement?.id === entry.id ||
                    deletingMeasurement?.id === entry.id;
                  return (
                    <li
                      key={entry.id}
                      className="group flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
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
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <p className="text-sm font-semibold tabular-nums text-text-primary">
                          {formatMeasurementValue(entry.value, entry.unit)}
                        </p>
                        {/* Hidden until hover or focus only when a pointer can hover. */}
                        <div className="flex flex-wrap gap-2 transition-opacity can-hover:opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
                          <button
                            type="button"
                            aria-label={historyActionName("Edit", entry)}
                            disabled={rowBusy}
                            onClick={() => setEditingMeasurement(entry)}
                            className={`${ROW_ACTION_CLASS_NAME} text-brand-coral hover:bg-brand-coral-light hover:text-brand-coral-deep`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            aria-label={historyActionName("Delete", entry)}
                            disabled={rowBusy}
                            onClick={() => setDeletingMeasurement(entry)}
                            className={`${ROW_ACTION_CLASS_NAME} text-text-muted hover:bg-surface-page hover:text-brand-coral-deep`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <WeightTrendCard
          refreshToken={refreshToken}
          onLogMeasurementClick={onLogMeasurementClick}
        />
      </div>
    </>
  );
}
