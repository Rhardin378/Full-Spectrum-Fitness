# Slice 3 Tickets (Copy to GitHub Issues)

Use each section as one GitHub issue. Ryan locked the decisions in [`README.md`](./README.md) on Nov 23, 2026. Create the `slice-3` label and the `Slice 3 - Workouts` milestone when the first issue opens (`docs/vertical_slices/tracking_setup.md`). Do not open those issues from a docs-only pass.

**Gate:** Slice 2 QA (#79) and tests (#78) should be green enough that workouts are the active slice. NAV.1 is done. Prefer G.1 (weekly workout count) before or with OV.1.

Mockups: [`docs/mockups/slice_3_workouts/`](../../mockups/slice_3_workouts/README.md). Research: [`competitive_research.md`](./competitive_research.md).

---

## Ticket 3.0: Lock Slice 3 product decisions

**Type:** chore  
**Priority:** P0  
**Labels:** `slice-3`, `documentation`

### Description

Ryan locked the Slice 3 table on Nov 23, 2026, then revised D13 the same day (rest timer is in Slice 3), added D22–D27, and brought cardio in as D28. The README table is the lock. D1 is a FitNotes-style single log with no live session or stopwatch. Mockup images are still the pre-lock frames. A separate design pass updates the images. Do not reopen the decisions from those images.

### Acceptance Criteria

- README, this tickets file, the mockups README, navigation IA, and the launch plan agree with the lock.
- Development log notes the lock.
- Existing mockup images stay untouched until that design pass.

### Suggested GitHub title

`[Slice 3] Lock workout product decisions and mockups`

---

## Ticket 3.1: Exercise library + workout schema

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-3`, `database`, `backend`

### Description

Migrations for `exercises` (global seed + owner custom), completed workout tables, and the template hierarchy required by Slice 3.1’s dependency contract. Calendar `performed_on`. Soft-delete on sessions. RLS/grants match measurements style.

### Scope (draft)

- Seed about 120–150 common exercises with slug, name, aliases, primary muscle, optional equipment (D4). About 12 are cardio, with primary muscle Cardio: outdoor run, treadmill run, walk, incline treadmill walk, outdoor cycling, stationary bike, rowing machine, elliptical, stair climber, swimming, jump rope, air bike (D28).
- `exercises.tracking_type` text not null default `strength`, check `strength` or `cardio`.
- Custom exercises: `user_id` not null; global rows have null owner. No parent-link column and no variant action (D20).
- Completed: sessions → exercises → sets. No rest-seconds column on completed sets (D13).
- `workout_sessions.session_rpe`: nullable integer. Check constraint: null or between 1 and 10 inclusive (D23). `duration_minutes` stays optional. No new clock column; duration pre-fill reads the set rows’ saved-at timestamps.
- `workout_sets.id` is a uuid primary key, `default gen_random_uuid()`, and the client supplies it (D26). No `client_id` column and no `is_pr` column. RLS matches measurements: owner-scoped on `user_id` from the session. `ON CONFLICT (id) DO NOTHING` stays.
- Cardio columns on `workout_sets` (D28): `reps` nullable; `duration_seconds` nullable integer, null or > 0 and ≤ 86400; `distance` nullable numeric, null or > 0; `distance_unit` nullable text, null or `mi` / `km` / `m`. `distance` and `distance_unit` are both null or both set. `reps` or `duration_seconds` is non-null. Insert and update grants name columns, including the new ones, the way measurements names its update columns. `id` and `user_id` stay off the update grant.
- Templates: program/session/exercise/set_prescription + optional groups. Rest seconds stay nullable on set prescriptions only. `exercise_templates.notes` is nullable text (D22). No rest-timer table.
- No AI import tables.

### Acceptance Criteria

- Local reset applies cleanly.
- Owner can only read/write own sessions and custom exercises; global exercises are readable by all authenticated users.
- Unique constraints and checks match the locked README.

### Dependencies

- Ticket 3.0

### Suggested GitHub title

`[Slice 3] Add exercise library and workout schema`

---

## Ticket 3.2: Server actions and domain save contract

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-3`, `backend`, `api`, `validation`

### Description

Zod-validated server actions: create/list/update/soft-delete workouts, create custom exercise, search exercises, save template, start log from template. Expose a versioned canonical template input used by manual save and later Slice 3.1 confirm.

### Acceptance Criteria

- Unauthorized callers fail generically.
- Volume helper matches D10: reps × load as entered, no dumbbell doubling, warm-ups and non-numeric load excluded.
- The PR badge is computed on read from log history (D11): heaviest numeric load, excluding warm-ups, non-numeric load, cardio sets, and soft-deleted sessions. No e1RM, no cardio PRs, and no stored flag. An edit or soft-delete changes the next read.
- The set action loads `tracking_type` from the exercise row and ignores a client-sent type (D28). Strength requires reps and rejects `duration_seconds`, `distance`, and `distance_unit`. Cardio requires `duration_seconds`; distance with its unit and RPE are optional; reps, load, load_text, and RIR must be null, and the warm-up flag must be null or false. Cross-type fields fail validation. Volume still excludes cardio.
- Saving a set accepts the client uuid and uses `ON CONFLICT (id) DO NOTHING`. A second save with the same id does not insert another row (D26). The caller still cannot write another owner’s row.
- Date slack window matches measurements/journal pattern.
- `session_rpe` validates as an integer 1–10 or null. `duration_minutes` validates as a whole number of minutes or null (D23). Out-of-range effort is rejected.
- Unit tests without a live DB (mock Supabase), including Chicago/UTC calendar cases.

### Dependencies

- Ticket 3.1

### Suggested GitHub title

`[Slice 3] Workout server actions and template save contract`

---

## Ticket 3.3: Workouts tab history + empty state

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-3`, `frontend`, `ui`

### Description

Replace the Workouts coming-soon panel. History list, empty state, Show more windowing, welcome-band **+ Log workout**. Phone-width layout.

### Acceptance Criteria

- `/fitness/workouts` shows real data or an honest empty state. Strength volume stays reps × load. Cardio work in that summary shows total time (D28). A cardio-only session is a workout day.
- Soft-deleted sessions are absent.
- **+ Log workout** opens a new log for today. No start chooser. Starting from a template is on this tab, not in the band (D15).
- The same band action is the Overview primary when OV.1 lands. Overview still has secondary + Log measurement.

### Dependencies

- Ticket 3.2

### Suggested GitHub title

`[Slice 3] Build Workouts tab history`

---

## Ticket 3.4: Log workout + exercise picker

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-3`, `frontend`, `ui`

### Description

`/fitness/workouts/new` is a FitNotes-style single log (D1). The date defaults to today and is editable. Each set saves as you tick it. No live session or stopwatch. Ticking a set starts the client-side rest timer (D13). The picker is a search sheet (search, muscle chips, create custom). A per-exercise history view is reached from the log or the picker (D16). A log started from a template shows an info button on each exercise that has template notes (D22).

### Acceptance Criteria

- A multi-exercise session reloads after refresh. Phone-width layout is required. The normal nav stays, with a sticky save/finish bar on phone. No focus mode (D21).
- Rest timer (D13), client-side only, in the sticky bar: it starts when a strength set is ticked, not a cardio set (D28), shows **+30s** and **Skip**, and at zero shows a visual cue plus vibration where the browser supports it. Duration is the ticked set’s template prescription rest seconds, or **90s** when there is no template or that value is null. Adjusting it does not write rest onto the completed set or the template. It runs only while the page is open. Tests cover countdown, +30s, skip, a new tick resetting it, and the 90s fallback.
- When the log was started from a template, each exercise with notes shows an info button. Activating it opens a popover with the note. It is not hover-only: touch, keyboard, and aria all work (D22). Log exercise notes (D8) stay.
- The dumbbell load hint says “per dumbbell”. Volume uses the entered load with no doubling (D10).
- Custom create shows a fuzzy-duplicate warning, and **Create anyway** stays. There is no **Create as variant** (D19, D20).
- The per-exercise history view shows past sets and the PR badge. It is not a Library page.
- The finish summary shows the PR badge when the read-time comparison says this set’s load is the heaviest numeric load for that exercise (D11). No PR board, no e1RM, and no stored flag.
- A new set row suggests weight and reps from the latest logged set of that exercise across workouts: same position when it exists, otherwise the last set. Warm-ups are skipped unless this row is a warm-up. Suggestions look different from confirmed values. One tap on the check saves them (D24). Template targets are labeled as targets and are not logged values. Confirming a set does not update the template.
- The rest timer stores an end timestamp and recomputes on visibility change (D25). **Keep screen on** uses Wake Lock where supported, is hidden otherwise, and re-acquires the lock when the page becomes visible. No push and no background alarm.
- A failed or offline tick stays on screen and is queued in localStorage, with a small “Saving… / Not synced yet” state. Retry on reconnect, on visibility, and on the next tick. Reload shows server rows plus the queue. No service worker (D26).
- Weight +/− steps 5 lb or 2.5 kg. Reps step by 1. Targets are large enough for a phone. Typing still works. There is no per-exercise step setting (D27). Steppers are strength-only.
- A cardio card has Time (mm:ss, also h:mm:ss), Distance with mi/km/m, and optional effort. No warm-up control and no steppers. Tick-to-save matches strength. The rest timer does not start. D24 prefills the last cardio set, including its unit. Custom create offers Strength or Cardio and defaults to Strength (D28).
- Per-exercise history for cardio shows date, time, distance, and effort, and no PR badge.
- Finish pre-fills `duration_minutes` from the first and last ticked set’s saved-at timestamps, rounded to whole minutes (D23). If that span is blank or shorter than the session’s total cardio time, the pre-fill uses the total cardio time (D28). It stays blank when the log date is in the past. The user can edit or clear it. No session clock and no Start button.
- Finish has an optional “How hard was that?” 1–10 tap row. Skipping it stores null. Per-set RPE/RIR stay optional (D8). Copy is plain and non-medical.
- Fourth-class junk fields rejected by Zod.
- A custom exercise appears in search for the owner only.
- The written spec wins where the current images lag. Updated mockups come from a separate design pass.

### Dependencies

- Ticket 3.2

### Suggested GitHub title

`[Slice 3] Build log workout flow and exercise picker`

---

## Ticket 3.5: Workout detail, edit, soft-delete

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-3`, `frontend`, `ui`

### Description

Detail page for a session; edit sets; soft-delete with confirm. The finish summary shows the PR badge from D11. No PR board and no e1RM. The normal nav stays. No focus mode.

### Acceptance Criteria

- The owner can edit sets and soft-delete the session. A cardio set edits as time, distance and unit, and effort (D28).
- Duration and session effort are editable on the detail page, and either can be cleared (D23).
- The PR badge is recomputed from current log history. Editing or soft-deleting a past session corrects it. No flag is stored (D11).
- The screen keeps the normal nav. No focus mode (D21).

### Dependencies

- Tickets 3.3, 3.4

### Suggested GitHub title

`[Slice 3] Workout detail, edit, and soft-delete`

---

## Ticket 3.6: Thin templates

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-3`, `frontend`, `backend`

### Description

Save session as template; list templates on Workouts; start a new log from a template. No scheduler. No AI import. The editor can write the template exercise note (D22).

### Acceptance Criteria

- The template editor saves a nullable exercise note (form cue, tempo, or time under tension). A cardio cue such as “30 min easy” is that note. There are no numeric cardio target columns (D28).
- Starting a log from that template supplies the note to the info button (D22) and the prescription rest seconds to the timer (D13). Template numbers show as targets (D24).
- Saving or confirming a log does not write those actuals back onto the template.

### Dependencies

- Tickets 3.2, 3.4

### Suggested GitHub title

`[Slice 3] Save and reuse workout templates`

---

## Ticket 3.7: Wire streak + OV.1 consumers

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-3`, `frontend`, `backend`

### Description

Feed `performed_on` into activity streak (ADR-014), including a cardio-only session (D28). Ship or finish OV.1 Fitness Overview using live workout + measurement recent activity (F mockup). Depends on G.1 for the weekly goal hero. Workouts completed and consistency include cardio. Volume and strength trends stay strength-only.

### Dependencies

- Ticket 3.2
- G.1 structured weekly workout count
- NAV.1 (done)

### Suggested GitHub title

`[Slice 3] Wire workouts into streak and Fitness Overview`

---

## Ticket 3.8: Tests

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-3`, `tests`, `quality`

### Description

Unit/action/component coverage for schema rules, D10 volume (no dumbbell doubling; cardio excluded), the D11 PR badge computed at read time (including after edit and soft-delete; no stored flag; cardio excluded), the D13/D25 rest timer (countdown from an end timestamp, +30s, skip, a new tick resetting it, the 90s fallback, no drift across a visibility change, and no auto-start on a cardio tick), D23 duration pre-fill (under 2 sets, past date, rounding, edit, and the cardio-time fallback when the tick span is blank or shorter), `session_rpe` validation (1–10 or null), D24 prefill (position match, warm-up exclusion, suggestion versus confirmed, template targets not logged, cardio unit), D26 idempotent set save (a retry with the same id does not duplicate; the queue resumes), D27 stepper steps (5 lb, 2.5 kg, reps by 1; not on cardio), D28 per-type validation, the set CHECKs, and cross-type rejection, date slack, the duplicate warning, the D22 notes popover (touch, keyboard, aria), history windowing, and the template save contract. No Playwright required in this ticket. No service worker.

### Dependencies

- Tickets 3.2–3.6

### Suggested GitHub title

`[Slice 3] Test workout logging and templates`

---

## Ticket 3.9: QA and release checklist

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-3`, `qa`, `release`

### Description

Walk an empty log, a custom exercise with the duplicate warning and Create anyway, a multi-set strength session (last-time suggestion and one-tap confirm, steppers, sets save as ticked, rest pill with the screen-on toggle where supported, per-dumbbell hint, computed PR badge, per-exercise history, duration pre-fill, and the optional effort tap), one cardio exercise (time, optional distance and unit, no stepper, no rest timer, history as time rather than volume, and a run-only duration), a failed save that shows “Not synced yet” and then retries without a duplicate row, a past-date log with duration left blank, a template whose targets stay targets and whose note has an info button, edit and soft-delete that correct the PR badge, template reuse from the Workouts tab, a cardio-only streak day, Overview (if shipped), and phone-width with the sticky save/finish bar and the normal nav. Capture gaps as follow-ups. Do not expand into 3.1, push or background alarms, a service worker, a PR board, a per-exercise step setting, pace, heart rate, GPS, or Create as variant during QA.

### Dependencies

- Tickets 3.3–3.8

### Suggested GitHub title

`[Slice 3] QA workout logging`
