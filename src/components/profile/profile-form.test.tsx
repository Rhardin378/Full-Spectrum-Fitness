import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Profile } from "@/lib/types/profile";

const { updateProfile, refreshProfile } = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  refreshProfile: vi.fn(),
}));

vi.mock("@/lib/profile/actions", () => ({
  updateProfile,
}));

vi.mock("@/components/profile/profile-provider", () => ({
  useProfile: () => ({
    profile: null,
    isLoading: false,
    errorMessage: null,
    refreshProfile,
  }),
}));

import ProfileForm from "@/components/profile/profile-form";

const initialProfile: Profile = {
  id: "profile-1",
  user_id: "user-1",
  display_name: "Alex",
  fitness_goal: "Build consistency",
  wellness_goal: "Reduce stress",
  experience_level: "beginner",
  sharing_preferences: "private",
  domain_priorities: [{ domain: "physical", priority: 1 }],
  created_at: "2026-06-23T00:00:00.000Z",
  updated_at: "2026-06-23T00:00:00.000Z",
};

function renderForm(profile: Profile = initialProfile) {
  render(<ProfileForm initialProfile={profile} />);
}

beforeEach(() => {
  vi.clearAllMocks();
  refreshProfile.mockResolvedValue(undefined);
});

describe("ProfileForm", () => {
  it("prefills fields from initialProfile", () => {
    renderForm();

    expect(screen.getByLabelText("Display name")).toHaveValue("Alex");
    expect(screen.getByLabelText("Fitness goal")).toHaveValue("Build consistency");
    expect(screen.getByLabelText("Wellness goal")).toHaveValue("Reduce stress");
    expect(screen.getByLabelText("Experience level")).toHaveValue("beginner");
    expect(screen.getByLabelText("Sharing preference")).toHaveValue("private");
    expect(screen.getByLabelText("Domain", { selector: "#domain-name-0" })).toHaveValue(
      "physical",
    );
  });

  it("submits successfully, shows status, and refreshes profile context", async () => {
    const updated: Profile = {
      ...initialProfile,
      display_name: "Alexandra",
      updated_at: "2026-11-02T00:00:00.000Z",
    };
    updateProfile.mockResolvedValue({ success: true, profile: updated });

    renderForm();
    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Alexandra" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: "Alexandra",
          fitness_goal: "Build consistency",
          wellness_goal: "Reduce stress",
          experience_level: "beginner",
          sharing_preferences: "private",
          domain_priorities: [{ domain: "physical", priority: 1 }],
        }),
      );
    });

    expect(
      await screen.findByText(
        "Profile saved. Your preferences are ready for the journey ahead.",
      ),
    ).toBeInTheDocument();
    expect(refreshProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Display name")).toHaveValue("Alexandra");
  });

  it("shows field and form errors without clearing user input", async () => {
    updateProfile.mockResolvedValue({
      success: false,
      message: "Unable to update your profile. Please try again.",
      fieldErrors: { display_name: "Display name must be 80 characters or fewer." },
    });

    renderForm();
    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "A very long name the user typed" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(
      await screen.findByText("Unable to update your profile. Please try again."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Display name must be 80 characters or fewer."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Display name")).toHaveValue(
      "A very long name the user typed",
    );
    expect(refreshProfile).not.toHaveBeenCalled();
  });

  it("disables submit while save is in progress", async () => {
    let resolveUpdate: (value: unknown) => void;
    updateProfile.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(screen.getByRole("button", { name: "Saving profile..." })).toBeDisabled();

    resolveUpdate!({ success: true, profile: initialProfile });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save profile" })).toBeEnabled();
    });
  });
});
