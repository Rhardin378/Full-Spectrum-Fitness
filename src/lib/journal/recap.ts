import {
  LIFE_DOMAINS,
  lifeDomainChipLabel,
  type LifeDomain,
} from "@/lib/life-domains";
import { addUtcCalendarDays } from "@/lib/measurements/calendar-date";

export type RecapJournalEntry = {
  entry_on: string;
  mood: number;
  stress?: number | null;
  energy?: number | null;
  domains: LifeDomain[];
};

export type WeekRecapTopDomain = {
  domain: LifeDomain;
  label: string;
  count: number;
};

export type WeekRecap = {
  weekStart: string;
  weekEnd: string;
  averageMood: number | null;
  /** Mean over entries that rated stress; null when none did. */
  averageStress: number | null;
  /** Mean over entries that rated energy; null when none did. */
  averageEnergy: number | null;
  daysJournaled: number;
  topDomains: WeekRecapTopDomain[];
  sparkline: Array<number | null>;
};

/** Half away from zero to one decimal. */
export function roundMoodAverage(value: number): number {
  return Math.round(value * 10) / 10;
}

function averageOf(values: Array<number | null | undefined>): number | null {
  const rated = values.filter((value): value is number => value != null);
  if (rated.length === 0) return null;
  return roundMoodAverage(
    rated.reduce((sum, value) => sum + value, 0) / rated.length,
  );
}

export function buildWeekRecap(
  entries: RecapJournalEntry[],
  weekStart: string,
): WeekRecap {
  const weekEnd = addUtcCalendarDays(weekStart, 6);
  const inWeek = entries.filter(
    (entry) => entry.entry_on >= weekStart && entry.entry_on <= weekEnd,
  );

  const averageMood = averageOf(inWeek.map((entry) => entry.mood));
  const averageStress = averageOf(inWeek.map((entry) => entry.stress));
  const averageEnergy = averageOf(inWeek.map((entry) => entry.energy));

  const counts = new Map<LifeDomain, number>();
  for (const entry of inWeek) {
    for (const domain of entry.domains) {
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }

  const topDomains = [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return LIFE_DOMAINS.indexOf(a[0]) - LIFE_DOMAINS.indexOf(b[0]);
    })
    .slice(0, 2)
    .map(([domain, count]) => ({
      domain,
      label: lifeDomainChipLabel(domain),
      count,
    }));

  const byDay = new Map(inWeek.map((entry) => [entry.entry_on, entry.mood]));
  const sparkline: Array<number | null> = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = addUtcCalendarDays(weekStart, offset);
    sparkline.push(byDay.get(day) ?? null);
  }

  return {
    weekStart,
    weekEnd,
    averageMood,
    averageStress,
    averageEnergy,
    daysJournaled: inWeek.length,
    topDomains,
    sparkline,
  };
}
