# Slice 2: Journaling, Life Domains, and Weekly Check-In

## Feature Brief

Authenticated users can keep one short journal entry per calendar day, tag it with up to two life domains, and once a week score how life went, close last week’s intention, and set exactly one intention for the new week.

**This is the current slice.** Slice 1.5 closed on 2026-11-16 and `docs/LAUNCH_PLAN.md` points here. Start with ticket 2.9, then 2.1.

## Scope change (read this first)

Ryan locked this on 2026-11-03. It **disagrees** with the handoff pack. Ticket **2.9** updates the pack. Do not “fix” the disagreement by building the old PRD.

1. **Weekly check-in moves from Slice 5 into Slice 2.** Slice 2 stores the subjective check-in (recap, stress, energy, domain scores, intention outcome, next intention). Slice 5 stays the **coach report**: analytics snapshot, model call, structured sections. Slice 2 does not call a model and does not render a coach report.
2. **Life domains are Option B**, not the wellness wheel. Approved screen: [`docs/mockups/slice_2_journal_checkin/domains-compare-desktop.png`](../../mockups/slice_2_journal_checkin/domains-compare-desktop.png).
3. **The daily journal is mood plus a written reflection.** Stress and energy are check-in fields. The journal does not store domain scores. Optional tags are a join table, not `journal_domain_scores`.

`profiles.domain_priorities` still uses the seven wellness-wheel keys in `src/lib/types/profile.ts` (`DOMAIN_FOCUS_AREAS`). Journal and check-in tickets do not migrate that column. The decision record is [ADR-013](../../ARCHITECTURE_DECISIONS.md) (Proposed): Option B domains, stress and energy on the weekly check-in, that check-in in Slice 2, and exactly one weekly intention. Ticket 2.9 makes the PRD, system design, ADR-005, `docs/navigation-ia.md`, `docs/vertical_slices/tracking_setup.md`, and `DOMAIN_FOCUS_AREAS` align with and link to ADR-013, including a mapping or migration for existing users’ saved values.

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

One row per user per `entry_on`. The screen is for **local today** only (the validated date above). Past days are history, not an editor. Saving again the same day updates that row and replaces its tags.

- Mood: integer 1–10. Copy: “1 = rough, 10 = great”.
- Reflection: required, trimmed, 1–2000 characters.
- Tags: optional, at most two, from the eight domains. Copy: “What was today mostly about? Pick one or two.”
- No stress, energy, sleep, or domain scores on the entry.

Mockup: [`journal-desktop.png`](../../mockups/slice_2_journal_checkin/journal-desktop.png).

### Weekly check-in

One row per user per check-in `week_start`. A second submit for that week is rejected. This slice does not edit a submitted check-in.

Screen order matches [`checkin-desktop.png`](../../mockups/slice_2_journal_checkin/checkin-desktop.png) through the next intention, plus the Your goals bar and the notes field, which that PNG does not show. The list here is the approved order.

1. **Your week so far** — deterministic recap of journal rows whose `entry_on` falls on the seven days of the check-in week (not a rolling window that includes today). Average mood to one decimal, days journaled as “N of 7”, top two tagged domains with counts, mood sparkline. Hollow point = no entry. Caption may say “Mood, last 7 days”. Empty week: honest empty copy, not zeros.
2. **Last week’s intention** — the `weekly_intentions` row whose `week_start` equals this check-in week. “Did you do it?” maps Yes → `done`, Partly → `partly`, No → `not_done`. Hidden when that row does not exist (first check-in). Required when it exists.
3. **Stress and energy** — each integer 1–10. Copy: “1 = low, 10 = high”.
4. **Your goals** — read-only reminder of the profile’s free-text fitness and wellness goals, directly above the life-domain scores. “Edit in profile” goes to `/profile`. No inputs. Layout: [`G-checkin-goals-reminder.png`](../../mockups/nov_2026_tickets/G-checkin-goals-reminder.png). Both empty, and the three-line clamp, are not in that PNG. Ticket 2.4 governs them: a quiet “Add goals in your profile” link, not blank lines. Not shown on the Fitness Overview.
5. **Life domains** — seven required scores plus optional Habits, canonical order, not profile-priority order. Copy: “1 = struggling, 10 = thriving”. Profile focus areas do not affect this screen for now. [ADR-013](../../ARCHITECTURE_DECISIONS.md) is unchanged.
6. **Intention for next week** — exactly one. Domain required, preselected to the lowest required score (Habits counts only if it was scored). Ties use canonical order. The user can change the domain before submit. Text required, 1–200 characters. Copy: “One concrete thing. Your lowest domain this week: {Label}.” Profile focus-area rank does not change this default. On 2026-11-16 Ryan rejected a proposal to preselect the top-ranked profile domain, and confirmed focus areas do not affect the check-in for now. See [`docs/mockups/nov_2026_tickets/B-checkin-journal.png`](../../mockups/nov_2026_tickets/B-checkin-journal.png).
7. **Notes** — optional, last field before submit. Prompt: “How did your training, energy and life go this week? Anything to remember?” Nullable text, at most 1000 characters. Empty is allowed and stores null. This is not a message to a coach. Nothing replies, and there is no Q&A. The Slice 5 coach report reads `notes` as context later (ADR-004). That read does not need a new column or table.

The new intention’s `week_start` is `currentIntentionWeekStart(today)`. `created_from_checkin_id` points at the check-in that created it. `outcome` starts null. `editable_until` is the validated create date plus 3 days.

