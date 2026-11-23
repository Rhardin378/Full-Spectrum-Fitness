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

Ryan locked the Slice 3 table on Nov 23, 2026, then revised D13 the same day (rest timer is in Slice 3) and added D22. The README table is the lock. D1 is a FitNotes-style single log with no live session or stopwatch. Mockup images are still the pre-lock frames. A separate design pass updates the images. Do not reopen the decisions from those images.

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

- Seed about 120–150 common exercises with slug, name, aliases, primary muscle, optional equipment (D4).
- Custom exercises: `user_id` not null; global rows have null owner. No parent-link column and no variant action (D20).
- Completed: sessions → exercises → sets. No rest-seconds column on completed sets (D13).
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
- PR flag matches D11: heaviest numeric load for an exercise, excluding warm-ups and non-numeric load. No e1RM.
- Date slack window matches measurements/journal pattern.
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

- `/fitness/workouts` shows real data or an honest empty state.
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
- Rest timer (D13), client-side only, in the sticky bar: it starts when a set is ticked, shows **+30s** and **Skip**, and at zero shows a visual cue plus vibration where the browser supports it. Duration is the ticked set’s template prescription rest seconds, or **90s** when there is no template or that value is null. Adjusting it does not write rest onto the completed set or the template. It runs only while the page is open. Tests cover countdown, +30s, skip, a new tick resetting it, and the 90s fallback.
- When the log was started from a template, each exercise with notes shows an info button. Activating it opens a popover with the note. It is not hover-only: touch, keyboard, and aria all work (D22). Log exercise notes (D8) stay.
- The dumbbell load hint says “per dumbbell”. Volume uses the entered load with no doubling (D10).
- Custom create shows a fuzzy-duplicate warning, and **Create anyway** stays. There is no **Create as variant** (D19, D20).
- The per-exercise history view shows past sets and the PR badge. It is not a Library page.
- The finish summary shows the PR badge when the heaviest non-warmup numeric load is a personal record (D11). No PR board and no e1RM.
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

- The owner can edit sets and soft-delete the session.
- The PR badge is the heaviest numeric load for that exercise, excluding warm-ups and non-numeric load.
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

- The template editor saves a nullable exercise note (form cue, tempo, or time under tension).
- Starting a log from that template supplies the note to the info button (D22) and the prescription rest seconds to the timer (D13).

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

Feed `performed_on` into activity streak (ADR-014). Ship or finish OV.1 Fitness Overview using live workout + measurement recent activity (F mockup). Depends on G.1 for the weekly goal hero.

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

Unit/action/component coverage for schema rules, D10 volume (no dumbbell doubling), the D11 PR flag, the D13 rest timer (countdown, +30s, skip, a new tick resetting it, and the 90s fallback), date slack, the duplicate warning, the D22 notes popover (touch, keyboard, aria), history windowing, and the template save contract. No Playwright required in this ticket.

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

Walk an empty log, a custom exercise with the duplicate warning and Create anyway, a multi-set session (sets save as ticked, rest pill, per-dumbbell hint, PR badge, per-exercise history), a template with an exercise note and its info button, edit, soft-delete, template reuse from the Workouts tab, streak day, Overview (if shipped), and phone-width with the sticky save/finish bar and the normal nav. Capture gaps as follow-ups. Do not expand into 3.1, push or background timers, a PR board, or Create as variant during QA.

### Dependencies

- Tickets 3.3–3.8

### Suggested GitHub title

`[Slice 3] QA workout logging`
