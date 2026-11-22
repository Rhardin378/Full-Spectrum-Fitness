"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { RatingScale } from "@/components/rating-scale";
import { saveJournalEntry } from "@/lib/journal/actions";
import { formatJournalDay } from "@/lib/journal/display";
import type { JournalEntry } from "@/lib/journal/types";
import {
  LIFE_DOMAINS,
  LIFE_DOMAIN_LABELS,
  type LifeDomain,
} from "@/lib/life-domains";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";

const MAX_TAGS = 3;
const UNEXPECTED_SAVE_MESSAGE =
  "Unable to save your journal entry. Please try again.";

const inputClassName =
  "w-full rounded-[10px] border border-black/10 bg-surface-card px-3.5 py-3 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25";

function subscribeToNothing() {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

type JournalEntryScreenProps = {
  /** The caller's rows around UTC today; the screen picks local today's row. */
  recentEntries: JournalEntry[];
  intentionSlot?: ReactNode;
};

export function JournalEntryScreen({
  recentEntries,
  intentionSlot,
}: JournalEntryScreenProps) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading today’s entry…
      </p>
    );
  }

  const todaysEntry =
    recentEntries.find((entry) => entry.entry_on === today) ?? null;

  return (
    <JournalEntryForm
      key={today}
      today={today}
      initialEntry={todaysEntry}
      intentionSlot={intentionSlot}
    />
  );
}

type JournalEntryFormProps = {
  today: string;
  initialEntry: JournalEntry | null;
  intentionSlot?: ReactNode;
};

