# Slice 2 Tickets (Copy to GitHub Issues)

Use each section below as one GitHub issue. Keep the order. The build spec is [`README.md`](./README.md). Mockups: [`docs/mockups/slice_2_journal_checkin/`](../../mockups/slice_2_journal_checkin/README.md).

**Scope change:** the weekly subjective check-in is in this slice, not Slice 5. Domain names are Option B, not the wellness wheel. Ticket **2.9** aligned the handoff pack ([ADR-013](../../ARCHITECTURE_DECISIONS.md) is Accepted) and landed in [PR #68](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/68). Slice 2 implementation starts with ticket 2.1. **NAV.1** ([issue #80](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/80)) must merge before ticket 2.7. Do not build the old journal (mood + stress + energy + domain scores).

Create the `slice-2` label when the first issue is opened. It is not in the repo label list yet (`docs/vertical_slices/tracking_setup.md` already reserves the name).

---

## Ticket 2.1: Journal, check-in, and intention schema

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `database`, `backend`

### Description

Add owner-scoped tables for a daily journal, optional domain tags, one weekly check-in, and one weekly intention. Dates are calendar `date` columns, following `measurements.measured_on`.

### Scope

Migration under `supabase/migrations/`. Match the style of `20260612003147_create_profiles_table.sql` and `20260923050632_revoke_measurements_extra_grants.sql`:

- `enable row level security`
- `revoke all` from `anon`
- `revoke all` from `authenticated`, then grant only the commands below
- policies use `(select auth.uid()) = user_id`
- `updated_at` trigger: `security invoker`, `search_path = ''`, same shape as `set_profiles_updated_at()`

**`journal_entries`**

- `id uuid` primary key default `gen_random_uuid()`
- `user_id uuid not null` references `auth.users(id)` on delete cascade
- `entry_on date not null`
- `mood smallint not null` check `mood between 1 and 10`
- `reflection text not null` check `char_length(reflection) between 1 and 2000`
- `win text null` check `win is null or char_length(win) between 1 and 200`
- `grateful_for text null` check `grateful_for is null or char_length(grateful_for) between 1 and 200`
- `created_at`, `updated_at` `timestamptz not null default now()`
- unique `(user_id, entry_on)`
- unique `(id, user_id)` so tag rows can reference both
- Grants: `select`, `insert`, and `update (mood, reflection, win, grateful_for)` to `authenticated`. No `delete`.

**`journal_entry_domains`**

- `journal_entry_id uuid not null`
- `user_id uuid not null` references `auth.users(id)` on delete cascade
- `domain text not null` check against the eight slugs in the slice README
- primary key `(journal_entry_id, domain)`
- foreign key `(journal_entry_id, user_id)` → `journal_entries (id, user_id)` on delete cascade
- Trigger rejects a third tag on the same entry
- Grants: `select`, `insert`, `delete` to `authenticated` (replace-tags on save). No `truncate`.

**`weekly_check_ins`**

Scores are columns, not a child table. The set is fixed, and a single insert can be `CHECK`ed without a new write pattern.

- `id`, `user_id`, `week_start date not null` (Monday)
- `stress`, `energy` `smallint not null` check 1–10
- required scores, each `smallint not null` check 1–10: `physical_health`, `mental_health`, `family_relationships`, `social`, `career`, `learning`, `leisure`
- `habits smallint null` check `habits is null or habits between 1 and 10`
- `notes text null` check `notes is null or char_length(notes) between 1 and 1000`
- timestamps
- unique `(user_id, week_start)`
- No mood, sleep, motivation, nutrition, or reflection column. `notes` is the only free-text column.
- Grants: `select`, `insert` only. `notes` is written on insert. There is no `update` grant, so a submitted note cannot be edited.

**`weekly_intentions`**

- `id`, `user_id`
- `week_start date not null` — Monday the intention is **for**
- `domain text not null` check against the same eight slugs
- `body text not null` check `char_length(body) between 1 and 200` (the intention text; the column is not named `text`)
- `outcome text null` check `outcome is null or outcome in ('done', 'partly', 'not_done')`
- `created_from_checkin_id uuid not null` references `weekly_check_ins(id)` on delete restrict
- `editable_until date not null`
- timestamps
- unique `(user_id, week_start)`
- Grants: `select`, `insert`, and `update (body, outcome)` only. `domain`, `week_start`, `user_id`, `editable_until`, and `created_from_checkin_id` are not updatable by `authenticated`.

**Trigger on `weekly_intentions`**

- Reject any change to `domain`, `week_start`, `user_id`, `editable_until`, or `created_from_checkin_id`.
- Reject a `body` change when `(now() at time zone 'UTC')::date > editable_until + 1`. The extra day is only a backstop so an evening in the US is not locked out early. The action uses the user’s validated local today (ticket 2.2) and is the rule the UI follows.
- Allow `outcome` updates after `editable_until`. The next check-in sets outcome a week later.

**`public.submit_weekly_check_in(...)`**

`security invoker`, `search_path = ''`, `user_id` from `auth.uid()`. One transaction:

1. Insert the check-in for `lastCompletedWeekStart`, including `notes` (null when the user left it blank).
2. If an intention exists for that same `week_start`, set its `outcome`. If it exists and outcome is null, raise. If it does not exist, ignore outcome.
3. Insert the next intention (`currentIntentionWeekStart`, domain, body, `editable_until`, `created_from_checkin_id`).

Grant `execute` to `authenticated` only. Direct table grants still apply inside the function because it is invoker. Do not use a `security definer` function to skip RLS.

Do not add `entry_at` / `measured_at` companions. Do not seed a `life_domains` lookup table in this migration.

`notes` is optional and nullable. Empty and whitespace-only input is stored as null, not as `''`. The database check rejects a non-null value outside 1–1000 characters. The same limit is enforced with Zod on the server in ticket 2.2. Owner RLS on `weekly_check_ins` covers `notes`; it is not its own table.

`win` and `grateful_for` are optional columns on `journal_entries`, not a `wins` table and not a gratitude table. Empty and whitespace-only input is stored as null, not as `''`. The database check rejects a non-null value outside 1–200 characters. The same limit is enforced with Zod in ticket 2.2. Owner RLS on `journal_entries` covers both columns. Slice 7 `wins` and `life_events` are not part of this migration.

### Acceptance Criteria

- Migration applies on a local reset.
- A user can insert and read only their own rows under RLS.
- A second journal row for the same user and `entry_on` fails. A third tag fails. A second check-in or intention for the same user and `week_start` fails.
- `authenticated` cannot update `weekly_intentions.domain`.
- `anon` has no grants.
- Check constraints reject mood, scores, and text outside the ranges above.
- A check-in with `notes` null succeeds. A `notes` value of 1000 characters succeeds. 1001 characters, or `''`, fails the check constraint.
- A journal row with `win` and `grateful_for` both null succeeds. A value of 200 characters in either column succeeds. 201 characters, or `''`, fails the check constraint.
- `authenticated` can update `win` and `grateful_for` on the owner’s row, together with `mood` and `reflection`. There is no `delete` grant.
- Under RLS, a user can read and insert only their own `weekly_check_ins` rows, including `notes`. Another user cannot select or insert that row. The same owner scope covers `journal_entries.win` and `journal_entries.grateful_for`.

### Dependencies

- Slice 1 auth

### Suggested GitHub title

`[Slice 2] Add journal, check-in, and intention tables`

---

## Ticket 2.2: Server actions, validation, and recap math

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `backend`, `api`, `validation`

### Description

Expose journal save/list, check-in submit, intention text edit, the week recap, and the due-card predicate as server actions. Validation is Zod. Identity is the session user.

### Scope

New modules under `src/lib/journal/` and `src/lib/weekly/`. Import date helpers from `src/lib/measurements/calendar-date.ts`. Do not duplicate them.

Ticket 2.2 creates `src/lib/life-domains/` as the single source for the eight Option B slugs, their canonical order, the labels, and the `LifeDomain` type. It moves `DOMAIN_FOCUS_AREAS` and `DOMAIN_FOCUS_LABELS` out of `src/lib/types/profile.ts`, and profile code imports from `src/lib/life-domains/`. Keep `DomainFocusArea` as an alias of the shared type, or rename it at call sites, whichever keeps the diff small. The ADR-013 wheel-slug mapping (`WHEEL_DOMAIN_PREFERRED_OPTION_B`, `DOMAIN_PRIORITY_OVERFLOW`, `mapStoredDomainPriorities`) stays profile-only but uses the shared list. No change to the profile UI, saved data, or the database. No new table. Ticket 2.1’s SQL checks still spell out the slugs. Profile focus-area priorities still do not reorder or preselect anything in the check-in or journal. That stays a gate-D future idea per the Nov 16 decisions.

Every action:

- calls `getUser()` the way `src/lib/measurements/actions.ts` does
- returns `{ success: false, error: "unauthorized" }` when there is no user
- parses input with a `.strict()` Zod schema
- writes `user_id` from the session (the SQL functions also use `auth.uid()`)
- returns a generic database message, not `error.message` from Postgres

**Dates.** Client payload includes `today` as `YYYY-MM-DD`. Reject it unless `isValidCalendarDate` and the date is inside `[addUtcCalendarDays(utcTodayISODate(), -1), maxAllowedMeasuredOn()]`. Derive `entry_on`, check-in week, and intention week on the server from that `today`. Ignore any client `week_start` or `user_id`.

**Journal**

- `saveJournalEntry({ today, mood, reflection, domains, win, grateful_for })` inserts or updates the unique user+day row and replaces its tags. Empty or whitespace reflection fails. `domains` length 0–2, distinct, known slugs. There is no journal RPC in ticket 2.1. If the tag write fails after the entry write, return an error; a retry must end with this payload’s tags and not a mix. Prefer one transaction if it stays a `security invoker` function with `auth.uid()`, but do not add a `security definer` bypass.
- `win` and `grateful_for` are optional. Omitted, null, and whitespace-only all become null. Otherwise trim and require `char_length` 1–200. 201 characters is a field error. Neither field makes an otherwise valid save fail. The Zod schema stays `.strict()`. The form always submits the current input. A second save that omits a line, or sends it blank, clears a previously stored value.
- They follow the reflection’s day rule, not the intention’s 3-day window. `entry_on` is the validated `today`. A second save updates these columns on that row. The action does not edit a past `entry_on`. There is no separate trigger for these columns.
- `listJournalEntries({ start_date?, end_date?, limit? })` returns only the caller’s rows, newest `entry_on` first, including `win` and `grateful_for`. Default limit 25, max 100. Used by history, the Mind trend, and the check-in recap. The recap still ignores these two columns.

**Recap (pure function, then a thin action)**

`buildWeekRecap(entries, weekStart)`:

- Window is `weekStart` through `weekStart + 6` inclusive.
- Average mood: arithmetic mean, one decimal, half away from zero. `[1, 2, 2]` → `1.7`. `[1, 1, 2]` → `1.3`. No entries → `null`, not `0`.
- `daysJournaled` is the entry count. Display “N of 7”.
- `topDomains`: tag counts, highest first, canonical slug order on ties, at most two. Family’s short chip label is Family.
- `sparkline`: seven slots, index 0 = Monday, value = mood or null.

**Check-in**

- `submitWeeklyCheckIn` validates stress, energy, seven scores, optional habits, intention domain and body (1–200), optional `notes`, and outcome when required.
- `notes` is optional. Omitted, null, and whitespace-only all become null. Otherwise trim and require `char_length` 1–1000. 1001 characters is a field error. The Zod schema is `.strict()`.
- `listWeeklyCheckIns` returns only the caller’s rows, newest `week_start` first, including `notes`. Used by check-in history. Default limit 25, max 100.
- Lowest-domain helper: minimum among the seven required scores; include Habits only when it is non-null; tie → earlier slug in the README table. The client may send a different domain. The server checks that the chosen slug is allowed. It does not force the lowest after the user changes it.
- Calls `submit_weekly_check_in`. Maps unique violations to “You already submitted this week’s check-in.”
- Does not accept a mood field.

**Intention**

- `updateIntentionText({ id, today, body })` updates `body` only when `today <= editable_until`. After that, return a clear validation error. Schema has no `domain` field; unknown keys fail `.strict()`.
- `getCurrentIntention({ today })` returns the row for `currentIntentionWeekStart(today)` or null.
- Outcome is not updated here.

**Due card**

- `isCheckInDue(today, hasCheckInForLastCompletedWeek)` is pure and has no side effects. The page loader queries that one `week_start`.

Ship unit tests in this ticket for week boundaries (the README fixture, plus Sunday 2026-11-01 and Monday 2026-11-02), `editable_until` inclusive through 2026-11-06 and rejected on 2026-11-07, recap rounding, empty recap, top-domain ties, and lowest-score ties. Action tests can finish in ticket 2.8 if the pure tests land here.

`editable_until` = created + 3 days, capped at the intention week's Sunday (`week_start` + 6).

**Hardening from 2.1 review**

- Intentions must only be created through `submit_weekly_check_in`. Server code must never insert into `weekly_intentions` directly. Because `authenticated` has an insert grant (needed by the invoker RPC), add a database check in the 2.2 migration constraining `editable_until` to the intention’s own week (`editable_until between week_start and week_start + 6`), so a direct insert can’t make the text editable indefinitely.
- Validate that `week_start` and `p_next_week_start` are Mondays in Zod, and back it with a check `extract(isodow from week_start) = 1` on `weekly_check_ins` and `weekly_intentions` in the same 2.2 migration.

The two-tag trigger on `journal_entry_domains` can race on truly concurrent inserts; acceptable for a single user’s form, no action.

### Acceptance Criteria

- Valid save, list, submit, and text edit succeed for the signed-in user. Submit with `notes` omitted, null, or blank succeeds and stores null. Submit with 1000 characters of notes succeeds.
- Save with `win` and `grateful_for` omitted, null, or blank succeeds and stores null. Save with 200 characters in either line succeeds. A valid mood and reflection still save when both lines are absent.
- Mood outside 1–10, reflection outside 1–2000, a win or gratitude line longer than 200 characters, more than two tags, habits-only “required” omission, a too-long intention, and notes longer than 1000 characters fail with field errors.
- A signed-out caller cannot submit a check-in or read check-in notes, and cannot save or read journal `win` or `grateful_for`. A client-supplied `user_id` does not change the row owner or which rows `listWeeklyCheckIns` or `listJournalEntries` returns.
- `today` of `utcToday - 2` is rejected.
- Second check-in for the same week fails cleanly.
- Intention domain cannot be changed through the action.
- Recap numbers come from stored journal rows only.
- The slugs and labels are defined only once, in `src/lib/life-domains/`, with no copy left in `src/lib/types/profile.ts`, journal, or weekly modules.
- The profile focus-area picker shows the same eight labels in the same order as before.
- Existing profile tests and the `mapStoredDomainPriorities` tests pass unchanged except for import paths.

### Dependencies

- Ticket 2.1

### Suggested GitHub title

`[Slice 2] Add journal and check-in server actions`

---

## Ticket 2.3: Daily journal UI

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `frontend`, `ui`

### Description

Build `/mind/journal` to match [`journal-desktop.png`](../../mockups/slice_2_journal_checkin/journal-desktop.png), without the “Example data” pill and without sample copy.

### Scope

- Route is protected (ticket 2.6 may land the middleware change first; if this ticket lands first, include the `/mind` prefix in `src/lib/supabase/middleware.ts`).
- Heading with the local calendar day via `formatCalendarDate` / a weekday label that uses the same UTC-stable date. The day is not a free date picker.
- Mood control: buttons 1–10, one selected, legend “1 = rough, 10 = great”.
- Reflection textarea, required.
- Two optional single-line inputs, after the reflection and before the domain chips. Labels, exact: “One win today” and “Grateful for”. Each has a visible label. A placeholder does not replace that label. Empty is allowed. Save stays available when both are empty, as long as mood and reflection are valid.
- The two inputs are full width and stacked in one column, including a phone-width layout. Do not place them side by side.
- Max 200 characters each. The server still normalizes blank and whitespace-only to null. The client does not block submit for an empty line.
- Domain chips in canonical order. Habits chip shows “optional”. Zero, one, or two selected. A third click does not add a tag.
- Primary button “Save entry”. Saving an existing today-row updates it. Button shows a pending state.
- Field errors and a generic save error. Success is visible on this page. After a successful save, stay on `/mind/journal`. Do not redirect.
- If today’s row exists, the form loads it (mood, reflection, tags, and the two lines). A null line loads as an empty input.
- Leave a place directly under the date for the intention line (ticket 2.5). Do not invent stress or energy controls. Do not add a wins page, a gratitude page, or a link to one. `journal-desktop.png` does not show these two inputs. This ticket adds them.
- Keyboard: each mood button and chip is a real button, the textarea and each one-line field have a label, submit works from the keyboard.
- Coral selected state and coral primary button, existing tokens (`brand-coral`, `surface-card`, `surface-page`). Same family as the measurements log modal.

### Acceptance Criteria

- A signed-in user can save today’s mood, reflection, and up to two tags, with both lines empty or filled, stay on `/mind/journal`, refresh, and see the same values.
- Saving again updates that day; the history count for today stays one. Clearing a line on that second save stores null.
- Three tags cannot be selected.
- Empty reflection does not submit. Empty or whitespace-only win and gratitude lines do not block submit and come back empty.
- The screen has no stress or energy field, no wins list, and no “Example data” badge.
- On a phone-width viewport the two inputs are stacked, labeled, and usable.

### Dependencies

- Ticket 2.2

### Suggested GitHub title

`[Slice 2] Build the daily journal entry screen`

---

## Ticket 2.4: Weekly check-in UI

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `frontend`, `ui`

### Description

Build `/mind/check-in` in the mockup’s order. The recap is computed. The form does not ask for mood.

**This is the Slice 5 → Slice 2 move.** The screen stores scores, optional notes, and the next intention. It does not request a coach report, and nothing replies to the notes.

### Scope

Match [`checkin-desktop.png`](../../mockups/slice_2_journal_checkin/checkin-desktop.png), plus the Your goals bar below, which that PNG does not show:

1. Title “Weekly check-in” and subtitle “Week of {Mon} – {Sun}” for `lastCompletedWeekStart(today)` through that Sunday. Format those dates with the calendar-date helper.
2. **Your week so far.** Average mood, “N of 7” days, top tagged domains, sparkline with hollow gaps. Data from ticket 2.2. No entries: short empty copy, not zeros, and the rest of the form still works.
3. Last intention, when a prior intention row exists for that `week_start`: the body in quotes and Yes / Partly / No. One of the three required. When no prior intention row exists (the first check-in), hide the last-intention block entirely. There is no heading, no quoted body, and no outcome control.
4. Stress and energy, 1–10, legend “1 = low, 10 = high”.
5. **Your goals.** A read-only reminder of the profile’s free-text fitness and wellness goals. Ryan added this on 2026-11-16. Layout: [`G-checkin-goals-reminder.png`](../../mockups/nov_2026_tickets/G-checkin-goals-reminder.png) (desktop and mobile). It sits after the week recap and last week’s intention, and directly above the life-domain scores (after stress and energy, immediately before the domain rows). The PNG draws the filled bar and leaves stress and energy out of that frame. Keep stress and energy. Muted bar, not a form. Labels “Fitness” and “Wellness”. No inputs, and the text is not editable here. Link, exact label “Edit in profile”, to `/profile`. Show a goal only when its trimmed text is non-empty. Each goal clamps to three lines; the rest is truncated. The full text stays on the profile. The PNG does not show that clamp or an empty bar. This ticket governs both. If both goals are empty, do not show blank lines: show a quiet link, exact label “Add goals in your profile”, to `/profile`. Hiding the whole block is also allowed by the decision; build the quiet link so the empty state is one thing. Do not show structured goals (weight, waist, weekly count) in this bar. Do not put this bar on the Fitness Overview. `checkin-desktop.png` does not show the bar.
6. Seven domain rows plus Habits, in canonical order, not profile-priority order. Legend “1 = struggling, 10 = thriving”. Habits may be left blank. The other seven may not. `domain_priorities` does not change this block. Ryan confirmed that on 2026-11-16. A later callout, a later reorder, and passing priorities to the Slice 5 coach are Future ideas (gate D) in [`docs/vertical_slices/nov_16_2026_decisions/tickets.md`](../nov_16_2026_decisions/tickets.md). Not this ticket.
7. Intention label, exact: “Intention for the week of {Mon}–{Sun}”. {Mon} is `currentIntentionWeekStart(today)` and {Sun} is that Sunday, the week the new intention is for. Format those dates with the calendar-date helper. The subtitle stays “Week of {Mon} – {Sun}” for the check-in week (`lastCompletedWeekStart`). Domain control defaults to the lowest score and can be changed before submit. Helper: “One concrete thing. Your lowest domain this week: {Label}.” The helper updates if the user changes scores before submit. Text required, max 200. On 2026-11-16 Ryan rejected a proposal to preselect the user’s top-ranked profile focus area instead ([`B-checkin-journal.png`](../../mockups/nov_2026_tickets/B-checkin-journal.png)). [ADR-013](../../ARCHITECTURE_DECISIONS.md) is unchanged. Do not read `domain_priorities` to pick this default, to order the rows, or to write this helper.
8. Optional notes, last field before submit. Label and prompt, exact: “How did your training, energy and life go this week? Anything to remember?” The check-in submits when this is empty. Max 1000 characters. This is not a message to a coach. Nothing replies to it. Do not add a thread, a reply box, or any Q&A.
9. “Submit check-in”. Pending, field errors, generic failure, and the already-submitted message. The check-in does not save a draft. Nothing is written until submit succeeds. A successful submit redirects to `/mind`.

Check-in history on this screen lists the caller’s past `weekly_check_ins`, newest first, read-only. Show `notes` when the value is non-null. A week with null notes does not render an empty notes block. This slice still does not edit a submitted check-in.

The Slice 5 coach report will read `notes` as context later ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). No data model change is needed then. Do not call a model from this screen.

