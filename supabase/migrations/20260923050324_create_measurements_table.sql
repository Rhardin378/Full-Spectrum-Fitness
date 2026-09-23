-- Slice 1.5 Ticket 1: user-owned weight and waist measurement history

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measurement_type text not null,
  value numeric not null,
  unit text not null,
  measured_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measurements_value_positive check (value > 0),
  constraint measurements_type_unit_valid check (
    (measurement_type = 'weight' and unit in ('lb', 'kg'))
    or (measurement_type = 'waist' and unit in ('in', 'cm'))
  )
);

comment on table public.measurements is
  'User-owned time-series history for baseline body measurements';

create index measurements_user_type_measured_at_idx
  on public.measurements (user_id, measurement_type, measured_at desc);

create index measurements_user_measured_at_idx
  on public.measurements (user_id, measured_at desc);

alter table public.measurements enable row level security;

revoke all on public.measurements from anon;
revoke all on public.measurements from authenticated;
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
