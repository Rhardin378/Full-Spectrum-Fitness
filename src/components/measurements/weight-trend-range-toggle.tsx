"use client";

import { useRef, type KeyboardEvent } from "react";
import {
  WEIGHT_TREND_RANGE_OPTIONS,
  type WeightTrendRange,
} from "@/lib/measurements/trend-range";

interface WeightTrendRangeToggleProps {
  value: WeightTrendRange;
  onChange: (range: WeightTrendRange) => void;
}

export function WeightTrendRangeToggle({
  value,
  onChange,
}: WeightTrendRangeToggleProps) {
  const buttonRefs = useRef(new Map<WeightTrendRange, HTMLButtonElement>());

  function focusRange(range: WeightTrendRange) {
    buttonRefs.current.get(range)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = WEIGHT_TREND_RANGE_OPTIONS.findIndex(
      (option) => option.id === value,
    );
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % WEIGHT_TREND_RANGE_OPTIONS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex =
          (currentIndex - 1 + WEIGHT_TREND_RANGE_OPTIONS.length) %
          WEIGHT_TREND_RANGE_OPTIONS.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = WEIGHT_TREND_RANGE_OPTIONS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = WEIGHT_TREND_RANGE_OPTIONS[nextIndex];
    if (!next) {
      return;
    }
    if (next.id !== value) {
      onChange(next.id);
    }
    focusRange(next.id);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Weight trend range"
      className="flex w-full rounded-full bg-surface-page p-1 sm:w-auto"
      onKeyDown={handleKeyDown}
    >
      {WEIGHT_TREND_RANGE_OPTIONS.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.id, node);
              } else {
                buttonRefs.current.delete(option.id);
              }
            }}
            onClick={() => onChange(option.id)}
            className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-1.5 text-center text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 sm:flex-none sm:px-3 ${
              selected
                ? "bg-brand-coral text-white"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
