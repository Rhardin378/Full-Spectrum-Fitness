import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const { listMeasurements, createMeasurement, updateMeasurement, softDeleteMeasurement } =
  vi.hoisted(() => ({
    listMeasurements: vi.fn(),
    createMeasurement: vi.fn(),
    updateMeasurement: vi.fn(),
    softDeleteMeasurement: vi.fn(),
  }));

vi.mock("@/lib/measurements/actions", () => ({
  listMeasurements,
  createMeasurement,
  updateMeasurement,
  softDeleteMeasurement,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import FitnessDashboardShell from "@/components/dashboard/fitness-dashboard-shell";

function emptyListResult() {
  return {
    success: true as const,
    measurements: [] as Measurement[],
    next_cursor: null,
    has_more: false,
  };
}

function listResult(measurements: Measurement[]) {
  return {
    success: true as const,
    measurements,
    next_cursor: null,
    has_more: false,
  };
}

const createdEntry: Measurement = {
  id: "44444444-4444-4444-8444-444444444444",
  user_id: "user-1",
  measurement_type: "weight",
  value: 175.5,
  unit: "lb",
  measured_on: "2026-10-04",
  measured_at: "2026-10-04T00:00:00.000Z",
  notes: "Post-workout",
  created_at: "2026-10-04T18:00:00.000Z",
  updated_at: "2026-10-04T18:00:00.000Z",
  deleted_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date("2026-10-04T18:00:00.000Z"));
  listMeasurements.mockResolvedValue(emptyListResult());
});

afterEach(() => {
  vi.useRealTimers();
});

describe("FitnessDashboardShell", () => {
  it("starts with Measurements as the selected tab and shows its panel", async () => {
    render(<FitnessDashboardShell displayName="Alex" />);

    const measurementsTab = screen.getByRole("tab", { name: "Measurements" });
    expect(measurementsTab).toHaveAttribute("aria-selected", "true");

    expect(
      await screen.findByRole("heading", { name: "Recent history" }),
    ).toBeInTheDocument();
    const logButtons = screen.getAllByRole("button", {
      name: "+ Log measurement",
    });
    expect(logButtons.length).toBeGreaterThan(0);
    expect(logButtons.some((button) => !button.hasAttribute("disabled"))).toBe(
      true,
    );
  });

  it("shows coming soon content when a non-measurements tab is selected", async () => {
    render(<FitnessDashboardShell displayName={null} />);

    await screen.findByRole("heading", { name: "Recent history" });

    fireEvent.click(screen.getByRole("tab", { name: /^Overview/ }));

    expect(
      screen.getByText(/Measurements is your home for baseline tracking/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recent history" })).not.toBeInTheDocument();
  });

  it("shows empty history when listMeasurements returns no rows", async () => {
    render(<FitnessDashboardShell displayName="Alex" />);

    expect(await screen.findByText("No measurements yet")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "+ Log measurement" }).length,
    ).toBeGreaterThan(0);
  });

  it("creates via the log modal and refreshes history with the new row", async () => {
    let rows: Measurement[] = [];
    listMeasurements.mockImplementation(async () => listResult(rows));
    createMeasurement.mockImplementation(async () => {
      rows = [createdEntry];
      return { success: true, measurement: createdEntry };
    });

    render(<FitnessDashboardShell displayName="Alex" />);

    await screen.findByText("No measurements yet");

    fireEvent.click(screen.getAllByRole("button", { name: "+ Log measurement" })[0]!);

    const dialog = await screen.findByRole("dialog", { name: "Log measurement" });
    fireEvent.change(within(dialog).getByLabelText("Value"), {
      target: { value: "175.5" },
    });
    fireEvent.change(within(dialog).getByLabelText("Notes (optional)"), {
      target: { value: "Post-workout" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save measurement" }),
    );

    await waitFor(() => {
      expect(createMeasurement).toHaveBeenCalled();
    });

    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent(/Measurement saved/i);

    await waitFor(() => {
      expect(screen.queryByText("No measurements yet")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Post-workout")).toBeInTheDocument();
    expect(screen.getAllByText("175.5 lb").length).toBeGreaterThan(0);
    expect(listMeasurements.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
