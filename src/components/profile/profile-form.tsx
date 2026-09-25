"use client";

import { useState, type FormEvent } from "react";
import { useProfile } from "@/components/profile/profile-provider";
import { updateProfile } from "@/lib/profile/actions";
import {
  DOMAIN_FOCUS_AREAS,
  EXPERIENCE_LEVELS,
  SHARING_PREFERENCES,
  type DomainPriority,
  type ExperienceLevel,
  type Profile,
  type SharingPreference,
} from "@/lib/types/profile";

type ProfileFormProps = {
  initialProfile: Profile;
};

type FieldErrors = Record<string, string>;

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const SHARING_LABELS: Record<SharingPreference, string> = {
  private: "Private",
  friends: "Friends only",
  public: "Public",
};

const DOMAIN_LABELS: Record<(typeof DOMAIN_FOCUS_AREAS)[number], string> = {
  emotional: "Emotional",
  physical: "Physical",
  social: "Social",
  environmental: "Environmental",
  financial: "Financial",
  occupational: "Occupational",
  spiritual: "Spiritual",
};

const inputClassName =
  "w-full rounded-lg border border-black/10 bg-surface-card px-3 py-2 text-text-primary outline-none ring-brand-coral/40 transition focus:ring-2";

function emptyDomainRow(): DomainPriority {
  return { domain: "", priority: 1 };
}

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getPriorityOptions(rowCount: number): number[] {
  return Array.from({ length: rowCount }, (_, index) => index + 1);
}

function getPriorityLabel(rank: number, rowCount: number): string {
  if (rank === 1) {
    return `${rank} (Highest)`;
  }

  if (rank === rowCount) {
    return `${rank} (Lowest)`;
  }

  return `${rank}`;
}

function isDomainFocusArea(
  value: string,
): value is (typeof DOMAIN_FOCUS_AREAS)[number] {
  return DOMAIN_FOCUS_AREAS.includes(
    value as (typeof DOMAIN_FOCUS_AREAS)[number],
  );
}

