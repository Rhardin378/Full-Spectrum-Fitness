import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MindHome } from "@/components/mind/mind-home";
import type { JournalEntry } from "@/lib/journal/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/weekly/actions", () => ({
  getCurrentIntention: vi.fn(async () => ({
    success: true,
    intention: null,
  })),
  updateIntentionText: vi.fn(),
  getActivityStreak: vi.fn(async () => ({
    success: true,
    streak: { days: 0, graceLeft: null, countsWorkouts: false },
  })),
}));

const TODAY = "2026-11-22";

const ZERO_STREAK = {
  days: 0,
  graceLeft: null,
  countsWorkouts: false,
} as const;

const ACTIVE_STREAK = {
  days: 4,
  graceLeft: 1 as const,
  countsWorkouts: false,
};

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
    render(<MindHome entries={[makeEntry()]} initialStreak={ZERO_STREAK} />);
    expect(
      screen.getByRole("link", { name: "Edit today’s entry" }),
    ).toHaveAttribute("href", "/mind/journal");
    expect(screen.queryByText("Entry saved.")).not.toBeInTheDocument();
  });

  it("shows Entry saved when confirmation is requested", () => {
    render(
      <MindHome
        entries={[makeEntry()]}
        showSavedConfirmation
        initialStreak={ZERO_STREAK}
      />,
    );
    expect(screen.getByText("Entry saved.")).toBeInTheDocument();
  });

  it("omits null stress/energy pills and win-only lines", () => {
    render(<MindHome entries={[makeEntry()]} initialStreak={ZERO_STREAK} />);
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

    render(<MindHome entries={entries} initialStreak={ZERO_STREAK} />);
    expect(screen.getByText("Showing 5 of 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByText("Showing 12 of 12")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByText("Showing 5 of 12")).toBeInTheDocument();
  });

  it("shows Activity streak from the server result, not Journal streak or N of 7", () => {
    render(<MindHome entries={[makeEntry()]} initialStreak={ACTIVE_STREAK} />);
    expect(screen.getByText("Activity streak")).toBeInTheDocument();
    expect(screen.getByText("4 days")).toBeInTheDocument();
    expect(screen.getByText("1 grace day left this week")).toBeInTheDocument();
    expect(screen.getByText("Journal counts")).toBeInTheDocument();
    expect(screen.queryByText(/Journal streak/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/of 7/)).not.toBeInTheDocument();
  });

  it("shows empty streak copy when the count is 0", () => {
    render(<MindHome entries={[makeEntry()]} initialStreak={ZERO_STREAK} />);
    expect(screen.getByText("0 days")).toBeInTheDocument();
    expect(
      screen.getByText("Log a journal entry to start a streak."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/grace day/i)).not.toBeInTheDocument();
  });

  it("labels the mood sparkline as last 7 days", () => {
    render(<MindHome entries={[makeEntry()]} initialStreak={ZERO_STREAK} />);
    expect(
      screen.getByText("Mood, last 7 days (hollow = no entry)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Past days are history, not an editor/),
    ).not.toBeInTheDocument();
  });
});
