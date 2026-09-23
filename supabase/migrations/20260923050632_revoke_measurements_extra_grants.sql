-- Keep the Data API surface limited to the operations supported in Slice 1.5.
-- These revokes are explicit so databases with legacy default grants converge
-- on the same privileges as new projects.

revoke all on public.measurements from anon;
revoke update, delete, truncate, references, trigger
  on public.measurements
  from authenticated;

grant select, insert on public.measurements to authenticated;
