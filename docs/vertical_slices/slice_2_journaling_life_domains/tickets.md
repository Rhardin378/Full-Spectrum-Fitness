# Slice 2 Tickets (Copy to GitHub Issues)

Use each section below as one GitHub issue. Keep the order. The build spec is [`README.md`](./README.md). Mockups: [`docs/mockups/slice_2_journal_checkin/`](../../mockups/slice_2_journal_checkin/README.md).

**Scope change:** the weekly subjective check-in is in this slice, not Slice 5. Domain names are Option B, not the wellness wheel in `docs/PRD.md` §2. Ticket **2.9** updates the handoff pack. Do not build the old journal (mood + stress + energy + domain scores).

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
- `created_at`, `updated_at` `timestamptz not null default now()`
- unique `(user_id, entry_on)`
- unique `(id, user_id)` so tag rows can reference both
- Grants: `select`, `insert`, and `update (mood, reflection)` to `authenticated`. No `delete`.

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

### Acceptance Criteria

- Migration applies on a local reset.
- A user can insert and read only their own rows under RLS.
- A second journal row for the same user and `entry_on` fails. A third tag fails. A second check-in or intention for the same user and `week_start` fails.
- `authenticated` cannot update `weekly_intentions.domain`.
- `anon` has no grants.
- Check constraints reject mood, scores, and text outside the ranges above.
- A check-in with `notes` null succeeds. A `notes` value of 1000 characters succeeds. 1001 characters, or `''`, fails the check constraint.
- Under RLS, a user can read and insert only their own `weekly_check_ins` rows, including `notes`. Another user cannot select or insert that row.

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

Every action:

- calls `getUser()` the way `src/lib/measurements/actions.ts` does
- returns `{ success: false, error: "unauthorized" }` when there is no user
- parses input with a `.strict()` Zod schema
- writes `user_id` from the session (the SQL functions also use `auth.uid()`)
- returns a generic database message, not `error.message` from Postgres

**Dates.** Client payload includes `today` as `YYYY-MM-DD`. Reject it unless `isValidCalendarDate` and the date is inside `[addUtcCalendarDays(utcTodayISODate(), -1), maxAllowedMeasuredOn()]`. Derive `entry_on`, check-in week, and intention week on the server from that `today`. Ignore any client `week_start` or `user_id`.

**Journal**

- `saveJournalEntry({ today, mood, reflection, domains })` inserts or updates the unique user+day row and replaces its tags. Empty or whitespace reflection fails. `domains` length 0–2, distinct, known slugs. There is no journal RPC in ticket 2.1. If the tag write fails after the entry write, return an error; a retry must end with this payload’s tags and not a mix. Prefer one transaction if it stays a `security invoker` function with `auth.uid()`, but do not add a `security definer` bypass.
- `listJournalEntries({ start_date?, end_date?, limit? })` returns only the caller’s rows, newest `entry_on` first. Default limit 25, max 100. Used by history, the Mind trend, and the check-in recap.

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

### Acceptance Criteria

- Valid save, list, submit, and text edit succeed for the signed-in user. Submit with `notes` omitted, null, or blank succeeds and stores null. Submit with 1000 characters of notes succeeds.
- Mood outside 1–10, reflection outside 1–2000, more than two tags, habits-only “required” omission, a too-long intention, and notes longer than 1000 characters fail with field errors.
- A signed-out caller cannot submit a check-in or read check-in notes. A client-supplied `user_id` does not change the row owner or which rows `listWeeklyCheckIns` returns.
- `today` of `utcToday - 2` is rejected.
- Second check-in for the same week fails cleanly.
- Intention domain cannot be changed through the action.
- Recap numbers come from stored journal rows only.

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
- Domain chips in canonical order. Habits chip shows “optional”. Zero, one, or two selected. A third click does not add a tag.
- Primary button “Save entry”. Saving an existing today-row updates it. Button shows a pending state.
- Field errors and a generic save error. Success is visible.
- If today’s row exists, the form loads it (mood, text, tags).
- Leave a place directly under the date for the intention line (ticket 2.5). Do not invent stress or energy controls.
- Keyboard: each mood button and chip is a real button, textarea has a label, submit works from the keyboard.
- Coral selected state and coral primary button, existing tokens (`brand-coral`, `surface-card`, `surface-page`). Same family as the measurements log modal.

### Acceptance Criteria

- A signed-in user can save today’s mood, reflection, and up to two tags, refresh, and see the same values.
- Saving again updates that day; the history count for today stays one.
- Three tags cannot be selected.
- Empty reflection does not submit.
- The screen has no stress or energy field and no “Example data” badge.

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

