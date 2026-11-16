"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SIGNED_IN_PATH } from "@/lib/auth/redirect";
import {
  formatAuthErrors,
  updatePasswordSchema,
  type FieldErrors,
} from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/client";

const UPDATE_ERROR_MESSAGES: Record<string, string> = {
  same_password: "Your new password must be different from your current one.",
  weak_password: "That password is too weak. Try a longer one.",
};

const GENERIC_ERROR_MESSAGE =
  "Unable to update your password. Please try again.";

const inputClassName =
  "w-full rounded-lg border border-black/10 bg-surface-card px-3 py-2 text-text-primary outline-none ring-brand-coral/40 transition focus:ring-2";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setErrorMessage(null);
    setStatusMessage(null);

    const parsed = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setErrors(formatAuthErrors(parsed.error));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      setErrorMessage(
        (error.code && UPDATE_ERROR_MESSAGES[error.code]) ?? GENERIC_ERROR_MESSAGE,
      );
      setLoading(false);
      return;
    }

    setStatusMessage("Password updated. Redirecting...");
    router.replace(DEFAULT_SIGNED_IN_PATH);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          Set a new password
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Choose a password with at least 8 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="new-password"
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
          autoComplete="new-password"
          required
        />
        {errors.password && (
          <p className="mt-1 text-xs text-feedback-error">{errors.password}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClassName}
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-feedback-error">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-coral-deep px-4 py-2 font-semibold text-text-on-dark transition hover:bg-brand-coral disabled:opacity-70"
      >
        {loading ? "Updating password..." : "Update password"}
      </button>

      {statusMessage && (
        <p className="rounded-lg bg-feedback-success-bg px-3 py-2 text-sm text-feedback-success-text">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-feedback-error-border bg-feedback-error-bg px-3 py-2 text-sm text-feedback-error"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}
