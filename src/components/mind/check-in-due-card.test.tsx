import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckInDueCard } from "@/components/mind/check-in-due-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/weekly/actions", () => ({
  getCheckInDueStatus: vi.fn(),
}));

beforeEach(() => {
  vi.setSystemTime(new Date("2026-11-03T18:00:00.000Z"));
});

describe("CheckInDueCard", () => {
  it("renders when due with check-in and weight links", () => {
    render(<CheckInDueCard initialDue />);

    expect(
      screen.getByRole("heading", { name: "Last week’s check-in is ready" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Start weekly check-in" }),
    ).toHaveAttribute("href", "/mind/check-in");
    expect(
      screen.getByRole("link", { name: "Log this week’s weight" }),
    ).toHaveAttribute("href", "/fitness/measurements");
  });

  it("on Sunday says this week’s check-in is ready", () => {
    vi.setSystemTime(new Date("2026-11-01T18:00:00.000Z"));
    render(<CheckInDueCard initialDue />);

    expect(
      screen.getByRole("heading", { name: "This week’s check-in is ready" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when not due", () => {
    const { container } = render(<CheckInDueCard initialDue={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
