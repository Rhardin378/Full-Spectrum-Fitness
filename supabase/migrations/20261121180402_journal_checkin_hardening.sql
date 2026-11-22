-- Slice 2 Ticket 2.2 hardening from the 2.1 schema review

alter table public.weekly_check_ins
  add constraint weekly_check_ins_week_start_monday_check
  check (extract(isodow from week_start) = 1);

alter table public.weekly_intentions
  add constraint weekly_intentions_week_start_monday_check
  check (extract(isodow from week_start) = 1);

alter table public.weekly_intentions
  add constraint weekly_intentions_editable_until_in_week_check
  check (
    editable_until between week_start and (week_start + 6)
  );