Do not add sleep, motivation, nutrition, diet or appetite tracking, alcohol, a second reflection, a coach reply, or an AI panel. Do not build the domain-comparison page. The notes field is the only free-text input on this screen. The journal’s optional win and gratitude lines are ticket 2.3. They are not fields on this check-in. Your goals is read-only.

### Acceptance Criteria

- Submitting a valid check-in persists scores, sets the previous intention outcome when that row exists, and creates one next intention.
- The recap matches journal entries inside that Monday–Sunday window and ignores entries outside it.
- A second visit in the same week cannot create another check-in.
- First-time check-in (no prior intention row) hides the last-intention block entirely. There is no heading, quoted body, or outcome control, and the check-in still submits.
- The intention label is “Intention for the week of {Mon}–{Sun}” for `currentIntentionWeekStart(today)` through that Sunday.
- The check-in does not save a draft. A successful submit redirects to `/mind`.
- Unanswered Habits is stored as null. An unanswered required domain does not submit.
- Empty notes are allowed and store null. Notes of 1000 characters submit. Longer notes do not.
- Check-in history shows saved notes. A null notes week has no empty notes block.
- The screen has no coach reply, no Q&A, and does not ask the user to write “to the coach.”
- With both free-text goals saved, Your goals shows both, clamped, with “Edit in profile” and no inputs, directly above the domain scores.
- With only one free-text goal saved, only that goal shows.
- With both empty, the block is the quiet “Add goals in your profile” link and does not show blank goal text.
- The intention domain still defaults to the lowest score. Profile priority does not reorder the domain rows.

