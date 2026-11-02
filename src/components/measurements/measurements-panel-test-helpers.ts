import { screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";
import {
  formatMeasuredOnDisplay,
  measurementTypeLabel,
} from "@/lib/measurements/display";
import type { Measurement } from "@/lib/types/measurement";

export function historyActionLabel(
  action: "Edit" | "Delete",
  entry: Measurement,
): string {
  return `${action} ${measurementTypeLabel(entry.measurement_type)} on ${formatMeasuredOnDisplay(entry.measured_on)}`;
}

/** Wait until listMeasurements finished and history rows are in the DOM. */
export async function waitForHistoryReady(listMeasurements: Mock) {
  await waitFor(() => expect(listMeasurements).toHaveBeenCalled(), {
    timeout: 5000,
  });
  await waitFor(
    () => {
      expect(
        screen.queryByText(/Loading your measurements/i),
      ).not.toBeInTheDocument();
      const list = document.getElementById("measurement-history-list");
      expect(list?.children.length ?? 0).toBeGreaterThan(0);
    },
    { timeout: 5000 },
  );
}

export async function findHistoryRowAction(
  action: "Edit" | "Delete",
  entry: Measurement,
  listMeasurements: Mock,
) {
  await waitForHistoryReady(listMeasurements);
  return screen.findByRole(
    "button",
    { name: historyActionLabel(action, entry) },
    { timeout: 5000 },
  );
}
