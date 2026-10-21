import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const {
  listMeasurements,
  createMeasurement,
  updateMeasurement,
  softDeleteMeasurement,
} = vi.hoisted(() => ({
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

import { MeasurementsTabPanel } from "@/components/measurements/measurements-tab-panel";

const weightEntry: Measurement = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "user-1",
  measurement_type: "weight",
  value: 180.5,
  unit: "lb",
  measured_on: "2026-10-04",
  measured_at: "2026-10-04T00:00:00.000Z",
  notes: "Morning check-in",
  created_at: "2026-10-04T15:00:00.000Z",
  updated_at: "2026-10-04T15:00:00.000Z",
  deleted_at: null,
};

const waistEntry: Measurement = {
  id: "22222222-2222-4222-8222-222222222222",
  user_id: "user-1",
  measurement_type: "waist",
  value: 32,
  unit: "in",
  measured_on: "2026-10-01",
  measured_at: "2026-10-01T00:00:00.000Z",
  notes: null,
  created_at: "2026-10-01T15:00:00.000Z",
  updated_at: "2026-10-01T15:00:00.000Z",
  deleted_at: null,
};

function renderHistory() {
  const onHistoryRefresh = vi.fn();
  const onLogMeasurementClick = vi.fn();
  render(
    <MeasurementsTabPanel
      refreshToken={0}
      onHistoryRefresh={onHistoryRefresh}
      onLogMeasurementClick={onLogMeasurementClick}
    />,
  );
  return { onHistoryRefresh, onLogMeasurementClick };
}

async function openDeleteDialog(name: string) {
  fireEvent.click(await screen.findByRole("button", { name }));
  return screen.findByRole("alertdialog");
}

beforeEach(() => {
  vi.clearAllMocks();
  listMeasurements.mockResolvedValue({
    success: true,
    measurements: [weightEntry, waistEntry],
    next_cursor: null,
    has_more: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("measurement history row actions", () => {
  it("names each row action and keeps a 44px target visible without hover", async () => {
    renderHistory();

    const editWeight = await screen.findByRole("button", {
      name: "Edit Weight on Oct 4, 2026",
    });
    const deleteWeight = screen.getByRole("button", {
      name: "Delete Weight on Oct 4, 2026",
    });
    const editWaist = screen.getByRole("button", {
      name: "Edit Waist on Oct 1, 2026",
    });
    const deleteWaist = screen.getByRole("button", {
      name: "Delete Waist on Oct 1, 2026",
    });

    for (const button of [editWeight, deleteWeight, editWaist, deleteWaist]) {
      expect(button).toHaveClass("min-h-11", "min-w-11");
    }

    expect(editWeight.parentElement).toHaveClass(
      "can-hover:opacity-0",
      "group-hover:opacity-100",
      "group-focus-within:opacity-100",
    );
    expect(editWeight.parentElement?.className).not.toContain("sm:opacity-0");
  });

  it("prefills edit and submits updateMeasurement with the row id", async () => {
    updateMeasurement.mockResolvedValue({
      success: true,
      measurement: weightEntry,
    });
    const { onHistoryRefresh } = renderHistory();

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Weight on Oct 4, 2026" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Edit measurement",
    });
    expect(within(dialog).getByLabelText("Value")).toHaveValue("180.5");
    expect(within(dialog).getByLabelText("Unit")).toHaveValue("lb");
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-10-04");
    expect(within(dialog).getByLabelText("Notes (optional)")).toHaveValue(
      "Morning check-in",
    );
    expect(
      within(dialog).getByRole("button", { name: "Weight" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateMeasurement).toHaveBeenCalledWith({
        id: weightEntry.id,
        measurement_type: "weight",
        value: 180.5,
        unit: "lb",
        measured_on: "2026-10-04",
        notes: "Morning check-in",
      });
    });
    expect(createMeasurement).not.toHaveBeenCalled();
    expect(onHistoryRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Measurement updated.");
    expect(
      screen.queryByRole("dialog", { name: "Edit measurement" }),
    ).not.toBeInTheDocument();
  });

  it("confirms delete, refreshes history, and moves focus to the heading", async () => {
    softDeleteMeasurement.mockResolvedValue({ success: true });
    const { onHistoryRefresh } = renderHistory();

    const dialog = await openDeleteDialog("Delete Weight on Oct 4, 2026");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove measurement" }),
    );

    await waitFor(() => {
      expect(softDeleteMeasurement).toHaveBeenCalledWith({ id: weightEntry.id });
    });
    expect(onHistoryRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Measurement removed from your history.",
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Recent history" }),
      );
    });
  });

  it("closes delete from Cancel without calling soft delete", async () => {
    renderHistory();
    const dialog = await openDeleteDialog("Delete Weight on Oct 4, 2026");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(softDeleteMeasurement).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("closes delete from Escape without calling soft delete", async () => {
    renderHistory();
    await openDeleteDialog("Delete Waist on Oct 1, 2026");
    fireEvent.keyDown(document, { key: "Escape" });

    expect(softDeleteMeasurement).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("resets delete after a thrown action and shows a generic error", async () => {
    softDeleteMeasurement.mockRejectedValue(new Error("socket hang up"));
    const { onHistoryRefresh } = renderHistory();

    const dialog = await openDeleteDialog("Delete Weight on Oct 4, 2026");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove measurement" }),
    );

    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(
      "Unable to remove your measurement. Please try again.",
    );
    expect(alert).not.toHaveTextContent("socket");
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(
      within(dialog).getByRole("button", { name: "Remove measurement" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeEnabled();
    expect(onHistoryRefresh).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("resets edit after a thrown action and shows a generic error", async () => {
    updateMeasurement.mockRejectedValue(new Error("boom secret"));
    const { onHistoryRefresh } = renderHistory();

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Waist on Oct 1, 2026" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit measurement",
    });
    expect(within(dialog).getByLabelText("Value")).toHaveValue("32");
    expect(within(dialog).getByLabelText("Unit")).toHaveValue("in");
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-10-01");

    fireEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));

    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(
      "Unable to save your measurement. Please try again.",
    );
    expect(alert).not.toHaveTextContent("boom");
    expect(
      within(dialog).getByRole("button", { name: "Save changes" }),
    ).toBeEnabled();
    expect(within(dialog).getByRole("button", { name: "Close" })).toBeEnabled();
    expect(onHistoryRefresh).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(
      screen.queryByRole("dialog", { name: "Edit measurement" }),
    ).not.toBeInTheDocument();
  });

  it("refreshes and closes when delete reports not_found", async () => {
    softDeleteMeasurement.mockResolvedValue({
      success: false,
      error: "not_found",
      message: "Measurement not found or was already removed.",
    });
    const { onHistoryRefresh } = renderHistory();

    const dialog = await openDeleteDialog("Delete Weight on Oct 4, 2026");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove measurement" }),
    );

    await waitFor(() => {
      expect(onHistoryRefresh).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "That measurement is no longer in your history.",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("heading", { name: "Recent history" }),
      );
    });
  });

  it("refreshes and closes when edit reports not_found", async () => {
    updateMeasurement.mockResolvedValue({
      success: false,
      error: "not_found",
      message: "Measurement not found or was already removed.",
    });
    const { onHistoryRefresh } = renderHistory();

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit Weight on Oct 4, 2026" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Edit measurement",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateMeasurement).toHaveBeenCalledWith(
        expect.objectContaining({ id: weightEntry.id }),
      );
    });
    expect(onHistoryRefresh).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("dialog", { name: "Edit measurement" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "That measurement is no longer in your history.",
    );
    expect(screen.queryByText("Measurement updated.")).not.toBeInTheDocument();
  });

  it("keeps a failed delete open without refreshing", async () => {
    softDeleteMeasurement.mockResolvedValue({
      success: false,
      error: "database",
      message: "Unable to remove your measurement. Please try again.",
    });
    const { onHistoryRefresh } = renderHistory();

    const dialog = await openDeleteDialog("Delete Waist on Oct 1, 2026");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Remove measurement" }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Unable to remove your measurement. Please try again.",
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(onHistoryRefresh).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("restarts the status banner timer when a new status replaces it", async () => {
    softDeleteMeasurement.mockResolvedValue({ success: true });
    updateMeasurement.mockResolvedValue({
      success: true,
      measurement: waistEntry,
    });
    renderHistory();
    await screen.findByRole("button", { name: "Delete Weight on Oct 4, 2026" });

    vi.useFakeTimers();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Weight on Oct 4, 2026" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove measurement" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(
      screen.getByText("Measurement removed from your history."),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Waist on Oct 1, 2026" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("Measurement updated.")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText("Measurement updated.")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(screen.queryByText("Measurement updated.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Measurement removed from your history."),
    ).not.toBeInTheDocument();
  });
});
