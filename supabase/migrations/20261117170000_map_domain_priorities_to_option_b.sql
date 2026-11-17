-- Ticket 2.9 / ADR-013.
-- Rewrite saved wellness-wheel focus areas onto the Option B slugs.
-- Same rules as mapStoredDomainPriorities in src/lib/types/profile.ts:
--   emotional -> mental_health
--   physical -> physical_health
--   social -> social
--   environmental -> family_relationships
--   financial -> career
--   occupational -> career
--   spiritual -> leisure
-- The better rank (lower priority number) keeps the preferred slug.
-- The other row keeps its rank and takes the first free slug in:
--   learning, habits, then the canonical Option B order.
-- Unknown slugs are dropped. A non-array becomes [].
-- Habits is not a preferred target.

create function pg_temp.map_domain_priorities(input jsonb)
returns jsonb
language plpgsql
as $$
declare
  element jsonb;
  idx int := 0;
  preferred text;
  slug text;
  candidate text;
  used text[] := '{}';
  ords int[] := '{}';
  priorities numeric[] := '{}';
  preferreds text[] := '{}';
  n int;
  i int;
  j int;
  tmp_ord int;
  tmp_priority numeric;
  tmp_preferred text;
  result jsonb := '[]'::jsonb;
  overflow text[] := array[
    'learning',
    'habits',
    'physical_health',
    'mental_health',
    'family_relationships',
    'social',
    'career',
    'learning',
    'leisure',
    'habits'
  ];
begin
  if input is null or jsonb_typeof(input) is distinct from 'array' then
    return '[]'::jsonb;
  end if;

  for element in select value from jsonb_array_elements(input)
  loop
    preferred := null;

    if jsonb_typeof(element) = 'object'
      and jsonb_typeof(element->'domain') = 'string'
      and jsonb_typeof(element->'priority') = 'number'
    then
      preferred := case element->>'domain'
        when 'physical_health' then 'physical_health'
        when 'mental_health' then 'mental_health'
        when 'family_relationships' then 'family_relationships'
        when 'social' then 'social'
        when 'career' then 'career'
        when 'learning' then 'learning'
        when 'leisure' then 'leisure'
        when 'habits' then 'habits'
        when 'emotional' then 'mental_health'
        when 'physical' then 'physical_health'
        when 'environmental' then 'family_relationships'
        when 'financial' then 'career'
        when 'occupational' then 'career'
        when 'spiritual' then 'leisure'
        else null
      end;
    end if;

    if preferred is not null then
      ords := ords || idx;
      priorities := priorities || (element->>'priority')::numeric;
      preferreds := preferreds || preferred;
    end if;

    idx := idx + 1;
  end loop;

  n := coalesce(array_length(ords, 1), 0);

  for i in 1..n loop
    j := i;
    while j > 1 and (
      priorities[j] < priorities[j - 1]
      or (priorities[j] = priorities[j - 1] and ords[j] < ords[j - 1])
    ) loop
      tmp_ord := ords[j - 1];
      tmp_priority := priorities[j - 1];
      tmp_preferred := preferreds[j - 1];
      ords[j - 1] := ords[j];
      priorities[j - 1] := priorities[j];
      preferreds[j - 1] := preferreds[j];
      ords[j] := tmp_ord;
      priorities[j] := tmp_priority;
      preferreds[j] := tmp_preferred;
      j := j - 1;
    end loop;
  end loop;

  for i in 1..n loop
    slug := null;

    if array_position(used, preferreds[i]) is null then
      slug := preferreds[i];
    else
      foreach candidate in array overflow loop
        if array_position(used, candidate) is null then
          slug := candidate;
          exit;
        end if;
      end loop;
    end if;

    if slug is null then
      continue;
    end if;

    used := used || slug;
    result := result || jsonb_build_object(
      'domain', slug,
      'priority', to_jsonb(priorities[i])
    );
  end loop;

  return result;
end;
$$;

update public.profiles
set domain_priorities = pg_temp.map_domain_priorities(domain_priorities)
where domain_priorities is distinct from pg_temp.map_domain_priorities(domain_priorities);

comment on column public.profiles.domain_priorities is
  'Ranked life-domain priorities. Slugs are the Option B set in ADR-013. Wellness-wheel slugs were mapped by 20261117170000_map_domain_priorities_to_option_b.sql.';

drop function pg_temp.map_domain_priorities(jsonb);
