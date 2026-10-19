-- Slice 1.5 Ticket 1.5.9: owner-scoped update and soft delete.
-- Soft delete only (no DELETE grant). List/trend hide rows in application queries.

alter table public.measurements
  add column deleted_at timestamptz;

comment on column public.measurements.deleted_at is
  'Null means active. Set to now() to soft-delete; hidden from list and trend.';

create index measurements_user_type_measured_on_active_idx
  on public.measurements (
    user_id,
    measurement_type,
    measured_on desc
  )
  where deleted_at is null;

grant update on public.measurements to authenticated;

create policy "measurements_update_own"
  on public.measurements
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
