import { redirect } from "next/navigation";
import FitnessDashboardShell from "@/components/dashboard/fitness-dashboard-shell";
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
        <section className="mx-auto max-w-4xl rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load profile
          </h1>
          <p className="mt-3 text-text-muted">{profileResult.message}</p>
        </section>
      </main>
    );
  }

  const { profile } = profileResult;
  const needsProfileSetup =
    !profile.display_name?.trim() || !profile.fitness_goal?.trim();

  return (
    <main className="min-h-screen bg-surface-page">
      <FitnessDashboardShell
        displayName={profile.display_name}
        needsProfileSetup={needsProfileSetup}
      />
    </main>
  );
}
