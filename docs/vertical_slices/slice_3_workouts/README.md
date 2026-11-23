# Slice 3: Manual Workout Logging

## Feature Brief

Authenticated users can log completed strength and cardio sessions (exercises, sets, reps, load, or time and distance), see workout history on `/fitness/workouts`, reuse sessions as templates, and feed calendar workout days into the existing activity streak and the Fitness Overview (OV.1).

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

Ryan locked this table on Nov 23, 2026. Later that day he revised D13 (the rest timer is in Slice 3), added D22–D27, and brought cardio in as D28. Do not reopen a row without updating this pack.

| ID | Topic | Decision | Why |
|----|--------|----------|-----|
| D1 | Capture mode | **FitNotes-style single log screen.** Date defaults to today and is editable for after-the-fact logs. Each set saves as you tick it. No live session or stopwatch state. Phone-width layout is required. Optional duration is a typed number, not a timer. | Web-first capture. A running session would be a second product. Phone-width is required. |
| D2 | Start paths | **Empty workout** is primary. **Save as template** after save. **Start from template** ships in-slice if thin; otherwise immediately after first loggable history. | Market table stakes; empty-first matches measurements/journal capture style. The band does not choose (D15). |
| D3 | Program builder UX | **Schema includes** program → sessions → exercises → set prescriptions + optional groups. **Full program-builder UI trails** log/history inside the slice. | PRD + 3.1 contract. Do not block logging on a builder. |
| D4 | Exercise library | Seed **about 120–150 curated global exercises**, about 12 of them cardio (D28), plus **owner-scoped custom exercises**. Search by name/alias; filter by primary muscle. | ADR-009. Enough of a catalog to log without a Library page. |
| D5 | Units | Profile default `lb` or `kg`. Each set stores numeric load + unit when load is present. **No conversion.** | Matches measurements and 3.1. |
| D6 | Calendar day | `performed_on date` with the same local-today slack window pattern as measurements/journal. Multiple workouts per day **allowed**. | ADR-014 streak input; gym double-days are real. |
| D7 | Edit / delete | Soft-delete (`deleted_at`) like measurements. Owner can edit a past session. | Expected in Strong/Hevy; matches 1.5. |
| D8 | Set fields (completed) | Per set: `reps` (int, required for strength; nullable for cardio — D28), nullable `load` + `load_unit`, nullable `load_text` (bodyweight/bands), nullable `rpe` (0.5 steps 6–10 or null), nullable `rir`, optional `is_warmup`. Session + exercise notes allowed. | Aligns with 3.1 prescription capabilities; warm-up excluded from volume when flagged. |
| D9 | Set fields (templates) | Same as completed, plus **rep range** on prescriptions. Groupings (superset/circuit) on templates required for 3.1. Nullable rest seconds stay on set prescriptions only. The timer reads them and does not copy them onto completed sets (D13). Exercise `notes` are nullable text (D22). | Slice 3.1 dependency contract. |
| D10 | Volume | Dumbbell load is logged **per dumbbell**. Volume = reps × load as entered, **no doubling**. The input hint says “per dumbbell”. Warm-ups stay excluded. Null load / load_text-only sets excluded. **Cardio sets are excluded** (D28). | Volume uses the number the user typed. Doubling would invent load. |
| D11 | PRs in Slice 3 | Follow PRD §3, simple PR detection on a lift. **Computed at read time** from log history: the heaviest numeric load for an exercise, excluding warm-ups, non-numeric load, cardio sets, and soft-deleted sessions. Nothing is stored. Editing or deleting a past workout corrects the badge on the next read. It shows on the finish summary and on the per-exercise history view. **No PR board, no e1RM** (Slice 4), and **no cardio PRs** (D28). | A badge is the Phase 1 PR. A stored flag would go stale after an edit. |
| D12 | Cardio / time-only | **Originally deferred** so strength could ship first. **Changed Nov 23, 2026:** time and distance sets are in scope (D28). | A run is a workout day. Pace, heart rate, and imports stay later. |
| D13 | Rest timer | **In Slice 3.** Client-side only. Starts when a set is ticked. When the log was started from a template, duration is that exercise’s existing prescription rest seconds (the ticked set’s prescription); if there is no template or that value is null, **90s**. Adjustable in the timer, and not written back. Sticky pill in the log’s sticky bar, with **+30s** and **Skip**. At zero: a visual cue, plus vibration where the browser supports it. A new tick resets it. A cardio tick does not start it (D28). It counts down from an end timestamp (D25). Runs only while the page is open. No push notifications and no background alarms. No new table. Rest is not stored on completed set rows. Template rest seconds stay on set prescriptions. | Smallest timer that still helps between sets. It is not a live session or a workout stopwatch (D1). |
| D14 | Routes | `/fitness/workouts` history · `/fitness/workouts/new` log · `/fitness/workouts/[id]` detail · templates section on the Workouts tab (or `/fitness/workouts/templates`). | Matches NAV.1 + IA. |
| D15 | Welcome band | **+ Log workout** opens a new log for today. **No start chooser.** Starting from a template lives on the Workouts tab. Overview (OV.1) keeps + Log workout primary and + Log measurement secondary. | The band is one tap to today’s log. |
| D16 | Library tab | Stays **coming soon**. The exercise picker’s search sheet inside the log is the only library UI in Slice 3. A small **per-exercise history view**, reached from the log or the picker, shows past sets and the PR badge. It is not a Library page. | One library home later (Slice 3.1). History belongs to logging. |
| D17 | OV.1 timing | Ship Overview **after** first loggable workout path exists; hero needs G.1 weekly workout count (or a temporary placeholder only if G.1 is explicitly gated — prefer G.1 first). | Nov 16 sequence. |
| D18 | AI | None in this slice. | Launch plan. |
| D19 | Picker duplicates | Creating a custom exercise shows a **fuzzy-duplicate warning**. **Create anyway** stays. | Stops silent duplicates without blocking a real new name. |
| D20 | Create as variant | **Out of Slice 3** (gate D). It needs a parent link in the data model. | Do not add a parent-link column or a variant action in this slice. |
| D21 | Log and finish chrome | The **normal nav stays** on the log and finish screens. Phone gets a **sticky save/finish bar**. **No focus mode.** The rest pill sits in that bar (D13). | The Fitness shell stays available on those screens. |
| D22 | Exercise notes tooltip | A template exercise’s `notes` (nullable text) holds form cues, tempo, or time under tension, for example “3-sec eccentric, pause at chest”. When a log is started from a template, each exercise with notes shows an info button. Tapping it opens a popover. Not hover-only: it works on touch and with a keyboard, with proper aria. The template editor can write the note. Log exercise notes (D8) stay. No new columns. | Cues sit on the template exercise the log already copies from. |
| D23 | Session duration and effort | **Auto duration.** The finish screen pre-fills optional `duration_minutes` from the time between the first and last ticked set, using those rows’ saved-at timestamps. Round to whole minutes. If that span is blank (fewer than 2 ticked sets) or shorter than the session’s total cardio time, use the total cardio time (D28). Leave it blank when the log is for a past date. The user can edit or clear it before saving. No session clock and no Start button (D1 unchanged). **Session effort, one tap.** Optional “How hard was that?” 1–10 row, stored as nullable `session_rpe` (integer 1–10, or null). It can be skipped. Per-set RPE/RIR (D8) stay optional. Copy stays plain and non-medical. | Later insights need a duration and an effort without a live session. |
| D24 | Prefill from last time | A new set row prefills weight and reps from the most recent logged set of the same canonical exercise, across any workout. Match the set position when it exists; otherwise use the last set. Warm-ups are excluded unless the new row is tagged warm-up. Suggestions are styled differently from typed or confirmed values. One tap on the check confirms and saves them. Template targets, when the log started from a template, show as targets and never as logged values. Logged values never write back to the template. The lookup only reads history. This replaces “last session’s numbers beside each set.” Cardio prefills the last set of that exercise, including its distance unit (D28). | One tap is faster than retyping, and a suggestion is not yet a log. |
| D25 | Reliable rest timer | The D13 timer counts down from a client-held end timestamp, not by decrementing, and recomputes when the page becomes visible, so a backgrounded tab or a locked phone does not drift it. A **Keep screen on** toggle uses the Screen Wake Lock API where supported, is hidden where it is not, and re-acquires the lock on visibility. The end timestamp is not a database column. No push and no background alarms (D13). | A decrementing counter is wrong after the tab sleeps. |
| D26 | Offline-tolerant set save | Each set’s `id` is a client-generated UUID. A tick saves optimistically and queues in localStorage when the request fails or the device is offline. Retry on reconnect, on visibility, and on the next tick. The save is idempotent: `ON CONFLICT (id) DO NOTHING`, so a retry never duplicates a set. The UI shows a small “Saving… / Not synced yet” state. A reload shows server rows plus the queue. No service worker and no full offline app. RLS stays owner-scoped. | A dropped request should not lose the set or insert it twice. |
| D27 | +/− steppers | Weight steps by unit: **5 lb** or **2.5 kg**. The per-dumbbell hint still applies (D10). Reps step by 1. Tap targets are large enough for a phone browser. Typing still works. No per-exercise step setting in Slice 3. **Strength only.** Cardio uses plain inputs and a numeric keypad (D28). | Phone logging should not require a precise tap in a small field. |
| D28 | Cardio exercises | **In Slice 3** (was D12). `exercises.tracking_type` is text, not null, default `strength`, check `strength` or `cardio`. Custom create chooses Strength or Cardio and defaults to Strength. About 12 seeded cardio exercises sit inside the 120–150 total, with a primary muscle such as Cardio so the picker filter can show them: outdoor run, treadmill run, walk, incline treadmill walk, outdoor cycling, stationary bike, rowing machine, elliptical, stair climber, swimming, jump rope, air bike. Sets: `reps` nullable; nullable `duration_seconds` (integer > 0 and ≤ 86400); nullable `distance` (> 0) and `distance_unit` (`mi`, `km`, `m`), both null or both set; `reps` or `duration_seconds` required. Those columns are on the column-level insert and update grants, measurements style. RLS and the D26 client id are unchanged. The server reads `tracking_type` from the database and does not trust the client. Strength requires reps, and cardio fields are rejected. Cardio requires `duration_seconds`; distance with its unit and RPE are optional; reps, load, load_text, RIR, and the warm-up flag must be null or false. The cardio card is Time (mm:ss, also h:mm:ss), Distance plus unit, and optional effort. Tick-to-save matches strength. No steppers, and the rest timer does not auto-start. D24 prefills the last set, including its unit. Templates may include cardio; a cue such as “30 min easy” goes in the D22 note, not a numeric target. Volume and the PR badge stay strength-only. D23 uses total cardio time when the tick span is blank or shorter than that total. History shows date, time, distance, and effort. A cardio-only session counts as a workout day, and a summary shows total cardio time where it would show volume. Later insights: workouts completed and consistency include cardio; volume and strength trends stay strength-only. | A run should log without becoming a second product. |

