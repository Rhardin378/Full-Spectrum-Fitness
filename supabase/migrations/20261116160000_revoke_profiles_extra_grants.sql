revoke delete, truncate, references, trigger
  on public.profiles
  from authenticated;

grant select, insert, update
  on public.profiles
  to authenticated;
