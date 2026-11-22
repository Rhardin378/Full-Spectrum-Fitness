-- Slice 2: a journal entry may carry up to three domain tags (was two).

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

  if tag_count >= 3 then
    raise exception 'journal entry may have at most three domain tags';
  end if;

  return new;
end;
$$;

drop trigger if exists journal_entry_domains_limit_two
  on public.journal_entry_domains;

create trigger journal_entry_domains_limit_three
  before insert on public.journal_entry_domains
  for each row
  execute function public.enforce_journal_entry_domain_limit();
