import {
  LIFE_DOMAINS,
  lifeDomainChipLabel,
  type LifeDomain,
} from "@/lib/life-domains";
import {
  addUtcCalendarDays,
  isValidCalendarDate,
} from "@/lib/measurements/calendar-date";
import { roundMoodAverage } from "@/lib/journal/recap";
import type { JournalEntry } from "@/lib/journal/types";

export type MindWindowStats = {
  windowStart: string;
  windowEnd: string;
  averageMood: number | null;
  domainsTouched: Array<{ domain: LifeDomain; label: string }>;
  lastEntryOn: string | null;
  sparkline: Array<number | null>;
};

/** Rolling seven calendar days ending on `today` (inclusive). */
export function rollingMindWindowStart(today: string): string {
  return addUtcCalendarDays(today, -6);
}

export function buildMindWindowStats(
  entries: JournalEntry[],
  today: string,
): MindWindowStats {
  const windowEnd = today;
  const windowStart = rollingMindWindowStart(today);
  const inWindow = entries.filter(
    (entry) => entry.entry_on >= windowStart && entry.entry_on <= windowEnd,
  );

  const moods = inWindow.map((entry) => entry.mood);
  const averageMood =
    moods.length === 0
      ? null
      : roundMoodAverage(moods.reduce((sum, value) => sum + value, 0) / moods.length);

  const touched = new Set<LifeDomain>();
  for (const entry of inWindow) {
    for (const domain of entry.domains) {
      touched.add(domain);
    }
  }

  const domainsTouched = LIFE_DOMAINS.filter((domain) => touched.has(domain)).map(
    (domain) => ({
      domain,
      label: lifeDomainChipLabel(domain),
    }),
  );

  const byDay = new Map(inWindow.map((entry) => [entry.entry_on, entry.mood]));
  const sparkline: Array<number | null> = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = addUtcCalendarDays(windowStart, offset);
    sparkline.push(byDay.get(day) ?? null);
  }

  const newestOverall = [...entries].sort((a, b) =>
    b.entry_on.localeCompare(a.entry_on),
  )[0];

  return {
    windowStart,
    windowEnd,
    averageMood,
    domainsTouched,
    lastEntryOn: newestOverall?.entry_on ?? null,
    sparkline,
  };
}

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/** Single-letter weekday labels for a YYYY-MM-DD window start, UTC-stable. */
export function weekdayLettersForWindow(windowStart: string): string[] {
  if (!isValidCalendarDate(windowStart)) {
    return ["M", "T", "W", "T", "F", "S", "S"];
  }

  const start = new Date(`${windowStart}T00:00:00.000Z`);
  const labels: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    labels.push(WEEKDAY_LETTERS[day.getUTCDay()]);
  }
  return labels;
}
