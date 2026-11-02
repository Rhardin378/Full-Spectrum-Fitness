import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Measurement } from "@/lib/types/measurement";

const { createMeasurement, updateMeasurement } = vi.hoisted(() => ({
  createMeasurement: vi.fn(),
  updateMeasurement: vi.fn(),
}));

vi.mock("@/lib/measurements/actions", () => ({
  createMeasurement,
  updateMeasurement,
}));

import { LogMeasurementModal } from "@/components/measurements/log-measurement-modal";

function renderCreateModal(overrides?: {
  onClose?: () => void;
  onSaved?: () => void;
}) {
  const onClose = overrides?.onClose ?? vi.fn();
  const onSaved = overrides?.onSaved ?? vi.fn();
  render(
    <LogMeasurementModal open onClose={onClose} onSaved={onSaved} mode="create" />,
  );
  return { onClose, onSaved };
}

async function getCreateDialog() {
  return screen.findByRole("dialog", { name: "Log measurement" });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date("2026-10-04T18:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("LogMeasurementModal (create)", () => {
  it("does not render when closed", () => {
    render(
      <LogMeasurementModal
        open={false}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows client validation when value is not a positive decimal", async () => {
    renderCreateModal();
    const dialog = await getCreateDialog();
    fireEvent.change(within(dialog).getByLabelText("Value"), {
      target: { value: "-5" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save measurement" }),
    );

    expect(
      await within(dialog).findByText(
        "Enter a positive number with up to two decimal places.",
      ),
    ).toBeInTheDocument();
    expect(createMeasurement).not.toHaveBeenCalled();
  });

  it("shows server message and field errors when createMeasurement fails", async () => {
    createMeasurement.mockResolvedValue({
      success: false,
      message: "That unit does not match this measurement type.",
      fieldErrors: { unit: "Use lb or kg for weight." },
    });
    renderCreateModal();
    const dialog = await getCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Value"), {
      target: { value: "180" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save measurement" }),
    );

    await waitFor(() => {
      expect(createMeasurement).toHaveBeenCalled();
    });

    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "That unit does not match this measurement type.",
    );
    expect(within(dialog).getByText("Use lb or kg for weight.")).toBeInTheDocument();
  });

  it("submits createMeasurement, then calls onSaved and onClose on success", async () => {
    const saved: Measurement = {
      id: "33333333-3333-4333-8333-333333333333",
      user_id: "user-1",
      measurement_type: "weight",
      value: 180,
      unit: "lb",
      measured_on: "2026-10-04",
      measured_at: "2026-10-04T00:00:00.000Z",
      notes: null,
      created_at: "2026-10-04T18:00:00.000Z",
      updated_at: "2026-10-04T18:00:00.000Z",
      deleted_at: null,
    };
    createMeasurement.mockResolvedValue({ success: true, measurement: saved });

    const { onClose, onSaved } = renderCreateModal();
    const dialog = await getCreateDialog();

    fireEvent.change(within(dialog).getByLabelText("Value"), {
      target: { value: "180" },
    });
    expect(within(dialog).getByLabelText("Date")).toHaveValue("2026-10-04");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Save measurement" }),
    );

    await waitFor(() => {
      expect(createMeasurement).toHaveBeenCalledWith({
        measurement_type: "weight",
        value: 180,
        unit: "lb",
        measured_on: "2026-10-04",
        notes: null,
      });
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
