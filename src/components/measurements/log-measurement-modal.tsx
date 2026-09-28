"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createMeasurement } from "@/lib/measurements/actions";
import {
  parsePositiveDecimal,
  toDateInputValue,
} from "@/lib/measurements/display";
import type {
  MeasurementType,
  MeasurementUnit,
} from "@/lib/types/measurement";
import { WAIST_UNITS, WEIGHT_UNITS } from "@/lib/types/measurement";
import { useModalFocusTrap } from "@/components/measurements/use-modal-focus-trap";

type LogMeasurementModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const TYPE_OPTIONS: { id: MeasurementType; label: string }[] = [
  { id: "weight", label: "Weight" },
  { id: "waist", label: "Waist" },
];

function defaultUnitForType(type: MeasurementType): MeasurementUnit {
  return type === "weight" ? "lb" : "in";
}

function unitsForType(type: MeasurementType): readonly MeasurementUnit[] {
  return type === "weight" ? WEIGHT_UNITS : WAIST_UNITS;
}

export function LogMeasurementModal({
  open,
  onClose,
  onSaved,
}: LogMeasurementModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef, open);

  const [measurementType, setMeasurementType] =
    useState<MeasurementType>("weight");
  const [unit, setUnit] = useState<MeasurementUnit>("lb");
  const [valueInput, setValueInput] = useState("");
  const [measuredAt, setMeasuredAt] = useState(() => toDateInputValue());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  function handleTypeChange(type: MeasurementType) {
    setMeasurementType(type);
    const allowed = unitsForType(type);
    if (!allowed.includes(unit)) {
      setUnit(defaultUnitForType(type));
    }
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.unit;
      delete next.measurement_type;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsedValue = parsePositiveDecimal(valueInput);
    if (parsedValue === null) {
      setFieldErrors({
        value:
          "Enter a positive number with up to two decimal places.",
      });
      return;
    }

    if (!measuredAt.trim()) {
      setFieldErrors({ measured_at: "Measurement date is required." });
      return;
    }

    setSubmitting(true);

    const result = await createMeasurement({
      measurement_type: measurementType,
      value: parsedValue,
      unit,
      measured_at: measuredAt,
      notes: notes.trim() ? notes : null,
    });

    setSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      setFormError(result.message);
      return;
    }

    onSaved();
    onClose();
  }

  if (!open) {
    return null;
  }

  const unitOptions = unitsForType(measurementType);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[420px] rounded-2xl bg-surface-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className="text-xl font-semibold text-text-primary sm:text-[22px]"
          >
            Log measurement
          </h2>
          <button
            type="button"
            aria-label="Close"
            disabled={submitting}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-page hover:text-text-primary disabled:opacity-60"
          >
            <span className="text-2xl leading-none" aria-hidden>×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[18px]">
          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
            >
              {formError}
            </p>
          ) : null}

          <div>
            <span
              id={`${titleId}-type-label`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Measurement type
            </span>
            <div
              role="group"
              aria-labelledby={`${titleId}-type-label`}
              className="grid grid-cols-2 overflow-hidden rounded-xl border border-black/10 bg-surface-card"
            >
              {TYPE_OPTIONS.map((option) => {
                const selected = measurementType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleTypeChange(option.id)}
                    className={`px-4 py-3 text-[15px] font-medium transition ${
                      selected
                        ? "bg-brand-coral-light text-text-primary shadow-[inset_0_0_0_1px_var(--brand-coral)]"
                        : "bg-surface-card text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {fieldErrors.measurement_type ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.measurement_type}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${titleId}-value`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Value
            </label>
            <div className="grid grid-cols-[1fr_88px] gap-2.5">
              <input
                id={`${titleId}-value`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                aria-invalid={Boolean(fieldErrors.value)}
                aria-describedby={
                  fieldErrors.value ? `${titleId}-value-error` : undefined
                }
                className="w-full rounded-[10px] border border-black/10 bg-surface-card px-3.5 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25"
                placeholder="0.0"
              />
              <select
                aria-label="Unit"
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value as MeasurementUnit)
                }
                className="w-full rounded-[10px] border border-black/10 bg-surface-card px-2 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25"
              >
                {unitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.value ? (
              <p
                id={`${titleId}-value-error`}
                className="mt-1.5 text-sm text-brand-coral-deep"
              >
                {fieldErrors.value}
              </p>
            ) : null}
            {fieldErrors.unit ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.unit}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${titleId}-date`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Date
            </label>
            <input
              id={`${titleId}-date`}
              type="date"
              value={measuredAt}
              onChange={(event) => setMeasuredAt(event.target.value)}
              aria-invalid={Boolean(fieldErrors.measured_at)}
              className="w-full rounded-[10px] border border-black/10 bg-surface-card px-3.5 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25"
            />
            {fieldErrors.measured_at ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.measured_at}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${titleId}-notes`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Notes (optional)
            </label>
            <textarea
              id={`${titleId}-notes`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Anything worth remembering about this check-in..."
              className="w-full resize-none rounded-[10px] border border-black/10 bg-surface-card px-3.5 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25"
            />
            {fieldErrors.notes ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.notes}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-brand-coral-deep px-5 py-3.5 text-base font-semibold text-white shadow-[0_2px_8px_rgba(209,74,64,0.35)] transition hover:bg-brand-coral-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving…" : "Save measurement"}
          </button>
        </form>
      </div>
    </div>
  );
}
