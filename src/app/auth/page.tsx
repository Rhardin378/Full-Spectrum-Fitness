"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type FormErrors = {
  email?: string;
  password?: string;
};

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.replace("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  function validateInputs() {
    const nextErrors: FormErrors = {};
    const emailResult = emailSchema.safeParse(email.trim());
    const passwordResult = passwordSchema.safeParse(password);

    if (!emailResult.success) {
      nextErrors.email = emailResult.error.issues[0]?.message;
    }
    if (!passwordResult.success) {
      nextErrors.password = passwordResult.error.issues[0]?.message;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    if (!validateInputs()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : error.message,
      );
    } else {
      setStatusMessage("Welcome back. Redirecting...");
    }
    setLoading(false);
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    if (!validateInputs()) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(
        error.message.includes("already registered")
          ? "This email is already registered. Please sign in instead."
          : error.message,
      );
    } else {
      setStatusMessage("Account created. Please confirm your email to continue.");
    }

    setLoading(false);
  }

  const inputClassName =
    "w-full rounded-lg border border-black/10 bg-surface-card px-3 py-2 text-text-primary outline-none ring-brand-coral/40 transition focus:ring-2";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-auth" aria-hidden />

      <main className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-surface-card/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo className="[&_span]:text-text-primary" />
          <p className="mt-3 text-sm text-text-muted">
            Stronger minds. Stronger bodies.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg bg-surface-page p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === "signin"
                ? "bg-surface-card text-text-primary shadow"
                : "text-text-muted"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === "signup"
                ? "bg-surface-card text-text-primary shadow"
                : "text-text-muted"
            }`}
          >
            Sign Up
          </button>
        </div>

        {tab === "signin" ? (
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="signin-email" className="mb-1 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-rose-700">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="signin-password" className="mb-1 block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                placeholder="Enter password"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-rose-700">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-coral-deep px-4 py-2 font-semibold text-text-on-dark transition hover:bg-brand-coral disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignUp}>
            <div>
              <label htmlFor="signup-fullname" className="mb-1 block text-sm font-medium text-text-primary">
                Full Name
              </label>
              <input
                id="signup-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClassName}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-text-primary">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                required
              />
              {errors.email && <p className="mt-1 text-xs text-rose-700">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-text-primary">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                placeholder="Create password"
                required
              />
              {errors.password && <p className="mt-1 text-xs text-rose-700">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-coral-deep px-4 py-2 font-semibold text-text-on-dark transition hover:bg-brand-coral disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        {statusMessage && (
          <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800">
            {statusMessage}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
            {errorMessage}
          </p>
        )}
      </main>
    </div>
  );
}
