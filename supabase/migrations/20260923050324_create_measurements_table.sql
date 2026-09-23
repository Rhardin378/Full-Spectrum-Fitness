-- Slice 1.5 Ticket 1.5.1 measurements time-series linked to auth.users

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measurement_type text not null,
  value numeric(8, 2) not null,
  unit text not null,
  measured_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measurements_type_check check (
    measurement_type in ('weight', 'waist')
  ),
  constraint measurements_value_positive check (value > 0),
  constraint measurements_type_unit_check check (
    (
      measurement_type = 'weight'
      and unit in ('lb', 'kg')
    )
    or (
      measurement_type = 'waist'
      and unit in ('in', 'cm')
    )
  ),
  constraint measurements_notes_length check (
    notes is null
    or char_length(notes) between 1 and 500
  )
);

comment on table public.measurements is 'Owner-scoped weight and waist time-series';
comment on column public.measurements.value is 'Stored as entered, no unit conversion';

create index measurements_user_type_measured_at_idx
  on public.measurements (user_id, measurement_type, measured_at desc);

alter table public.measurements enable row level security;

revoke all on public.measurements from anon;
grant select, insert on public.measurements to authenticated;

create policy "measurements_select_own"
  on public.measurements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "measurements_insert_own"
  on public.measurements
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function public.set_measurements_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger measurements_set_updated_at
  before update on public.measurements
  for each row
  execute function public.set_measurements_updated_at();