### Dependencies

- Ticket 2.2
- Ticket 2.3 is not required to submit, but recap QA needs at least one journal row

### Suggested GitHub title

`[Slice 2] Build the weekly check-in screen`

---

## Ticket 2.5: Weekly intention line, card, and edit lock

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `frontend`, `ui`, `backend`

### Description

Show the current week’s single intention above the journal form and as a card on Mind. Let the owner edit the wording until `editable_until`. Keep the domain fixed.

### Scope

- Load `getCurrentIntention`. If none, render nothing (no empty placeholder sentence).
- Journal: one line, coral tint, same role as the mockup bar (“This week’s intention: …”). The intention text on this line is editable inside the window below.
- Mind: a card with the domain label, the body, and the outcome if it is already set (`done` / `partly` / `not_done` as Done / Partly / Not done). Outcome is read-only here. The intention text on this card is editable inside the same window.
- While `today <= editable_until`, the body is an editable field on the journal line and on the Mind card, and save calls `updateIntentionText`. After that date, the body is text, not a field, on both.
- The domain is never a control on either surface.
- Server rejection (window closed, unauthenticated) is visible. The client clock is not the only check.

### Acceptance Criteria

- The intention created by the check-in shows on the journal page and on `/mind` during its `week_start` week.
- Text saves from the journal line and from the Mind card on `editable_until`, and does not save the next calendar day.
- Changing domain is not possible in the UI. A crafted action payload that includes `domain` fails.
- A week with no intention does not show a fake sentence.

