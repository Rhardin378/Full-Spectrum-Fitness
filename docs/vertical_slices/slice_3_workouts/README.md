# Slice 3: Manual Workout Logging

## Feature Brief

Authenticated users can log completed strength sessions (exercises, sets, reps, load), see workout history on `/fitness/workouts`, reuse sessions as templates, and feed calendar workout days into the existing activity streak and the Fitness Overview (OV.1).

**This folder is the planning pack.** Implementation starts after Slice 2 close-out (and after Ryan locks the decisions below). Slice 3.1 AI import must reuse this slice’s canonical template save path — see [`../slice_3_1_ai_workout_import/`](../slice_3_1_ai_workout_import/).

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
4. **Fitness URLs:** `/fitness/workouts` (NAV.1). Library stays coming-soon until 3.1 / library UX.
5. **Overview (F mockup) turns on with workouts** (Nov 16 / OV.1). Primary band CTA **+ Log workout**.
6. **One activity streak** — journal or workout calendar day (ADR-014).
7. **No social feed, badges, wearables, or AI planner** in Phase 1.
8. **No unit auto-conversion** (same rule as measurements / Slice 3.1).

## Decisions to lock (proposed)

Status column: **Proposed** until Ryan confirms. Recommendations come from the FSF thesis plus 2026 logger research (Strong / Hevy / Fitbod lane split).

| ID | Topic | Proposed lock | Why |
|----|--------|---------------|-----|
| D1 | Capture mode | **Post-hoc log** is the primary path: pick date (`performed_on`), optional duration minutes, build exercises/sets, save. No live stopwatch required for v1. | FSF Phase 1 is web-first. Strong/Hevy are phone-gym apps; copying their timer as the only path would overfit mobile. Phone-width layout still required. |
| D2 | Start paths | **Empty workout** is primary. **Save as template** after save. **Start from template** ships in-slice if thin; otherwise immediately after first loggable history. | Market table stakes; empty-first matches measurements/journal capture style. |
| D3 | Program builder UX | **Schema includes** program → sessions → exercises → set prescriptions + optional groups. **Full program-builder UI trails** log/history inside the slice. | PRD + 3.1 contract. Do not block logging on a builder. |
| D4 | Exercise library | Seed **global curated catalog** (~80–120 common lifts) + **owner-scoped custom exercises**. Search by name/alias; filter by primary muscle. | ADR-009; Hevy/Strong both ship library + custom. |
| D5 | Units | Profile default `lb` or `kg`. Each set stores numeric load + unit when load is present. **No conversion.** | Matches measurements and 3.1. |
| D6 | Calendar day | `performed_on date` with the same local-today slack window pattern as measurements/journal. Multiple workouts per day **allowed**. | ADR-014 streak input; gym double-days are real. |
| D7 | Edit / delete | Soft-delete (`deleted_at`) like measurements. Owner can edit a past session. | Expected in Strong/Hevy; matches 1.5. |
| D8 | Set fields (completed) | Per set: `reps` (int), nullable `load` + `load_unit`, nullable `load_text` (bodyweight/bands), nullable `rpe` (0.5 steps 6–10 or null), nullable `rir`, optional `is_warmup`. Session + exercise notes allowed. | Aligns with 3.1 prescription capabilities; warm-up excluded from volume when flagged. |
| D9 | Set fields (templates) | Same as completed, plus **rep range** on prescriptions. Groupings (superset/circuit) on templates required for 3.1. | Slice 3.1 dependency contract. |
| D10 | Volume | `sum(reps × load)` over non-warmup sets with numeric load. Null load / load_text-only sets excluded. | Deterministic; coach-safe. |
| D11 | PRs in Slice 3 | **No PR board.** History detail may show “heaviest set this session.” Real PR / e1RM analytics wait for Slice 4. | Keeps Slice 3 a capture slice. |
| D12 | Cardio / time-only | **Deferred.** Strength/hypertrophy logging first. | Scope control. |
| D13 | Rest timer | **Deferred** as UI. Nullable rest seconds allowed on template prescriptions only. | Mobile-native pattern; not Phase 1 web. |
| D14 | Routes | `/fitness/workouts` history · `/fitness/workouts/new` log · `/fitness/workouts/[id]` detail · templates section on the Workouts tab (or `/fitness/workouts/templates`). | Matches NAV.1 + IA. |
| D15 | Welcome band | Workouts tab: **+ Log workout** only. Overview (OV.1): + Log workout primary, + Log measurement secondary (F). | Nov 16 / IA. |
| D16 | Library tab | Stays **coming soon** until Slice 3.1 / exercise-library UX enrichment. Workouts tab owns templates for v1. | Avoid two homes for the same objects. |
| D17 | OV.1 timing | Ship Overview **after** first loggable workout path exists; hero needs G.1 weekly workout count (or a temporary placeholder only if G.1 is explicitly gated — prefer G.1 first). | Nov 16 sequence. |
| D18 | AI | None in this slice. | Launch plan. |

## What the user can do (target)

### Workouts tab (`/fitness/workouts`)

- See recent sessions (date, name, duration, exercise count, estimated volume).
- Empty state: calm copy + **+ Log workout**.
- Open a session for read/edit.
- Soft-delete.
- History windowing matches measurements (5, then Show more).

### Log workout (`/fitness/workouts/new`)

1. Session name (required, trimmed, reasonable max).
2. `performed_on` (defaults to validated local today).
3. Optional duration minutes.
4. Add exercises via picker (search, muscle chips, create custom).
5. Per exercise: ordered set rows (reps, load, optional RPE).
6. Save → detail or Workouts tab with short confirmation.
7. Optional **Save as template** on success (or from detail).

### Exercise picker

- Search aliases and names.
- Muscle filter chips.
- Create custom exercise (name required; primary muscle optional for v1 if it slows ship — prefer required primary muscle).

### Templates (thin)

- List owner templates.
- Start a new log prefilled from a template (prescriptions become editable actuals).
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
       └─ exercise_templates → exercise_id
            └─ set_prescriptions
```

Owner-scoped RLS. Zod on every action. `user_id` from session. Same grant/revoke style as measurements and Slice 2.

Versioned domain input for “save template / confirm import” is owned here so Slice 3.1 does not invent a second model.

## Future / not this slice

- Live rest timer / Watch / offline gym mode
- Fitbod-style generated sessions
- Auto progressive overload
- Cardio / duration-only exercise types as first-class
- Full program calendar / scheduling
- Library tab content and AI Import entry (3.1)
- PR leaderboard / muscle-group volume charts (Slice 4)
- Social sharing of workouts

## Done criteria (draft)

- Signed-in user can log a multi-exercise session with set rows referencing canonical exercises and see it after refresh.
- Custom exercise can be created and used in a log.
- Soft-deleted sessions disappear from history and streak inputs.
- Activity streak counts `performed_on` once workouts exist (ADR-014).
- Template can be created from a session (or manually) and used to start a new log.
- Domain save contract exists for Slice 3.1 confirmation.
- OV.1 can read recent workouts (when that ticket ships with this slice).
- `npm test` covers validation, volume math, date slack, ownership failures.
- No AI, no social, no example-data pill.

## Notes

- Product sources of truth remain the handoff pack. This folder is the Slice 3 behavior spec once decisions are locked.
- Brand: charcoal + coral (`docs/brand_style_guide.md`). Supportive copy, not bro-science.
- If a mockup PNG is older than this README, the README wins (same rule as Slice 2).
