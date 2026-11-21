import type { LifeDomain } from "@/lib/life-domains";

export type JournalEntry = {
  id: string;
  user_id: string;
  entry_on: string;
  mood: number;
  reflection: string;
  win: string | null;
  grateful_for: string | null;
  domains: LifeDomain[];
  created_at: string;
  updated_at: string;
};

export type SaveJournalEntryInput = {
  today: string;
  mood: number;
  reflection: string;
  domains?: LifeDomain[];
  win?: string | null;
  grateful_for?: string | null;
};

export type ListJournalEntriesInput = {
  start_date?: string;
  end_date?: string;
  limit?: number;
};
