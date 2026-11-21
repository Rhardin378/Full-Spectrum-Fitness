-- Slice 2 Ticket 2.1: journal, weekly check-in, and intention tables

-- ---------------------------------------------------------------------------
-- journal_entries
-- ---------------------------------------------------------------------------

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_on date not null,
  mood smallint not null,
  reflection text not null,
  win text,
  grateful_for text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_entries_user_entry_on_key unique (user_id, entry_on),
  constraint journal_entries_id_user_id_key unique (id, user_id),
  constraint journal_entries_mood_check check (mood between 1 and 10),
  constraint journal_entries_reflection_length check (
    char_length(reflection) between 1 and 2000
  ),
  constraint journal_entries_win_length check (
    win is null
    or char_length(win) between 1 and 200
  ),
  constraint journal_entries_grateful_for_length check (
    grateful_for is null
    or char_length(grateful_for) between 1 and 200
  )
);

comment on table public.journal_entries is
  'One mood + reflection per user per calendar day, plus optional win and grateful_for';
comment on column public.journal_entries.entry_on is
  'Local calendar day for the entry (date, not timestamptz)';
comment on column public.journal_entries.win is
  'Optional “One win today” line; null or 1–200 characters';
comment on column public.journal_entries.grateful_for is
  'Optional “Grateful for” line; null or 1–200 characters';

alter table public.journal_entries enable row level security;

revoke all on public.journal_entries from anon;
revoke all on public.journal_entries from authenticated;
grant select, insert on public.journal_entries to authenticated;
grant update (mood, reflection, win, grateful_for)
  on public.journal_entries
  to authenticated;

create policy "journal_entries_select_own"
  on public.journal_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "journal_entries_insert_own"
  on public.journal_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "journal_entries_update_own"
  on public.journal_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_journal_entries_updated_at()
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

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_journal_entries_updated_at();

-- ---------------------------------------------------------------------------
-- journal_entry_domains
-- ---------------------------------------------------------------------------

create table public.journal_entry_domains (
  journal_entry_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  domain text not null,
  primary key (journal_entry_id, domain),
  constraint journal_entry_domains_entry_user_fkey
    foreign key (journal_entry_id, user_id)
    references public.journal_entries (id, user_id)
    on delete cascade,
  constraint journal_entry_domains_domain_check check (
    domain in (
      'physical_health',
      'mental_health',
      'family_relationships',
      'social',
      'career',
      'learning',
      'leisure',
      'habits'
    )
  )
);

comment on table public.journal_entry_domains is
  'Zero to two Option B domain tags per journal entry';

alter table public.journal_entry_domains enable row level security;

revoke all on public.journal_entry_domains from anon;
revoke all on public.journal_entry_domains from authenticated;
grant select, insert, delete on public.journal_entry_domains to authenticated;

create policy "journal_entry_domains_select_own"
  on public.journal_entry_domains
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "journal_entry_domains_insert_own"
  on public.journal_entry_domains
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "journal_entry_domains_delete_own"
  on public.journal_entry_domains
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.enforce_journal_entry_domain_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  tag_count integer;
begin
  select count(*)::integer
    into tag_count
  from public.journal_entry_domains
  where journal_entry_id = new.journal_entry_id;

  if tag_count >= 2 then
    raise exception 'journal entry may have at most two domain tags';
  end if;

  return new;
end;
$$;

create trigger journal_entry_domains_limit_two
  before insert on public.journal_entry_domains
  for each row
  execute function public.enforce_journal_entry_domain_limit();

-- ---------------------------------------------------------------------------
-- weekly_check_ins
-- ---------------------------------------------------------------------------

create table public.weekly_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  stress smallint not null,
  energy smallint not null,
  physical_health smallint not null,
  mental_health smallint not null,
  family_relationships smallint not null,
  social smallint not null,
  career smallint not null,
  learning smallint not null,
  leisure smallint not null,
  habits smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_check_ins_user_week_start_key unique (user_id, week_start),
  constraint weekly_check_ins_stress_check check (stress between 1 and 10),
  constraint weekly_check_ins_energy_check check (energy between 1 and 10),
  constraint weekly_check_ins_physical_health_check check (
    physical_health between 1 and 10
  ),
  constraint weekly_check_ins_mental_health_check check (
    mental_health between 1 and 10
  ),
  constraint weekly_check_ins_family_relationships_check check (
    family_relationships between 1 and 10
  ),
  constraint weekly_check_ins_social_check check (social between 1 and 10),
  constraint weekly_check_ins_career_check check (career between 1 and 10),
  constraint weekly_check_ins_learning_check check (learning between 1 and 10),
  constraint weekly_check_ins_leisure_check check (leisure between 1 and 10),
  constraint weekly_check_ins_habits_check check (
    habits is null
    or habits between 1 and 10
  ),
  constraint weekly_check_ins_notes_length check (
    notes is null
    or char_length(notes) between 1 and 1000
  )
);

comment on table public.weekly_check_ins is
  'One subjective weekly check-in per user per Monday week_start';
comment on column public.weekly_check_ins.week_start is
  'Monday of the completed week being scored';
comment on column public.weekly_check_ins.notes is
  'Optional owner memory of the week; null or 1–1000 characters';
comment on column public.weekly_check_ins.habits is
  'Optional Habits score; null when the user skipped it';

alter table public.weekly_check_ins enable row level security;

revoke all on public.weekly_check_ins from anon;
revoke all on public.weekly_check_ins from authenticated;
grant select, insert on public.weekly_check_ins to authenticated;

create policy "weekly_check_ins_select_own"
  on public.weekly_check_ins
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "weekly_check_ins_insert_own"
  on public.weekly_check_ins
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function public.set_weekly_check_ins_updated_at()
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