Match [`checkin-desktop.png`](../../mockups/slice_2_journal_checkin/checkin-desktop.png):

1. Title “Weekly check-in” and subtitle “Week of {Mon} – {Sun}” for `lastCompletedWeekStart(today)` through that Sunday. Format those dates with the calendar-date helper.
2. **Your week so far.** Average mood, “N of 7” days, top tagged domains, sparkline with hollow gaps. Data from ticket 2.2. No entries: short empty copy, not zeros, and the rest of the form still works.
3. Last intention, when one exists for that `week_start`: the body in quotes and Yes / Partly / No. One of the three required. Hidden when there is no intention.
4. Stress and energy, 1–10, legend “1 = low, 10 = high”.
5. Seven domain rows plus Habits. Legend “1 = struggling, 10 = thriving”. Habits may be left blank. The other seven may not.
6. Intention for next week. Domain control defaults to the lowest score and can be changed before submit. Helper: “One concrete thing. Your lowest domain this week: {Label}.” The helper updates if the user changes scores before submit. Text required, max 200.
7. Optional notes, last field before submit. Label and prompt, exact: “How did your training, energy and life go this week? Anything to remember?” The check-in submits when this is empty. Max 1000 characters. This is not a message to a coach. Nothing replies to it. Do not add a thread, a reply box, or any Q&A.
8. “Submit check-in”. Pending, field errors, generic failure, and the already-submitted message.

Check-in history on this screen lists the caller’s past `weekly_check_ins`, newest first, read-only. Show `notes` when the value is non-null. A week with null notes does not render an empty notes block. This slice still does not edit a submitted check-in.

The Slice 5 coach report will read `notes` as context later ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). No data model change is needed then. Do not call a model from this screen.

Do not add sleep, motivation, nutrition, diet or appetite tracking, alcohol, a second reflection, a coach reply, or an AI panel. Do not build the domain-comparison page. The notes field above is the only free text on this form.

### Acceptance Criteria

- Submitting a valid check-in persists scores, sets the previous intention outcome when that row exists, and creates one next intention.
- The recap matches journal entries inside that Monday–Sunday window and ignores entries outside it.
- A second visit in the same week cannot create another check-in.
- First-time check-in (no prior intention) submits without an outcome control.
- Unanswered Habits is stored as null. An unanswered required domain does not submit.
- Empty notes are allowed and store null. Notes of 1000 characters submit. Longer notes do not.
- Check-in history shows saved notes. A null notes week has no empty notes block.
- The screen has no coach reply, no Q&A, and does not ask the user to write “to the coach.”

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
- Journal: one line, coral tint, same role as the mockup bar (“This week’s intention: …”).
- Mind: a card with the domain label, the body, and the outcome if it is already set (`done` / `partly` / `not_done` as Done / Partly / Not done). Outcome is read-only here.
- While `today <= editable_until`, the body is an editable field and save calls `updateIntentionText`. After that date, the body is text, not a field.
- The domain is never a control on this surface.
- Server rejection (window closed, unauthenticated) is visible. The client clock is not the only check.

### Acceptance Criteria

- The intention created by the check-in shows on the journal page and on `/mind` during its `week_start` week.
- Text saves on `editable_until` and does not save the next calendar day.
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
- Page chrome uses the existing charcoal header and warm page. A short welcome line is enough (“Reflect across your life domains” from `docs/navigation-ia.md`) plus one primary action, **+ New journal entry**, to `/mind/journal`. Do not build the Mind tab bar (Overview / Journal / Domains / Prompts). That IA is still a draft; ticket 2.9 records the cut.
- Stats for the seven days ending today (validated local today, inclusive):
  - average mood (same rounding as the recap; em dash when there are no entries)
  - days journaled (“N of 7”)
  - domains touched (distinct tags in the window)
  - last entry date, or “No entries yet”
- Mood trend for those same seven days, hollow when a day has no entry. This window includes today. It is not the check-in week window.
- History: newest first, fetch limit 25, then the PR #52 window (5 visible, +10 per Show more, Show less back to 5, “Showing N of M”, hide a control that would not change the list). Do not add cursor pagination in this ticket. The measurements log already accepts the 25-row cap.
- Mount points for the intention card (2.5) and the due card (2.7).
- Empty history: supportive copy and the new-entry action. No sample numbers.

### Acceptance Criteria

- Signed-out visitors to `/mind` and `/mind/journal` land on `/auth`.
- Mind in the navbar is a real link and shows the coral active state on `/mind` (desktop and the mobile menu).
- Stats and the trend match journal rows in the rolling seven days and ignore older rows.
- History Show more / Show less behaves like Recent history on the Measurements tab.
- The page does not show an Insights tab, a domain radar, or hard-coded demo stats.

