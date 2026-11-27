# Nov 26, 2026 — Slice 3 / 3.1 lock-in

Ryan locked these on 2026-11-26 after a Slice 3.1 plan audit. This folder is the decision record. It does not implement anything: no application code, no migration, and no GitHub issue edits.

Related packs:

- Slice 3 planning: [`../slice_3_workouts/README.md`](../slice_3_workouts/README.md) (D1–D28; this pack adds D29–D34)
- Slice 3.1 AI import: [`../slice_3_1_ai_workout_import/`](../slice_3_1_ai_workout_import/)
- Prior sequencing: [`../nov_16_2026_decisions/README.md`](../nov_16_2026_decisions/README.md)
- ADRs: [ADR-009](../../ARCHITECTURE_DECISIONS.md), [ADR-010](../../ARCHITECTURE_DECISIONS.md)

## Scope gate

| Gate | Meaning |
|------|---------|
| **A** | Required for the Slice 3 canonical contract or Slice 3.1 import path |
| **B** | Supporting. Honest without it, but locked for this sequence |
| **C** | Quality / ops detail that ships with the feature it belongs to |
| **D** | Future. Not this sequence |

## Sequencing (Blocker #1)

**Respect the recorded sequence.** Do not implement Slice 3.1 until Slice 3’s canonical model, exercise identity, thin templates, manual editor, and save path are stable.

- Slice 2 close-out and Slice 3 implementation come first.
- Slice 3.1 remains a Phase 1.5 follow-on (ADR-010), not a beta blocker.
- New import routes use `/fitness/workouts/import` after NAV.1. Do not invent new `/dashboard` paths.

## Market research takeaways (Blocker #5)

Evidence gathered 2026-11-26 from competitor product pages and public user threads (not a formal user study):

1. **Target user:** Lifters who already own a plan outside the app—coach PDFs, creator ebooks, purchased programs, exported sheets—and want to log without rebuilding routines by hand. Mainstream trackers such as Hevy still do not import program PDFs; Hevy’s CSV path covers Strong history, not routines.
2. **Observed pain:** Manual recreation is a recurring complaint and product wedge. Users describe multi-week PDF/Excel entry as tedious; third-party converters and dedicated import apps (PDF Fit, WLog, ZON, NEPSYN, Ellim, Zealo, RepSheet) exist specifically because logging apps leave this gap.
3. **Minimum v1 document support:** Program/workout names, ordered multi-day sessions, week/day labels, exercises, set rows, exact/range/text reps, numeric or nonstandard loads, rest, RPE/RIR, notes (including tempo cues), and contiguous supersets/circuits. Human review stays mandatory. OCR, screenshots, and spreadsheet import stay deferred.

These bullets validate the current Slice 3.1 direction. They do not justify social features, auto-save without review, or OCR in 3.1.

## Locked decisions

### Slice 3 contract amendments (D29–D34)

| ID | Topic | Decision | Gate |
|----|--------|----------|------|
| D29 | Template hierarchy naming | One versioned contract: `ProgramTemplate → WorkoutTemplate[] → ExerciseTemplate[] → SetPrescription[]`, with optional contiguous exercise groups. A standalone workout is a one-workout program. UI may say “Workout” or “Program”; do not maintain separate creation contracts. User can open a program and log one selected workout without logging the whole program. Clarifies D3. | A |
| D30 | Exercise groups | Contiguous, flat, non-overlapping. At least two exercises. Each exercise belongs to at most one group. No nesting. Group type (`superset` / `circuit` / `giant_set`) is descriptive; do not enforce different member counts by type. Refines D9. | A |
| D31 | Prescription value shapes | Template reps and load use typed discriminated values: reps are `exact`, `range`, `text`, or `null`; load is `numeric`, `text`, `combined`, or `null`. Invalid parallel combinations are rejected. Aligns completed-log fields with existing D8 storage where practical. Tempo is **not** a structured column (D22 unchanged): extracted tempo cues map into the exercise note. | A |
| D32 | Zero prescribed sets | A template exercise may have zero prescribed set rows after explicit review acknowledgement when the source had no set scheme. Users may add rows in review, later template edit, or while logging. Performed sets remain distinct from prescriptions. | A |
| D33 | Template → log snapshot | Starting a workout from a template snapshots prescriptions into the log. Later template edits do not change completed or in-progress logs. Canonical `exercise_id` links remain for analytics. Analytics use **performed** values, not template targets. Extends D24. | A |
| D34 | Workout mood before/after | Optional one-tap mood on the day log (before/during) and again on the finish summary. Same integer 1–10 scale and “1 = rough, 10 = great” copy as the journal. Store as nullable `mood_before` and `mood_after` on `workout_sessions`. Never required; never blocks logging or finish. Distinct from `session_rpe` (effort). Does **not** create or update a journal entry. No free-text mood prompt in Slice 3. Wellbeing language only (ADR-011). | A |

