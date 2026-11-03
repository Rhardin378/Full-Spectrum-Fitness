import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const { listMeasurements } = vi.hoisted(() => ({
  listMeasurements: vi.fn(),
}));

vi.mock("@/lib/measurements/actions", () => ({
  listMeasurements,
  createMeasurement: vi.fn(),
  updateMeasurement: vi.fn(),
  softDeleteMeasurement: vi.fn(),
}));

import { MeasurementsTabPanel } from "@/components/measurements/measurements-tab-panel";
import { WeightTrendCard } from "@/components/measurements/weight-trend-card";

function weightRow(
  id: string,
  measuredOn: string,
  value: number,
): Measurement {
  return {
    id,
    user_id: "user-1",
    measurement_type: "weight",
    value,
    unit: "lb",
    measured_on: measuredOn,
    measured_at: `${measuredOn}T00:00:00.000Z`,
    notes: null,
    created_at: `${measuredOn}T15:00:00.000Z`,
    updated_at: `${measuredOn}T15:00:00.000Z`,
    deleted_at: null,
  };
}

const trendRows = [
  weightRow("today", "2026-11-03", 179.4),
  weightRow("inside-30", "2026-10-05", 180),
  weightRow("before-30", "2026-10-04", 181),
  weightRow("start-90", "2026-08-06", 186),
  weightRow("before-90", "2026-08-05", 190),
];

function listResult(
  measurements: Measurement[],
  extras: { next_cursor?: string | null; has_more?: boolean } = {},
) {
  return {
    success: true as const,
    measurements,
    next_cursor: extras.next_cursor ?? null,
    has_more: extras.has_more ?? false,
  };
}

function renderCard() {
  return render(
    <WeightTrendCard refreshToken={0} onLogMeasurementClick={vi.fn()} />,
  );
}