## What the user can do (target)

### Workouts tab (`/fitness/workouts`)

- See recent sessions (date, name, duration, exercise count, volume). Volume is reps × load as entered (D10). Cardio work shows total time instead of volume (D28).
- Empty state: calm copy + **+ Log workout**, which opens a new log for today. No start chooser (D15).
- Start from a template on this tab, not from the welcome band.
- Open a session for read/edit.
- Soft-delete.
- History windowing matches measurements (5, then Show more).

### Log workout (`/fitness/workouts/new`)

FitNotes-style single screen (D1). The normal nav stays. Phone uses a sticky save/finish bar. No focus mode (D21).

1. Session name (required, trimmed, reasonable max).
2. `performed_on` defaults to validated local today and stays editable.
3. Optional duration minutes. No stopwatch, no session clock, and no Start button (D1). The finish screen may pre-fill it (D23).
4. Add exercises via the picker search sheet.
5. Per exercise: ordered set rows (reps, load, optional RPE). Dumbbell load hint says “per dumbbell”. Weight and reps have +/− steppers; typing still works (D27). A cardio card instead shows Time, Distance with mi/km/m, and optional effort, with plain inputs and no warm-up flag (D28).
6. A new row suggests the last logged set of that exercise. One tap confirms it (D24). Cardio includes the last distance unit. Template targets stay labeled as targets.
7. Each set saves as you tick it, including when offline (D26). A strength tick starts the client-side rest timer (D13, D25). A cardio tick does not. **Keep screen on** shows only where Wake Lock is supported.
8. If the log was started from a template, an exercise with template notes shows an info button that opens the note (D22).
9. Finish summary shows the PR badge when the read-time comparison in D11 says so. It pre-fills duration and offers the optional effort tap (D23). Both stay editable, including on the detail page. Optional **Save as template** from there or from detail. Saving a template does not copy confirmed set values back onto the template (D24).
10. Per-exercise history opens from the log. It is not a Library page (D16). Strength shows past sets and the PR badge. Cardio shows date, time, distance, and effort, with no PR (D28).

