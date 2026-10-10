-- Slice 1.5 Ticket 1.5.12: persist the user-chosen calendar date without timezone shift.
-- Future-date limits stay in application validation (current_date is not immutable).

alter table public.measurements
  add column measured_on date;

update public.measurements
set measured_on = (measured_at at time zone 'UTC')::date
where measured_on is null;

alter table public.measurements
  alter column measured_on set not null;

comment on column public.measurements.measured_on is
  'User-chosen calendar date. History, filters, and trend use this field, not measured_at.';

create index measurements_user_measured_on_idx
  on public.measurements (
    user_id,
    measured_on desc,
    created_at desc,
    id desc
  );
