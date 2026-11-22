import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeightNowCard } from "@/components/measurements/weight-now-card";
import type { WeightNowSummary } from "@/lib/measurements/weight-now";

const emptySummary: WeightNowSummary = { status: "empty" };

const readySummary: WeightNowSummary = {
  status: "ready",
  latest: {
    id: "w1",
    user_id: "user-1",
    measurement_type: "weight",
    value: 180,
    unit: "lb",
    measured_on: "2026-11-10",
    measured_at: "2026-11-10T00:00:00.000Z",
    notes: null,
    created_at: "2026-11-10T12:00:00.000Z",
    updated_at: "2026-11-10T12:00:00.000Z",
    deleted_at: null,
  },
  relativeLine: "Logged 2 days ago · Nov 10",
  change30d: {
    delta: -3.1,
    label: "−3.1 lb over 30 days",
    tone: "muted",
  },
  toGoalLine: null,
};

describe("WeightNowCard", () => {
  it("shows the empty state and opens the log flow without inserting a row", () => {
    const onLog = vi.fn();
    render(
      <WeightNowCard
        refreshToken={0}
        onLogMeasurementClick={onLog}
        initialSummary={emptySummary}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Weight now" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No weight logged yet.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Log measurement" }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it("shows value, relative line, and muted 30-day change without a goal", () => {
    render(
      <WeightNowCard
        refreshToken={0}
        onLogMeasurementClick={vi.fn()}
        initialSummary={readySummary}
      />,
    );

    expect(screen.getByText("180 lb")).toBeInTheDocument();
    expect(
      screen.getByText("Logged 2 days ago · Nov 10"),
    ).toBeInTheDocument();
    expect(screen.getByText("−3.1 lb over 30 days")).toBeInTheDocument();
    expect(screen.queryByText(/to goal/)).not.toBeInTheDocument();
  });
});
