import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckInGoalsReminder } from "@/components/weekly/check-in-goals-reminder";

describe("CheckInGoalsReminder", () => {
  it("shows the quiet profile link when both goals are empty", () => {
    render(<CheckInGoalsReminder fitnessGoal="  " wellnessGoal={null} />);
    expect(
      screen.getByRole("link", { name: "Add goals in your profile" }),
    ).toHaveAttribute("href", "/profile");
    expect(screen.queryByText("Fitness")).not.toBeInTheDocument();
    expect(screen.queryByText("Wellness")).not.toBeInTheDocument();
  });

  it("shows only the saved goal and Edit in profile", () => {
    render(
      <CheckInGoalsReminder
        fitnessGoal="Run a half marathon"
        wellnessGoal={null}
      />,
    );
    expect(screen.getByText("Fitness")).toBeInTheDocument();
    expect(screen.getByText("Run a half marathon")).toBeInTheDocument();
    expect(screen.queryByText("Wellness")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Edit in profile" }),
    ).toHaveAttribute("href", "/profile");
  });
});
