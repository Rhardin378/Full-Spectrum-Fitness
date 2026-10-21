"use client";

import { useEffect, useId, useRef, useState } from "react";
import { softDeleteMeasurement } from "@/lib/measurements/actions";
import { useModalFocusTrap } from "@/components/measurements/use-modal-focus-trap";
import type { Measurement } from "@/lib/types/measurement";
import {
  formatMeasuredOnDisplay,
  formatMeasurementValue,
  measurementTypeLabel,
} from "@/lib/measurements/display";

type DeleteMeasurementDialogProps = {
  measurement: Measurement | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onNotFound: () => void;
};

const UNEXPECTED_DELETE_MESSAGE =
  "Unable to remove your measurement. Please try again.";

export function DeleteMeasurementDialog({
  measurement,
  open,
  onClose,
  onDeleted,
  onNotFound,
}: DeleteMeasurementDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef, open);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, submitting]);

  async function handleConfirm() {
    if (!measurement || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await softDeleteMeasurement({ id: measurement.id });

      if (!result.success) {
        if (result.error === "not_found") {
          onNotFound();
          onClose();
          return;
        }

        setErrorMessage(result.message);
        return;
      }

      onDeleted();
      onClose();
    } catch {
      setErrorMessage(UNEXPECTED_DELETE_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open || !measurement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-surface-header/45"
        onClick={() => {
          if (!submitting) {
            onClose();
          }
        }}
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
        className="relative z-10 w-full max-w-[400px] rounded-2xl bg-surface-card p-6 shadow-xl"
      >
        <h2
          id={titleId}
          className="text-lg font-semibold text-text-primary sm:text-xl"
        >
          Remove this measurement?
        </h2>
        <p
          id={`${titleId}-description`}
          className="mt-2 text-sm leading-relaxed text-text-muted"
        >
          {measurementTypeLabel(measurement.measurement_type)} ·{" "}
          {formatMeasuredOnDisplay(measurement.measured_on)} ·{" "}
          {formatMeasurementValue(measurement.value, measurement.unit)}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          It will disappear from your history and trend. You cannot undo this
          from the app.
        </p>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-black/10 bg-surface-card px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface-page disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleConfirm()}
            className="rounded-xl border-2 border-brand-coral-deep bg-brand-coral-light px-4 py-2.5 text-sm font-semibold text-brand-coral-deep transition hover:bg-brand-coral-light/80 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Removing…" : "Remove measurement"}
          </button>
        </div>
      </div>
    </div>
  );
}
