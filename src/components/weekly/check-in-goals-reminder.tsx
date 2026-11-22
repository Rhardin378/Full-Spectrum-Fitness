import Link from "next/link";

type CheckInGoalsReminderProps = {
  fitnessGoal: string | null;
  wellnessGoal: string | null;
};

function clampClassName() {
  return "line-clamp-3 whitespace-pre-wrap text-sm text-text-primary";
}

/** Read-only profile goals bar for the weekly check-in. */
export function CheckInGoalsReminder({
  fitnessGoal,
  wellnessGoal,
}: CheckInGoalsReminderProps) {
  const fitness = fitnessGoal?.trim() || null;
  const wellness = wellnessGoal?.trim() || null;

  if (!fitness && !wellness) {
    return (
      <section
        aria-label="Your goals"
        className="rounded-2xl border border-black/5 bg-surface-page/80 px-4 py-3 sm:px-5"
      >
        <Link
          href="/profile"
          className="text-sm text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
        >
          Add goals in your profile
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-label="Your goals"
      className="rounded-2xl border border-black/5 bg-surface-page/80 px-4 py-4 sm:px-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-text-primary">Your goals</h2>
        <Link
          href="/profile"
          className="shrink-0 text-sm font-medium text-brand-coral-deep underline-offset-2 hover:underline"
        >
          Edit in profile
        </Link>
      </div>
      <dl className="mt-3 space-y-3">
        {fitness ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Fitness
            </dt>
            <dd className={`mt-1 ${clampClassName()}`}>{fitness}</dd>
          </div>
        ) : null}
        {wellness ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Wellness
            </dt>
            <dd className={`mt-1 ${clampClassName()}`}>{wellness}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
