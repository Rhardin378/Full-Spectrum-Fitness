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

-- Column-level UPDATE only. id, user_id, created_at, and updated_at are not
-- writable by authenticated (updated_at stays trigger-owned).
grant update (
  measurement_type,
  value,
  unit,
  measured_on,
  measured_at,
  notes,
  deleted_at
) on public.measurements to authenticated;

-- USING requires an active row so owners cannot edit or undelete via the Data API.
-- WITH CHECK does not require deleted_at is null, or soft delete would fail.
-- Select policy stays owner-only and unfiltered so lookup/RETURNING still work.
create policy "measurements_update_own"
  on public.measurements
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and deleted_at is null
  )
  with check ((select auth.uid()) = user_id);
