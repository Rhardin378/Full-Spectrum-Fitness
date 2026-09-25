import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/profile-form";
import { getOrCreateProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
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
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-500/30 bg-rose-50 p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load profile
          </h1>
          <p className="mt-3 text-text-muted">{profileResult.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-black/5 bg-surface-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-coral">Profile setup</p>
            <h1 className="text-3xl font-semibold text-text-primary">
              Tell us about your journey
            </h1>
            <p className="mt-2 max-w-2xl text-text-muted">
              Share your goals and priorities so Full Spectrum Fitness can support both
              body and mindset in one place.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-page"
          >
            Back to dashboard
          </Link>
        </div>

        <ProfileForm initialProfile={profileResult.profile} />
      </section>
    </main>
  );
}