### Dependencies

- Ticket 2.2
- Ticket 2.3 for the new-entry link target

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
- Secondary link, exact label “Log this week’s weight”, to `/dashboard`. That is the existing measurements logging flow: the Measurements tab and `+ Log measurement`, which opens `LogMeasurementModal`. Do not add a route, a modal, a query param, or a weight-only form. The link does not insert a measurement.
- After a successful submit, the next load of `/mind` does not show the card for that week.
- No email, push, badge count in the navbar, cron, or `notifications` table.
- The card does not appear on Fitness `/dashboard` in this ticket.

### Acceptance Criteria

- A user with no check-in for `lastCompletedWeekStart(today)` sees the card.
- A user who has that row does not see the card.
- Rendering the card does not insert a row.
- The card shows a secondary link “Log this week’s weight” to `/dashboard`. Following it does not insert a measurement or a check-in.
- Monday and Sunday follow the README fixtures (different `week_start` values).

### Dependencies

- Ticket 2.2
- Ticket 2.6

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

- Unit: week fixtures, inclusive `editable_until`, recap rounding and empty input, tag ranking, lowest domain, due predicate. Extend the ticket 2.2 tests rather than forking a second copy.
- Action tests: unauthorized journal save, check-in submit, and intention update; invalid mood, tags, and body; `today` outside the slack window; intention update rejected after the window; `.strict()` rejects `domain` on text update; check-in unique violation mapped to the friendly error. Notes: omitted, null, and whitespace-only store null; 1000 characters pass; 1001 fail. A signed-out caller cannot submit notes or read them back. `listWeeklyCheckIns` returns only the session user’s rows.
- Component: journal blocks a third tag and requires reflection; check-in hides outcome when there is no prior intention and shows the empty recap without zeros; empty notes still submit; check-in history shows notes text and hides the block when notes are null; history Show more reveals the next 10 and Show less returns to 5; due card renders from the predicate and not from a hard-coded flag, and its “Log this week’s weight” link points at `/dashboard`.
- Run under `TZ=America/Chicago` and `TZ=UTC` the way measurement calendar tests do, with `vi.setSystemTime` where the clock matters.
- Do not add Playwright in this ticket.

### Acceptance Criteria

- `npm test` passes, including the new cases.
- Existing measurement and profile tests still pass.
- A reviewer can point at the SQL policy and the grant list for each new table, and at an action test that rejects a signed-out caller. `weekly_check_ins` owner RLS covers `notes`. Tests do not need a live database. Empty notes, the 1000-character limit, and that ownership rejection are all in the action tests.

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

The approved Slice 2 spec and the handoff pack disagree. This docs PR **does not** edit the pack, on purpose: domain names, the journal shape, and the check-in move have to change together (`docs/ARCHITECTURE_DECISIONS.md` ADR-001). The decision record is **[ADR-013](../../ARCHITECTURE_DECISIONS.md)** (status Proposed) in that file. Build from the slice README until this ticket lands.

When this ticket lands, these must align with ADR-013 and link to it:

- `docs/PRD.md`
- `docs/SYSTEM_DESIGN.md`
- ADR-005 in `docs/ARCHITECTURE_DECISIONS.md` (amend it; do not delete it)
- `docs/navigation-ia.md`
- `docs/vertical_slices/tracking_setup.md`
- `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts`, including a mapping or migration for existing users’ saved `profiles.domain_priorities` values

### Discrepancies to fix

**Life domains.** `docs/PRD.md` §2 lists the SAMHSA wellness wheel: Emotional, Physical well-being, Social / relationships, Environmental, Financial, Occupational, Spiritual / purpose. ADR-013 replaces that with Peterson / Future Authoring (Option B): Physical health, Mental health, Family & relationships, Social, Career, Learning, Leisure, plus optional Habits. The comparison mockup labels the wheel “Option A: Wellness wheel (current)” and Option B as the replacement. `docs/PRD.md` database section also describes `life_domains` plus `journal_domain_scores`. The PRD must align with ADR-013 and link to it.

**Journal shape.** PRD §2 and the feature hierarchy say journal entries carry mood, stress, energy, and optional domain scores. `docs/SYSTEM_DESIGN.md` “Logging a journal entry” writes `journal_entries` + `journal_domain_scores`. Approved, and recorded in ADR-013: mood, reflection, optional tags in `journal_entry_domains`. Stress and energy live only on the weekly check-in. No domain scores on the journal row. System design must say that and link to ADR-013.

