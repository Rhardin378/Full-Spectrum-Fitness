"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { getWeekRecap } from "@/lib/journal/actions";
import type { WeekRecap } from "@/lib/journal/recap";
import {
  LIFE_DOMAINS,
  LIFE_DOMAIN_LABELS,
  REQUIRED_CHECKIN_DOMAINS,
  type LifeDomain,
  type RequiredCheckInDomain,
} from "@/lib/life-domains";
import {
  addUtcCalendarDays,
  todayLocalISODate,
} from "@/lib/measurements/calendar-date";
import {
  getCheckInWeekIntention,
  submitWeeklyCheckIn,
} from "@/lib/weekly/actions";
import {
  formatIntentionWeekLabel,
  formatWeekOfRange,
} from "@/lib/weekly/display";
import { lowestDomain } from "@/lib/weekly/lowest-domain";
import type {
  IntentionOutcome,
  WeeklyCheckIn,
  WeeklyIntention,
} from "@/lib/weekly/types";
import {
  currentIntentionWeekStart,
  lastCompletedWeekStart,
} from "@/lib/weekly/week-math";
import { RatingScale } from "@/components/rating-scale";
import { CheckInGoalsReminder } from "@/components/weekly/check-in-goals-reminder";
import { MoodSparkline } from "@/components/weekly/mood-sparkline";

const UNEXPECTED_SUBMIT_MESSAGE =
  "Unable to submit your check-in. Please try again.";

const OUTCOME_OPTIONS: Array<{
  value: IntentionOutcome;
  label: string;
}> = [
  { value: "done", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "not_done", label: "No" },
];

const inputClassName =
  "w-full rounded-[10px] border border-black/10 bg-surface-card px-3.5 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25";

const sectionClassName =
  "rounded-2xl border border-black/5 bg-surface-card p-5 shadow-sm sm:p-6";

function subscribeToNothing() {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

type WeeklyCheckInScreenProps = {
  pastCheckIns: WeeklyCheckIn[];
  fitnessGoal: string | null;
  wellnessGoal: string | null;
};

export function WeeklyCheckInScreen({
  pastCheckIns,
  fitnessGoal,
  wellnessGoal,
}: WeeklyCheckInScreenProps) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading this week’s check-in…
      </p>
    );
  }

  return (
    <WeeklyCheckInLoader
      key={today}
      today={today}
      pastCheckIns={pastCheckIns}
      fitnessGoal={fitnessGoal}
      wellnessGoal={wellnessGoal}
    />
  );
}

type WeeklyCheckInLoaderProps = WeeklyCheckInScreenProps & {
  today: string;
};

function WeeklyCheckInLoader({
  today,
  pastCheckIns,
  fitnessGoal,
  wellnessGoal,
}: WeeklyCheckInLoaderProps) {
  const [recap, setRecap] = useState<WeekRecap | null>(null);
  const [priorIntention, setPriorIntention] = useState<WeeklyIntention | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const [recapResult, intentionResult] = await Promise.all([
        getWeekRecap({ today }),
        getCheckInWeekIntention({ today }),
      ]);

      if (cancelled) return;

      if (!recapResult.success) {
        setLoadError(recapResult.message);
        setLoading(false);
        return;
      }

      if (!intentionResult.success) {
        setLoadError(intentionResult.message);
        setLoading(false);
        return;
      }

      setRecap(recapResult.recap);
      setPriorIntention(intentionResult.intention);
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [today]);

  if (loading) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading this week’s check-in…
      </p>
    );
  }

  if (loadError || !recap) {
    return (
      <section className="rounded-2xl border border-feedback-error-border bg-feedback-error-bg p-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Unable to load your check-in
        </h1>
        <p className="mt-3 text-text-muted">
          {loadError ?? "Please try again."}
        </p>
      </section>
    );
  }

  const checkInWeekStart = lastCompletedWeekStart(today);
  const existingCheckIn =
    pastCheckIns.find((row) => row.week_start === checkInWeekStart) ?? null;

  return (
    <WeeklyCheckInForm
      today={today}
      recap={recap}
      priorIntention={priorIntention}
      existingCheckIn={existingCheckIn}
      pastCheckIns={pastCheckIns}
      fitnessGoal={fitnessGoal}
      wellnessGoal={wellnessGoal}
    />
  );
}

type WeeklyCheckInFormProps = {
  today: string;
  recap: WeekRecap;
  priorIntention: WeeklyIntention | null;
  existingCheckIn: WeeklyCheckIn | null;
  pastCheckIns: WeeklyCheckIn[];
  fitnessGoal: string | null;
  wellnessGoal: string | null;
};

