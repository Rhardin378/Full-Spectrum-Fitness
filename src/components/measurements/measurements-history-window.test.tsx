import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const { listMeasurements, softDeleteMeasurement } = vi.hoisted(() => ({
  listMeasurements: vi.fn(),
  softDeleteMeasurement: vi.fn(),
}));

vi.mock("@/lib/measurements/actions", () => ({
  listMeasurements,
  createMeasurement: vi.fn(),
  updateMeasurement: vi.fn(),
  softDeleteMeasurement,
}));

import { MeasurementsTabPanel } from "@/components/measurements/measurements-tab-panel";

function shiftIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeMeasurements(count: number): Measurement[] {
  return Array.from({ length: count }, (_, index) => {
    const measured_on = shiftIsoDate("2026-10-20", -index);
    return {
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      user_id: "user-1",
      measurement_type: "weight",
      value: 100 + index,
      unit: "lb",
      measured_on,
      measured_at: `${measured_on}T00:00:00.000Z`,
      notes: null,
      created_at: `${measured_on}T15:00:00.000Z`,
      updated_at: `${measured_on}T15:00:00.000Z`,
      deleted_at: null,
    };
  });
}

function listResult(measurements: Measurement[]) {
  return {
    success: true as const,
    measurements,
    next_cursor: null,
    has_more: false,
  };
}

function renderPanel() {
  return render(
    <MeasurementsTabPanel
      refreshToken={0}
      onHistoryRefresh={vi.fn()}
      onLogMeasurementClick={vi.fn()}
    />,
  );
}

function historyList() {
  return within(screen.getByRole("list"));
}

function historyItems() {
  return historyList().getAllByRole("listitem");
}

function showMoreButton() {
  return screen.getByRole("button", { name: "Show more measurements" });
}

function showLessButton() {
  return screen.getByRole("button", { name: "Show less measurements" });
}

beforeEach(() => {
  vi.clearAllMocks();
  listMeasurements.mockResolvedValue(listResult(makeMeasurements(23)));
});

describe("measurement history window", () => {
  it("shows the 5 most recent rows and a count", async () => {
    renderPanel();

    expect(await screen.findByText("Showing 5 of 23")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(5);
    expect(historyList().getByText("100 lb")).toBeInTheDocument();
    expect(historyList().getByText("104 lb")).toBeInTheDocument();
    expect(historyList().queryByText("105 lb")).not.toBeInTheDocument();
    expect(showMoreButton()).toHaveClass("min-h-11");
    expect(
      screen.queryByRole("button", { name: "Show less measurements" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("list").className).not.toMatch(/overflow|max-h/);
  });

  it("reveals 10 more rows on each Show more click", async () => {
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: "Show more measurements" }));

    expect(screen.getByText("Showing 15 of 23")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(15);
    expect(historyList().getByText("114 lb")).toBeInTheDocument();
    expect(historyList().queryByText("115 lb")).not.toBeInTheDocument();
    expect(showMoreButton()).toHaveClass("min-h-11");
    expect(showLessButton()).toHaveClass("min-h-11");

    fireEvent.click(showMoreButton());

    expect(screen.getByText("Showing 23 of 23")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(23);
    expect(historyList().getByText("122 lb")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show more measurements" }),
    ).not.toBeInTheDocument();
    expect(showLessButton()).toHaveFocus();
  });

  it("collapses back to 5 with Show less", async () => {
    renderPanel();

    fireEvent.click(await screen.findByRole("button", { name: "Show more measurements" }));
    expect(screen.getByText("Showing 15 of 23")).toBeInTheDocument();

    fireEvent.click(showLessButton());

    expect(screen.getByText("Showing 5 of 23")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(5);
    expect(historyList().queryByText("105 lb")).not.toBeInTheDocument();
    expect(showMoreButton()).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Show less measurements" }),
    ).not.toBeInTheDocument();
  });

  it("hides Show more and Show less when there are 5 or fewer rows", async () => {
    listMeasurements.mockResolvedValue(listResult(makeMeasurements(5)));
    const view = renderPanel();

    expect(await screen.findByText("Showing 5 of 5")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(5);
    expect(
      screen.queryByRole("button", { name: "Show more measurements" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show less measurements" }),
    ).not.toBeInTheDocument();

    view.unmount();

    listMeasurements.mockResolvedValue(listResult(makeMeasurements(3)));
    renderPanel();

    expect(await screen.findByText("Showing 3 of 3")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "Show more measurements" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show less measurements" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the expanded window after delete and clamps when fewer rows remain", async () => {
    const rowsRef = { current: makeMeasurements(16) };
    listMeasurements.mockImplementation(async () => listResult(rowsRef.current));
    softDeleteMeasurement.mockResolvedValue({ success: true });

    function Harness() {
      const [refreshToken, setRefreshToken] = useState(0);
      return (
        <MeasurementsTabPanel
          refreshToken={refreshToken}
          onLogMeasurementClick={() => {}}
          onHistoryRefresh={() => {
            rowsRef.current = rowsRef.current.slice(1, 8);
            setRefreshToken((token) => token + 1);
          }}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(await screen.findByRole("button", { name: "Show more measurements" }));
    expect(screen.getByText("Showing 15 of 16")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(15);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Weight on Oct 20, 2026" }),
    );
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove measurement" }));

    await waitFor(() => {
      expect(screen.getByText("Showing 7 of 7")).toBeInTheDocument();
    });
    expect(historyItems()).toHaveLength(7);
    expect(historyList().queryByText("100 lb")).not.toBeInTheDocument();
    expect(historyList().getByText("101 lb")).toBeInTheDocument();
    expect(historyList().getByText("107 lb")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show more measurements" }),
    ).not.toBeInTheDocument();
    expect(showLessButton()).toBeInTheDocument();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Recent history" }),
      );
    });

    fireEvent.click(showLessButton());

    expect(screen.getByText("Showing 5 of 7")).toBeInTheDocument();
    expect(historyItems()).toHaveLength(5);
    expect(historyList().queryByText("106 lb")).not.toBeInTheDocument();
    expect(showMoreButton()).toHaveFocus();
  });
});
