import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrCreateProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const profileResult = await getOrCreateProfile();

  if (!profileResult.success) {
    if (profileResult.error === "unauthorized") {
      redirect("/auth");
    }

    return (
      <main className="min-h-screen bg-surface-page p-6 sm:p-10">
        <section className="mx-auto max-w-4xl rounded-2xl border border-rose-500/30 bg-rose-50 p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load profile
          </h1>
          <p className="mt-3 text-text-muted">{profileResult.message}</p>
        </section>
      </main>
    );
  }

  const { profile } = profileResult;

  async function signOut() {
    "use server";

    const supabaseClient = await createClient();
    await supabaseClient.auth.signOut();
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <section className="mx-auto max-w-4xl rounded-2xl border border-black/5 bg-surface-card p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-brand-coral">Dashboard</p>
        <h1 className="text-3xl font-semibold text-text-primary">
          Welcome to Full Spectrum Fitness
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          {profile.display_name
            ? `Welcome back, ${profile.display_name}.`
            : "You are signed in. Complete your profile to personalize your experience."}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface-page p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Signed in as
            </p>
            <p className="mt-1 text-base font-medium text-text-primary">
              {user.email}
            </p>
          </div>

          <div className="rounded-xl bg-surface-page p-4">
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Profile status
            </p>
            <p className="mt-1 text-base font-medium text-text-primary">
              {profile.display_name ? "Profile created" : "Profile pending setup"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-xl bg-brand-coral px-4 py-2 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
          >
            {profile.display_name && profile.fitness_goal
              ? "Edit profile"
              : "Complete profile setup"}
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-surface-page sm:w-auto"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
