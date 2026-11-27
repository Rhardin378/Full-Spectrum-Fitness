import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WeekRecap } from "@/lib/journal/recap";
import type { WeeklyCheckIn, WeeklyIntention } from "@/lib/weekly/types";
import { WeeklyCheckInForm } from "@/components/weekly/weekly-check-in-form";

const { submitWeeklyCheckIn, push, refresh } = vi.hoisted(() => ({
  submitWeeklyCheckIn: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/weekly/actions", () => ({
  submitWeeklyCheckIn,
  getCheckInWeekIntention: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const TODAY = "2026-11-03";

const emptyRecap: WeekRecap = {
  weekStart: "2026-10-26",
  weekEnd: "2026-11-01",
  averageMood: null,
  averageStress: null,
  averageEnergy: null,
  daysJournaled: 0,
  topDomains: [],
  sparkline: [null, null, null, null, null, null, null],
};

const filledRecap: WeekRecap = {
  weekStart: "2026-10-26",
  weekEnd: "2026-11-01",
  averageMood: 6.8,
  averageStress: 5.5,
  averageEnergy: 7,
  daysJournaled: 5,
  topDomains: [
    { domain: "career", label: "Career", count: 3 },
    { domain: "family_relationships", label: "Family", count: 2 },
  ],
  sparkline: [7, 6, 8, 5, null, 7, null],
};

function makeIntention(
  overrides: Partial<WeeklyIntention> = {},
): WeeklyIntention {
  return {
    id: "intention-1",
    user_id: "user-1",
    week_start: "2026-10-26",
    domain: "career",
    body: "Block 2 focus hours",
    outcome: null,
    created_from_checkin_id: "checkin-0",
    editable_until: "2026-10-29",
    created_at: "2026-10-26T12:00:00.000Z",
    updated_at: "2026-10-26T12:00:00.000Z",
    ...overrides,
  };
}

function makeCheckIn(overrides: Partial<WeeklyCheckIn> = {}): WeeklyCheckIn {
  return {
    id: "checkin-1",
    user_id: "user-1",
    week_start: "2026-10-19",
    stress: 4,
    energy: 6,
    physical_health: 7,
    mental_health: 6,
    family_relationships: 7,
    social: 5,
    career: 5,
    learning: 6,
    leisure: 5,
    habits: null,
    notes: "Remembered notes",
    created_at: "2026-10-26T12:00:00.000Z",
    updated_at: "2026-10-26T12:00:00.000Z",
    ...overrides,
  };
}

function ratingButton(groupName: string | RegExp, value: number) {
  return within(screen.getByRole("group", { name: groupName })).getByRole(
    "button",
    { name: String(value) },
  );
}

async function fillRequiredScores() {
  fireEvent.click(ratingButton("Stress", 6));
  fireEvent.click(ratingButton("Energy", 7));
  fireEvent.click(ratingButton("Physical health", 8));
  fireEvent.click(ratingButton("Mental health", 6));
  fireEvent.click(ratingButton("Family & relationships", 7));
  fireEvent.click(ratingButton("Social", 5));
  fireEvent.click(ratingButton("Career", 4));
  fireEvent.click(ratingButton("Learning", 6));
  fireEvent.click(ratingButton("Leisure", 5));
}

beforeEach(() => {
  // Other suites use fake timers; waitFor needs real time in this file.
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("WeeklyCheckInForm", () => {
  it("hides the last-intention block on the first check-in", () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={null}
        existingCheckIn={null}
        pastCheckIns={[]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    expect(screen.queryByText(/Did you do it/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yes" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Add goals in your profile" }),
    ).toBeInTheDocument();
  });

  it("shows empty recap copy instead of zeros", () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={null}
        existingCheckIn={null}
        pastCheckIns={[]}
        fitnessGoal="Lift"
        wellnessGoal="Sleep"
      />,
    );

    expect(
      screen.getByText(/No journal entries last week/),
    ).toBeInTheDocument();
    expect(screen.queryByText("0 of 7")).not.toBeInTheDocument();
    expect(screen.getByText("Lift")).toBeInTheDocument();
    expect(screen.getByText("Sleep")).toBeInTheDocument();
  });

  it(
    "defaults the intention domain to the lowest score and redirects on success",
    async () => {
    submitWeeklyCheckIn.mockResolvedValue({
      success: true,
      checkIn: makeCheckIn({ week_start: "2026-10-26" }),
      intention: makeIntention({ week_start: "2026-11-02" }),
    });

    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={filledRecap}
        priorIntention={makeIntention()}
        existingCheckIn={null}
        pastCheckIns={[makeCheckIn()]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    expect(screen.getByText(/Block 2 focus hours/)).toBeInTheDocument();
    expect(screen.getByText("Daily avg 5.5")).toBeInTheDocument();
    expect(screen.getByText("Daily avg 7")).toBeInTheDocument();
    expect(screen.getByText("Remembered notes")).toBeInTheDocument();
    expect(
      screen.getByText(/Mood, week of Oct 26, 2026 – Nov 1, 2026/),
    ).toBeInTheDocument();

    await fillRequiredScores();
    fireEvent.click(screen.getByRole("button", { name: "Partly" }));

    expect(
      await screen.findByText(/Your lowest domain this week: Career/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Domain")).toHaveValue("career");

    fireEvent.change(screen.getByLabelText("Intention"), {
      target: { value: "Ship the check-in screen" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit check-in" }));

    await waitFor(() => {
      expect(submitWeeklyCheckIn).toHaveBeenCalledWith(
        expect.objectContaining({
          today: TODAY,
          stress: 6,
          energy: 7,
          career: 4,
          habits: null,
          intention_domain: "career",
          intention_body: "Ship the check-in screen",
          intention_outcome: "partly",
          notes: null,
        }),
      );
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/mind");
    });
    expect(refresh).toHaveBeenCalled();
  },
  10_000,
  );

  it("requires an outcome when a prior intention exists", async () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={makeIntention()}
        existingCheckIn={null}
        pastCheckIns={[]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    await fillRequiredScores();
    fireEvent.change(screen.getByLabelText("Intention"), {
      target: { value: "Call Mom on Sunday" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit check-in" }));

    expect(submitWeeklyCheckIn).not.toHaveBeenCalled();
    expect(
      screen.getByText("Outcome is required for last week’s intention."),
    ).toBeInTheDocument();
  });

  it("blocks submit when a required domain is missing", async () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={null}
        existingCheckIn={null}
        pastCheckIns={[]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    fireEvent.click(ratingButton("Stress", 6));
    fireEvent.click(ratingButton("Energy", 7));
    fireEvent.click(ratingButton("Physical health", 8));
    fireEvent.click(ratingButton("Mental health", 6));
    fireEvent.click(ratingButton("Family & relationships", 7));
    fireEvent.click(ratingButton("Social", 5));
    fireEvent.click(ratingButton("Career", 4));
    fireEvent.click(ratingButton("Learning", 6));
    // Leisure left blank
    fireEvent.change(screen.getByLabelText("Intention"), {
      target: { value: "Protect Saturday morning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit check-in" }));

    expect(submitWeeklyCheckIn).not.toHaveBeenCalled();
    expect(screen.getByText("Leisure is required.")).toBeInTheDocument();
  });

  it("sends unanswered Habits and empty notes as null", async () => {
    submitWeeklyCheckIn.mockResolvedValue({
      success: true,
      checkIn: makeCheckIn({ week_start: "2026-10-26" }),
      intention: makeIntention({ week_start: "2026-11-02" }),
    });

    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={null}
        existingCheckIn={null}
        pastCheckIns={[]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    await fillRequiredScores();
    fireEvent.change(screen.getByLabelText("Intention"), {
      target: { value: "Walk after dinner twice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit check-in" }));

    await waitFor(() => {
      expect(submitWeeklyCheckIn).toHaveBeenCalledWith(
        expect.objectContaining({
          habits: null,
          notes: null,
          intention_outcome: null,
        }),
      );
    });
  });

  it("shows the already-submitted message and does not submit again", async () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={filledRecap}
        priorIntention={null}
        existingCheckIn={makeCheckIn({ week_start: "2026-10-26", notes: null })}
        pastCheckIns={[makeCheckIn({ week_start: "2026-10-26", notes: null })]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    expect(
      screen.getByText("You already submitted this week’s check-in."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit check-in" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Submit check-in" }));
    expect(submitWeeklyCheckIn).not.toHaveBeenCalled();
  });

  it("shows past-check-in notes when present and hides them when null", () => {
    render(
      <WeeklyCheckInForm
        today={TODAY}
        recap={emptyRecap}
        priorIntention={null}
        existingCheckIn={null}
        pastCheckIns={[
          makeCheckIn({
            id: "with-notes",
            week_start: "2026-10-19",
            stress: 6,
            energy: 7,
            notes: "Kept training light",
          }),
          makeCheckIn({
            id: "without-notes",
            week_start: "2026-10-12",
            stress: 3,
            energy: 5,
            notes: null,
          }),
        ]}
        fitnessGoal={null}
        wellnessGoal={null}
      />,
    );

    expect(screen.getByText("Past check-ins")).toBeInTheDocument();
    expect(screen.getByText("Kept training light")).toBeInTheDocument();
    expect(screen.getByText("Stress 6 · Energy 7")).toBeInTheDocument();
    expect(screen.getByText("Stress 3 · Energy 5")).toBeInTheDocument();
    expect(screen.queryByText("Remembered notes")).not.toBeInTheDocument();
  });
});
