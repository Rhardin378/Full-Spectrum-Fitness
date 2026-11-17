# Nov 16, 2026 tickets (copy to GitHub issues)

Use each section below as one GitHub issue, in the order in [`README.md`](./README.md). Do not open the issues from this docs change. Do not edit issues #55 or #56. How they map is in the README.

Mockups: [`docs/mockups/nov_2026_tickets/`](../../mockups/nov_2026_tickets/README.md). Scope gates are defined in the README. **D** and **E** items are [Future ideas](#future-ideas), not issues to start.

Labels use the existing set in [`docs/vertical_slices/tracking_setup.md`](../tracking_setup.md). This folder does not add a new slice label.

---

## Ticket 2.5.1: Activity streak

**Type:** feature  
**Priority:** P1  
**Labels:** `frontend`, `backend`, `ui`, `tests`  
**Scope gate:** A — required MVP

### Goal

Ship one activity streak, computed on the server from calendar days, and show it as the first stat on `/mind`.

### Scope

The rule is [ADR-014](../../ARCHITECTURE_DECISIONS.md). Implement that rule. Do not store a streak counter. Recompute it from source rows on the server. The page receives the number. It does not derive the number in the client.

**Hit dates.** A pure function unions calendar dates. A journal `entry_on` is a hit. When a workout row has a calendar day (the same kind of date as `entry_on` / `measured_on`), that day is a hit too. The same day from both sources is one hit. Until that workout date exists, pass journal dates only. Do not invent workout rows.

**Streak function.** Pure, no clock and no database. Inputs are `today` (`YYYY-MM-DD`) and the hit dates on or before `today`. Hits after `today` are ignored. Return the day count and whether the current Monday–Sunday week still has its grace day (`0`, `1`, or hidden when the count is 0). Week boundaries use the same Monday rule as Slice 2 (`mondayOnOrBefore` in the slice README). Put the function next to the other calendar helpers. Do not copy `src/lib/measurements/calendar-date.ts`.

**Mind card.** On `/mind`, the first stat is **Activity streak**. Ticket 2.6 leaves this slot. This ticket fills it.

- Count is an integer. Copy: “1 day” or “N days”.
- When the count is 0, do not show a grace line. Empty copy, until workouts exist: “Log a journal entry to start a streak.” After a workout calendar day exists, add “or a workout” to that sentence.
- When the count is at least 1, subtitle: “1 grace day left this week” or “No grace day left this week.” A second line says what counts: “Journal counts” until workouts exist, then “Journal or workout counts.”
- Do not label the card “Journal streak”. Do not show “N of 7” in this slot. The check-in recap keeps its own “N of 7”.

The loader uses the same validated local `today` as the Mind page (Slice 2 slack window). The pure function does not re-check that window.

Ship unit tests in this ticket. Run them under `TZ=America/Chicago` and `TZ=UTC` the way the measurement calendar tests do. The function takes date strings, so the clock should not change the result. Include:

| Today | Hits on or before today | Days | Grace left |
|-------|-------------------------|------|------------|
| 2026-11-12 | 11-09, 11-10, 11-11, 11-12 | 4 | 1 |
| 2026-11-12 | 11-09, 11-10, 11-12 (miss 11-11) | 3 | 0 |
| 2026-11-12 | 11-11, 11-12 (miss 11-09 and 11-10) | 2 | 0 |
| 2026-11-12 | 11-06, 11-07, 11-10, 11-11, 11-12 (miss 11-08 and 11-09) | 5 | 0 |
| 2026-11-12 | 11-09, 11-10, 11-11 (today open) | 3 | 1 |
| 2026-11-12 | 11-09, 11-10 (today open, 11-11 missed) | 2 | 0 |
| 2026-11-12 | none | 0 | hidden |
| 2026-11-09 | none (Monday, today open) | 0 | hidden |
| 2026-11-09 | 11-09 only | 1 | 1 |
| 2026-11-09 | 11-06 and 11-09 (miss 11-07 and 11-08) | 1 | 1 |
| 2026-11-09 | 11-06, 11-07, 11-09 (miss 11-08 only) | 3 | 1 |
| 2026-11-12 | 11-12, plus a hit on 11-13 | 1 | 1 |

Also assert `mondayOnOrBefore(2026-11-01) = 2026-10-26` and `mondayOnOrBefore(2026-11-02) = 2026-11-02`, the Slice 2 Sunday/Monday fixture. A set-builder test: the same calendar day from journal and workout is one hit, and an empty workout list leaves the journal dates unchanged.

The F and D mockups show sample streak numbers (9 days, 5 days). Those PNGs are not expected values.

### Out of scope

- A second streak (journal-only, workout-only, or “days journaled”).
- Persisting the streak, badges, notifications, or a grace-day explanation modal.
- Changing the check-in recap’s “N of 7”.
- The Fitness Overview card. **OV.1** reuses this function. Do not turn Overview on here.
- Workout logging. This ticket only reads a calendar day once the workouts slice has one.

### Acceptance Criteria

- The unit tests above pass, including a week that forgives one miss and a week that stops on the second miss.
- Sunday and the following Monday can both be misses without ending the streak, because they fall in different `week_start` weeks.
- A day before the user’s earliest hit is not a miss and does not use the grace day.
- Today with no log does not add a day and does not use grace. A missed yesterday can use grace.
- `/mind` shows Activity streak from the server result. It does not show “N of 7” or “Journal streak”.
- With no workout calendar day in the product, only journal dates change the number.
- A signed-out caller does not get another user’s dates. The loader uses the session user.

### Dependencies

- Ticket 2.6 for the `/mind` slot and the protected route. The pure function can land first.
- Journal `entry_on` from Slice 2. Workout dates are an input only after they exist.

### Mockups

- [`D-mind-home.png`](../../mockups/nov_2026_tickets/D-mind-home.png) — first stat. Replace the “Journal streak” label.
- [`F-fitness-overview.png`](../../mockups/nov_2026_tickets/F-fitness-overview.png) — same number, later, on Overview. Not built here.
- [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png) — Option A is the page this card sits on.

### Suggested GitHub title

`[Slice 2.5] Add the activity streak`

---

## Ticket 2.5.2: Weight now card

**Type:** feature  
**Priority:** P1  
**Labels:** `frontend`, `backend`, `ui`, `measurements`, `tests`  
**Scope gate:** B — supporting

### Goal

Show the latest weight, how long ago it was logged, and the change over 30 calendar days, with an honest empty state.

### Scope

One card, fed by the signed-in user’s weight rows (`measurement_type = weight`, not deleted). Calendar dates use `measured_on` and the existing formatters. Do not age the row from `measured_at` or `created_at`.

**Latest.** The newest `measured_on`. Tie on the same day: the row the measurements list already treats as latest. Show the value and the unit as stored. Do not convert lb/kg.

**Relative time.** Calendar days from the validated local `today` to that `measured_on`. Copy: “Logged today”, “Logged yesterday”, or “Logged N days ago”, then the formatted date, as in A: “Logged 2 days ago · Nov 10”. A future `measured_on` inside the existing slack window still uses the day count (it can be “Logged today” only when the dates are equal).

**30-day change.** Pure function. Anchor is the latest `measured_on`. Baseline is the latest weight on or before anchor minus 30 calendar days (`addUtcCalendarDays(anchor, -30)`). Delta is latest minus baseline, in the stored unit. Display one decimal, half away from zero, with a leading minus for a decrease: “−3.1 lb over 30 days”. No baseline on or before that lookback: omit the line. Do not substitute a newer point and still say “over 30 days”.

**Toward a goal.** When an active weight goal exists (ticket **G.1**) and its unit matches the latest row, the delta uses the positive-change pill if the sign moves toward the target (down when the target is lower, up when the target is higher). The pill fill is `#4ADE80` and the text on it is `text-primary` (`#1A1A1A`). See `docs/brand_style_guide.md`. A change that moves away from the target, or a zero change, is muted text, not the green pill, and not red. When no goal exists yet, show the signed delta in muted text, not green. “Positive” is not defined without a target.

**To goal.** When that same active goal exists and the units match, show the remaining distance in the stored unit: “4.2 lb to goal”. Distance is the absolute difference while the latest value has not reached the target in the goal direction. When it has, show “At your goal” and do not show a negative distance. Charcoal text (`text-primary`), not green and not small coral type (the brand guide already avoids small coral on white). No goal, or a unit mismatch: omit the phrase. Do not convert.

**Empty.** No weight rows: the A empty state. Heading “No weight logged yet.” Body: “Log a measurement to see your latest weight and the change over 30 days.” Button “Log measurement” opens the existing log modal. It does not insert a row by itself.

**Where it renders.** Ryan confirmed this on 2026-11-16. Until **OV.1**, the card is at the top of the Measurements tab. OV.1 moves this same card onto Overview and removes it from Measurements. One place only. Not in the welcome band. Do not turn the Overview tab on in this ticket.

Tests for the pure date math: relative copy for 0, 1, and 2 days; a baseline exactly 30 days back; a history shorter than 30 days omits the line; rounding half away from zero (`1.25` → `1.3`, `-1.25` → `-1.3`); toward-goal vs away-from-goal; unit mismatch omits “to goal”.

### Out of scope

- Waist on this card. Waist progress is **G.2**, on the profile row.
- The A “Goal progress” panel (three bars). Not this card, and not the approved Overview.
- Editing the weight from the card. Logging stays the existing modal.
- A welcome-band stat row (#55’s original placement).

### Acceptance Criteria

- A user with a weight sees the value, the unit, the relative day line, the date, the 30-day line when a baseline exists, and the goal line only when **G.1** has a matching active goal.
- A user with no weight sees the empty state, and the button does not insert a measurement.
- The 30-day line is absent when every earlier weight is more recent than 30 days before the latest.
- Green is the pill fill with charcoal text, and only when the 30-day change moves toward the active goal.
- Another user’s measurements are not read. Deleted weights are not the latest.

### Dependencies

- Slice 1.5 measurements (shipped).
- **G.1** only for the “to goal” line and the toward-goal color. The card ships without that line if G.1 has not merged.
- Placement is the Measurements tab until **OV.1**. That order is confirmed.

### Mockups

- [`A-dashboard-overview.png`](../../mockups/nov_2026_tickets/A-dashboard-overview.png) — card content and empty state. The rest of A is not this ticket.
- [`F-fitness-overview.png`](../../mockups/nov_2026_tickets/F-fitness-overview.png) — the same card in the Overview grid, later (**OV.1**).

### Suggested GitHub title

`[Slice 2.5] Add the Weight now card`

---

## Ticket G.1: Structured goals on the profile

**Type:** feature  
**Priority:** P1  
**Labels:** `database`, `backend`, `frontend`, `validation`, `ui`, `tests`  
**Scope gate:** A — required MVP

### Goal

Let the user save a weight goal, a waist goal, and a weekly workout count on the profile. A body-metric goal is a target number plus a deadline. A fast pace warns, and the user can keep the date.

### Scope

**What a goal is.** Three types in this ticket: `weight`, `waist`, `workouts_per_week`. One active goal per type, matching C. The free-text `fitness_goal` and `wellness_goal` stay. They are not replaced and not parsed into these numbers.

Body metrics:

- Target number, positive, in `lb` or `kg` for weight and `in` or `cm` for waist. No unit conversion.
- Deadline, a calendar `date`, required, on or after the validated local today. A past deadline is a field error, not the realism warning.
- Start date, a calendar `date`, shown on the form, defaulting to validated today, and not after the deadline.
- Active toggle. Saving an active goal for a type deactivates the previous active goal of that type. An inactive goal is kept and is hidden from “to goal”, the Overview hero, and the warning’s “current goal” reads.

Weekly workout count:

- Integer from 1 to 14. Ryan confirmed the cap on 2026-11-16.
- No deadline. It is a standing weekly target. Ryan confirmed that. The Overview hero resets every Monday. C shows “None” on that row.
- Start date and active toggle, same as the other rows.
- The count can be saved before any workout exists. Nothing compares it to logged workouts until **OV.1**.

**Where.** A Goals section on `/profile`, after experience level and before life-domain priorities, as on C. `id="goals"` so **OV.1** can link to `/profile#goals`. Each row shows target, start date, deadline (weight and waist only), and the active toggle. Workouts per week does not show a deadline field.

**Storage.** A small owner-scoped table, not new columns on the free-text goals. Follow the measurements grant style: RLS with `(select auth.uid()) = user_id`, `revoke all` from `anon`, then only the commands `authenticated` needs. `user_id` comes from the session. Zod `.strict()` on the action. Generic database errors, not Postgres text. This docs ticket does not add the migration. The implementation ticket does.

**Realism warning.** A pure function. No model call ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). It runs when a weight or waist goal is saved or the deadline changes. It does not run for the workout count.

- Current value is the latest non-deleted measurement of that type whose unit matches the goal. No such row: no warning.
- Weeks are the calendar days from validated today to the deadline, divided by 7. A deadline seven days out is one week. A deadline of today is zero weeks. Weekly pace is `abs(target - latest) / latest`, divided by that week count. Do not divide by zero: a deadline of today with a non-zero gap warns immediately.
- Thresholds, confirmed 2026-11-16: `0.01` for weight and `0.005` for waist. At the threshold does not warn. Over it does. A clearly-over case and a clearly-under case are both required, plus one pace that lands on the threshold and stays quiet.
- Suggested date: `ceil(abs(target - latest) / (latest * threshold))` whole weeks after today (`addUtcCalendarDays`). When that value is already a whole number of weeks, the suggested day is that many weeks out (the pace equals the threshold, so that day does not warn). Target equal to latest: no warning and no suggested date. Show the day with `formatCalendarDate`. If the user picks that day or a later one, the note goes away.
- Weight threshold: **1% of the latest body weight per week** (`0.01`). Confirmed.
- Waist threshold: **0.5% of the latest waist per week** (`0.005`). Confirmed.
- At or under the threshold: no warning.
- Over the threshold: inline note. Save stays enabled. The user may keep the date. Do not add a second confirm step and do not reject the save.
- Copy is supportive and non-medical ([ADR-011](../../ARCHITECTURE_DECISIONS.md)). Name the pace in plain language (“about 1% of your weight each week”). Do not say unsafe, unhealthy, dangerous, obese, or tell them to see a doctor. Do not prescribe a diet or a training plan. Example shape, not locked wording: “That’s a quick change for the time you picked. A date around {suggested} keeps it closer to about 1% of your weight each week. You can keep {deadline}.” Waist uses the confirmed waist threshold in the same shape.

The pace uses the latest measurement and the deadline, not the start date. Ryan confirmed that on 2026-11-16.

Tests: deadline required for weight and waist; workout count rejects 0 and 15 and accepts 1 and 14; past deadline fails; warning fires above the threshold and not at it; missing measurement skips the warning; save still persists the fast date; suggested date is on the threshold pace; a unit mismatch skips the warning; a second active weight goal leaves only one active.

### Out of scope

- Lift or exercise goals (Future ideas). They wait until workouts exist.
- LLM-written goal suggestions (Future ideas, Coach slice).
- Progress bars on the dashboard. **G.2** and **OV.1** read these rows.
- Migrating old free text into structured goals.
- Editing goal history as its own screen. One active row per type is enough.

### Acceptance Criteria

- A signed-in user can save an active weight goal, waist goal, and weekly count, reload `/profile`, and see them.
- Weight and waist without a deadline do not save. A workout count does not require one.
- A pace faster than the confirmed threshold shows the note and still saves, including when the user keeps the original date.
- A pace at or under the threshold shows no note.
- Copy does not diagnose, prescribe, or block the date.
- A signed-out caller cannot write goals. One user cannot read another’s goals.
- Free-text fitness and wellness goals still save as they do now.

### Dependencies

- Slice 1 profile. Measurements for the warning’s “latest” value. The warning is silent when there is no matching measurement, so this ticket is not blocked on new measurement work.
- Sequence: after Slice 2.5, before **OV.1**. The hero needs the weekly count.

### Mockups

- [`C-profile.png`](../../mockups/nov_2026_tickets/C-profile.png) — the Goals block. Ignore “optional” on the weight and waist target dates.

### Suggested GitHub title

`[Goals] Save structured goals on the profile`

---

## Ticket G.2: Goal progress on the surfaces that already show the metric

**Type:** feature  
**Priority:** P2  
**Labels:** `frontend`, `ui`  
**Scope gate:** B — supporting

### Goal

Show how far the current number is from the active goal, on the profile and on the weight card, without a new dashboard panel.

### Scope

Depends on **G.1**. Uses the same remaining-distance rule as **2.5.2** (absolute gap until the target is reached in the goal direction, then “At your goal”). Units must match. No conversion.

- **Profile.** Each active weight and waist row shows the latest matching measurement, the remaining distance, and the deadline. No matching measurement: “No {weight|waist} logged yet”, and no fake zero. An inactive goal does not show a remaining distance.
- **Weight now card.** If **2.5.2** has not already rendered “X lb to goal”, add that line under the same rules. Do not build a second weight card.
- **Weekly count on the profile.** Show the target. Do not show “this week” counts here. **OV.1** is the workout comparison. Before workouts exist, the row does not imply workouts were logged.

Do not build the three-bar Goal progress panel on A. F replaced that Overview. Do not add a waist twin of the Weight now card.

### Out of scope

- The Overview hero (**OV.1**).
- Lift progress.
- Charts, forecasts, or coach copy about the goal.

### Acceptance Criteria

- With an active weight goal and a matching latest weight, the profile row and the Weight now card show the same remaining distance.
- A waist goal shows remaining distance on the profile row only.
- No measurement, no goal, or a unit mismatch: no invented number.
- The A Goal progress panel is not on the Fitness shell.

### Dependencies

- **G.1**
- **2.5.2** for the weight card line. The profile waist and weight lines do not wait on Overview.

### Mockups

- [`C-profile.png`](../../mockups/nov_2026_tickets/C-profile.png) — the rows that gain a current-vs-target line.
- [`A-dashboard-overview.png`](../../mockups/nov_2026_tickets/A-dashboard-overview.png) — the Goal progress panel is the layout **not** to build. The “4.2 lb to goal” phrase on the weight card is the phrase to reuse.

### Suggested GitHub title

`[Goals] Show remaining distance on profile and Weight now`

---

## Ticket G.3: Profile field cleanup

**Type:** chore  
**Priority:** P2  
**Labels:** `frontend`, `ui`  
**Scope gate:** B — supporting

### Goal

Make the profile tell the truth about fields that are not live yet, and match the ranked domain list on C once Option B domains exist.

### Scope

Small. The profile page shell (title, display name, back link, save) stays.

**Sharing preference.** Social is not Phase 1 ([ADR-007](../../ARCHITECTURE_DECISIONS.md)). The control stays visible, shows the saved value, and does not accept a new choice. Helper, from C: “Coming later — social features are not in Phase 1, so this setting is labeled and left inactive.” Do not drop the column, do not clear saved values, and do not add friends or a public profile.

**Experience level.** Keep the select. It is stored and not read by measurements today, and workout defaults do not exist yet. Helper: “Workouts will use this for defaults when that slice ships.” Do not claim it changes measurement guidance. Do not build those defaults in this ticket.

**Life-domain ranker.** After ticket **2.9** has switched `DOMAIN_FOCUS_AREAS` to the ADR-013 set, show all eight domains as a fixed ranked list, lower number = higher priority, as on C. Do not keep the add/remove rows. Do not do this restyle while the wheel slugs are still the list. This ticket does not write the 2.9 mapping or migration.

**Free-text goals.** Leave the textareas. They stay editable only here. Ticket 2.4 shows them read-only on the weekly check-in. Do not add the helper “Shown on the dashboard Overview.” Helper, if one is added: “Shown on the weekly check-in.” Do not put the text on Overview.

### Out of scope

- Structured goals (**G.1** owns that section).
- The domain-slug migration (ticket 2.9).
- Deleting sharing preferences or experience level.
- A Your goals card on Overview.

### Acceptance Criteria

- The sharing control cannot be changed to a new value. The helper is visible. A previously saved value still loads.
- The experience helper does not say the field changes measurement copy.
- Before ticket 2.9, the ranker is unchanged. After 2.9, the profile lists the eight Option B domains with ranks, and a save still round-trips `domain_priorities`.
- Free-text goals still save, and Overview does not gain a Your goals card from this ticket.

### Dependencies

- None for the sharing control and the experience helper.
- Ticket 2.9 before the ranker restyle.

### Mockups

- [`C-profile.png`](../../mockups/nov_2026_tickets/C-profile.png) — sharing helper, experience helper, ranked domains. The Goals block is G.1. The “Shown on the dashboard Overview” lines are superseded: free-text goals show on the weekly check-in (ticket 2.4), not on Overview.

### Suggested GitHub title

`[Profile] Mark inactive fields and rank life domains`

---

## Ticket NAV.1: Move Fitness to `/fitness`

**Type:** feature  
**Priority:** P1  
**Labels:** `frontend`, `ui`, `tests`  
**Scope gate:** B — supporting

### Goal

Make `/fitness` the Fitness URL, and send `/dashboard` there permanently without dropping the query string.

### Scope

Ryan confirmed the map on 2026-11-16. This ticket does the move. It does not build Overview, workouts, or the library.

**Paths.**

| Path | What it shows |
|------|----------------|
| `/fitness` | Fitness shell. Until **OV.1**, the selected tab is Measurements, which is today’s home, so sign-in does not land on a coming-soon panel. The address stays `/fitness`. |
| `/fitness/measurements` | Measurements tab. Same screen as today’s working tab. |
| `/fitness/workouts` | Workouts tab. Coming soon, as it is now. |
| `/fitness/library` | Library tab. Coming soon. Content waits for Slice 3.1. |

The tab follows the URL. Choosing a tab updates the URL. Overview content stays the coming-soon panel until OV.1. OV.1 then fills `/fitness`. It does not move the route again.

**Redirect.** `/dashboard` and any path under it permanently redirect to the same path with `/fitness` in place of `/dashboard`. Use a 308 so the method is unchanged. Keep the query string: `/dashboard?foo=1` becomes `/fitness?foo=1`. `/dashboard/settings` becomes `/fitness/settings`.

**Auth.** A signed-out visit to `/dashboard` or `/fitness` ends on `/auth`, including `?reason=` when the middleware already adds one. The redirect must not skip that check and must not loop. A signed-in visit to `/dashboard` ends on `/fitness` with the query string kept. A signed-in visit to `/auth` still leaves the sign-in form; the destination becomes `/fitness` instead of `/dashboard` (`DEFAULT_SIGNED_IN_PATH` in `src/lib/auth/redirect.ts`).

**Protection.** In `src/lib/supabase/middleware.ts`, the protected list that is `/dashboard` today becomes `/fitness`. Prefix matching covers the child paths. `/profile` stays protected. `/mind` stays ticket 2.6.

**Links and active state.** Point Fitness in `src/components/app-header.tsx` and `src/components/mobile-nav-menu.tsx` at `/fitness`. Fitness is active on `/fitness` and on paths under it. Muted Insights and Community placeholders must not keep `href="/dashboard"`. The profile “Back to dashboard” link (`src/app/(main)/profile/page.tsx`) goes to `/fitness`. Post-reset and post-sign-in navigations that hard-code `/dashboard` go to `/fitness` (`src/components/auth/auth-form.tsx`, `src/components/auth/update-password-form.tsx`, `src/app/auth/callback/route.ts`). Move the page file off `src/app/(main)/dashboard/page.tsx`. `getOrCreateProfile()` still runs for a signed-in visit to the Fitness shell.

**Tests.** Update the cases that expect `/dashboard`, including the middleware tests, `src/app/auth/callback/route.test.ts`, `src/components/auth/auth-form.test.ts`, `src/components/auth/update-password-form.test.tsx`, and `src/components/app-header.test.tsx`. Add: signed-in `/dashboard?foo=1` lands on `/fitness?foo=1`; signed-out `/dashboard` and `/fitness` land on `/auth`; Fitness is active on `/fitness/measurements`.

Until OV.1, do not turn Overview into a live home. This ticket only changes where the existing shell lives.

### Out of scope

- Overview content (**OV.1**).
- Workout logging (Slice 3; no ticket folder yet).
- Library content (Slice 3.1).
- Last-visited domain memory. Sign-in lands on `/fitness`. Remembering Mind versus Fitness is still unplanned.
- Renaming historical Slice 1.5 tickets. They correctly describe what shipped at `/dashboard`.

### Acceptance Criteria

- A signed-in user who opens `/dashboard?foo=1` is at `/fitness?foo=1`, and the Measurements tab is selected until OV.1.
- A signed-out user who opens `/dashboard` or `/fitness` is at `/auth`.
- `/fitness/measurements` shows Measurements. `/fitness/workouts` and `/fitness/library` show the existing coming-soon panels.
- The navbar Fitness item points at `/fitness` and is active on that tree.
- No in-app link still targets `/dashboard` as a page the user stays on.
- The new and updated tests pass.

### Dependencies

- CU.3 is merged in #64, including the hosted Supabase settings. Nothing else blocks this ticket. Can start beside Slice 2. Must land before **OV.1**, and must merge before Slice 2 ticket 2.7 so the check-in due card can link to `/fitness/measurements`.

### Mockups

None. The shell does not change shape.

### Suggested GitHub title

`[Nav] Move the Fitness shell to /fitness`

---

## Ticket OV.1: Fitness Overview tab

**Type:** feature  
**Priority:** P1  
**Labels:** `frontend`, `ui`  
**Scope gate:** A — required MVP

### Goal

Turn the Fitness Overview tab on with the workouts slice, using the F layout and live data.

### Scope

Overview stays `comingSoon` until the workouts slice can log a workout that has a calendar day and a display name. This ticket does not define that model ([ADR-009](../../ARCHITECTURE_DECISIONS.md)) and does not ship sample workouts. It reads what the workouts slice stores and what measurements already store. The shell already lives at `/fitness` (**NAV.1**). This ticket fills `/fitness`. It does not rename the route.

**Welcome band, Overview tab only.** Primary **+ Log workout** (the workouts slice’s log action). Secondary **+ Log measurement** (the existing modal). Subtitle stays “Track training and baseline progress”. Other tabs keep the tab-aware CTA rules in `docs/navigation-ia.md`. Slice 1.5’s “no log buttons except on Measurements” rule ends for Overview only when this tab turns on.

**Hero — weekly workout goal.** The current Monday–Sunday week, `mondayOnOrBefore(validated today)` through Sunday. “Resets Monday” means the next Monday is a new count.

- Count is workouts whose calendar day falls in that week, not distinct days. Two workouts on Monday count as two. Day dots are Monday through Sunday. A dot is filled when that day has at least one workout. A journal entry does not fill a dot. Future days in the week are empty, not marked missed.
- With an active `workouts_per_week` goal (**G.1**): “{count} of {target} workouts this week”, a ring filled to `min(count / target, 1)`, and the goal link **Edit goal** to `/profile#goals`. Under the target: “{n} more to hit your goal, resets Monday” while `count < target`, or “Goal met, resets Monday” when `count >= target`. Over the target still says the real count (“5 of 4 workouts this week”) and “Goal met”. No shame copy.
- With no active goal: “{count} workouts this week”, the dots, “Resets Monday”, and a link **Set a weekly goal** to `/profile#goals`. No ring target and no “N more”. Do not invent a target of 4.

**Activity streak.** The **2.5.1** card. Do not compute a different streak.

**Weight now.** The **2.5.2** card, moved here from the top of Measurements. It is not on both. `/fitness/measurements` no longer shows it.

**Recent activity.** The latest 6 items, newest first, mixing workouts and weight/waist measurements. Each row: a calendar label (Today, Yesterday, or the formatted day), the title the source already has, and a type label (Workout, Weight, Waist) in `text-muted`. Do not use small coral type for that label. The brand guide avoids it on white. Links **View workouts** and **View measurements** go to `/fitness/workouts` and `/fitness/measurements`. Empty list: short honest copy and the two log buttons. No Alex Sample rows.

**Mobile.** The F phone frame: hero, then streak and weight, then recent activity, then the same two links. Buttons stack. Do not add a bottom nav.

Library and the Workouts tab are not turned on by this ticket, except that **View workouts** needs the Workouts tab the workouts slice provides. If that tab is not ready, this ticket is blocked. Do not link to a coming-soon panel and call Overview done.

### Out of scope

- The compact Mind card at the bottom of E and the LATER block on F. Future ideas.
- The A layout: Goal progress panel, Your goals free-text card, PRs / consistency, a separate journal streak, Mind stats on this page.
- Building the workout logger, the exercise library, or Slice 3.1 import.
- PRs, volume, or other Slice 4 analytics.
- Moving or renaming `/fitness`. **NAV.1** already did that. `/dashboard` already redirects.

### Acceptance Criteria

- Before the workouts slice can log a workout, Overview still shows coming soon. This ticket does not merge a live Overview ahead of that.
- With workouts and an active weekly goal, the hero count, the ring, the dots, and the “resets Monday” line match the current Monday–Sunday week and ignore other weeks.
- A day with a journal entry and no workout is an empty dot.
- No weekly goal: the hero has no invented target, and the set-goal link goes to `/profile#goals`.
- Recent activity shows workouts and measurements for the signed-in user only, newest first, with both view links.
- Streak and Weight now match tickets 2.5.1 and 2.5.2. Weight now is not also on Measurements.
- The LATER Mind card and the PRs card are absent.
- Desktop and the phone-width layout both show the hero, streak, weight, and the list.

### Dependencies

- Workouts slice: a logged workout with a calendar day and a title, and a Workouts tab to open.
- **NAV.1**. The Overview tab turns on at `/fitness`, not at `/dashboard`.
- **G.1** for the target on the hero. The no-goal state can be built before G.1; the “of {target}” state cannot ship without it.
- **2.5.1** and **2.5.2**.

### Mockups

- [`F-fitness-overview.png`](../../mockups/nov_2026_tickets/F-fitness-overview.png) — approved desktop and mobile. Ignore the LATER Mind block and the sample numbers.
- [`A-dashboard-overview.png`](../../mockups/nov_2026_tickets/A-dashboard-overview.png) — do not build this Overview.
- [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png) — the bottom Mind row is the later idea, not this ticket.

### Suggested GitHub title

`[Workouts] Turn on the Fitness Overview tab`

---

## Future ideas

Not issues to open with the tickets above. Ryan can write a real ticket when one of these starts. None of them are **E**. The rejected “suggest my top focus area” idea is not in this list.

### Compact Mind card on the Fitness Overview

**Scope gate:** D — future

One row on Overview: activity streak, 7-day average mood, check-in state, and **Go to Mind**. E calls it optional later. F marks the block LATER. It waits until Overview is on, and it is not part of **OV.1**. Detail stays on `/mind`.

Mockups: [`E-mind-layout-compare.png`](../../mockups/nov_2026_tickets/E-mind-layout-compare.png), [`F-fitness-overview.png`](../../mockups/nov_2026_tickets/F-fitness-overview.png).

### Lift goals

**Scope gate:** D — future

A target on a lift (a weight, a reps scheme, or whatever the workouts slice can actually store) uses the same idea as G.1: a number and a deadline, set on the profile, with a rule-based realism note rather than a model. It starts only after workouts exist, so the target refers to a real exercise identity ([ADR-009](../../ARCHITECTURE_DECISIONS.md)). Not in G.1’s form.

### LLM-written goal suggestions

**Scope gate:** D — future

The Coach slice may suggest goal wording later. The model interprets. It does not calculate pace, remaining distance, or the realism threshold ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). Copy stays under [ADR-011](../../ARCHITECTURE_DECISIONS.md). Not MVP, and not a shortcut around G.1’s warning.

### Focus areas on the check-in, later

**Scope gate:** D — future

Profile focus areas do not affect the Slice 2 check-in. Ryan confirmed that on 2026-11-16. These three are later, and none of them is the rejected “preselect the top focus area” default.

- A recap callout when a high-priority domain scored low. Example shape: “Family is your #1 focus but scored 4/10.” Copy stays under [ADR-011](../../ARCHITECTURE_DECISIONS.md). The numbers come from the stored check-in and `domain_priorities`, not from a model ([ADR-004](../../ARCHITECTURE_DECISIONS.md)).
- Ordering the check-in domain rows by the profile’s priority instead of the canonical slug order.
- Passing those priorities into the Slice 5 coach context. Slice 5 has no ticket folder yet. This idea does not start that slice.

### PRs / consistency card

**Scope gate:** D — future

A shows this card greyed out (“Not in this slice”). F does not include it. #55 listed it behind workouts and analytics. It stays with Slice 4. It is not part of **OV.1**.
