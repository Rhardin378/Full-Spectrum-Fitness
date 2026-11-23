# Slice 3: Manual Workout Logging

## Feature Brief

Authenticated users can log completed strength sessions (exercises, sets, reps, load), see workout history on `/fitness/workouts`, reuse sessions as templates, and feed calendar workout days into the existing activity streak and the Fitness Overview (OV.1).

**This folder is the planning pack.** Ryan locked the decisions below on Nov 23, 2026. Implementation still starts after Slice 2 close-out. Slice 3.1 AI import must reuse this slice’s canonical template save path — see [`../slice_3_1_ai_workout_import/`](../slice_3_1_ai_workout_import/).

Competitive notes: [`competitive_research.md`](./competitive_research.md). Mockups: [`../../mockups/slice_3_workouts/`](../../mockups/slice_3_workouts/README.md). Tickets: [`tickets.md`](./tickets.md).

## Position in the roadmap

| Before | This slice | After |
|--------|------------|-------|
| Slice 2 capture + QA | Manual workouts + thin templates | Slice 4 insights |
| NAV.1 `/fitness` routes (done) | Workouts tab live | Slice 3.1 AI import |
| G.1 weekly workout count (Nov 16) | OV.1 Overview turns on with this slice | — |
| 2.5.1 activity streak | Workout `performed_on` becomes a streak input | — |

Do not start Slice 3.1, screenshot import, or Insights charts here.

## Goal

Make logging a session cheaper than avoiding it, store stable exercise identity from day one, and leave a clean contract for templates, Overview, streak, analytics, and later AI import.

## Already locked (handoff pack)

Do not reopen these without updating the pack.

1. **Manual logging before AI import** ([LAUNCH_PLAN](../../LAUNCH_PLAN.md), ADR-010).
2. **Canonical exercise identity** — logs reference `exercise_id`, not free-text alone (ADR-009, PRD §3).
3. **Templates ≠ completed logs.** Program/session/exercise/set prescription hierarchy is the logical model (PRD database section; Slice 3.1 dependency contract).
4. **Fitness URLs:** `/fitness/workouts` (NAV.1). The Library tab stays coming soon through Slice 3 (D16). The log picker and a per-exercise history view are not a Library page.
5. **Overview (F mockup) turns on with workouts** (Nov 16 / OV.1). Primary band CTA **+ Log workout**.
6. **One activity streak** — journal or workout calendar day (ADR-014).
7. **No social feed, achievement badges, wearables, or AI planner** in Phase 1. The Slice 3 PR badge (D11) is a history flag, not an achievement.
8. **No unit auto-conversion** (same rule as measurements / Slice 3.1).

## Decisions (locked Nov 23, 2026)

Ryan locked this table on Nov 23, 2026. Later that day he revised D13 (the rest timer is in Slice 3) and added D22. Do not reopen a row without updating this pack.

