"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { formatJournalDay } from "@/lib/journal/display";
import {
  buildMindWindowStats,
  weekdayLettersForWindow,
} from "@/lib/journal/mind-window";
import type { JournalEntry } from "@/lib/journal/types";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import { MindHistoryCard } from "@/components/mind/mind-history-card";
import { MoodSparkline } from "@/components/weekly/mood-sparkline";

const HISTORY_INITIAL_VISIBLE = 5;
const HISTORY_VISIBLE_STEP = 10;

const HISTORY_WINDOW_BUTTON_CLASS_NAME =
  "rounded-lg border border-black/10 bg-surface-card px-3 py-2 text-sm font-medium text-text-primary transition hover:border-brand-coral/40";

function subscribeToNothing() {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

type MindHomeProps = {
  entries: JournalEntry[];
  showSavedConfirmation?: boolean;
};

export function MindHome({
  entries,
  showSavedConfirmation = false,
}: MindHomeProps) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading Mind…
      </p>
    );
  }

  return (
    <MindHomeContent
      key={today}
      today={today}
      entries={entries}
      showSavedConfirmation={showSavedConfirmation}
    />
  );
}

type MindHomeContentProps = {
  today: string;
  entries: JournalEntry[];
  showSavedConfirmation: boolean;
};

function MindHomeContent({
  today,
  entries,
  showSavedConfirmation,
}: MindHomeContentProps) {
  const [visibleLimit, setVisibleLimit] = useState(HISTORY_INITIAL_VISIBLE);
  // Capture once so stripping ?saved=1 does not clear the in-memory banner.
  const [showSaved] = useState(showSavedConfirmation);

  useEffect(() => {
    if (!showSavedConfirmation || typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("saved")) {
      url.searchParams.delete("saved");
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", next);
    }
  }, [showSavedConfirmation]);

  const hasTodaysEntry = entries.some((entry) => entry.entry_on === today);
  const stats = buildMindWindowStats(entries, today);
  const visibleEntries = entries.slice(0, visibleLimit);
  const canShowMore = visibleLimit < entries.length;
  const canShowLess = visibleLimit > HISTORY_INITIAL_VISIBLE;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {showSaved ? (
        <p
          role="status"
          className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
        >
          Entry saved.
        </p>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Mind</h1>
          <p className="mt-2 text-text-muted">
            Reflect across your life domains
          </p>
        </div>
        <Link
          href="/mind/journal"
          className="inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2.5 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
        >
          {hasTodaysEntry ? "Edit today’s entry" : "+ New journal entry"}
        </Link>
      </header>

      <section
        aria-label="Mind stats"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <StatCard
          label="Avg mood"
          value={stats.averageMood != null ? String(stats.averageMood) : "—"}
          hint="Last 7 days"
        />
        <StatCard
          label="Domains touched"
          value={
            stats.domainsTouched.length > 0
              ? String(stats.domainsTouched.length)
              : "—"
          }
          hint={
            stats.domainsTouched.length > 0
              ? stats.domainsTouched.map((item) => item.label).join(", ")
              : "Last 7 days"
          }
        />
        <StatCard
          label="Last entry"
          value={
            stats.lastEntryOn
              ? formatJournalDay(stats.lastEntryOn)
              : "No entries yet"
          }
        />
      </section>

      {/* Ticket 2.7: check-in due card sits under stats and above the mood strip. */}
      {/* Ticket 2.5: intention card sits under the mood strip. */}

      <section aria-labelledby="mind-mood-trend">
        <h2
          id="mind-mood-trend"
          className="text-lg font-semibold text-text-primary"
        >
          Mood trend
        </h2>
        <div className="mt-3 rounded-2xl border border-black/5 bg-surface-card p-4 shadow-sm sm:p-5">
          <MoodSparkline
            values={stats.sparkline}
            weekStart={stats.windowStart}
            weekEnd={stats.windowEnd}
            dayLabels={weekdayLettersForWindow(stats.windowStart)}
            caption="Mood, last 7 days"
          />
        </div>
      </section>

      <section aria-labelledby="mind-recent-entries">
        <div className="mb-3">
          <h2
            id="mind-recent-entries"
            className="text-lg font-semibold text-text-primary"
          >
            Recent entries
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-surface-card px-5 py-8 text-center shadow-sm">
            <p className="text-sm text-text-muted">
              No journal entries yet. Start with today’s mood and a short
              reflection.
            </p>
            <Link
              href="/mind/journal"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2.5 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
            >
              + New journal entry
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {visibleEntries.map((entry) => (
                <li key={entry.id}>
                  <MindHistoryCard entry={entry} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-sm text-text-muted">
                Showing {visibleEntries.length} of {entries.length}
              </p>
              {canShowMore || canShowLess ? (
                <div className="flex flex-wrap gap-2">
                  {canShowMore ? (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleLimit((previous) =>
                          Math.min(
                            previous + HISTORY_VISIBLE_STEP,
                            entries.length,
                          ),
                        )
                      }
                      className={HISTORY_WINDOW_BUTTON_CLASS_NAME}
                    >
                      Show more
                    </button>
                  ) : null}
                  {canShowLess ? (
                    <button
                      type="button"
                      onClick={() => setVisibleLimit(HISTORY_INITIAL_VISIBLE)}
                      className={HISTORY_WINDOW_BUTTON_CLASS_NAME}
                    >
                      Show less
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-surface-card px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}
