import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WeeklyIntention } from "@/lib/weekly/types";
import {
  isIntentionEditable,
  WeeklyIntentionCard,
  WeeklyIntentionLine,
} from "@/components/weekly/weekly-intention";

const { getCurrentIntention, updateIntentionText } = vi.hoisted(() => ({
  getCurrentIntention: vi.fn(),
  updateIntentionText: vi.fn(),
}));

vi.mock("@/lib/weekly/actions", () => ({
  getCurrentIntention,
  updateIntentionText,
}));

const TODAY = "2026-11-03";

function makeIntention(
  overrides: Partial<WeeklyIntention> = {},
): WeeklyIntention {
  return {
    id: "intention-1",
    user_id: "user-1",
    week_start: "2026-11-02",
    domain: "career",
    body: "Lift 3x and call Mom Sunday",
    outcome: null,
    created_from_checkin_id: "checkin-1",
    editable_until: "2026-11-05",
    created_at: "2026-11-02T12:00:00.000Z",
    updated_at: "2026-11-02T12:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.setSystemTime(new Date("2026-11-03T18:00:00.000Z"));
});

describe("isIntentionEditable", () => {
  it("is inclusive through editable_until", () => {
    expect(isIntentionEditable("2026-11-05", "2026-11-05")).toBe(true);
    expect(isIntentionEditable("2026-11-06", "2026-11-05")).toBe(false);
  });
});

describe("WeeklyIntentionLine", () => {
  it("renders nothing when there is no intention", () => {
    const { container } = render(
      <WeeklyIntentionLine initialIntention={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing while loading", () => {
    getCurrentIntention.mockReturnValue(new Promise(() => {}));
    const { container } = render(<WeeklyIntentionLine />);
    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByText(/Loading this week’s intention/),
    ).not.toBeInTheDocument();
  });

  it("shows a muted error when the intention fails to load", async () => {
    getCurrentIntention.mockResolvedValue({
      success: false,
      error: "database",
      message: "Unable to load the intention. Please try again.",
    });

    render(<WeeklyIntentionLine />);

    expect(
      await screen.findByText("Couldn’t load this week’s intention."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a locked line after the edit window", () => {
    render(
      <WeeklyIntentionLine
        initialIntention={makeIntention({ editable_until: "2026-11-02" })}
      />,
    );
    expect(
      screen.getByText(/This week’s intention:/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Lift 3x and call Mom Sunday/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("saves text on editable_until and surfaces server lock errors", async () => {
    updateIntentionText.mockResolvedValue({
      success: true,
      intention: makeIntention({
        body: "Walk after dinner",
        editable_until: TODAY,
      }),
    });

    render(
      <WeeklyIntentionLine
        initialIntention={makeIntention({ editable_until: TODAY })}
      />,
    );

    const input = screen.getByLabelText("This week’s intention");
    fireEvent.change(input, { target: { value: "Walk after dinner" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(updateIntentionText).toHaveBeenCalledWith({
        id: "intention-1",
        today: TODAY,
        body: "Walk after dinner",
      });
    });
    expect(await screen.findByText("Intention updated.")).toBeInTheDocument();

    updateIntentionText.mockResolvedValue({
      success: false,
      error: "validation",
      message: "This intention can no longer be edited.",
      fieldErrors: {
        body: "Intention text is locked after the edit window.",
      },
    });

    fireEvent.change(screen.getByLabelText("This week’s intention"), {
      target: { value: "Too late" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("This intention can no longer be edited."),
    ).toBeInTheDocument();
  });
});

describe("WeeklyIntentionCard", () => {
  it("shows domain and read-only outcome, with no domain control", () => {
    render(
      <WeeklyIntentionCard
        initialIntention={makeIntention({
          outcome: "partly",
          editable_until: "2026-11-02",
        })}
      />,
    );

    expect(screen.getByText("Career")).toBeInTheDocument();
    expect(screen.getByText("Partly")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.getByText("Lift 3x and call Mom Sunday"),
    ).toBeInTheDocument();
  });

  it("edits from the Mind card while the window is open", async () => {
    updateIntentionText.mockResolvedValue({
      success: true,
      intention: makeIntention({ body: "Block focus hours" }),
    });

    render(
      <WeeklyIntentionCard initialIntention={makeIntention()} />,
    );

    fireEvent.change(screen.getByLabelText("Intention"), {
      target: { value: "Block focus hours" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save intention" }));

    await waitFor(() => {
      expect(updateIntentionText).toHaveBeenCalledWith({
        id: "intention-1",
        today: TODAY,
        body: "Block focus hours",
      });
    });
  });
});