### Dependencies

- Ticket 2.2
- Ticket 2.3 (journal line)
- Ticket 2.6 (Mind card placement). The card component can land before the page and be mounted in 2.6.

### Suggested GitHub title

`[Slice 2] Show and lock the weekly intention`

---

## Ticket 2.6: Mind page

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-2`, `frontend`, `ui`

### Description

Replace the muted Mind link with a real `/mind` home: stats, a 7-day mood trend, and journal history.

### Scope

- `src/lib/supabase/middleware.ts`: treat paths under `/mind` as protected, same redirect to `/auth` as `/dashboard`.
- `src/components/app-header.tsx` and `src/components/mobile-nav-menu.tsx`: Mind href `/mind`, active on `/mind`. Do not activate it together with Fitness. Leave Insights and Community muted.
- Page chrome uses the existing charcoal header and warm page. A short welcome line is enough (“Reflect across your life domains” from `docs/navigation-ia.md`) plus one primary action, **+ New journal entry**, to `/mind/journal`. **Mind is one page.** Do not build a tab bar: not Overview / Journal / Domains / Prompts, and not the Option B tabs on [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png) (Overview / Journal / Check-ins). Option A on that PNG is this page. Ryan confirmed the single page on 2026-11-16. `docs/navigation-ia.md` now says the same. Ticket 2.9 must not put the tab bar back.
- Page order, top to bottom:
  1. Welcome line and **+ New journal entry**.
  2. Stat row. **Activity streak** is the first stat ([ADR-014](../../ARCHITECTURE_DECISIONS.md), ticket 2.5.1). It replaces “days journaled, N of 7” in this row. Do not show “N of 7” here, and do not label the card “Journal streak” (the D mockup still uses that sample label). If ticket 2.5.1 has not merged, omit the streak card. Do not fill the slot with a days-journaled fraction. The other three stats still ship:
     - average mood for the seven days ending today (same rounding as the recap; em dash when there are no entries)
     - domains touched: the count of distinct tags in that window, plus their labels (Family may use the short chip label)
     - last entry date, or “No entries yet”
  3. Check-in due card (ticket 2.7), under the stat row and above the mood strip, only when `isCheckInDue` is true. Ryan confirmed that placement on 2026-11-16.
  4. Mood trend for those same seven days, hollow when a day has no entry. This window includes today. It is not the check-in week window.
  5. Intention card (ticket 2.5).
  6. History: newest first, fetch limit 25, then the PR #52 window (5 visible, +10 per Show more, Show less back to 5, “Showing N of M”, hide a control that would not change the list). Do not add cursor pagination in this ticket. The measurements log already accepts the 25-row cap. Each entry is read-only. It shows the date, mood, tags, and the reflection clamped to about 2–3 lines, as on [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png). That PNG does not specify the clamp. When `win` is non-null, show the label “One win today” and the text under the reflection and before the domain chips. When `grateful_for` is non-null, show “Grateful for” and the text in that same spot, after the win line. A null value does not render an empty line. Do not add a Wins list, a `/mind/wins` route, a filter, or a second page for these lines. They are not stats and they are not part of the mood trend.
- Layout reference: [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png). Sample numbers and the “rules are not decided yet” line are not product copy. The streak rules are ADR-014.
- Empty history: supportive copy and the new-entry action. No sample numbers.

### Acceptance Criteria

- Signed-out visitors to `/mind` and `/mind/journal` land on `/auth`.
- Mind in the navbar is a real link and shows the coral active state on `/mind` (desktop and the mobile menu).
- Stats and the trend match journal rows in the rolling seven days and ignore older rows. The stat row does not show “N of 7” or a “Journal streak” number. Before ticket 2.5.1 merges, the streak card is omitted. When ticket 2.5.1 has merged, Activity streak is the first stat and its number comes from that server result.
- History Show more / Show less behaves like Recent history on the Measurements tab.
- A history entry is read-only. It shows the date, mood, tags, and the reflection clamped to about 2–3 lines. A saved win or gratitude line shows on that entry. A null line is omitted, including after the user clears it on a later save of today.
- The page does not show a tab bar, an Insights tab, a domain radar, a wins page, or hard-coded demo stats.

### Dependencies

- Ticket 2.2
- Ticket 2.3 for the new-entry link target
- Ticket 2.5.1 fills the Activity streak stat. This ticket does not wait on it, and it does not invent a substitute number.

### Suggested GitHub title

`[Slice 2] Build the Mind page`

---

## Ticket 2.7: Check-in due card

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-2`, `frontend`, `ui`