function WeeklyCheckInForm({
  today,
  recap,
  priorIntention,
  existingCheckIn,
  pastCheckIns,
  fitnessGoal,
  wellnessGoal,
}: WeeklyCheckInFormProps) {
  const router = useRouter();
  const formId = useId();
  const checkInWeekStart = lastCompletedWeekStart(today);
  const checkInWeekEnd = addUtcCalendarDays(checkInWeekStart, 6);
  const intentionWeekStart = currentIntentionWeekStart(today);
  const intentionWeekEnd = addUtcCalendarDays(intentionWeekStart, 6);
  const alreadySubmitted = existingCheckIn != null;

  const [stress, setStress] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [scores, setScores] = useState<
    Partial<Record<RequiredCheckInDomain, number>>
  >({});
  const [habits, setHabits] = useState<number | null>(null);
  const [intentionOutcome, setIntentionOutcome] =
    useState<IntentionOutcome | null>(null);
  const [intentionDomainOverride, setIntentionDomainOverride] =
    useState<LifeDomain | null>(null);
  const [intentionBody, setIntentionBody] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const requiredScoresReady = REQUIRED_CHECKIN_DOMAINS.every(
    (domain) => scores[domain] != null,
  );
  const lowestFromScores = requiredScoresReady
    ? lowestDomain({
        physical_health: scores.physical_health!,
        mental_health: scores.mental_health!,
        family_relationships: scores.family_relationships!,
        social: scores.social!,
        career: scores.career!,
        learning: scores.learning!,
        leisure: scores.leisure!,
        habits,
      })
    : null;
  const intentionDomain = intentionDomainOverride ?? lowestFromScores;

  function clearFieldError(field: string) {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function setRequiredScore(domain: RequiredCheckInDomain, value: number) {
    clearFieldError(domain);
    setScores((previous) => ({ ...previous, [domain]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (submitting || alreadySubmitted) {
      return;
    }

    setFormError(null);
    const nextErrors: Record<string, string> = {};

    if (stress == null) nextErrors.stress = "Stress is required.";
    if (energy == null) nextErrors.energy = "Energy is required.";
    for (const domain of REQUIRED_CHECKIN_DOMAINS) {
      if (scores[domain] == null) {
        nextErrors[domain] = `${LIFE_DOMAIN_LABELS[domain]} is required.`;
      }
    }
    if (priorIntention && intentionOutcome == null) {
      nextErrors.intention_outcome =
        "Outcome is required for last week’s intention.";
    }
    if (intentionDomain == null) {
      nextErrors.intention_domain = "Choose an intention domain.";
    }
    if (!intentionBody.trim()) {
      nextErrors.intention_body = "Intention is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError("Please fix the highlighted check-in fields.");
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const result = await submitWeeklyCheckIn({
        today,
        stress: stress!,
        energy: energy!,
        physical_health: scores.physical_health!,
        mental_health: scores.mental_health!,
        family_relationships: scores.family_relationships!,
        social: scores.social!,
        career: scores.career!,
        learning: scores.learning!,
        leisure: scores.leisure!,
        habits,
        notes: notes.trim() ? notes : null,
        intention_domain: intentionDomain!,
        intention_body: intentionBody,
        intention_outcome: priorIntention ? intentionOutcome : null,
      });

      if (!result.success) {
        setFormError(result.message || UNEXPECTED_SUBMIT_MESSAGE);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setSubmitting(false);
        return;
      }

      router.push("/mind");
      router.refresh();
      // Keep submitting true so the button stays disabled after success.
    } catch {
      setFormError(UNEXPECTED_SUBMIT_MESSAGE);
      setSubmitting(false);
    }
  }

  const lowestLabel =
    lowestFromScores != null ? LIFE_DOMAIN_LABELS[lowestFromScores] : "…";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-3xl font-semibold text-text-primary">
          Weekly check-in
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {formatWeekOfRange(checkInWeekStart, checkInWeekEnd)}
        </p>
      </header>

      {alreadySubmitted ? (
        <p
          role="status"
          className="mb-6 rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
        >
          You already submitted this week’s check-in.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
          >
            {formError}
          </p>
        ) : null}

        <section
          className={sectionClassName}
          aria-labelledby={`${formId}-recap`}
        >
          <h2
            id={`${formId}-recap`}
            className="text-lg font-semibold text-text-primary"
          >
            Your week so far
          </h2>
          {recap.daysJournaled === 0 ? (
            <p className="mt-3 text-sm text-text-muted">
              No journal entries last week. You can still complete the check-in.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold text-text-primary">
                    {recap.averageMood ?? "—"}
                  </p>
                  <p className="text-xs text-text-muted">Avg mood</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-text-primary">
                    {recap.daysJournaled} of 7
                  </p>
                  <p className="text-xs text-text-muted">Days journaled</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-medium text-text-primary">
                    {recap.topDomains.length > 0
                      ? recap.topDomains
                          .map((item) => `${item.label} (${item.count})`)
                          .join(", ")
                      : "—"}
                  </p>
                  <p className="text-xs text-text-muted">Most tagged</p>
                </div>
              </div>
              <MoodSparkline
                values={recap.sparkline}
                weekStart={recap.weekStart}
                weekEnd={recap.weekEnd}
              />
            </div>
          )}
        </section>

        {priorIntention ? (
          <section
            className={sectionClassName}
            aria-labelledby={`${formId}-outcome`}
          >
            <h2 id={`${formId}-outcome`} className="sr-only">
              Last week’s intention
            </h2>
            <p className="text-base text-text-primary">
              <span className="font-medium">“{priorIntention.body}”</span>
              {" — Did you do it?"}
            </p>
            <div
              role="group"
              aria-labelledby={`${formId}-outcome`}
              aria-describedby={
                fieldErrors.intention_outcome
                  ? `${formId}-outcome-error`
                  : undefined
              }
              className="mt-4 flex flex-wrap gap-2"
            >
              {OUTCOME_OPTIONS.map((option) => {
                const selected = intentionOutcome === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={alreadySubmitted}
                    aria-pressed={selected}
                    aria-invalid={
                      fieldErrors.intention_outcome ? true : undefined
                    }
                    onClick={() => {
                      clearFieldError("intention_outcome");
                      setIntentionOutcome(option.value);
                    }}
                    className={`min-w-20 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      selected
                        ? "bg-brand-coral-deep text-white"
                        : "bg-surface-page text-text-muted hover:text-text-primary"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {fieldErrors.intention_outcome ? (
              <p
                id={`${formId}-outcome-error`}
                className="mt-1.5 text-sm text-brand-coral-deep"
              >
                {fieldErrors.intention_outcome}
              </p>
            ) : null}
          </section>
        ) : null}

        <section
          className={sectionClassName}
          aria-labelledby={`${formId}-stress-energy`}
        >
          <h2
            id={`${formId}-stress-energy`}
            className="text-lg font-semibold text-text-primary"
          >
            Stress & energy
          </h2>
          <p className="mt-1 text-xs text-text-muted">1 = low, 10 = high</p>
          <div className="mt-4 space-y-5">
            <RatingScale
              id={`${formId}-stress`}
              label="Stress"
              value={stress}
              disabled={alreadySubmitted}
              reference={
                recap.averageStress != null
                  ? `Daily avg ${recap.averageStress}`
                  : null
              }
              error={fieldErrors.stress}
              onChange={(value) => {
                clearFieldError("stress");
                setStress(value);
              }}
            />
            <RatingScale
              id={`${formId}-energy`}
              label="Energy"
              value={energy}
              disabled={alreadySubmitted}
              reference={
                recap.averageEnergy != null
                  ? `Daily avg ${recap.averageEnergy}`
                  : null
              }
              error={fieldErrors.energy}
              onChange={(value) => {
                clearFieldError("energy");
                setEnergy(value);
              }}
            />
          </div>
        </section>

        <CheckInGoalsReminder
          fitnessGoal={fitnessGoal}
          wellnessGoal={wellnessGoal}
        />

        <section
          className={sectionClassName}
          aria-labelledby={`${formId}-domains`}
        >
          <h2
            id={`${formId}-domains`}
            className="text-lg font-semibold text-text-primary"
          >
            Life domains
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            1 = struggling, 10 = thriving
          </p>
          <div className="mt-4 space-y-5">
            {REQUIRED_CHECKIN_DOMAINS.map((domain) => (
              <RatingScale
                key={domain}
                id={`${formId}-${domain}`}
                label={LIFE_DOMAIN_LABELS[domain]}
                value={scores[domain] ?? null}
                disabled={alreadySubmitted}
                compact
                error={fieldErrors[domain]}
                onChange={(value) => {
                  if (value == null) return;
                  setRequiredScore(domain, value);
                }}
              />
            ))}
            <RatingScale
              id={`${formId}-habits`}
              label={LIFE_DOMAIN_LABELS.habits}
              value={habits}
              optional
              disabled={alreadySubmitted}
              compact
              error={fieldErrors.habits}
              onChange={(value) => {
                clearFieldError("habits");
                setHabits(value);
              }}
            />
          </div>
        </section>

        <section
          className={sectionClassName}
          aria-labelledby={`${formId}-intention`}
        >
          <h2
            id={`${formId}-intention`}
            className="text-lg font-semibold text-text-primary"
          >
            Intention for the week of{" "}
            {formatIntentionWeekLabel(intentionWeekStart, intentionWeekEnd)}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            One concrete thing. Your lowest domain this week: {lowestLabel}.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor={`${formId}-intention-domain`}
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Domain
              </label>
              <select
                id={`${formId}-intention-domain`}
                value={intentionDomain ?? ""}
                disabled={alreadySubmitted}
                onChange={(event) => {
                  clearFieldError("intention_domain");
                  setIntentionDomainOverride(event.target.value as LifeDomain);
                }}
                className={inputClassName}
                aria-invalid={Boolean(fieldErrors.intention_domain)}
                aria-describedby={
                  fieldErrors.intention_domain
                    ? `${formId}-intention-domain-error`
                    : undefined
                }
              >
                <option value="" disabled>
                  Choose a domain
                </option>
                {LIFE_DOMAINS.map((domain) => (
                  <option key={domain} value={domain}>
                    {LIFE_DOMAIN_LABELS[domain]}
                  </option>
                ))}
              </select>
              {fieldErrors.intention_domain ? (
                <p
                  id={`${formId}-intention-domain-error`}
                  className="mt-1.5 text-sm text-brand-coral-deep"
                >
                  {fieldErrors.intention_domain}
                </p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor={`${formId}-intention-body`}
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Intention
              </label>
              <input
                id={`${formId}-intention-body`}
                type="text"
                value={intentionBody}
                disabled={alreadySubmitted}
                onChange={(event) => {
                  clearFieldError("intention_body");
                  setIntentionBody(event.target.value);
                }}
                maxLength={200}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.intention_body)}
                aria-describedby={
                  fieldErrors.intention_body
                    ? `${formId}-intention-body-error`
                    : undefined
                }
                className={inputClassName}
              />
              {fieldErrors.intention_body ? (
                <p
                  id={`${formId}-intention-body-error`}
                  className="mt-1.5 text-sm text-brand-coral-deep"
                >
                  {fieldErrors.intention_body}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className={sectionClassName}
          aria-labelledby={`${formId}-notes`}
        >
          <label
            id={`${formId}-notes`}
            htmlFor={`${formId}-notes-input`}
            className="block text-base font-semibold text-text-primary"
          >
            How did your training, energy and life go this week? Anything to
            remember?
          </label>
          <textarea
            id={`${formId}-notes-input`}
            value={notes}
            disabled={alreadySubmitted}
            onChange={(event) => {
              clearFieldError("notes");
              setNotes(event.target.value);
            }}
            rows={4}
            maxLength={1000}
            aria-invalid={Boolean(fieldErrors.notes)}
            aria-describedby={
              fieldErrors.notes ? `${formId}-notes-error` : undefined
            }
            className={`${inputClassName} mt-3 resize-y bg-surface-page/60`}
          />
          {fieldErrors.notes ? (
            <p
              id={`${formId}-notes-error`}
              className="mt-1.5 text-sm text-brand-coral-deep"
            >
              {fieldErrors.notes}
            </p>
          ) : null}
        </section>

        <button
          type="submit"
          disabled={submitting || alreadySubmitted}
          className="w-full rounded-xl bg-brand-coral-deep px-6 py-3.5 text-base font-semibold text-white shadow-[0_2px_8px_rgba(209,74,64,0.35)] transition hover:bg-brand-coral-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Submitting…" : "Submit check-in"}
        </button>
      </form>

      <section className="mt-10" aria-labelledby={`${formId}-history`}>
        <h2
          id={`${formId}-history`}
          className="text-lg font-semibold text-text-primary"
        >
          Past check-ins
        </h2>
        {pastCheckIns.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            No check-ins yet. Your first submit will show up here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pastCheckIns.map((checkIn) => {
              const weekEnd = addUtcCalendarDays(checkIn.week_start, 6);
              return (
                <li
                  key={checkIn.id}
                  className="rounded-2xl border border-black/5 bg-surface-card px-4 py-4 shadow-sm"
                >
                  <p className="text-sm font-medium text-text-primary">
                    {formatWeekOfRange(checkIn.week_start, weekEnd)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Stress {checkIn.stress} · Energy {checkIn.energy}
                  </p>
                  {checkIn.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-text-primary">
                      {checkIn.notes}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export { WeeklyCheckInForm };