function normalizeDomainRows(rows: DomainPriority[]): DomainPriority[] {
  const trimmedRows = rows.slice(0, DOMAIN_FOCUS_AREAS.length);

  if (trimmedRows.length === 0) {
    return [emptyDomainRow()];
  }

  const maxPriority = trimmedRows.length;

  return trimmedRows.map((row) => ({
    domain: isDomainFocusArea(row.domain) ? row.domain : "",
    priority: Math.min(Math.max(1, row.priority), maxPriority),
  }));
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const { refreshProfile } = useProfile();
  const [displayName, setDisplayName] = useState(
    initialProfile.display_name ?? "",
  );
  const [fitnessGoal, setFitnessGoal] = useState(
    initialProfile.fitness_goal ?? "",
  );
  const [wellnessGoal, setWellnessGoal] = useState(
    initialProfile.wellness_goal ?? "",
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    initialProfile.experience_level ?? "",
  );
  const [sharingPreference, setSharingPreference] = useState<
    SharingPreference | ""
  >(initialProfile.sharing_preferences ?? "");
  const [domainPriorities, setDomainPriorities] = useState<DomainPriority[]>(
    normalizeDomainRows(initialProfile.domain_priorities),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateDomainRow(index: number, patch: Partial<DomainPriority>) {
    setDomainPriorities((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function addDomainRow() {
    setDomainPriorities((rows) => {
      if (rows.length >= DOMAIN_FOCUS_AREAS.length) {
        return rows;
      }

      return [...rows, { ...emptyDomainRow(), priority: rows.length + 1 }];
    });
  }

  function removeDomainRow(index: number) {
    setDomainPriorities((rows) => {
      const nextRows =
        rows.length === 1
          ? [emptyDomainRow()]
          : rows.filter((_, rowIndex) => rowIndex !== index);

      const maxPriority = nextRows.length;

      return nextRows.map((row) => ({
        ...row,
        priority: Math.min(Math.max(1, row.priority), maxPriority),
      }));
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setStatusMessage(null);
    setErrorMessage(null);

    const cleanedDomains = domainPriorities.filter(
      (row) => row.domain.length > 0,
    );

    const result = await updateProfile({
      display_name: normalizeText(displayName),
      fitness_goal: normalizeText(fitnessGoal),
      wellness_goal: normalizeText(wellnessGoal),
      experience_level: experienceLevel === "" ? null : experienceLevel,
      sharing_preferences: sharingPreference === "" ? null : sharingPreference,
      domain_priorities: cleanedDomains,
    });

    if (!result.success) {
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      setErrorMessage(result.message);
      setLoading(false);
      return;
    }

    setDisplayName(result.profile.display_name ?? "");
    setFitnessGoal(result.profile.fitness_goal ?? "");
    setWellnessGoal(result.profile.wellness_goal ?? "");
    setExperienceLevel(result.profile.experience_level ?? "");
    setSharingPreference(result.profile.sharing_preferences ?? "");
    setDomainPriorities(normalizeDomainRows(result.profile.domain_priorities));
    setStatusMessage(
      "Profile saved. Your preferences are ready for the journey ahead.",
    );
    await refreshProfile();
    setLoading(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="display-name"
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          Display name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className={inputClassName}
          placeholder="How should we greet you?"
          autoComplete="name"
        />
        {fieldErrors.display_name && (
          <p className="mt-1 text-xs text-rose-300">
            {fieldErrors.display_name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="fitness-goal"
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          Fitness goal
        </label>
        <textarea
          id="fitness-goal"
          value={fitnessGoal}
          onChange={(event) => setFitnessGoal(event.target.value)}
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="What do you want to build physically?"
        />
        {fieldErrors.fitness_goal && (
          <p className="mt-1 text-xs text-rose-300">
            {fieldErrors.fitness_goal}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="wellness-goal"
          className="mb-1 block text-sm font-medium text-text-primary"
        >
          Wellness goal
        </label>
        <textarea
          id="wellness-goal"
          value={wellnessGoal}
          onChange={(event) => setWellnessGoal(event.target.value)}
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="How do you want to feel mentally and emotionally?"
        />
        {fieldErrors.wellness_goal && (
          <p className="mt-1 text-xs text-rose-300">
            {fieldErrors.wellness_goal}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="experience-level"
            className="mb-1 block text-sm font-medium text-text-primary"
          >
            Experience level
          </label>
          <select
            id="experience-level"
            value={experienceLevel}
            onChange={(event) =>
              setExperienceLevel(event.target.value as ExperienceLevel | "")
            }
            className={inputClassName}
          >
            <option value="">Select your level</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LABELS[level]}
              </option>
            ))}
          </select>
          {fieldErrors.experience_level && (
            <p className="mt-1 text-xs text-rose-300">
              {fieldErrors.experience_level}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sharing-preference"
            className="mb-1 block text-sm font-medium text-text-primary"
          >
            Sharing preference
          </label>
          <select
            id="sharing-preference"
            value={sharingPreference}
            onChange={(event) =>
              setSharingPreference(event.target.value as SharingPreference | "")
            }
            className={inputClassName}
          >
            <option value="">Choose visibility</option>
            {SHARING_PREFERENCES.map((preference) => (
              <option key={preference} value={preference}>
                {SHARING_LABELS[preference]}
              </option>
            ))}
          </select>
          {fieldErrors.sharing_preferences && (
            <p className="mt-1 text-xs text-rose-300">
              {fieldErrors.sharing_preferences}
            </p>
          )}
        </div>
      </div>

      <fieldset className="rounded-xl border border-white/10 bg-black/20 p-4">
        <legend className="px-1 text-sm font-medium text-text-primary">
          Life domain priorities
        </legend>
        <p className="mb-4 text-sm text-text-muted">
          Rank the areas that matter most right now. Lower numbers mean higher
          priority.
        </p>

        <div className="space-y-3">
          {domainPriorities.map((row, index) => (
            <div
              key={`domain-${index}`}
              className="grid gap-3 sm:grid-cols-[1fr_120px_auto]"
            >
              <div>
                <label
                  htmlFor={`domain-name-${index}`}
                  className="mb-1 block text-xs font-medium text-text-muted"
                >
                  Domain
                </label>
                <select
                  id={`domain-name-${index}`}
                  value={row.domain}
                  onChange={(event) =>
                    updateDomainRow(index, { domain: event.target.value })
                  }
                  className={inputClassName}
                >
                  <option value="">Select a domain</option>
                  {DOMAIN_FOCUS_AREAS.filter((domain) => {
                    const rowDomain = row.domain;
                    if (domain === rowDomain) {
                      return true;
                    }

                    return !domainPriorities.some(
                      (domainRow, domainRowIndex) =>
                        domainRowIndex !== index && domainRow.domain === domain,
                    );
                  }).map((domain) => (
                    <option key={domain} value={domain}>
                      {DOMAIN_LABELS[domain]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`domain-priority-${index}`}
                  className="mb-1 block text-xs font-medium text-text-muted"
                >
                  Priority
                </label>
                <select
                  id={`domain-priority-${index}`}
                  value={row.priority}
                  onChange={(event) =>
                    updateDomainRow(index, {
                      priority: Number.parseInt(event.target.value, 10) || 1,
                    })
                  }
                  className={inputClassName}
                >
                  {getPriorityOptions(domainPriorities.length).map((rank) => (
                    <option key={rank} value={rank}>
                      {getPriorityLabel(rank, domainPriorities.length)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeDomainRow(index)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm text-text-muted transition hover:bg-surface-page"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDomainRow}
          disabled={domainPriorities.length >= DOMAIN_FOCUS_AREAS.length}
          className="mt-4 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium text-text-muted transition hover:bg-surface-page disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        >
          Add domain
        </button>

        {fieldErrors.domain_priorities && (
          <p className="mt-3 text-xs text-rose-300">
            {fieldErrors.domain_priorities}
          </p>
        )}
      </fieldset>

      {statusMessage && (
        <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-800">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-coral px-4 py-3 font-semibold text-text-on-dark transition hover:bg-brand-coral-deep disabled:opacity-70 sm:w-auto"
      >
        {loading ? "Saving profile..." : "Save profile"}
      </button>
    </form>
  );
}
