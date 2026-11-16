import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Profile } from "@/lib/types/profile";

const { getUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser, signOut: vi.fn() } }),
}));

import AppHeader from "@/components/app-header";
import { ProfileProvider } from "@/components/profile/profile-provider";

const profile: Profile = {
  id: "profile-1",
  user_id: "user-1",
  display_name: "Alex Rivera",
  fitness_goal: null,
  wellness_goal: null,
  experience_level: null,
  sharing_preferences: null,
  domain_priorities: [],
  created_at: "2026-06-23T00:00:00.000Z",
  updated_at: "2026-06-23T00:00:00.000Z",
};

function Header({
  userId,
  initialProfile,
}: {
  userId: string | null;
  initialProfile: Profile | null;
}) {
  return (
    <ProfileProvider
      key={userId ?? "signed-out"}
      initialProfile={initialProfile}
      initialIsAuthenticated={userId !== null}
    >
      <AppHeader />
    </ProfileProvider>
  );
}

beforeEach(() => {
  getUser.mockResolvedValue({
    data: { user: { email: "alex@example.com" } },
  });
});

describe("AppHeader", () => {
  it("switches from signed out to signed in when the layout's user changes", async () => {
    const { rerender } = render(<Header userId={null} initialProfile={null} />);

    expect(screen.getByRole("link", { name: "Get started" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Alex Rivera/ })).toBeNull();

    rerender(<Header userId="user-1" initialProfile={profile} />);

    expect(
      await screen.findByRole("button", { name: /Alex Rivera/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get started" })).toBeNull();
  });

  it("shows the signed-in menu even before a profile row exists", async () => {
    render(<Header userId="user-1" initialProfile={null} />);

    expect(await screen.findByRole("button", { name: /alex/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get started" })).toBeNull();
  });
});