**Where the check-in sits.** PRD §2.5, the core loop, `docs/LAUNCH_PLAN.md` (phase table and build-order rows 2 and 5), `docs/SYSTEM_DESIGN.md` §8 and §16, and ADR-005 put the weekly check-in in Slice 5 together with the coach report. ADR-013 amends ADR-005: the subjective check-in (recap, stress, energy, domain scores, one intention) is Slice 2. Slice 5’s coach report reads that stored check-in later and still produces the structured report. ADR-005’s “not a chatbot / not the next slice after 1.5” part stays. Update ADR-005 so its text matches ADR-013 and links to it. Do not delete ADR-005. One intention per week lives in `weekly_intentions` (next week), not as columns on the check-in (last week); text is editable for 3 days on the server, and the domain locks once set. The pack must not describe a list of intentions or a Slice 5 form.

**Check-in fields the pack still lists and Slice 2 will not store:** mood (again), sleep / recovery, motivation, nutrition adherence, life-event text, free-form check-in reflection. Say they are later or explicitly dropped. Do not leave them implied as Slice 2 work.

**Navigation.** `docs/navigation-ia.md` assigns the weekly check-in to Slice 5 and lists Mind tabs Overview, Journal, Domains, Prompts plus `/mind/domains`. Slice 2 ships `/mind`, `/mind/journal`, and `/mind/check-in` only. Update the draft IA so it aligns with ADR-013, links to it, and does not send an implementer to build a domain radar.

**Profile keys.** `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts` is still the seven wheel slugs (`emotional`, `physical`, `social`, `environmental`, `financial`, `occupational`, `spiritual`). It must align with ADR-013’s Option B set and link to that ADR. Include a mapping or migration for existing users’ saved `profiles.domain_priorities` values. Do not leave the wheel slugs valid beside the new domains, and do not rewrite saved values without that mapping. Journal and check-in tickets do not perform this migration; this ticket does.

**Tracking.** `docs/vertical_slices/tracking_setup.md` milestones still describe Slice 5 as the check-in and Slice 2 as journaling only. They must align with ADR-013 and link to it.

**Not a product spec.** `docs/AI_ENGINEERING_CONTEXT.md` is an audit from 2026-10-05. Do not copy domain names or slice status from it. A full refresh is optional and is not required to close this ticket.

### Scope

- Update the PRD, system design, and launch plan so they match ADR-013 and link to it. Amend ADR-005 in the same change so it links to ADR-013. Set ADR-013 to Accepted only as part of this pack update, and append the development log.
- Update `docs/navigation-ia.md` and `docs/vertical_slices/tracking_setup.md` so they align with ADR-013 and link to it.
- Align `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts` with ADR-013, including a mapping or migration for existing users’ saved values, and point readers at the ADR.
- Leave Slice 2 behavior described once, in the slice README, and point the pack at it and at ADR-013.
- The ADR pull request does not change application code. This ticket is the one that changes `DOMAIN_FOCUS_AREAS` and the saved-value mapping or migration.

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

- Sign in, open Mind from the navbar (desktop and a phone-width menu), save today’s journal, refresh, confirm one row.
- Save the same day again and confirm the row updated.
- Confirm a Chicago-timezone evening still stores the local calendar day the screen showed (same class of bug as measurements before `measured_on`).
- Submit the check-in with notes left blank, then once with a short note on a later week if a second week is available. Blank stores no note. The saved note shows in check-in history. A note over 1000 characters is refused. Nothing replies to the note.
- Recap counts match the journal. Outcome buttons match an existing intention. A second submit is refused.
- Edit intention text today. Confirm the domain control is absent. Confirm text is refused after `editable_until` (the unit fixture is enough if the calendar day cannot be waited out).
- Due card visible before submit and gone after. “Log this week’s weight” goes to `/dashboard` and does not add a weigh-in.
- Sign out. `/mind` redirects to `/auth`.
- Confirm deferred items are absent: second intention, alcohol, diet or appetite tracking, coach Q&A replies to notes, Insights, monthly reflection, workout mood, wins, notifications, AI, progress photos (backlog #54), example-data pill.
- Ticket 2.9 is merged or has an open issue. QA does not silently edit the PRD.

### Acceptance Criteria

- Done criteria in the slice README are checked off or have a follow-up issue.
- No wellness-wheel labels on the new screens.
- Slice 2 is ready to call done only after this list and ticket 2.8 are green.

### Dependencies

- Tickets 2.3 through 2.8
- Ticket 2.9 filed, not necessarily done

### Suggested GitHub title

`[Slice 2] QA the journal and weekly check-in`
