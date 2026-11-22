import { isLifeDomain, type LifeDomain } from "@/lib/life-domains";
import type { JournalEntry } from "@/lib/journal/types";

type RawDomainRow = { domain?: unknown };

type RawJournalEntry = {
  id: unknown;
  user_id: unknown;
  entry_on: unknown;
  mood: unknown;
  reflection: unknown;
  stress?: unknown;
  energy?: unknown;
  win?: unknown;
  grateful_for?: unknown;
  created_at: unknown;
  updated_at: unknown;
  journal_entry_domains?: RawDomainRow[] | null;
  domains?: unknown;
};

function normalizeDomains(raw: RawJournalEntry): LifeDomain[] {
  if (Array.isArray(raw.domains)) {
    return raw.domains.filter(
      (domain): domain is LifeDomain =>
        typeof domain === "string" && isLifeDomain(domain),
    );
  }

  if (!Array.isArray(raw.journal_entry_domains)) return [];

  return raw.journal_entry_domains
    .map((row) => row.domain)
    .filter(
      (domain): domain is LifeDomain =>
        typeof domain === "string" && isLifeDomain(domain),
    );
}

function normalizeRating(value: unknown): number | null {
  if (value == null || value === "") return null;
  const rating = Number(value);
  return Number.isFinite(rating) ? rating : null;
}

export function normalizeJournalEntry(raw: unknown): JournalEntry {
  const row = raw as RawJournalEntry;

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    entry_on: String(row.entry_on),
    mood: Number(row.mood),
    reflection: String(row.reflection),
    stress: normalizeRating(row.stress),
    energy: normalizeRating(row.energy),
    win: row.win == null || row.win === "" ? null : String(row.win),
    grateful_for:
      row.grateful_for == null || row.grateful_for === ""
        ? null
        : String(row.grateful_for),
    domains: normalizeDomains(row),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