| ID | Topic | Decision | Why |
|----|--------|----------|-----|
| D1 | Capture mode | **FitNotes-style single log screen.** Date defaults to today and is editable for after-the-fact logs. Each set saves as you tick it. No live session or stopwatch state. Phone-width layout is required. Optional duration is a typed number, not a timer. | Web-first capture. A running session would be a second product. Phone-width is required. |
| D2 | Start paths | **Empty workout** is primary. **Save as template** after save. **Start from template** ships in-slice if thin; otherwise immediately after first loggable history. | Market table stakes; empty-first matches measurements/journal capture style. The band does not choose (D15). |
| D3 | Program builder UX | **Schema includes** program → sessions → exercises → set prescriptions + optional groups. **Full program-builder UI trails** log/history inside the slice. | PRD + 3.1 contract. Do not block logging on a builder. |
| D4 | Exercise library | Seed **about 120–150 curated global exercises**, plus **owner-scoped custom exercises**. Search by name/alias; filter by primary muscle. | ADR-009. Enough of a catalog to log without a Library page. |
| D5 | Units | Profile default `lb` or `kg`. Each set stores numeric load + unit when load is present. **No conversion.** | Matches measurements and 3.1. |
| D6 | Calendar day | `performed_on date` with the same local-today slack window pattern as measurements/journal. Multiple workouts per day **allowed**. | ADR-014 streak input; gym double-days are real. |
| D7 | Edit / delete | Soft-delete (`deleted_at`) like measurements. Owner can edit a past session. | Expected in Strong/Hevy; matches 1.5. |
| D8 | Set fields (completed) | Per set: `reps` (int), nullable `load` + `load_unit`, nullable `load_text` (bodyweight/bands), nullable `rpe` (0.5 steps 6–10 or null), nullable `rir`, optional `is_warmup`. Session + exercise notes allowed. | Aligns with 3.1 prescription capabilities; warm-up excluded from volume when flagged. |
| D9 | Set fields (templates) | Same as completed, plus **rep range** on prescriptions. Groupings (superset/circuit) on templates required for 3.1. Nullable rest seconds stay on set prescriptions only. The timer reads them and does not copy them onto completed sets (D13). Exercise `notes` are nullable text (D22). | Slice 3.1 dependency contract. |
| D10 | Volume | Dumbbell load is logged **per dumbbell**. Volume = reps × load as entered, **no doubling**. The input hint says “per dumbbell”. Warm-ups stay excluded. Null load / load_text-only sets excluded. | Volume uses the number the user typed. Doubling would invent load. |
| D11 | PRs in Slice 3 | Follow PRD §3, simple PR detection on a lift. A deterministic flag is the heaviest numeric load for an exercise, excluding warm-ups and non-numeric load. It shows as a **badge** on the finish summary and on the per-exercise history view. **No PR board or e1RM** (Slice 4). | A badge is the Phase 1 PR. A board and e1RM are analytics. |
| D12 | Cardio / time-only | **Deferred.** Strength/hypertrophy logging first. | Scope control. |
| D13 | Rest timer | **In Slice 3.** Client-side only. Starts when a set is ticked. When the log was started from a template, duration is that exercise’s existing prescription rest seconds (the ticked set’s prescription); if there is no template or that value is null, **90s**. Adjustable in the timer, and not written back. Sticky pill in the log’s sticky bar, with **+30s** and **Skip**. At zero: a visual cue, plus vibration where the browser supports it. A new tick resets it. Runs only while the page is open. No push notifications or background timers. No new table. Rest is not stored on completed set rows. Template rest seconds stay on set prescriptions. | Smallest timer that still helps between sets. It is not a live session or a workout stopwatch (D1). |
| D14 | Routes | `/fitness/workouts` history · `/fitness/workouts/new` log · `/fitness/workouts/[id]` detail · templates section on the Workouts tab (or `/fitness/workouts/templates`). | Matches NAV.1 + IA. |
| D15 | Welcome band | **+ Log workout** opens a new log for today. **No start chooser.** Starting from a template lives on the Workouts tab. Overview (OV.1) keeps + Log workout primary and + Log measurement secondary. | The band is one tap to today’s log. |
| D16 | Library tab | Stays **coming soon**. The exercise picker’s search sheet inside the log is the only library UI in Slice 3. A small **per-exercise history view**, reached from the log or the picker, shows past sets and the PR badge. It is not a Library page. | One library home later (Slice 3.1). History belongs to logging. |
| D17 | OV.1 timing | Ship Overview **after** first loggable workout path exists; hero needs G.1 weekly workout count (or a temporary placeholder only if G.1 is explicitly gated — prefer G.1 first). | Nov 16 sequence. |
| D18 | AI | None in this slice. | Launch plan. |
| D19 | Picker duplicates | Creating a custom exercise shows a **fuzzy-duplicate warning**. **Create anyway** stays. | Stops silent duplicates without blocking a real new name. |
| D20 | Create as variant | **Out of Slice 3** (gate D). It needs a parent link in the data model. | Do not add a parent-link column or a variant action in this slice. |
| D21 | Log and finish chrome | The **normal nav stays** on the log and finish screens. Phone gets a **sticky save/finish bar**. **No focus mode.** The rest pill sits in that bar (D13). | The Fitness shell stays available on those screens. |
| D22 | Exercise notes tooltip | A template exercise’s `notes` (nullable text) holds form cues, tempo, or time under tension, for example “3-sec eccentric, pause at chest”. When a log is started from a template, each exercise with notes shows an info button. Tapping it opens a popover. Not hover-only: it works on touch and with a keyboard, with proper aria. The template editor can write the note. Log exercise notes (D8) stay. No new columns. | Cues sit on the template exercise the log already copies from. |

## What the user can do (target)

### Workouts tab (`/fitness/workouts`)

- See recent sessions (date, name, duration, exercise count, volume). Volume is reps × load as entered (D10).
- Empty state: calm copy + **+ Log workout**, which opens a new log for today. No start chooser (D15).
- Start from a template on this tab, not from the welcome band.
- Open a session for read/edit.
- Soft-delete.
- History windowing matches measurements (5, then Show more).

