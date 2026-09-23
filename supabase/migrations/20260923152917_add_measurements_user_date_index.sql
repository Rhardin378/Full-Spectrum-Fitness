-- Support stable owner-scoped date ordering and cursor pagination when no
-- measurement type filter is set.

create index measurements_user_measured_at_idx
  on public.measurements (
    user_id,
    measured_at desc,
    created_at desc,
    id desc
  );
