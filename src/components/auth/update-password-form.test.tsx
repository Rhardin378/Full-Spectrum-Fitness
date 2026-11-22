import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateUser, replace, refresh } = vi.hoisted(() => ({
  updateUser: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { updateUser } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

import UpdatePasswordForm from "@/components/auth/update-password-form";

function submit(password: string, confirmPassword: string) {
  fireEvent.change(screen.getByLabelText("New password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Confirm new password"), {
    target: { value: confirmPassword },
  });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UpdatePasswordForm", () => {
  it("rejects short passwords without calling Supabase", async () => {
    render(<UpdatePasswordForm />);
    submit("short", "short");

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    render(<UpdatePasswordForm />);
    submit("12345678", "87654321");

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the password and goes to Fitness", async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordForm />);
    submit("12345678", "12345678");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/fitness"));
    expect(updateUser).toHaveBeenCalledWith({ password: "12345678" });
  });

  it.each([
    ["same_password", "must be different"],
    ["weak_password", "too weak"],
    ["unexpected_failure", "Unable to update your password"],
  ])("maps %s to a friendly message", async (code, text) => {
    updateUser.mockResolvedValue({
      error: { code, message: "raw supabase text" },
    });
    render(<UpdatePasswordForm />);
    submit("12345678", "12345678");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(text);
    expect(alert).not.toHaveTextContent("raw supabase text");
    expect(replace).not.toHaveBeenCalled();
  });
});