### Log workout (`/fitness/workouts/new`)

FitNotes-style single screen (D1). The normal nav stays. Phone uses a sticky save/finish bar. No focus mode (D21).

1. Session name (required, trimmed, reasonable max).
2. `performed_on` defaults to validated local today and stays editable.
3. Optional duration minutes, typed. No stopwatch and no live session state.
4. Add exercises via the picker search sheet.
5. Per exercise: ordered set rows (reps, load, optional RPE). Dumbbell load hint says “per dumbbell”.
6. Each set saves as you tick it. That tick also starts the client-side rest timer (D13).
7. If the log was started from a template, an exercise with template notes shows an info button that opens the note (D22).
8. Finish summary shows the PR badge when D11’s flag is true. Optional **Save as template** from there or from detail.
9. Per-exercise history (past sets and the PR badge) opens from the log. It is not a Library page (D16).

### Exercise picker

- Search aliases and names. This sheet is the only library UI in Slice 3 (D16).
- Muscle filter chips.
- Create custom exercise (name required; primary muscle optional for v1 if it slows ship — prefer required primary muscle).
- Fuzzy-duplicate warning, with **Create anyway** (D19). No **Create as variant** (D20).
- The per-exercise history view is also reachable from here.

### Templates (thin)

- List owner templates.
- Start a new log prefilled from a template (prescriptions become editable actuals). The rest timer then uses the ticked set’s prescription rest seconds (D13).
- Edit the template exercise note (D22).
- No calendar scheduler. No AI import entry until 3.1 (muted control OK).

## Data (logical)

Physical names land in ticket 3.1 schema work.

```text
exercises (global + owner custom)
workout_sessions (completed) — performed_on, name, duration_minutes, notes, deleted_at
  └─ workout_exercises — position, exercise_id, notes
       └─ workout_sets — position, reps, load, load_unit, load_text, rpe, rir, is_warmup

program_templates
  └─ session_templates (position, optional week/day labels)
       ├─ exercise_groups (optional)
       └─ exercise_templates → exercise_id, notes (nullable text)
            └─ set_prescriptions (nullable rest seconds; not copied onto completed sets)
```

No parent-link column for exercise variants (D20). No rest column on completed sets, and no rest-timer table (D13). `exercise_templates.notes` is the D22 cue. Owner-scoped RLS. Zod on every action. `user_id` from session. Same grant/revoke style as measurements and Slice 2.

Versioned domain input for “save template / confirm import” is owned here so Slice 3.1 does not invent a second model.

## Future / not this slice

- Push notifications, background rest timers, Watch, and offline gym mode. The Slice 3 timer runs only while the log page is open (D13).
- **Create as variant** (D20, gate D) — needs a parent link.
- Fitbod-style generated sessions
- Auto progressive overload
- Cardio / duration-only exercise types as first-class
- Full program calendar / scheduling
- Library tab content and AI Import entry (3.1)
- PR board, e1RM, and muscle-group volume charts (Slice 4). The Slice 3 PR badge is in scope (D11).
- Social sharing of workouts
- Focus mode on the log or finish screens (rejected, D21)

## Done criteria (draft)

- Signed-in user can log a multi-exercise session on a phone-width FitNotes-style screen. Each set saves as it is ticked and starts the client-side rest timer. Sets reference canonical exercises and the session is still there after refresh.
- A log started from a template shows an info button on each exercise that has template notes. The template editor can write that note.
- Finish summary shows the PR badge. The per-exercise history view shows past sets and that badge.
- Custom exercise can be created and used in a log. A fuzzy duplicate warns first, and Create anyway still saves.
- Dumbbell volume does not double the entered load. Warm-ups stay out of volume and out of the PR flag.
- Soft-deleted sessions disappear from history and streak inputs.
- Activity streak counts `performed_on` once workouts exist (ADR-014).
- Template can be created from a session (or manually) and used to start a new log.
- Domain save contract exists for Slice 3.1 confirmation.
- OV.1 can read recent workouts (when that ticket ships with this slice).
- `npm test` covers validation, volume math (no dumbbell doubling), the PR flag, date slack, ownership failures.
- No AI, no social, no example-data pill.

## Notes

- Product sources of truth remain the handoff pack. This folder is the Slice 3 behavior spec. The decision table was locked on Nov 23, 2026.
- Brand: charcoal + coral (`docs/brand_style_guide.md`). Supportive copy, not bro-science.
- If a mockup PNG is older than this README, the README wins (same rule as Slice 2).