function rangeRadio(name: string) {
  return screen.getByRole("radio", { name });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0));
  listMeasurements.mockResolvedValue(listResult(trendRows));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("weight trend range toggle", () => {
  it("defaults to 90D and filters the loaded weigh-ins", async () => {
    renderCard();

    const ninety = await screen.findByRole("radio", { name: "90D" });
    expect(await screen.findByText("4 weigh-ins")).toBeInTheDocument();
    expect(ninety).toHaveAttribute("aria-checked", "true");
    expect(ninety).toHaveClass("bg-brand-coral", "text-white");
    expect(rangeRadio("30D")).toHaveAttribute("aria-checked", "false");
    expect(rangeRadio("30D")).toHaveClass("text-text-muted");
    expect(rangeRadio("30D")).not.toHaveClass("bg-brand-coral");

    const group = screen.getByRole("radiogroup", { name: "Weight trend range" });
    expect(group).toHaveClass("bg-surface-page", "w-full", "sm:w-auto");
    expect(ninety).toHaveClass("focus-visible:ring-2");
    expect(screen.getByText("Last 90 days")).toBeInTheDocument();
    expect(screen.getByText("179.4 lb")).toBeInTheDocument();
    expect(screen.getByText("-6.6 lb over 90 days")).toBeInTheDocument();
    expect(screen.getByText("4 weigh-ins")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Weight trend line chart for the last 90 days",
      }),
    ).toBeInTheDocument();

    expect(listMeasurements).toHaveBeenCalledWith({
      measurement_type: "weight",
      page_size: 100,
      sort_order: "newest",
    });
    for (const [input] of listMeasurements.mock.calls) {
      expect(input).not.toHaveProperty("start_date");
      expect(input).not.toHaveProperty("end_date");
    }
  });

  it("filters on click without requesting measurements again", async () => {
    renderCard();

    await screen.findByText("4 weigh-ins");
    const callsAfterLoad = listMeasurements.mock.calls.length;

    fireEvent.click(rangeRadio("30D"));

    expect(rangeRadio("30D")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    expect(screen.getByText("-0.6 lb over 30 days")).toBeInTheDocument();
    expect(screen.getByText("2 weigh-ins")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Weight trend line chart for the last 30 days",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("4 weigh-ins")).not.toBeInTheDocument();
    expect(listMeasurements.mock.calls.length).toBe(callsAfterLoad);

    fireEvent.click(rangeRadio("All"));

    expect(screen.getByText("All time")).toBeInTheDocument();
    expect(screen.getByText("-10.6 lb over all time")).toBeInTheDocument();
    expect(screen.getByText("5 weigh-ins")).toBeInTheDocument();
    expect(listMeasurements.mock.calls.length).toBe(callsAfterLoad);
  });

  it("moves the selection with arrow keys and keeps a single tab stop", async () => {
    renderCard();

    const ninety = await screen.findByRole("radio", { name: "90D" });
    expect(await screen.findByText("4 weigh-ins")).toBeInTheDocument();
    expect(ninety).toHaveAttribute("tabindex", "0");
    expect(rangeRadio("6M")).toHaveAttribute("tabindex", "-1");

    ninety.focus();
    fireEvent.keyDown(ninety, { key: "ArrowLeft" });

    const thirty = rangeRadio("30D");
    expect(thirty).toHaveAttribute("aria-checked", "true");
    expect(thirty).toHaveFocus();
    expect(screen.getByText("2 weigh-ins")).toBeInTheDocument();

    fireEvent.keyDown(thirty, { key: "End" });
    const all = rangeRadio("All");
    expect(all).toHaveAttribute("aria-checked", "true");
    expect(all).toHaveFocus();

    fireEvent.keyDown(all, { key: "ArrowRight" });
    expect(rangeRadio("30D")).toHaveAttribute("aria-checked", "true");
    expect(rangeRadio("30D")).toHaveFocus();

    fireEvent.keyDown(rangeRadio("30D"), { key: "ArrowUp" });
    expect(all).toHaveAttribute("aria-checked", "true");
  });

  it("shows a friendly empty state, then the points that exist on a longer range", async () => {
    listMeasurements.mockResolvedValue(
      listResult([weightRow("old", "2026-01-01", 200)]),
    );
    renderCard();

    expect(
      await screen.findByText("No weight entries in the last 90 days"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nothing in this range yet/)).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /Weight trend line chart/ }),
    ).not.toBeInTheDocument();

    const callsAfterLoad = listMeasurements.mock.calls.length;
    fireEvent.click(rangeRadio("30D"));
    expect(
      screen.getByText("No weight entries in the last 30 days"),
    ).toBeInTheDocument();

    fireEvent.click(rangeRadio("All"));

    expect(screen.getByText("All time")).toBeInTheDocument();
    expect(screen.getByText("200 lb")).toBeInTheDocument();
    expect(screen.getByText("1 weigh-in")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Log another weigh-in to see your trend over this window.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/over all time/)).not.toBeInTheDocument();
    expect(listMeasurements.mock.calls.length).toBe(callsAfterLoad);
  });

  it("charts the points on hand when history is shorter than the range", async () => {
    listMeasurements.mockResolvedValue(
      listResult([
        weightRow("recent", "2026-11-01", 178),
        weightRow("today", "2026-11-03", 177.5),
      ]),
    );
    renderCard();

    expect(await screen.findByText("2 weigh-ins")).toBeInTheDocument();
    expect(screen.getByText("-0.5 lb over 90 days")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Weight trend line chart for the last 90 days",
      }),
    ).toBeInTheDocument();

    fireEvent.click(rangeRadio("1Y"));

    expect(screen.getByText("Last year")).toBeInTheDocument();
    expect(screen.getByText("-0.5 lb over 1 year")).toBeInTheDocument();
    expect(screen.getByText("2 weigh-ins")).toBeInTheDocument();
  });

  it("includes later pages before filtering", async () => {
    listMeasurements.mockImplementation(async (input?: { cursor?: string }) => {
      if (input?.cursor === "page-2") {
        return listResult([weightRow("older", "2026-08-05", 190)]);
      }
      return listResult([weightRow("today", "2026-11-03", 179.4)], {
        has_more: true,
        next_cursor: "page-2",
      });
    });

    renderCard();

    expect(await screen.findByText("1 weigh-in")).toBeInTheDocument();
    expect(
      screen.getByText("Log another weigh-in to see your trend over this window."),
    ).toBeInTheDocument();

    fireEvent.click(rangeRadio("All"));

    expect(screen.getByText("2 weigh-ins")).toBeInTheDocument();
    expect(screen.getByText("-10.6 lb over all time")).toBeInTheDocument();
    expect(listMeasurements).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: "page-2" }),
    );
  });

  it("keeps the history list stable and places the chart first on small screens", async () => {
    const rows = [
      weightRow("today", "2026-11-03", 179.4),
      weightRow("nov-1", "2026-11-01", 180),
      weightRow("oct-20", "2026-10-20", 181),
      weightRow("start-30", "2026-10-05", 182),
      weightRow("before-30", "2026-10-04", 183),
      weightRow("old", "2026-01-01", 190),
    ];
    listMeasurements.mockResolvedValue(listResult(rows));

    render(
      <MeasurementsTabPanel
        refreshToken={0}
        onHistoryRefresh={vi.fn()}
        onLogMeasurementClick={vi.fn()}
      />,
    );

    expect(await screen.findByText("Showing 5 of 6")).toBeInTheDocument();
    expect(await screen.findByText("5 weigh-ins")).toBeInTheDocument();

    const chart = screen.getByRole("heading", { name: "Weight trend" }).closest("section");
    const history = screen
      .getByRole("heading", { name: "Recent history" })
      .closest("section");
    expect(chart).toHaveClass("order-1", "lg:order-2");
    expect(history).toHaveClass("order-2", "lg:order-1");

    const callsAfterLoad = listMeasurements.mock.calls.length;
    const historyList = screen.getByRole("list");
    expect(within(historyList).getAllByRole("listitem")).toHaveLength(5);

    fireEvent.click(rangeRadio("30D"));

    expect(screen.getByText("4 weigh-ins")).toBeInTheDocument();
    expect(screen.getByText("Showing 5 of 6")).toBeInTheDocument();
    expect(within(historyList).getAllByRole("listitem")).toHaveLength(5);
    expect(within(historyList).getByText("Oct 4, 2026")).toBeInTheDocument();
    expect(listMeasurements.mock.calls.length).toBe(callsAfterLoad);

    fireEvent.click(rangeRadio("All"));

    expect(screen.getByText("6 weigh-ins")).toBeInTheDocument();
    expect(screen.getByText("Showing 5 of 6")).toBeInTheDocument();
    expect(within(historyList).getAllByRole("listitem")).toHaveLength(5);
  });
});
