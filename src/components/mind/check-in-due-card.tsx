"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import { getCheckInDueStatus } from "@/lib/weekly/actions";
import { isSunday } from "@/lib/weekly/week-math";

function subscribeToNothing() {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

type CheckInDueCardProps = {
  /** Test seam: skip the network load. */
  initialDue?: boolean;
};

export function CheckInDueCard({ initialDue }: CheckInDueCardProps = {}) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return null;
  }

  return <CheckInDueCardBody key={today} today={today} initialDue={initialDue} />;
}

function CheckInDueCardBody({
  today,
  initialDue,
}: {
  today: string;
  initialDue?: boolean;
}) {
  const skipFetch = initialDue !== undefined;
  const [due, setDue] = useState<boolean | null>(
    initialDue === undefined ? null : initialDue,
  );

  useEffect(() => {
    if (skipFetch) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await getCheckInDueStatus({ today });
      if (cancelled) return;
      if (!result.success) {
        setDue(false);
        return;
      }
      setDue(result.due);
    })();

    return () => {
      cancelled = true;
    };
  }, [today, skipFetch]);

  if (due !== true) {
    return null;
  }

  return (
    <section
      aria-labelledby="mind-check-in-due"
      className="rounded-2xl border border-brand-coral/25 bg-brand-coral-light/30 px-5 py-5 shadow-sm"
    >
      <h2
        id="mind-check-in-due"
        className="text-lg font-semibold text-text-primary"
      >
        {isSunday(today)
          ? "This week’s check-in is ready"
          : "Last week’s check-in is ready"}
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Take a few minutes to score the week and set one intention. Nothing is
        stored until you submit.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/mind/check-in"
          className="inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2.5 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
        >
          Start weekly check-in
        </Link>
        <Link
          href="/fitness/measurements"
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-surface-card px-4 py-2.5 text-sm font-medium text-text-primary transition hover:border-brand-coral/40"
        >
          Log this week’s weight
        </Link>
      </div>
    </section>
  );
}
