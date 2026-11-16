import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, replace, refresh } = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

import AuthForm from "@/components/auth/auth-form";

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthForm", () => {
  it("shows the reason message", () => {
    render(<AuthForm reasonMessage="Your session has expired." />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Your session has expired.",
    );
  });

  it("signs in with a legacy 6-character password and navigates", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null });
    render(<AuthForm />);

    fill("Email", " a@example.com ");
    fill("Password", "123456");
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "123456",
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the rate limit message on 429", async () => {
    auth.signInWithPassword.mockResolvedValue({
      error: { message: "Request rate limit reached", status: 429 },
    });
    render(<AuthForm />);

    fill("Email", "a@example.com");
    fill("Password", "whatever");
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
  });

  it("rejects sign-up passwords shorter than 8 characters", async () => {
    render(<AuthForm initialMode="signup" />);

    fill("Email", "a@example.com");
    fill("Password", "1234567");
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("signs up with the callback as emailRedirectTo", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    render(<AuthForm initialMode="signup" />);

    fill("Email", "a@example.com");
    fill("Password", "12345678");
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      await screen.findByText(/Please confirm your email/),
    ).toBeInTheDocument();
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }),
      }),
    );
  });

  it("requests a reset email through the callback", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<AuthForm />);

    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fill("Email", "a@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText(/a reset link is on its way/),
    ).toBeInTheDocument();
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("a@example.com", {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Fauth%2Fupdate-password`,
    });
  });

  it("shows the rate limit message when reset emails are throttled", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      error: { message: "rate limited", status: 429 },
    });
    render(<AuthForm initialMode="forgot" />);

    fill("Email", "a@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts",
    );
  });
});