export function JournalEntryForm({
  today,
  initialEntry,
  intentionSlot,
}: JournalEntryFormProps) {
  const router = useRouter();
  const formId = useId();
  const [hasSavedEntry, setHasSavedEntry] = useState(initialEntry !== null);
  const [mood, setMood] = useState<number | null>(initialEntry?.mood ?? null);
  const [stress, setStress] = useState<number | null>(
    initialEntry?.stress ?? null,
  );
  const [energy, setEnergy] = useState<number | null>(
    initialEntry?.energy ?? null,
  );
  const [reflection, setReflection] = useState(initialEntry?.reflection ?? "");
  const [win, setWin] = useState(initialEntry?.win ?? "");
  const [gratefulFor, setGratefulFor] = useState(
    initialEntry?.grateful_for ?? "",
  );
  const [domains, setDomains] = useState<LifeDomain[]>(
    initialEntry?.domains ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function clearFieldError(field: string) {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function toggleDomain(domain: LifeDomain) {
    clearFieldError("domains");
    setDomains((previous) => {
      if (previous.includes(domain)) {
        return previous.filter((item) => item !== domain);
      }
      if (previous.length >= MAX_TAGS) {
        return previous;
      }
      return LIFE_DOMAINS.filter(
        (item) => item === domain || previous.includes(item),
      );
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (mood === null) {
      clientErrors.mood = "Pick a mood from 1 to 10.";
    }
    if (!reflection.trim()) {
      clientErrors.reflection = "Reflection is required.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await saveJournalEntry({
        today,
        mood: mood!,
        stress,
        energy,
        reflection,
        domains,
        win,
        grateful_for: gratefulFor,
      });

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFormError(result.message);
        setSubmitting(false);
        return;
      }

      const { entry } = result;
      setMood(entry.mood);
      setStress(entry.stress);
      setEnergy(entry.energy);
      setReflection(entry.reflection);
      setWin(entry.win ?? "");
      setGratefulFor(entry.grateful_for ?? "");
      setDomains(entry.domains);
      setHasSavedEntry(true);
      router.push("/mind?saved=1");
      router.refresh();
      // Keep submitting true so the button stays disabled after success.
    } catch {
      setFormError(UNEXPECTED_SAVE_MESSAGE);
      setSubmitting(false);
    }
  }

  const domainsLabelId = `${formId}-domains-label`;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-3xl font-semibold text-text-primary">
          {hasSavedEntry ? "Today’s journal entry" : "New journal entry"}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{formatJournalDay(today)}</p>
      </header>

      {intentionSlot ? <div className="mb-5">{intentionSlot}</div> : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-7 rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm sm:p-8"
      >
        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
          >
            {formError}
          </p>
        ) : null}

        <RatingScale
          id={`${formId}-mood`}
          label="How’s your mood today?"
          legend="1 = rough, 10 = great"
          value={mood}
          error={fieldErrors.mood}
          onChange={(value) => {
            clearFieldError("mood");
            setMood(value);
          }}
        />

        <RatingScale
          id={`${formId}-stress`}
          label="Stress today"
          legend="1 = low, 10 = high"
          value={stress}
          optional
          error={fieldErrors.stress}
          onChange={(value) => {
            clearFieldError("stress");
            setStress(value);
          }}
        />

        <RatingScale
          id={`${formId}-energy`}
          label="Energy today"
          legend="1 = low, 10 = high"
          value={energy}
          optional
          error={fieldErrors.energy}
          onChange={(value) => {
            clearFieldError("energy");
            setEnergy(value);
          }}
        />

        <div>
          <label
            htmlFor={`${formId}-reflection`}
            className="mb-2 block text-base font-semibold text-text-primary"
          >
            Reflection
          </label>
          <textarea
            id={`${formId}-reflection`}
            value={reflection}
            onChange={(event) => {
              clearFieldError("reflection");
              setReflection(event.target.value);
            }}
            rows={4}
            maxLength={2000}
            required
            aria-invalid={Boolean(fieldErrors.reflection)}
            aria-describedby={
              fieldErrors.reflection ? `${formId}-reflection-error` : undefined
            }
            className={`${inputClassName} resize-y bg-surface-page/60`}
          />
          {fieldErrors.reflection ? (
            <p
              id={`${formId}-reflection-error`}
              className="mt-1.5 text-sm text-brand-coral-deep"
            >
              {fieldErrors.reflection}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label
              htmlFor={`${formId}-win`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              One win today
            </label>
            <input
              id={`${formId}-win`}
              type="text"
              value={win}
              onChange={(event) => {
                clearFieldError("win");
                setWin(event.target.value);
              }}
              maxLength={200}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.win)}
              className={inputClassName}
            />
            {fieldErrors.win ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.win}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor={`${formId}-grateful-for`}
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Grateful for
            </label>
            <input
              id={`${formId}-grateful-for`}
              type="text"
              value={gratefulFor}
              onChange={(event) => {
                clearFieldError("grateful_for");
                setGratefulFor(event.target.value);
              }}
              maxLength={200}
              autoComplete="off"
              aria-invalid={Boolean(fieldErrors.grateful_for)}
              className={inputClassName}
            />
            {fieldErrors.grateful_for ? (
              <p className="mt-1.5 text-sm text-brand-coral-deep">
                {fieldErrors.grateful_for}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <span
            id={domainsLabelId}
            className="block text-base font-semibold text-text-primary"
          >
            Tag a domain{" "}
            <span className="font-normal text-text-muted">(optional)</span>
          </span>
          <p className="mt-1 text-xs text-text-muted">
            What was today mostly about? Pick up to three.
          </p>
          <div
            role="group"
            aria-labelledby={domainsLabelId}
            className="mt-3 flex flex-wrap gap-2"
          >
            {LIFE_DOMAINS.map((domain) => {
              const selected = domains.includes(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleDomain(domain)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    selected
                      ? "border-brand-coral-deep bg-brand-coral-deep text-white"
                      : "border-black/15 bg-surface-card text-text-primary hover:border-brand-coral/60"
                  }`}
                >
                  {LIFE_DOMAIN_LABELS[domain]}
                  {domain === "habits" ? (
                    <span
                      className={selected ? "text-white/80" : "text-text-muted"}
                    >
                      {" "}
                      (optional)
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {fieldErrors.domains ? (
            <p className="mt-1.5 text-sm text-brand-coral-deep">
              {fieldErrors.domains}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand-coral-deep px-6 py-3 text-base font-semibold text-white shadow-[0_2px_8px_rgba(209,74,64,0.35)] transition hover:bg-brand-coral-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Saving…" : "Save entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