create trigger weekly_check_ins_set_updated_at
  before update on public.weekly_check_ins
  for each row
  execute function public.set_weekly_check_ins_updated_at();

-- ---------------------------------------------------------------------------
-- weekly_intentions
-- ---------------------------------------------------------------------------

create table public.weekly_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  domain text not null,
  body text not null,
  outcome text,
  created_from_checkin_id uuid not null
    references public.weekly_check_ins (id) on delete restrict,
  editable_until date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_intentions_user_week_start_key unique (user_id, week_start),
  constraint weekly_intentions_domain_check check (
    domain in (
      'physical_health',
      'mental_health',
      'family_relationships',
      'social',
      'career',
      'learning',
      'leisure',
      'habits'
    )
  ),
  constraint weekly_intentions_body_length check (
    char_length(body) between 1 and 200
  ),
  constraint weekly_intentions_outcome_check check (
    outcome is null
    or outcome in ('done', 'partly', 'not_done')
  )
);

comment on table public.weekly_intentions is
  'Exactly one intention per user per Monday week_start';
comment on column public.weekly_intentions.week_start is
  'Monday the intention is for (current intention week)';
comment on column public.weekly_intentions.body is
  'Intention text; column is not named text';
comment on column public.weekly_intentions.editable_until is
  'Inclusive local calendar day through which body may still change';
comment on column public.weekly_intentions.created_from_checkin_id is
  'Check-in that created this intention; restrict on delete';

alter table public.weekly_intentions enable row level security;

revoke all on public.weekly_intentions from anon;
revoke all on public.weekly_intentions from authenticated;
grant select, insert on public.weekly_intentions to authenticated;
grant update (body, outcome) on public.weekly_intentions to authenticated;

create policy "weekly_intentions_select_own"
  on public.weekly_intentions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "weekly_intentions_insert_own"
  on public.weekly_intentions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "weekly_intentions_update_own"
  on public.weekly_intentions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.set_weekly_intentions_updated_at()
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

create trigger weekly_intentions_set_updated_at
  before update on public.weekly_intentions
  for each row
  execute function public.set_weekly_intentions_updated_at();

create or replace function public.enforce_weekly_intention_updates()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.domain is distinct from old.domain
    or new.week_start is distinct from old.week_start
    or new.user_id is distinct from old.user_id
    or new.editable_until is distinct from old.editable_until
    or new.created_from_checkin_id is distinct from old.created_from_checkin_id
  then
    raise exception
      'weekly intention domain, week_start, user_id, editable_until, and created_from_checkin_id are immutable';
  end if;

  if new.body is distinct from old.body
    and (now() at time zone 'UTC')::date > (old.editable_until + 1)
  then
    raise exception 'weekly intention body is no longer editable';
  end if;

  return new;
end;
$$;

create trigger weekly_intentions_enforce_updates
  before update on public.weekly_intentions
  for each row
  execute function public.enforce_weekly_intention_updates();

-- ---------------------------------------------------------------------------
-- submit_weekly_check_in (security invoker)
-- ---------------------------------------------------------------------------

create or replace function public.submit_weekly_check_in(
  p_week_start date,
  p_stress smallint,
  p_energy smallint,
  p_physical_health smallint,
  p_mental_health smallint,
  p_family_relationships smallint,
  p_social smallint,
  p_career smallint,
  p_learning smallint,
  p_leisure smallint,
  p_habits smallint,
  p_notes text,
  p_intention_outcome text,
  p_next_week_start date,
  p_next_domain text,
  p_next_body text,
  p_editable_until date
)
returns table (
  check_in_id uuid,
  intention_id uuid
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_check_in_id uuid;
  v_intention_id uuid;
  v_existing_intention_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.weekly_check_ins (
    user_id,
    week_start,
    stress,
    energy,
    physical_health,
    mental_health,
    family_relationships,
    social,
    career,
    learning,
    leisure,
    habits,
    notes
  )
  values (
    v_user_id,
    p_week_start,
    p_stress,
    p_energy,
    p_physical_health,
    p_mental_health,
    p_family_relationships,
    p_social,
    p_career,
    p_learning,
    p_leisure,
    p_habits,
    p_notes
  )
  returning id into v_check_in_id;

  select wi.id
    into v_existing_intention_id
  from public.weekly_intentions as wi
  where wi.user_id = v_user_id
    and wi.week_start = p_week_start;

  if v_existing_intention_id is not null then
    if p_intention_outcome is null then
      raise exception 'outcome is required when an intention exists for this week';
    end if;

    update public.weekly_intentions as wi
    set outcome = p_intention_outcome
    where wi.id = v_existing_intention_id
      and wi.user_id = v_user_id;
  end if;

  insert into public.weekly_intentions (
    user_id,
    week_start,
    domain,
    body,
    created_from_checkin_id,
    editable_until
  )
  values (
    v_user_id,
    p_next_week_start,
    p_next_domain,
    p_next_body,
    v_check_in_id,
    p_editable_until
  )
  returning id into v_intention_id;

  check_in_id := v_check_in_id;
  intention_id := v_intention_id;
  return next;
end;
$$;

comment on function public.submit_weekly_check_in(
  date,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  text,
  text,
  date,
  text,
  text,
  date
) is
  'Inserts a check-in, optionally sets last week intention outcome, and inserts the next intention in one transaction';

revoke all on function public.submit_weekly_check_in(
  date,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  text,
  text,
  date,
  text,
  text,
  date
) from public;

grant execute on function public.submit_weekly_check_in(
  date,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  smallint,
  text,
  text,
  date,
  text,
  text,
  date
) to authenticated;
