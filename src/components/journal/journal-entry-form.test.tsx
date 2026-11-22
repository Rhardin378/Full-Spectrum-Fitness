import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JournalEntry } from "@/lib/journal/types";

const { saveJournalEntry, push, refresh } = vi.hoisted(() => ({
  saveJournalEntry: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/journal/actions", () => ({
  saveJournalEntry,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

import {
  JournalEntryForm,
  JournalEntryScreen,
} from "@/components/journal/journal-entry-form";

const TODAY = "2026-11-03";

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    entry_on: TODAY,
    mood: 7,
    reflection: "A solid day",
    stress: null,
    energy: null,
    win: null,
    grateful_for: null,
    domains: [],
    created_at: "2026-11-03T15:00:00.000Z",
    updated_at: "2026-11-03T15:00:00.000Z",
    ...overrides,
  };
}

function pressed(name: string | RegExp) {
  return screen.getByRole("button", { name }).getAttribute("aria-pressed");
}

const SCALES = {
  mood: "How’s your mood today?",
  stress: /^Stress today/,
  energy: /^Energy today/,
} as const;

function ratingButton(scale: keyof typeof SCALES, value: number) {
  return within(screen.getByRole("group", { name: SCALES[scale] })).getByRole(
    "button",
    { name: String(value) },
  );
}

function ratingPressed(scale: keyof typeof SCALES, value: number) {
  return ratingButton(scale, value).getAttribute("aria-pressed");
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date("2026-11-03T18:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("JournalEntryScreen", () => {
  it("loads the row for local today and ignores neighbouring days", () => {
    render(
      <JournalEntryScreen
        recentEntries={[
          makeEntry({ id: "yesterday", entry_on: "2026-11-02", reflection: "Old" }),
          makeEntry({ reflection: "Today text", mood: 4 }),
        ]}
      />,
    );

    expect(screen.getByLabelText("Reflection")).toHaveValue("Today text");
    expect(ratingPressed("mood", 4)).toBe("true");
    expect(screen.getByText("Tuesday, Nov 3")).toBeInTheDocument();
  });

  it("shows an empty new entry when today has no row", () => {
    render(
      <JournalEntryScreen
        recentEntries={[makeEntry({ entry_on: "2026-11-02" })]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "New journal entry" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Reflection")).toHaveValue("");
  });
});

describe("JournalEntryForm", () => {
  it("loads saved tags and lines, with null lines as empty inputs", () => {
    render(
      <JournalEntryForm
        today={TODAY}
        initialEntry={makeEntry({
          win: "Finished the proposal",
          grateful_for: null,
          domains: ["career", "physical_health"],
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Today’s journal entry" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("One win today")).toHaveValue(
      "Finished the proposal",
    );
    expect(screen.getByLabelText("Grateful for")).toHaveValue("");
    expect(pressed("Career")).toBe("true");
    expect(pressed("Physical health")).toBe("true");
  });

  it("allows three tags and does not add a fourth", () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Career" }));
    fireEvent.click(screen.getByRole("button", { name: "Social" }));
    fireEvent.click(screen.getByRole("button", { name: "Learning" }));
    fireEvent.click(screen.getByRole("button", { name: "Leisure" }));

    expect(pressed("Career")).toBe("true");
    expect(pressed("Social")).toBe("true");
    expect(pressed("Learning")).toBe("true");
    expect(pressed("Leisure")).toBe("false");
    expect(
      screen.getByText("What was today mostly about? Pick up to three."),
    ).toBeInTheDocument();
  });

  it("marks Habits as optional", () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    expect(
      screen.getByRole("button", { name: /^Habits\s*\(optional\)$/ }),
    ).toBeInTheDocument();
  });

  it("does not submit an empty reflection", async () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    fireEvent.click(ratingButton("mood", 6));
    fireEvent.change(screen.getByLabelText("Reflection"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(
      await screen.findByText("Reflection is required."),
    ).toBeInTheDocument();
    expect(saveJournalEntry).not.toHaveBeenCalled();
  });

  it("requires a mood before submitting", async () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    fireEvent.change(screen.getByLabelText("Reflection"), {
      target: { value: "Quiet day" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(
      await screen.findByText("Pick a mood from 1 to 10."),
    ).toBeInTheDocument();
    expect(saveJournalEntry).not.toHaveBeenCalled();
  });

  it("saves with both optional lines empty and redirects to Mind", async () => {
    saveJournalEntry.mockResolvedValue({
      success: true,
      entry: makeEntry({ mood: 8, reflection: "Good run", domains: ["leisure"] }),
    });
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    fireEvent.click(ratingButton("mood", 8));
    fireEvent.change(screen.getByLabelText("Reflection"), {
      target: { value: "Good run" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Leisure" }));
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() => {
      expect(saveJournalEntry).toHaveBeenCalledWith({
        today: TODAY,
        mood: 8,
        stress: null,
        energy: null,
        reflection: "Good run",
        domains: ["leisure"],
        win: "",
        grateful_for: "",
      });
    });
    expect(push).toHaveBeenCalledWith("/mind?saved=1");
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("sends a cleared line so the server stores null", async () => {
    saveJournalEntry.mockResolvedValue({
      success: true,
      entry: makeEntry({ win: null }),
    });
    render(
      <JournalEntryForm
        today={TODAY}
        initialEntry={makeEntry({ win: "Old win" })}
      />,
    );

    fireEvent.change(screen.getByLabelText("One win today"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalled());
    expect(saveJournalEntry.mock.calls[0][0]).toMatchObject({ win: "" });
    expect(await screen.findByLabelText("One win today")).toHaveValue("");
  });

  it("shows server field errors and the message", async () => {
    saveJournalEntry.mockResolvedValue({
      success: false,
      error: "validation",
      message: "Please fix the highlighted journal fields.",
      fieldErrors: { win: "Must be 200 characters or fewer." },
    });
    render(<JournalEntryForm today={TODAY} initialEntry={makeEntry()} />);

    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(
      await screen.findByText("Please fix the highlighted journal fields."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Must be 200 characters or fewer."),
    ).toBeInTheDocument();
  });

  it("shows a generic error when the action throws", async () => {
    saveJournalEntry.mockRejectedValue(new Error("network"));
    render(<JournalEntryForm today={TODAY} initialEntry={makeEntry()} />);

    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(
      await screen.findByText(
        "Unable to save your journal entry. Please try again.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the intention slot under the date", () => {
    render(
      <JournalEntryForm
        today={TODAY}
        initialEntry={null}
        intentionSlot={<p>This week’s intention: Lift 3x</p>}
      />,
    );

    expect(screen.getByText("This week’s intention: Lift 3x")).toBeInTheDocument();
  });

  it("marks stress and energy optional and shows no example data", () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    expect(
      screen.getByRole("group", { name: /^Stress today\s*\(optional\)$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /^Energy today\s*\(optional\)$/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/example data/i)).not.toBeInTheDocument();
  });

  it("loads saved stress and energy", () => {
    render(
      <JournalEntryForm
        today={TODAY}
        initialEntry={makeEntry({ stress: 6, energy: 3 })}
      />,
    );

    expect(ratingPressed("stress", 6)).toBe("true");
    expect(ratingPressed("energy", 3)).toBe("true");
    expect(ratingPressed("mood", 6)).toBe("false");
  });

  it("clears an optional rating when the selected value is pressed again", () => {
    render(<JournalEntryForm today={TODAY} initialEntry={null} />);

    fireEvent.click(ratingButton("stress", 5));
    expect(ratingPressed("stress", 5)).toBe("true");
    fireEvent.click(ratingButton("stress", 5));
    expect(ratingPressed("stress", 5)).toBe("false");

    fireEvent.click(ratingButton("mood", 5));
    fireEvent.click(ratingButton("mood", 5));
    expect(ratingPressed("mood", 5)).toBe("true");
  });

  it("sends stress and energy with the entry", async () => {
    saveJournalEntry.mockResolvedValue({
      success: true,
      entry: makeEntry({ stress: 8, energy: null }),
    });
    render(
      <JournalEntryForm
        today={TODAY}
        initialEntry={makeEntry({ energy: 4 })}
      />,
    );

    fireEvent.click(ratingButton("stress", 8));
    fireEvent.click(ratingButton("energy", 4));
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() => expect(saveJournalEntry).toHaveBeenCalled());
    expect(saveJournalEntry.mock.calls[0][0]).toMatchObject({
      stress: 8,
      energy: null,
    });
    expect(push).toHaveBeenCalledWith("/mind?saved=1");
    expect(ratingPressed("stress", 8)).toBe("true");
  });
});
