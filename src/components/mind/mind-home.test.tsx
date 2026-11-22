import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MindHome } from "@/components/mind/mind-home";
import type { JournalEntry } from "@/lib/journal/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
}));

const TODAY = "2026-11-22";

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    entry_on: TODAY,
    mood: 7,
    reflection: "A solid day with enough detail to clamp if needed.",
    stress: 5,
    energy: null,
    win: "Shipped the Mind page",
    grateful_for: null,
    domains: ["career", "learning"],
    created_at: "2026-11-22T15:00:00.000Z",
    updated_at: "2026-11-22T15:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.setSystemTime(new Date("2026-11-22T18:00:00.000Z"));
});

describe("MindHome", () => {
  it("uses Edit today’s entry when today has a row", () => {
    render(<MindHome entries={[makeEntry()]} />);
    expect(
      screen.getByRole("link", { name: "Edit today’s entry" }),
    ).toHaveAttribute("href", "/mind/journal");
    expect(screen.queryByText("Entry saved.")).not.toBeInTheDocument();
  });

  it("shows Entry saved when confirmation is requested", () => {
    render(
      <MindHome entries={[makeEntry()]} showSavedConfirmation />,
    );
    expect(screen.getByText("Entry saved.")).toBeInTheDocument();
  });

  it("omits null stress/energy pills and win-only lines", () => {
    render(<MindHome entries={[makeEntry()]} />);
    expect(screen.getByText("Mood 7")).toBeInTheDocument();
    expect(screen.getByText("Stress 5")).toBeInTheDocument();
    expect(screen.queryByText(/Energy/)).not.toBeInTheDocument();
    expect(screen.getByText("One win today")).toBeInTheDocument();
    expect(screen.queryByText("Grateful for")).not.toBeInTheDocument();
  });

  it("pages history with Show more / Show less", () => {
    const entries = Array.from({ length: 12 }, (_, index) =>
      makeEntry({
        id: `entry-${index}`,
        entry_on: `2026-11-${String(22 - index).padStart(2, "0")}`,
        reflection: `Day ${index}`,
        win: null,
        stress: null,
      }),
    );

    render(<MindHome entries={entries} />);
    expect(screen.getByText("Showing 5 of 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByText("Showing 12 of 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByText("Showing 5 of 12")).toBeInTheDocument();
  });

  it("does not show a Journal streak or N of 7 stat", () => {
    render(<MindHome entries={[makeEntry()]} />);
    expect(screen.queryByText(/Journal streak/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/of 7/)).not.toBeInTheDocument();
  });

  it("labels the mood sparkline as last 7 days", () => {
    render(<MindHome entries={[makeEntry()]} />);
    expect(
      screen.getByText("Mood, last 7 days (hollow = no entry)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Past days are history, not an editor/),
    ).not.toBeInTheDocument();
  });
});