### Description

On `/mind`, show a card when last week’s check-in is missing. Compute it when the page loads. Do not store a due flag and do not notify anyone.

### Scope

- Server component (or the Mind page loader) calls the due predicate from ticket 2.2.
- Visible only when `isCheckInDue` is true. Copy is calm and specific, for example that last week’s check-in is ready, with a link to `/mind/check-in`.
- Secondary link, exact label “Log this week’s weight”, to `/fitness/measurements`. That is the measurements logging flow: the Measurements tab and `+ Log measurement`, which opens `LogMeasurementModal`. **NAV.1** ([issue #80](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/80)) creates that path and must merge before this ticket. Do not add a second route, a modal, a query param, or a weight-only form. The link does not insert a measurement. Do not point it at `/dashboard`.
- After a successful submit, the next load of `/mind` does not show the card for that week.
- No email, push, badge count in the navbar, cron, or `notifications` table.
- The card does not appear on Fitness `/dashboard` in this ticket.

### Acceptance Criteria

- A user with no check-in for `lastCompletedWeekStart(today)` sees the card.
- A user who has that row does not see the card.
- Rendering the card does not insert a row.
- The card shows a secondary link “Log this week’s weight” to `/fitness/measurements`. Following it does not insert a measurement or a check-in.
- Monday and Sunday follow the README fixtures (different `week_start` values).

### Dependencies

- Ticket 2.2
- Ticket 2.6
- **NAV.1** ([issue #80](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/80), [`docs/vertical_slices/nov_16_2026_decisions/tickets.md`](../nov_16_2026_decisions/tickets.md)) must merge before this ticket

### Suggested GitHub title

`[Slice 2] Show a stateless check-in due card`

---

## Ticket 2.8: Tests for journal, check-in, intention, and Mind

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-2`, `tests`, `quality`

### Description

Lock the date rules, the edit lock, the recap, the screens, and the auth checks. The repo’s tests mock Supabase (`src/lib/measurements/actions.test.ts`, Vitest, Testing Library). There is no live RLS harness and CI must not need a database. RLS itself is the migration plus the grants in ticket 2.1.

### Scope

- Unit: week fixtures, inclusive `editable_until`, recap rounding and empty input, tag ranking, lowest domain, due predicate, and the `src/lib/life-domains/` list (the same eight slugs and labels, canonical order, with no second copy in `src/lib/types/profile.ts`, journal, or weekly). Extend the ticket 2.2 tests rather than forking a second copy.
- Action tests: unauthorized journal save, check-in submit, and intention update; invalid mood, tags, and body; `today` outside the slack window; intention update rejected after the window; `.strict()` rejects `domain` on text update; check-in unique violation mapped to the friendly error. Notes: omitted, null, and whitespace-only store null; 1000 characters pass; 1001 fail. A signed-out caller cannot submit notes or read them back. `listWeeklyCheckIns` returns only the session user’s rows. Journal `win` and `grateful_for`: omitted, null, and whitespace-only store null; 200 characters pass; 201 fail. A save with both absent still succeeds when mood and reflection are valid. A signed-out caller cannot save or read those columns. `listJournalEntries` returns them only for the session user.
- Component: journal blocks a third tag and requires reflection; the journal still submits when both optional lines are empty; a filled line reloads after save; a successful journal save stays on `/mind/journal`; check-in hides the last-intention block entirely when there is no prior intention (no heading, quote, or outcome control) and shows the empty recap without zeros; the intention label is “Intention for the week of {Mon}–{Sun}”; a successful check-in does not save a draft and redirects to `/mind`; empty notes still submit; check-in history shows notes text and hides the block when notes are null; Mind history is read-only and shows the date, mood, tags, and the reflection clamped to about 2–3 lines; Mind history shows “One win today” and “Grateful for” when the values are non-null and hides each line when it is null; before ticket 2.5.1 merges, the Mind stat row omits the streak card; history Show more reveals the next 10 and Show less returns to 5; intention text saves from the journal line and from the Mind card inside the edit window; due card renders from the predicate and not from a hard-coded flag, and its “Log this week’s weight” link points at `/fitness/measurements`. The journal and Mind pages do not link to a wins route.
- Run under `TZ=America/Chicago` and `TZ=UTC` the way measurement calendar tests do, with `vi.setSystemTime` where the clock matters.
- Do not add Playwright in this ticket.

### Acceptance Criteria

- `npm test` passes, including the new cases.
- Existing measurement and profile tests still pass.
- A reviewer can point at the SQL policy and the grant list for each new table, and at an action test that rejects a signed-out caller. `weekly_check_ins` owner RLS covers `notes`. `journal_entries` owner RLS covers `win` and `grateful_for`, and the update grant lists those columns with `mood` and `reflection`. Tests do not need a live database. Empty notes, the 1000-character limit, empty win and gratitude lines, the 200-character limit, and that ownership rejection are all in the action tests.
- Component tests cover the intention label “Intention for the week of {Mon}–{Sun}”, the hidden last-intention block on a first check-in, the check-in redirect to `/mind` with no draft, and a journal save that stays on `/mind/journal`.

### Dependencies

- Tickets 2.2, 2.3, 2.4, 2.5, 2.6, 2.7

### Suggested GitHub title

`[Slice 2] Test journal, check-in, and Mind`

---

## Ticket 2.9: Doc updates needed (handoff pack vs approved Slice 2)

**Type:** chore  
**Priority:** P0  
**Labels:** `slice-2`, `documentation`

### Description

**Status:** Landed 2026-11-17 in [PR #68](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/68). [ADR-013](../../ARCHITECTURE_DECISIONS.md) is Accepted. The handoff pack, `docs/navigation-ia.md`, `docs/vertical_slices/tracking_setup.md`, and `DOMAIN_FOCUS_AREAS` match it. Saved `profiles.domain_priorities` are mapped by `mapStoredDomainPriorities` and by `supabase/migrations/20261117170000_map_domain_priorities_to_option_b.sql`. The notes below are the spec this ticket applied.

These align with ADR-013 and link to it:

- `docs/PRD.md`
- `docs/SYSTEM_DESIGN.md`
- ADR-005 in `docs/ARCHITECTURE_DECISIONS.md` (amend it; do not delete it)
- `docs/navigation-ia.md`
- `docs/vertical_slices/tracking_setup.md`
- `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts`, including a mapping or migration for existing users’ saved `profiles.domain_priorities` values

### What landed

**Life domains.** PRD §2 now lists Option B: Physical health, Mental health, Family & relationships, Social, Career, Learning, Leisure, plus optional Habits. It no longer lists the SAMHSA wheel or `life_domains` / `journal_domain_scores`. The comparison mockup still labels the wheel “Option A” as the rejected set.

**Journal shape.** The journal is mood, reflection, and optional tags in `journal_entry_domains`. Stress and energy live only on the weekly check-in. No domain scores on the journal row.

**Later journal fields.** On 2026-11-17 Ryan added optional `win` and `grateful_for` on the journal entry. This ticket did not. The Slice 2 README specifies them. Do not read the journal-shape sentence above as forbidding those two columns.

**Where the check-in sits.** The subjective check-in (recap, stress, energy, domain scores, one intention) is Slice 2. Slice 5’s coach report reads that stored check-in and still produces the structured report. ADR-005 stays. Its text matches ADR-013. One intention per week lives in `weekly_intentions`. The pack does not describe a list of intentions or a Slice 5 form.

**Check-in fields Slice 2 does not store:** a second mood score, sleep / recovery, motivation, nutrition adherence, life-event text, and a free-form coach reflection. Sleep and motivation are later. Nutrition adherence is not built. Life events are Slice 7. Optional notes are the owner’s memory of the week.

**Navigation.** Slice 2 ships `/mind`, `/mind/journal`, and `/mind/check-in` only. Mind stays one page with no tab bar. The activity streak on `/mind` is [ADR-014](../../ARCHITECTURE_DECISIONS.md), not a change to ADR-013.

**Profile keys.** `DOMAIN_FOCUS_AREAS` is the Option B set. Saved wheel slugs are mapped, not left valid and not dropped. The map is in ADR-013. Journal and check-in tickets do not run it again. Ticket 2.2 moves `DOMAIN_FOCUS_AREAS` and `DOMAIN_FOCUS_LABELS` out of `src/lib/types/profile.ts` into `src/lib/life-domains/`. The `profile.ts` path in this ticket’s scope is where 2.9 left the list, not where it stays.

**Tracking.** The Slice 2 milestone includes the weekly check-in. Slice 5 is the coach report. Both link to ADR-013.

**Not a product spec.** `docs/AI_ENGINEERING_CONTEXT.md` is an audit from 2026-10-05. Do not copy domain names or slice status from it. A full refresh is optional and is not required to close this ticket.

### Scope

- Update the PRD, system design, and launch plan so they match ADR-013 and link to it. Amend ADR-005 in the same change so it links to ADR-013. Set ADR-013 to Accepted only as part of this pack update, and append the development log.
- Update `docs/navigation-ia.md` and `docs/vertical_slices/tracking_setup.md` so they align with ADR-013 and link to it.
- Align `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts` with ADR-013, including a mapping or migration for existing users’ saved values, and point readers at the ADR.
- Leave Slice 2 behavior described once, in the slice README, and point the pack at it and at ADR-013.
- The ADR pull request does not change application code. This ticket is the one that changes `DOMAIN_FOCUS_AREAS` to the Option B slugs and adds the saved-value mapping or migration. Ticket 2.2 later moves `DOMAIN_FOCUS_AREAS` and `DOMAIN_FOCUS_LABELS` to `src/lib/life-domains/`.

### Acceptance Criteria

- A reader of the pack can answer: journal fields, domain labels, and which slice stores the weekly check-in, without opening this ticket. PRD, system design, ADR-005, `docs/navigation-ia.md`, and `docs/vertical_slices/tracking_setup.md` each link to ADR-013.
- Slice 5 is still the coach report, after deterministic insights, and it reads the Slice 2 check-in rather than collecting the form.
- `DOMAIN_FOCUS_AREAS` matches ADR-013 and points at it. Existing users’ saved `domain_priorities` have a mapping or migration. They are not left on the wheel and not silently rewritten.
- `docs/LAUNCH_PLAN.md` “You are here” changes only if Slice 1.5 is actually finished at that moment. This ticket must not pretend Slice 2 has started.

### Dependencies

- None for the writing. Do it before implementation so agents do not follow PRD §2.

### Suggested GitHub title

`[Slice 2] Update the handoff pack for domains and the weekly check-in`

---

## Ticket 2.10: Slice 2 QA and release checklist

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-2`, `qa`, `release`

### Description

Walk the Mind loop on a real account after the feature tickets merge. Capture gaps as new issues. Do not expand the slice during QA.

### Scope

- Sign in, open Mind from the navbar (desktop and a phone-width menu), save today’s journal, refresh, confirm one row. After the successful save the address is still `/mind/journal`.
- Save today’s journal once with “One win today” and “Grateful for” left blank, and confirm the row still saves. Save again with both lines filled, refresh, and confirm both show on the form and on the Mind history entry. The history entry is read-only and shows the date, mood, tags, and the reflection clamped to about 2–3 lines. On a phone-width journal screen the two inputs are stacked and labeled. Clear one line, save, and confirm that history entry no longer shows an empty line for it. Confirm there is no wins list page.
- Save the same day again and confirm the row updated.
- Confirm a Chicago-timezone evening still stores the local calendar day the screen showed (same class of bug as measurements before `measured_on`).
- Submit the check-in with notes left blank, then once with a short note on a later week if a second week is available. Blank stores no note. The saved note shows in check-in history. A note over 1000 characters is refused. Nothing replies to the note. The first check-in hides the last-intention block entirely (no heading, quoted body, or outcome control). The intention label is “Intention for the week of {Mon}–{Sun}”. There is no draft. A successful submit lands on `/mind`.
- Recap counts match the journal. Outcome buttons match an existing intention. A second submit is refused.
- Edit intention text today from the Mind card and from the journal, inside the edit window. Confirm the domain control is absent. Confirm text is refused after `editable_until` (the unit fixture is enough if the calendar day cannot be waited out).
- Due card visible before submit and gone after. “Log this week’s weight” goes to `/fitness/measurements` and does not add a weigh-in.
- Sign out. `/mind` redirects to `/auth`.
- Confirm deferred items are absent: second intention, alcohol, diet or appetite tracking, coach Q&A replies to notes, Insights, monthly reflection, workout mood, a wins table or wins page, life events, notifications, AI, progress photos (backlog #54), example-data pill. The optional journal lines are present. They are not this deferred list.
- Ticket 2.9 is merged or has an open issue. QA does not silently edit the PRD.

### Acceptance Criteria

- Done criteria in the slice README are checked off or have a follow-up issue.
- The walk confirms the intention label “Intention for the week of {Mon}–{Sun}”, a first check-in with the last-intention block hidden, a successful check-in on `/mind`, and a successful journal save still on `/mind/journal`.
- No wellness-wheel labels on the new screens.
- Slice 2 is ready to call done only after this list and ticket 2.8 are green.

### Dependencies

- Tickets 2.3 through 2.8
- Ticket 2.9 filed, not necessarily done

### Suggested GitHub title

`[Slice 2] QA the journal and weekly check-in`
