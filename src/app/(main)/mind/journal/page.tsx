import { redirect } from "next/navigation";
import { JournalEntryScreen } from "@/components/journal/journal-entry-form";
import { WeeklyIntentionLine } from "@/components/weekly/weekly-intention";
import { listJournalEntries } from "@/lib/journal/actions";
import {
  addUtcCalendarDays,
  maxAllowedMeasuredOn,
  utcTodayISODate,
} from "@/lib/measurements/calendar-date";
import { createClient } from "@/lib/supabase/server";

export default async function MindJournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const entriesResult = await listJournalEntries({
    start_date: addUtcCalendarDays(utcTodayISODate(), -1),
    end_date: maxAllowedMeasuredOn(),
    limit: 3,
  });

  if (!entriesResult.success) {
    if (entriesResult.error === "unauthorized") {
      redirect("/auth");
    }

    return (
      <main className="min-h-screen bg-surface-page p-6 sm:p-10">
        <section className="mx-auto max-w-2xl rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
          <h1 className="text-2xl font-semibold text-text-primary">
            Unable to load your journal
          </h1>
          <p className="mt-3 text-text-muted">{entriesResult.message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <JournalEntryScreen
          recentEntries={entriesResult.entries}
          intentionSlot={<WeeklyIntentionLine />}
        />
      </div>
    </main>
  );
}
