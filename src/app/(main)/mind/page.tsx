import { redirect } from "next/navigation";
import { MindHome } from "@/components/mind/mind-home";
import { listJournalEntries } from "@/lib/journal/actions";
import { createClient } from "@/lib/supabase/server";

type MindPageProps = {
  searchParams?: Promise<{ saved?: string | string[] }>;
};

export default async function MindPage({ searchParams }: MindPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const params = searchParams ? await searchParams : undefined;
  const savedParam = params?.saved;
  const showSavedConfirmation =
    savedParam === "1" ||
    (Array.isArray(savedParam) && savedParam.includes("1"));

  const entriesResult = await listJournalEntries({ limit: 25 });

  if (!entriesResult.success) {
    if (entriesResult.error === "unauthorized") {
      redirect("/auth");
    }

    return (
      <main className="min-h-screen bg-surface-page p-6 sm:p-10">
        <section className="mx-auto max-w-3xl rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load Mind
          </h1>
          <p className="mt-3 text-text-muted">{entriesResult.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <MindHome
        entries={entriesResult.entries}
        showSavedConfirmation={showSavedConfirmation}
      />
    </main>
  );
}
