# Slice 3 Tickets (Copy to GitHub Issues)

Use each section as one GitHub issue after Ryan locks the decisions in [`README.md`](./README.md). Create the `slice-3` label and the `Slice 3 - Workouts` milestone when the first issue opens (`docs/vertical_slices/tracking_setup.md`).

**Gate:** Slice 2 QA (#79) and tests (#78) should be green enough that workouts are the active slice. NAV.1 is done. Prefer G.1 (weekly workout count) before or with OV.1.

Mockups: [`docs/mockups/slice_3_workouts/`](../../mockups/slice_3_workouts/README.md). Research: [`competitive_research.md`](./competitive_research.md).

---

## Ticket 3.0: Lock Slice 3 product decisions

**Type:** chore  
**Priority:** P0  
**Labels:** `slice-3`, `documentation`

### Description

Confirm or amend the Proposed locks D1–D18 in the Slice 3 README. Update the README status from Proposed to Locked. Fold any accepted competitive-research recommendations. Refresh mockups if a lock changes the primary UX (especially D1 live-timer vs post-hoc).

### Acceptance Criteria

- Each D1–D18 row is Locked or explicitly Deferred with an owner slice.
- README, mockups README, and this tickets file agree.
- Development log note appended when locks land.

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

- Seed ~80–120 common exercises with slug, name, aliases, primary muscle, optional equipment.
- Custom exercises: `user_id` not null; global rows have null owner.
- Completed: sessions → exercises → sets.
- Templates: program/session/exercise/set_prescription + optional groups.
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
- Volume helper matches D10.
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
- Band button only on Workouts (and Overview when OV.1 lands).

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

`/fitness/workouts/new` post-hoc log form and exercise picker (search, muscle chips, create custom). Last-session reference when an exercise was logged before. Save confirmation.

### Acceptance Criteria

- Multi-exercise session saves and reloads.
- Fourth-class junk fields rejected by Zod.
- Custom exercise appears in search for the owner only.
- Matches locked mockups; written spec wins if PNG lags.

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

Detail page for a session; edit sets; soft-delete with confirm. Heaviest-set line optional; no PR board.

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

Save session as template; list templates on Workouts; start a new log from a template. No scheduler. No AI import.

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

Unit/action/component coverage for schema rules, volume, date slack, picker validation, history windowing, template save contract. No Playwright required in this ticket.

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

Walk empty log, custom exercise, multi-set session, edit, soft-delete, template reuse, streak day, Overview (if shipped), phone-width. Capture gaps as follow-ups. Do not expand into 3.1 during QA.

### Dependencies

- Tickets 3.3–3.8

### Suggested GitHub title

`[Slice 3] QA workout logging`
