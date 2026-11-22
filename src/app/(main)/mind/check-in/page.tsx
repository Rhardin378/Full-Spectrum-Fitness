import { redirect } from "next/navigation";
import { WeeklyCheckInScreen } from "@/components/weekly/weekly-check-in-form";
import { getOrCreateProfile } from "@/lib/profile/actions";
import { listWeeklyCheckIns } from "@/lib/weekly/actions";
import { createClient } from "@/lib/supabase/server";

export default async function MindCheckInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [profileResult, checkInsResult] = await Promise.all([
    getOrCreateProfile(),
    listWeeklyCheckIns({ limit: 25 }),
  ]);

  if (!profileResult.success) {
    if (profileResult.error === "unauthorized") {
      redirect("/auth");
    }

    return (
      <main className="min-h-screen bg-surface-page p-6 sm:p-10">
        <section className="mx-auto max-w-2xl rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load your check-in
          </h1>
          <p className="mt-3 text-text-muted">{profileResult.message}</p>
        </section>
      </main>
    );
  }

  if (!checkInsResult.success) {
    if (checkInsResult.error === "unauthorized") {
      redirect("/auth");
    }

    return (
      <main className="min-h-screen bg-surface-page p-6 sm:p-10">
        <section className="mx-auto max-w-2xl rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load your check-in
          </h1>
          <p className="mt-3 text-text-muted">{checkInsResult.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <WeeklyCheckInScreen
          pastCheckIns={checkInsResult.checkIns}
          fitnessGoal={profileResult.profile.fitness_goal}
          wellnessGoal={profileResult.profile.wellness_goal}
        />
      </div>
    </main>
  );
}