Check-in, outcome update, and intention insert commit together (one SQL function). A failed intention insert must not leave a check-in behind. `notes` is part of that check-in insert.

Check-in history lists the owner’s past check-ins and shows `notes` when present. A null note does not render an empty block. History is read-only.

### Intention after it exists

Shown as the coral line above the journal form, and as a card on the Mind page. The row is the one whose `week_start` is `currentIntentionWeekStart(today)`.

- Domain is immutable after insert (not granted to `authenticated`, and a trigger rejects a change).
- Body text is editable only through `editable_until`, enforced in the server action and by a trigger backstop (ticket 2.1).
- Outcome is set only by a later check-in, not by the journal line.

### Mind page and due card

`/mind` is one page with no tab bar (confirmed 2026-11-16; [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png) Option A). It shows a stat row, a 7-day mood trend for the seven calendar days ending on validated local today, the intention card, the check-in-due card when it is due, and journal history. The stat row is activity streak ([ADR-014](../../ARCHITECTURE_DECISIONS.md), ticket 2.5.1), average mood, domains touched, and last entry. It is not “N of 7”. The check-in recap still uses “N of 7” for days journaled in the check-in week. If the streak ticket has not merged, the Mind page omits that card rather than showing a days-journaled fraction. Layout: [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png). The PNG’s “Journal streak” label is superseded.

History reuses the measurements window from PR #52: 5 rows, then 10 more per **Show more**, **Show less** back to 5, “Showing N of M”, over one fetched page of 25. See `HISTORY_INITIAL_VISIBLE` and `HISTORY_VISIBLE_STEP` in `src/components/measurements/measurements-tab-panel.tsx`.

The due card is computed on page load. It sits under the stat row and above the 7-day mood strip. Ryan confirmed that spot on 2026-11-16. It is shown when no `weekly_check_ins` row exists for `lastCompletedWeekStart(today)`. It writes nothing and sends nothing. No notification system. The primary link goes to `/mind/check-in`. A secondary link, “Log this week’s weight”, goes to `/fitness/measurements` (ticket **NAV.1**), the measurements log (`+ Log measurement` opens the current modal). The link does not log a weight by itself.

## Routes

| Path | Page |
|------|------|
| `/mind` | Mind home |
| `/mind/journal` | Today’s journal entry |
| `/mind/check-in` | Weekly check-in |

Add `/mind` to the middleware allowlist in `src/lib/supabase/middleware.ts`. Today only `/dashboard` and `/profile` are protected. Point the navbar **Mind** item at `/mind` (it is muted and linked to `/dashboard` in `src/components/app-header.tsx` and `src/components/mobile-nav-menu.tsx`). Insights and Community stay muted.

Do not build `/mind/domains`, Prompts, or the domain-comparison screen. `docs/navigation-ia.md` records the single page (updated 2026-11-16). Ticket 2.9 must not put a Mind tab bar back. It still aligns the rest of the handoff pack with ADR-013.

## Data

| Table | Role |
|-------|------|
| `journal_entries` | One mood + reflection per user per calendar day |
| `journal_entry_domains` | Zero to two domain tags |
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
- Wins, gratitude, life events
- Sleep and motivation (later; not this slice)
- Diet adherence / appetite tracking (not built)
- Coach Q&A replies to check-in notes (not built; Slice 5 reads notes as context under ADR-004, and does not add a thread)
- Progress photos (remain backlog [#54](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/54); not this slice)
- Notifications, email, or push for “check-in due”
- AI prompts, summaries, theme extraction, or a coach report in this slice
- Editing or backfilling past journal days
- Soft-delete of journal rows
- Migrating `profiles.domain_priorities` inside the journal or check-in tickets (the mapping or migration is ticket 2.9, with ADR-013)
- Wellness-wheel names on new rows

## Done criteria

- A signed-in user can save today’s journal (mood, reflection, up to two tags) and see it after refresh. A second save the same day updates the same row.
- Stress and energy are not on the journal.
- A signed-in user can submit the check-in for the last completed week, including the recap from real journal rows, and cannot submit that week twice.
- Optional notes may be empty. When present, check-in history shows them. Nothing replies.
- Exactly one next intention is stored. Its domain does not change later. Its text changes only through `editable_until`.
- `/mind` is one page (no tab bar) and shows the stat row, a 7-day mood trend, history with Show more, the intention, and a due card that appears and disappears from data alone. The stat row does not show “N of 7”. Activity streak is ticket 2.5.1.
- Another user cannot read or write these rows. Unauthenticated requests fail.
- `npm test` covers week math, the edit lock, recap math, validation, and the main screens.
- Empty weeks and empty history do not show fake numbers. The “Example data” pill is not in the product UI.

## Notes

- Product sources of truth are still the handoff pack. Where this folder disagrees, **this folder is what to build**, and ticket 2.9 is what to change in the pack before or as the slice starts.
- Decision record: [ADR-013](../../ARCHITECTURE_DECISIONS.md) (Proposed) in `docs/ARCHITECTURE_DECISIONS.md`. It amends ADR-005 and keeps ADR-011’s wellbeing language (not therapy).
- Mockups: [`docs/mockups/slice_2_journal_checkin/`](../../mockups/slice_2_journal_checkin/README.md).
- Tickets: [`tickets.md`](./tickets.md).
- Brand and supportive copy: `docs/brand_style_guide.md`. Wellbeing language, not therapy (`ARCHITECTURE_DECISIONS.md` ADR-011, and ADR-013).
