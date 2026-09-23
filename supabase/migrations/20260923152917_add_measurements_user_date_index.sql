-- Support owner-scoped date filtering and ordering when no type filter is set.

create index measurements_user_measured_at_idx
  on public.measurements (user_id, measured_at desc);
