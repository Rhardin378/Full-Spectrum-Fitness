import type { ReactNode } from "react";

const RATING_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type RatingScaleProps = {
  id: string;
  label: ReactNode;
  legend?: string;
  value: number | null;
  /** Optional scales clear when the selected value is pressed again. */
  optional?: boolean;
  disabled?: boolean;
  compact?: boolean;
  /** Read-only hint beside the label (e.g. daily average on the check-in). */
  reference?: string | null;
  error?: string;
  onChange: (value: number | null) => void;
};

export function RatingScale({
  id,
  label,
  legend,
  value,
  optional = false,
  disabled = false,
  compact = false,
  reference,
  error,
  onChange,
}: RatingScaleProps) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const legendText =
    legend == null
      ? null
      : optional
        ? `${legend} · Tap again to clear.`
        : legend;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span
          id={labelId}
          className={`block font-semibold text-text-primary ${compact ? "text-sm" : "text-base"}`}
        >
          {label}
          {optional ? (
            <span className="font-normal text-text-muted"> (optional)</span>
          ) : null}
        </span>
        {reference ? (
          <span className="text-xs text-text-muted">{reference}</span>
        ) : null}
      </div>
      {legendText ? (
        <p className="mt-1 text-xs text-text-muted">{legendText}</p>
      ) : null}
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10 ${compact ? "" : "sm:mt-3 sm:gap-2"}`}
      >
        {RATING_VALUES.map((rating) => {
          const selected = value === rating;
          return (
            <button
              key={rating}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              aria-invalid={error ? true : undefined}
              onClick={() => onChange(optional && selected ? null : rating)}
              className={`rounded-lg py-2 text-[14px] font-medium transition sm:py-2.5 sm:text-[15px] ${
                selected
                  ? "bg-brand-coral-deep text-white shadow-[0_2px_8px_rgba(209,74,64,0.25)]"
                  : "bg-surface-page text-text-muted hover:text-text-primary"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {rating}
            </button>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-brand-coral-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