### Exercise picker

- Search aliases and names. This sheet is the only library UI in Slice 3 (D16).
- Muscle filter chips.
- Create custom exercise (name required; primary muscle optional for v1 if it slows ship — prefer required primary muscle). Strength or Cardio, default Strength (D28).
- Fuzzy-duplicate warning, with **Create anyway** (D19). No **Create as variant** (D20).
- The per-exercise history view is also reachable from here.

### Templates (thin)

- List owner templates.
- Start a new log prefilled from a template (prescriptions become editable actuals). The rest timer then uses the ticked set’s prescription rest seconds (D13).
- Edit the template exercise note (D22). Cardio exercises can be added. A cue such as “30 min easy” goes in that note. There are no numeric cardio target columns (D28).
- No calendar scheduler. No AI import entry until 3.1 (muted control OK).

## Data (logical)

Physical names land in ticket 3.1 schema work.

```text
exercises (global + owner custom) — tracking_type text not null default 'strength'
  check (tracking_type in ('strength', 'cardio'))
workout_sessions (completed) — performed_on, name, duration_minutes, session_rpe, notes, deleted_at
  └─ workout_exercises — position, exercise_id, notes
       └─ workout_sets — id (client-supplied uuid, primary key), position,
            reps (nullable), load, load_unit, load_text, rpe, rir, is_warmup,
            duration_seconds (nullable int), distance (nullable numeric), distance_unit (nullable text)

program_templates
  └─ session_templates (position, optional week/day labels)
       ├─ exercise_groups (optional)
       └─ exercise_templates → exercise_id, notes (nullable text)
            └─ set_prescriptions (nullable rest seconds; not copied onto completed sets)
```