### Slice 3.1 import locks (I1–I14)

| ID | Topic | Decision | Gate |
|----|--------|----------|------|
| I1 | Execution gate | Slice 3.1 implementation waits on a stable Slice 3 save path. | A |
| I2 | Exercise resolution | Every saved exercise requires a canonical `exercise_id` (global or owner custom). Exact unique normalized name/alias matches may prefill with a Change option. Fuzzy or AI suggestions require explicit confirmation. Unmatched names block confirmation. Aligns ADR-009 and D4/D19; supersedes the Slice 3.1 README line that deferred automatic library matching. | A |
| I3 | Ambiguity at confirm | Structural and identity issues block confirmation. Optional prescription fields may remain `null` after explicit acknowledgement. | A |
| I4 | Naming | Programs require a confirmed program name and a confirmed name for every workout. Standalone workouts require one confirmed workout name without a redundant visible container name. | A |
| I5 | Classification | AI proposes standalone vs program from structure; user may change it in review. Converting to standalone requires selecting or reducing to one workout. | A |
| I6 | Draft schema pinning | Each import pins its extraction/draft schema versions. Version-specific translators map into the current canonical contract through confirmation, cancel, or seven-day expiry. Autosaves do not rewrite schema version. | A |
| I7 | Review concurrency | Optimistic whole-draft versioning. Stale autosaves are rejected; local edits are preserved; the user explicitly resolves conflicts. | A |
| I8 | Autosave | Debounced autosave after edits, immediate save on structural actions, visible Saving/Saved/Conflict/Offline status, and a mandatory flush before confirmation. | A |
| I9 | Offline | Online-only durable storage. Temporary in-page buffering while offline; no IndexedDB/localStorage persistence of source-derived content. Confirmation disabled until sync succeeds. | A |
| I10 | Status delivery | Browser polls an authenticated status endpoint with backoff; stops in terminal states. Queue/worker durability does not depend on the browser. | B |
| I11 | Retry | Only server-classified transient/provider failures expose the one user retry. Invalid PDFs, scanned/textless files, auth failures, and expiry are not retryable. | A |
| I12 | Duplicates | Same-user identical PDF hash: warn, offer open existing active import or saved template, still allow continuation. Never compare across users. | B |
| I13 | Cancel | Confirmation dialog, then irreversible cancel, freeze edits, cleanup transient artifacts. Late processing results are discarded. | A |
| I14 | Expiry | Immutable `expires_at = created_at + 7 days`. Server time is authoritative. Confirmation succeeds only if the transaction validates before expiry. Autosaves never extend retention. | A |
| I15 | Provider retention | Release requires verified no-training API terms, explicitly accepted/disclosed provider retention controls, and accurate pre-upload disclosure. Provider retention is separate from app-side cleanup. Zero Data Retention is preferred if available, but not a hard gate if documented no-training + retention disclosure is accepted. | A |

## Rejected

- Implementing Slice 3.1 before Slice 3 is stable.
- Free-text exercise names as the only saved identity.
- Separate workout and program creation contracts.
- Nested or overlapping exercise groups.
- Structured tempo column (kept as D22 exercise note).
- Auto-accepting fuzzy exercise matches.
- Sliding or manually extendable import retention.
- Persistent offline draft storage of source-derived content.
- Cancel without confirmation, or a post-cancel undo window.
- Silent duplicate uploads.
- Last-write-wins draft concurrency.
- Automatic retry of all failures without classification.
- Sending document content to a provider without verified no-training terms and disclosed retention.
- Required before/after workout mood prompts, or a second mood scale that differs from the journal.
- Auto-creating journal entries from workout mood taps.

## Alignment notes

| Prior doc | How this pack treats it |
|-----------|-------------------------|
| Slice 3 D3 program schema | Kept. D29 names sessions as workouts in the UX/contract and locks one versioned input. |
| Slice 3 D9 template fields | Kept and refined by D30–D32. |
| Slice 3 D16 / Library tab | Unchanged. Picker ships in Slice 3; full `/fitness/library` stays later with 3.1. |
| Slice 3 D22 tempo | Unchanged. Import maps tempo text into the exercise note. |
| Slice 3.1 “automatic exercise-library matching” deferred list | **Superseded by I2.** Matching at confirm is required; OCR/image import remains deferred. |
| Slice 3.1 `/dashboard/workouts/import` | Read as `/fitness/workouts/import` after NAV.1. |

## What to do next

1. Keep building / finishing the Phase 1 path through Slice 3 using D1–D34.
2. When opening Slice 3.1 GitHub issues, copy from [`../slice_3_1_ai_workout_import/tickets.md`](../slice_3_1_ai_workout_import/tickets.md) and apply I1–I15.
3. Do not start Slice 3.1 migrations, Edge Functions, or import UI until the Slice 3 canonical save path exists.
