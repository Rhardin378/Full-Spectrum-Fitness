"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SIGNED_IN_PATH,
  getPasswordResetRedirectUrl,
  getSignUpRedirectUrl,
} from "@/lib/auth/redirect";
import {
  formatAuthErrors,
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

export type AuthMode = "signin" | "signup" | "forgot";

type AuthFormProps = {
  initialMode?: AuthMode;
  reasonMessage?: string | null;
};

type AuthErrorLike = { message?: string; status?: number; code?: string };

const RATE_LIMIT_MESSAGE =
  "Too many attempts. Please wait a minute and try again.";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

function isRateLimited(error: AuthErrorLike): boolean {
  return error.status === 429 || error.code === "over_email_send_rate_limit";
}

const inputClassName =
  "w-full rounded-lg border border-black/10 bg-surface-card px-3 py-2 text-text-primary outline-none ring-brand-coral/40 transition focus:ring-2";

const submitClassName =
  "w-full rounded-lg bg-brand-coral-deep px-4 py-2 font-semibold text-text-on-dark transition hover:bg-brand-coral disabled:opacity-70";

export default function AuthForm({
  initialMode = "signin",
  reasonMessage = null,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(
    reasonMessage,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrors({});
    setStatusMessage(null);
    setErrorMessage(null);
    setNoticeMessage(null);
    setPassword("");
  }

  function resetMessages() {
    setErrors({});
    setStatusMessage(null);
    setErrorMessage(null);
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(formatAuthErrors(parsed.error));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setErrorMessage(
        isRateLimited(error)
          ? RATE_LIMIT_MESSAGE
          : error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : GENERIC_ERROR_MESSAGE,
      );
      setLoading(false);
      return;
    }

    setStatusMessage("Welcome back. Redirecting...");
    router.replace(DEFAULT_SIGNED_IN_PATH);
    router.refresh();
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    const parsed = signUpSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(formatAuthErrors(parsed.error));
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo: getSignUpRedirectUrl(window.location.origin),
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(
        isRateLimited(error)
          ? RATE_LIMIT_MESSAGE
          : error.message.includes("already registered")
            ? "This email is already registered. Please sign in instead."
            : error.code === "weak_password"
              ? "That password is too weak. Try a longer one."
              : GENERIC_ERROR_MESSAGE,
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      setStatusMessage("Account created. Redirecting...");
      router.replace(DEFAULT_SIGNED_IN_PATH);
      router.refresh();
      return;
    }

    setStatusMessage("Account created. Please confirm your email to continue.");
    setLoading(false);
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(formatAuthErrors(parsed.error));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo: getPasswordResetRedirectUrl(window.location.origin) },
    );

    if (error) {
      setErrorMessage(
        isRateLimited(error) ? RATE_LIMIT_MESSAGE : GENERIC_ERROR_MESSAGE,
      );
      setLoading(false);
      return;
    }

    setStatusMessage(
      "If an account exists for that email, a reset link is on its way. Check your inbox.",
    );
    setLoading(false);
  }

  const emailField = (
    <div>
      <label
        htmlFor={`${mode}-email`}
        className="mb-1 block text-sm font-medium text-text-primary"
      >
        Email
      </label>
      <input
        id={`${mode}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClassName}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      {errors.email && (
        <p className="mt-1 text-xs text-feedback-error">{errors.email}</p>
      )}
    </div>
  );

  function passwordField(placeholder: string, autoComplete: string) {
    return (
      <div>
        <label
          htmlFor={`${mode}-password`}
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        {errors.password && (
          <p className="mt-1 text-xs text-feedback-error">{errors.password}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {noticeMessage && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-feedback-error-border bg-feedback-error-bg px-3 py-2 text-sm text-feedback-error"
        >
          {noticeMessage}
        </p>
      )}

      {mode === "forgot" ? (
        <form className="space-y-4" onSubmit={handleForgot} noValidate>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Reset your password
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Enter your email and we will send you a link to set a new
              password.
            </p>
          </div>
          {emailField}
          <button type="submit" disabled={loading} className={submitClassName}>
            {loading ? "Sending link..." : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="w-full text-sm font-medium text-brand-coral hover:text-brand-coral-deep"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-surface-page p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === "signin"
                  ? "bg-surface-card text-text-primary shadow"
                  : "text-text-muted"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-surface-card text-text-primary shadow"
                  : "text-text-muted"
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === "signin" ? (
            <form className="space-y-4" onSubmit={handleSignIn} noValidate>
              {emailField}
              {passwordField("Enter password", "current-password")}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-sm font-medium text-brand-coral hover:text-brand-coral-deep"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={submitClassName}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp} noValidate>
              <div>
                <label
                  htmlFor="signup-fullname"
                  className="mb-1 block text-sm font-medium text-text-primary"
                >
                  Full Name
                </label>
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClassName}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
              {emailField}
              {passwordField("At least 8 characters", "new-password")}
              <button
                type="submit"
                disabled={loading}
                className={submitClassName}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </>
      )}

      {statusMessage && (
        <p className="mt-4 rounded-lg bg-feedback-success-bg px-3 py-2 text-sm text-feedback-success-text">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-feedback-error-border bg-feedback-error-bg px-3 py-2 text-sm text-feedback-error"
        >
          {errorMessage}
        </p>
      )}
    </>
  );
}
