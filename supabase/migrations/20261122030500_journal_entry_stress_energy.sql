-- Optional daily stress and energy on the journal entry.
-- The weekly check-in keeps its own required stress and energy (overall week rating).

alter table public.journal_entries
  add column stress smallint,
  add column energy smallint,
  add constraint journal_entries_stress_check check (
    stress is null
    or stress between 1 and 10
  ),
  add constraint journal_entries_energy_check check (
    energy is null
    or energy between 1 and 10
  );

comment on column public.journal_entries.stress is
  'Optional daily stress; null or 1–10 (1 = low, 10 = high)';
comment on column public.journal_entries.energy is
  'Optional daily energy; null or 1–10 (1 = low, 10 = high)';

comment on table public.journal_entries is
  'One mood + reflection per user per calendar day, plus optional stress, energy, win, and grateful_for';

grant update (stress, energy)
  on public.journal_entries
  to authenticated;