No parent-link column for exercise variants (D20). No rest column on completed sets, and no rest-timer table (D13). No `is_pr` column: the badge is computed at read time (D11) and ignores cardio sets. `exercise_templates.notes` is the D22 cue. `session_rpe` is a nullable integer; a check allows null or 1–10 (D23). Duration pre-fill reads the ticked set rows’ saved-at timestamps and does not add a clock column. `workout_sets.id` is a uuid primary key, `default gen_random_uuid()` like `measurements.id`, and the client supplies it on tick (D26). There is no separate `client_id` column. Insert uses `ON CONFLICT (id) DO NOTHING`. Owner-scoped RLS is unchanged. `user_id` comes from the session.

Cardio checks on `workout_sets` (D28): `duration_seconds` is null or > 0 and ≤ 86400; `distance` is null or > 0; `distance_unit` is null or one of `mi`, `km`, `m`; `distance` and `distance_unit` are both null or both set; `reps` or `duration_seconds` is non-null. Insert and update grants name columns, including `duration_seconds`, `distance`, and `distance_unit`, the way measurements names its update columns. `id` and `user_id` stay off the update grant. Zod on every action. The set action reads `tracking_type` from the exercise row.

Versioned domain input for “save template / confirm import” is owned here so Slice 3.1 does not invent a second model.

## Future / not this slice

- Push notifications, background alarms, Watch, and a service worker. The Slice 3 timer runs only while the log page is open (D13, D25). A failed set save retries from localStorage (D26); that is not a full offline app.
- **Create as variant** (D20, gate D) — needs a parent link.
- Fitbod-style generated sessions
- Auto progressive overload
- Cardio extras (gate D): pace display, cardio PRs (longest distance or fastest time), heart rate and zones, intervals and laps, GPS or watch/Strava imports, calories, and numeric cardio targets in templates. Time and distance logging is in Slice 3 (D28).
- Full program calendar / scheduling
- Library tab content and AI Import entry (3.1)
- PR board, e1RM, and muscle-group volume charts (Slice 4). The Slice 3 PR badge is in scope (D11).
- Social sharing of workouts
- Focus mode on the log or finish screens (rejected, D21)

## Done criteria (draft)

- Signed-in user can log a multi-exercise session on a phone-width FitNotes-style screen. Each set saves as it is ticked and starts the client-side rest timer. Sets reference canonical exercises and the session is still there after refresh.
- A log started from a template shows an info button on each exercise that has template notes. The template editor can write that note.
- Finish summary shows the PR badge, computed from current log history. Editing or deleting a past workout changes it. Nothing stores the flag.
- A new set can be confirmed from a last-time suggestion in one tap. Template targets stay targets. A failed save retries without duplicating the set. Weight and reps have steppers.
- Finish pre-fills duration from ticked-set timestamps when the rules in D23 say so, and offers an optional 1–10 “How hard was that?” tap. Both can be cleared.
- Custom exercise can be created and used in a log. A fuzzy duplicate warns first, and Create anyway still saves.
- Dumbbell volume does not double the entered load. Warm-ups and cardio stay out of volume and out of the PR flag.
- A cardio set saves time, optional distance and unit, and optional effort. A cardio-only session still gets a duration when D23’s tick span is blank or shorter, and it counts as a workout day.
- Soft-deleted sessions disappear from history and streak inputs.
- Activity streak counts `performed_on` once workouts exist (ADR-014), including a cardio-only day.
- Template can be created from a session (or manually) and used to start a new log.
- Domain save contract exists for Slice 3.1 confirmation.
- OV.1 can read recent workouts (when that ticket ships with this slice).
- `npm test` covers validation, volume math (no dumbbell doubling, cardio excluded), the PR flag, the cardio checks and cross-type rejection, the duration fallback, date slack, ownership failures.
- No AI, no social, no example-data pill.

## Notes

- Product sources of truth remain the handoff pack. This folder is the Slice 3 behavior spec. The decision table was locked on Nov 23, 2026.
- Brand: charcoal + coral (`docs/brand_style_guide.md`). Supportive copy, not bro-science.
- If a mockup PNG is older than this README, the README wins (same rule as Slice 2).
