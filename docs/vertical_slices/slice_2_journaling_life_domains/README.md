# Slice 2: Journaling, Life Domains, and Weekly Check-In

## Feature Brief

Authenticated users can keep one short journal entry per calendar day, tag it with up to three life domains, and once a week score how life went, close last week’s intention, and set exactly one intention for the new week. The entry may also include two optional one-line fields, “One win today” and “Grateful for”. Both can be skipped. Neither is required to save.

**This is the current slice.** Slice 1.5 closed on 2026-11-16 and `docs/LAUNCH_PLAN.md` points here. Ticket 2.9 aligned the handoff pack with ADR-013 and landed in [PR #68](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/68). Slice 2 implementation starts with ticket 2.1. [NAV.1](../nov_16_2026_decisions/tickets.md) ([issue #80](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/80)) must merge before ticket 2.7. The screens are not built yet.

## Scope change (read this first)

Ryan locked this on 2026-11-03. Ticket 2.9 aligned the handoff pack with [ADR-013](../../ARCHITECTURE_DECISIONS.md) (Accepted). Build this folder. Do not build the old wellness-wheel journal.

1. **Weekly check-in moves from Slice 5 into Slice 2.** Slice 2 stores the subjective check-in (recap, stress, energy, domain scores, intention outcome, next intention). Slice 5 stays the **coach report**: analytics snapshot, model call, structured sections. Slice 2 does not call a model and does not render a coach report.
2. **Life domains are Option B**, not the wellness wheel. Approved screen: [`docs/mockups/slice_2_journal_checkin/domains-compare-desktop.png`](../../mockups/slice_2_journal_checkin/domains-compare-desktop.png).
3. **The daily journal is mood plus a written reflection, plus two optional one-line fields.** Stress and energy are required on the weekly check-in and, since 2026-11-21, optional daily ratings on the journal. The journal does not store domain scores. Optional tags are a join table, not `journal_domain_scores`. Ryan added “One win today” and “Grateful for” on 2026-11-17. They are nullable columns on `journal_entries`, not a wins table. Structured dated wins and life events stay Slice 7.

`profiles.domain_priorities` uses the Option B slugs from `src/lib/life-domains/` (`DOMAIN_FOCUS_AREAS`, which ticket 2.2 moves out of `src/lib/types/profile.ts`). Ticket 2.9 mapped saved wellness-wheel values onto that set. Journal and check-in tickets do not migrate that column again. The decision record is [ADR-013](../../ARCHITECTURE_DECISIONS.md) (Accepted): Option B domains, stress and energy on the weekly check-in (and optional on the journal since 2026-11-21), that check-in in Slice 2, and exactly one weekly intention.

## Goal

Give Mind a real capture loop: a one-minute daily note, a deterministic look at the week that just ended, and a single intention the user can still reword for a few days.

## Approved domains

Slugs are stable. Labels are the approved copy.

| Slug | Label | Check-in score | Journal tag |
|------|--------|----------------|-------------|
| `physical_health` | Physical health | Required 1–10 | Allowed |
| `mental_health` | Mental health | Required 1–10 | Allowed |
| `family_relationships` | Family & relationships | Required 1–10 | Allowed |
| `social` | Social | Required 1–10 | Allowed |
| `career` | Career | Required 1–10 | Allowed |
| `learning` | Learning | Required 1–10 | Allowed |
| `leisure` | Leisure | Required 1–10 | Allowed |
| `habits` | Habits | Optional 1–10 | Allowed (show “optional”) |

Canonical order is the table order. Tie-breaks use this order.

Those slugs and labels are the constants in `src/lib/life-domains/` (ticket 2.2). Zod schema checks, validation, and the journal, check-in, and Mind UI import that module. Profile code imports `DOMAIN_FOCUS_AREAS` and `DOMAIN_FOCUS_LABELS` from the same module. The SQL checks in ticket 2.1 name the same eight slugs. They do not import the module, and this slice does not seed a `life_domains` table.

Recap chips may shorten Family & relationships to **Family**. Score rows and tag buttons use the full label.

## Week and date rules

Calendar dates are Postgres `date` values, same idea as `measurements.measured_on` (`supabase/migrations/20261009113530_add_measurements_measured_on.sql`). Do not store the journal day or the week as a UTC-midnight `timestamptz`. Display with the existing `formatCalendarDate()` (`timeZone: "UTC"`) so the label cannot shift. Reuse `src/lib/measurements/calendar-date.ts`. Do not copy it.

A week is Monday–Sunday. `week_start` is that Monday.

The client sends the user’s local today from `todayLocalISODate()`. The server accepts that date only when it is inside `[utcToday - 1 day, utcToday + 1 day]` (`maxAllowedMeasuredOn` is the upper bound already used for measurements). Week math runs on that validated date. The client does not get to pick an arbitrary `week_start`.

Pure functions (unit-tested, no database):

- `mondayOnOrBefore(isoDate)` — Monday of the week that contains that date, UTC calendar math.
- `lastCompletedWeekStart(today)` — `mondayOnOrBefore(today)` minus 7 days. This is the check-in being submitted.
- `currentIntentionWeekStart(today)` — `mondayOnOrBefore(today)`. This is the intention shown on the journal and Mind page, and the intention created as “next week” when submitting the check-in.
- `editableUntil(createdOn)` — `createdOn` plus 3 calendar days (`addUtcCalendarDays`). Text edits are allowed while validated local today is **on or before** `editable_until`.
- `editable_until` = created + 3 days, capped at the intention week's Sunday (`week_start` + 6).

Locked fixture (`today = 2026-11-03`, a Tuesday):

| Value | Date |
|-------|------|
| Monday of that week | 2026-11-02 |
| Check-in `week_start` | 2026-10-26 |
| Check-in week end | 2026-11-01 |
| Intention created for | 2026-11-02 |
| `editable_until` if created that day | 2026-11-06 |

Sunday 2026-11-01 still belongs to the in-progress week, so the check-in due that day is the previous one (`week_start` 2026-10-19). Monday 2026-11-02 makes 2026-10-26 due. Missed weeks are not backfilled: when the next Monday arrives, only the new last-completed week is due.

There is no `current_date` check in SQL. Measurements already avoided that because it is not a safe timezone boundary. The action enforces the slack window. A database trigger is the backstop for intention text after the window (ticket 2.1).

## What the user can do

### Daily journal

One row per user per `entry_on`. The screen is for **local today** only (the validated date above). Past days are history, not an editor. Saving again the same day updates that row, including the two optional lines, and replaces its tags.

- Mood: integer 1–10. Copy: “1 = rough, 10 = great”.
- Reflection: required, trimmed, 1–2000 characters.
- **One win today:** optional single-line input. Label, exact: “One win today”. Column `win`. Nullable text. Omitted, null, and whitespace-only store null, not `''`. Otherwise trim and keep 1–200 characters. Skipping it does not block save.
- **Grateful for:** optional single-line input. Label, exact: “Grateful for”. Column `grateful_for`. Same null rule and the same 200-character cap. Skipping it does not block save.
- Tags: optional, at most three, from the eight domains. Copy: “What was today mostly about? Pick up to three.” Raised from two on 2026-11-21 (Ryan): real days often span three areas. The weekly recap still shows the top two tagged domains.
- Stress and energy: optional, each 1–10, legend “1 = low, 10 = high”, after mood. Pressing the selected value again clears it. Skipped stores null. Ryan added these on 2026-11-21 so Insights can correlate daily mood, stress, energy, and training. Mood stays the only required rating.
- No sleep or domain scores on the entry.

Field order: mood, reflection, “One win today”, “Grateful for”, then domain tags. The 200-character cap is the same cap as the weekly intention body. Both are one line, not a second reflection.

The two lines use the same day rule as the reflection. The screen edits local today only. A second save the same day updates them on that row. Past days are history, not an editor. There is no extra edit window and no database trigger for these columns. The 3-day window is only for intention text (ticket 2.1). After a successful save, go to `/mind`, which shows a short “Entry saved” confirmation and the new entry at the top of history (Ryan, 2026-11-21). Until ticket 2.6 ships `/mind`, the save stays on `/mind/journal` with “Entry saved.” on that page.

[`journal-desktop.png`](../../mockups/slice_2_journal_checkin/journal-desktop.png) does not show these two inputs. This list is the approved form. Do not leave the fields out because the PNG is older.

### Relationship to Slice 7 wins

“One win today” is a lightweight optional line on that day’s journal row (`journal_entries.win`). It is not a `wins` row, not a feed, and not a life event. [PRD.md](../../PRD.md) and [LAUNCH_PLAN.md](../../LAUNCH_PLAN.md) still plan Slice 7 structured dated records (`wins` and `life_events` tables). That plan stays. Gratitude is only `journal_entries.grateful_for`. It was not a PRD object before this decision. Slice 2 does not add a wins table, a wins page, insights over these lines, AI, or reminders.

### Weekly check-in

One row per user per check-in `week_start`. A second submit for that week is rejected. This slice does not edit a submitted check-in.

Screen order matches [`checkin-desktop.png`](../../mockups/slice_2_journal_checkin/checkin-desktop.png) through the next intention, plus the Your goals bar and the notes field, which that PNG does not show. The list here is the approved order.

1. **Your week so far** — deterministic recap of journal rows whose `entry_on` falls on the seven days of the check-in week (not a rolling window that includes today). Average mood to one decimal, days journaled as “N of 7”, top two tagged domains with counts, mood sparkline. Hollow point = no entry. Caption may say “Mood, last 7 days”. Empty week: honest empty copy, not zeros. When at least one entry rated them, average daily stress and energy show beside the stress and energy inputs as a reference. They do not prefill the inputs.
2. **Last week’s intention** — the `weekly_intentions` row whose `week_start` equals this check-in week. “Did you do it?” maps Yes → `done`, Partly → `partly`, No → `not_done`. When that row does not exist (first check-in), hide the block entirely: no heading, no quoted body, and no outcome control. Required when it exists.
3. **Stress and energy** — each integer 1–10, required. Copy: “1 = low, 10 = high”. This is the overall rating for the week, kept even though the journal can rate them daily.
4. **Your goals** — read-only reminder of the profile’s free-text fitness and wellness goals, directly above the life-domain scores. “Edit in profile” goes to `/profile`. No inputs. Layout: [`G-checkin-goals-reminder.png`](../../mockups/nov_2026_tickets/G-checkin-goals-reminder.png). Both empty, and the three-line clamp, are not in that PNG. Ticket 2.4 governs them: a quiet “Add goals in your profile” link, not blank lines. Not shown on the Fitness Overview.
5. **Life domains** — seven required scores plus optional Habits, canonical order, not profile-priority order. Copy: “1 = struggling, 10 = thriving”. Profile focus areas do not affect this screen for now. [ADR-013](../../ARCHITECTURE_DECISIONS.md) is unchanged.
6. **Intention for the week of {Mon}–{Sun}** — label, exact. {Mon} is `currentIntentionWeekStart(today)` and {Sun} is that Sunday. Exactly one. Domain required, preselected to the lowest required score (Habits counts only if it was scored). Ties use canonical order. The user can change the domain before submit. Text required, 1–200 characters. Copy: “One concrete thing. Your lowest domain this week: {Label}.” Profile focus-area rank does not change this default. On 2026-11-16 Ryan rejected a proposal to preselect the top-ranked profile domain, and confirmed focus areas do not affect the check-in for now. See [`docs/mockups/nov_2026_tickets/B-checkin-journal.png`](../../mockups/nov_2026_tickets/B-checkin-journal.png).
7. **Notes** — optional, last field before submit. Prompt: “How did your training, energy and life go this week? Anything to remember?” Nullable text, at most 1000 characters. Empty is allowed and stores null. This is not a message to a coach. Nothing replies, and there is no Q&A. The Slice 5 coach report reads `notes` as context later (ADR-004). That read does not need a new column or table.

The check-in does not save a draft. Nothing is written until submit succeeds. A successful submit redirects to `/mind`.

The new intention’s `week_start` is `currentIntentionWeekStart(today)`. `created_from_checkin_id` points at the check-in that created it. `outcome` starts null. `editable_until` = created + 3 days, capped at the intention week's Sunday (`week_start` + 6).

Check-in, outcome update, and intention insert commit together (one SQL function). A failed intention insert must not leave a check-in behind. `notes` is part of that check-in insert.

Check-in history lists the owner’s past check-ins and shows `notes` when present. A null note does not render an empty block. History is read-only.

### Intention after it exists

Shown as the coral line above the journal form, and as a card on the Mind page. The row is the one whose `week_start` is `currentIntentionWeekStart(today)`.

- Domain is immutable after insert (not granted to `authenticated`, and a trigger rejects a change).
- Body text is editable from the journal line and from the Mind card only through `editable_until`, enforced in the server action and by a trigger backstop (ticket 2.1). After that date, both show the text, not a field.
- Outcome is set only by a later check-in, not by the journal line or the Mind card.

### Mind page and due card

`/mind` is one page with no tab bar (confirmed 2026-11-16; [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png) Option A). It shows a stat row, a 7-day mood trend for the seven calendar days ending on validated local today, the intention card, the check-in-due card when it is due, and journal history. The stat row is activity streak ([ADR-014](../../ARCHITECTURE_DECISIONS.md), ticket 2.5.1), average mood, domains touched, and last entry. It is not “N of 7”. The check-in recap still uses “N of 7” for days journaled in the check-in week. If the streak ticket has not merged, the Mind page omits that card rather than showing a days-journaled fraction. Layout: [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png). The PNG’s “Journal streak” label is superseded.

History reuses the measurements window from PR #52: 5 rows, then 10 more per **Show more**, **Show less** back to 5, “Showing N of M”, over one fetched page of 25. See `HISTORY_INITIAL_VISIBLE` and `HISTORY_VISIBLE_STEP` in `src/components/measurements/measurements-tab-panel.tsx`. Each entry is read-only. It shows the date, mood, tags, and the reflection clamped to about 2–3 lines, plus, when the value is non-null, the “One win today” and “Grateful for” lines under the reflection. A null line does not render an empty block. [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png) does not draw the clamp or these lines. There is no Wins list and no `/mind/wins` route. These lines are not in the stat row, the 7-day mood trend, or the check-in recap.

The due card is computed on page load. It sits under the stat row and above the 7-day mood strip. Ryan confirmed that spot on 2026-11-16. It is shown when no `weekly_check_ins` row exists for `lastCompletedWeekStart(today)`. It writes nothing and sends nothing. No notification system. The primary link goes to `/mind/check-in`. A secondary link, “Log this week’s weight”, goes to `/fitness/measurements` (ticket **NAV.1**, [issue #80](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/80)), the measurements log (`+ Log measurement` opens the current modal). NAV.1 must merge before ticket 2.7. The link does not log a weight by itself.

## Routes

| Path | Page |
|------|------|
| `/mind` | Mind home |
| `/mind/journal` | Today’s journal entry |
| `/mind/check-in` | Weekly check-in |

Add `/mind` to the middleware allowlist in `src/lib/supabase/middleware.ts`. Today only `/dashboard` and `/profile` are protected. Point the navbar **Mind** item at `/mind` (it is muted and linked to `/dashboard` in `src/components/app-header.tsx` and `src/components/mobile-nav-menu.tsx`). Insights and Community stay muted.

Do not build `/mind/domains`, Prompts, the domain-comparison screen, or a wins list. `docs/navigation-ia.md` records the single page (updated 2026-11-16). Ticket 2.9 must not put a Mind tab bar back. It still aligns the rest of the handoff pack with ADR-013.

## Data

| Table | Role |
|-------|------|
| `journal_entries` | One mood + reflection per user per calendar day, plus optional `win` and `grateful_for` (each null, or 1–200 characters) |
| `journal_entry_domains` | Zero to three domain tags |
| `weekly_check_ins` | One score row per user per Monday `week_start`, plus optional `notes` (nullable, 1–1000 characters) |
| `weekly_intentions` | One intention per user per Monday `week_start` |

Owner-scoped RLS on every new table. Zod on every action. `user_id` comes from `auth.uid()` / `getUser()`, never from the client. Database errors returned to the UI stay generic, matching `createMeasurement` rather than the raw Postgres text in `src/lib/profile/actions.ts`.

Check-in domain scores are columns on `weekly_check_ins`, not a second scores table. The set is fixed, the repo has no write-RPC pattern besides triggers, and a single row can carry real `CHECK` constraints. Tags stay a join table because they are optional and variable. Ticket 2.1 is the schema.

## Future / not this slice

- More than one intention per week
- Alcohol question
- Insights tab and cross-domain charts
- Monthly reflection
- Pre/post workout mood
- Life-event records, and a structured wins table or wins feed (Slice 7). The optional journal lines are in this slice.
- Sleep and motivation (later; not this slice)
- Diet adherence / appetite tracking (not built)
- Coach Q&A replies to check-in notes (not built; Slice 5 reads notes as context under ADR-004, and does not add a thread)
- Progress photos (remain backlog [#54](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/54); not this slice)
- Notifications, email, or push for “check-in due”
- AI prompts, summaries, theme extraction, or a coach report in this slice
- Editing or backfilling past journal days
- Soft-delete of journal rows
- Migrating `profiles.domain_priorities` again inside the journal or check-in tickets (ticket 2.9 already mapped saved values; see ADR-013)
- Wellness-wheel names on new rows

## Done criteria

- A signed-in user can save today’s journal (mood, reflection, up to three tags) and see it after refresh. A second save the same day updates the same row. A successful save lands on `/mind` with an “Entry saved” confirmation.
- “One win today” and “Grateful for” are optional. Leaving both blank still saves the entry and stores null. Mind history shows a line only when its value is non-null. There is no wins page.
- Stress and energy on the journal are optional; an entry saves without them, and clearing one stores null.
- A signed-in user can submit the check-in for the last completed week, including the recap from real journal rows, and cannot submit that week twice. There is no draft. A successful submit redirects to `/mind`. The first check-in hides the last-intention block. The intention label is “Intention for the week of {Mon}–{Sun}”.
- Optional notes may be empty. When present, check-in history shows them. Nothing replies.
- Exactly one next intention is stored. Its domain does not change later. Its text changes only through `editable_until`, from the journal line and from the Mind card.
- `/mind` is one page (no tab bar) and shows the stat row, a 7-day mood trend, history with Show more, the intention, and a due card that appears and disappears from data alone. The stat row does not show “N of 7”. Before ticket 2.5.1 merges, the streak card is omitted. Activity streak is ticket 2.5.1. A history entry is read-only and clamps the reflection to about 2–3 lines.
- Another user cannot read or write these rows. Unauthenticated requests fail.
- `npm test` covers week math, the edit lock, recap math, validation, and the main screens.
- Empty weeks and empty history do not show fake numbers. The “Example data” pill is not in the product UI.

## Notes

- Product sources of truth are the handoff pack. Ticket 2.9 aligned that pack with this folder and with ADR-013. Screen behavior for this slice stays here.
- Decision record: [ADR-013](../../ARCHITECTURE_DECISIONS.md) (Accepted) in `docs/ARCHITECTURE_DECISIONS.md`. It amends ADR-005 and keeps ADR-011’s wellbeing language (not therapy).
- Mockups: [`docs/mockups/slice_2_journal_checkin/`](../../mockups/slice_2_journal_checkin/README.md).
- Tickets: [`tickets.md`](./tickets.md).
- Brand and supportive copy: `docs/brand_style_guide.md`. Wellbeing language, not therapy (`ARCHITECTURE_DECISIONS.md` ADR-011, and ADR-013).
