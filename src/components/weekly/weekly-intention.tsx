"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { LIFE_DOMAIN_LABELS } from "@/lib/life-domains";
import { todayLocalISODate } from "@/lib/measurements/calendar-date";
import {
  getCurrentIntention,
  updateIntentionText,
} from "@/lib/weekly/actions";
import type { IntentionOutcome, WeeklyIntention } from "@/lib/weekly/types";

const OUTCOME_LABELS: Record<IntentionOutcome, string> = {
  done: "Done",
  partly: "Partly",
  not_done: "Not done",
};

const UNEXPECTED_SAVE_MESSAGE =
  "Unable to update the intention. Please try again.";

const inputClassName =
  "w-full rounded-[10px] border border-black/10 bg-surface-card px-3 py-2.5 text-[15px] text-text-primary outline-none focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/25";

function subscribeToNothing() {
  return () => {};
}

function getServerToday(): string | null {
  return null;
}

export function isIntentionEditable(
  today: string,
  editableUntil: string,
): boolean {
  return today <= editableUntil;
}

type WeeklyIntentionLineProps = {
  /** Test seam: skip the network load and render this intention. */
  initialIntention?: WeeklyIntention | null;
};

export function WeeklyIntentionLine({
  initialIntention,
}: WeeklyIntentionLineProps = {}) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return null;
  }

  return (
    <WeeklyIntentionBody
      key={today}
      today={today}
      variant="line"
      initialIntention={initialIntention}
    />
  );
}

type WeeklyIntentionCardProps = {
  initialIntention?: WeeklyIntention | null;
};

export function WeeklyIntentionCard({
  initialIntention,
}: WeeklyIntentionCardProps = {}) {
  const today = useSyncExternalStore(
    subscribeToNothing,
    todayLocalISODate,
    getServerToday,
  );

  if (!today) {
    return null;
  }

  return (
    <WeeklyIntentionBody
      key={today}
      today={today}
      variant="card"
      initialIntention={initialIntention}
    />
  );
}

type WeeklyIntentionBodyProps = {
  today: string;
  variant: "line" | "card";
  initialIntention?: WeeklyIntention | null;
};

function WeeklyIntentionBody({
  today,
  variant,
  initialIntention,
}: WeeklyIntentionBodyProps) {
  const formId = useId();
  const [intention, setIntention] = useState<WeeklyIntention | null | undefined>(
    initialIntention !== undefined ? initialIntention : undefined,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [body, setBody] = useState(initialIntention?.body ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialIntention !== undefined) {
      return;
    }

    let cancelled = false;

    async function load() {
      const result = await getCurrentIntention({ today });
      if (cancelled) return;

      if (!result.success) {
        setIntention(null);
        setLoadError("Couldn’t load this week’s intention.");
        return;
      }

      setIntention(result.intention);
      setBody(result.intention?.body ?? "");
      setLoadError(null);
      setFormError(null);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [today, initialIntention]);

  if (intention === undefined) {
    return null;
  }

  if (loadError) {
    return (
      <p className="text-sm text-text-muted" role="status">
        {loadError}
      </p>
    );
  }

  if (intention === null) {
    return null;
  }

  const editable = isIntentionEditable(today, intention.editable_until);
  const domainLabel = LIFE_DOMAIN_LABELS[intention.domain];
  const outcomeLabel =
    intention.outcome != null ? OUTCOME_LABELS[intention.outcome] : null;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editable || submitting || !intention) {
      return;
    }

    const trimmed = body.trim();
    if (!trimmed) {
      setFieldError("Intention is required.");
      setSaved(false);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldError(null);
    setSaved(false);

    try {
      const result = await updateIntentionText({
        id: intention.id,
        today,
        body: trimmed,
      });

      if (!result.success) {
        setFormError(result.message || UNEXPECTED_SAVE_MESSAGE);
        if (result.fieldErrors?.body) {
          setFieldError(result.fieldErrors.body);
        }
        return;
      }

      setIntention(result.intention);
      setBody(result.intention.body);
      setSaved(true);
    } catch {
      setFormError(UNEXPECTED_SAVE_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  if (variant === "line") {
    return (
      <section className="rounded-xl border border-brand-coral/25 bg-brand-coral-light/50 px-4 py-3">
        {formError ? (
          <p role="alert" className="mb-2 text-sm text-brand-coral-deep">
            {formError}
          </p>
        ) : null}
        {editable ? (
          <form onSubmit={handleSave} className="space-y-2" noValidate>
            <label
              htmlFor={`${formId}-line-body`}
              className="block text-sm font-medium text-text-primary"
            >
              This week’s intention
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id={`${formId}-line-body`}
                type="text"
                value={body}
                maxLength={200}
                onChange={(event) => {
                  setFieldError(null);
                  setSaved(false);
                  setBody(event.target.value);
                }}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={
                  fieldError ? `${formId}-line-error` : undefined
                }
                className={inputClassName}
              />
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 rounded-lg bg-brand-coral-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-coral-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
            {fieldError ? (
              <p
                id={`${formId}-line-error`}
                className="text-sm text-brand-coral-deep"
              >
                {fieldError}
              </p>
            ) : null}
            {saved ? (
              <p role="status" className="text-sm text-text-primary">
                Intention updated.
              </p>
            ) : null}
          </form>
        ) : (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">This week’s intention:</span>{" "}
            {intention.body}
          </p>
        )}
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`${formId}-card-title`}
      className="rounded-2xl border border-black/5 bg-surface-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id={`${formId}-card-title`}
          className="text-lg font-semibold text-text-primary"
        >
          This week’s intention
        </h2>
        <p className="text-sm font-medium text-text-muted">{domainLabel}</p>
      </div>

      {outcomeLabel ? (
        <p className="mt-2 text-sm text-text-muted">
          Outcome:{" "}
          <span className="font-medium text-text-primary">{outcomeLabel}</span>
        </p>
      ) : null}

      {formError ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-brand-coral/30 bg-brand-coral-light/40 px-3 py-2 text-sm text-text-primary"
        >
          {formError}
        </p>
      ) : null}

      {editable ? (
        <form onSubmit={handleSave} className="mt-4 space-y-3" noValidate>
          <label
            htmlFor={`${formId}-card-body`}
            className="block text-sm font-medium text-text-primary"
          >
            Intention
          </label>
          <input
            id={`${formId}-card-body`}
            type="text"
            value={body}
            maxLength={200}
            onChange={(event) => {
              setFieldError(null);
              setSaved(false);
              setBody(event.target.value);
            }}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? `${formId}-card-error` : undefined}
            className={inputClassName}
          />
          {fieldError ? (
            <p
              id={`${formId}-card-error`}
              className="text-sm text-brand-coral-deep"
            >
              {fieldError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-coral-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-coral-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Saving…" : "Save intention"}
            </button>
            {saved ? (
              <p role="status" className="text-sm text-text-primary">
                Intention updated.
              </p>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="mt-3 text-base text-text-primary">{intention.body}</p>
      )}
    </section>
  );
}
