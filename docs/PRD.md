# Full Spectrum Fitness — Product Requirements Document (PRD)

**Role:** product source of truth — *what FSF is, what it must do, and what it must not become*.

Handoff pack: [docs/README.md](./README.md).

Read this with:

- [LAUNCH_PLAN.md](./LAUNCH_PLAN.md) — *when* each capability is built
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — *how* layers are separated
- [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) — locked why
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — what actually shipped

Vertical-slice tickets implement this PRD; they do not override it. If implementation needs a product change, update this file first and append the log.

---

## Document status

| Field | Value |
|-------|--------|
| Product direction | Longitudinal personal performance and wellbeing |
| Current implementation | Slice 1 and Slice 1.5 done. **Slice 2 is current.** Journal and check-in screens are not built yet. |
| Phase 1 destination | Capture + deterministic insights + weekly coach report v1 |
| Last planning alignment | 2026-11-17 — [ADR-013](./ARCHITECTURE_DECISIONS.md) accepted. Option B domains. The weekly check-in is Slice 2. The coach report stays Slice 5. |

---

# Product thesis

**Full Spectrum Fitness** helps a person see how **training, body metrics, mood, and life context** change together over time — and each week turns that history into a small set of observations, evidence-informed suggestions, and one reflection question.

**Central question:** *Help me understand the relationship between how I train, how I feel, and how I live.*

The product combines:

- Fitness / workout tracking
- Weight and waist measurements
- Wellbeing journaling
- Life-domain check-ins
- Weekly coach check-ins
- Deterministic analytics
- AI-generated interpretation (not AI-calculated metrics)
- A coaching agent (after v1)
- Evidence-backed knowledge / RAG (after v1)
- Eventually workout-program ingestion from PDFs / screenshots
- Longitudinal personal history

Value increases as longitudinal data accumulates. The product must not require enormous daily data entry.

---

# What FSF is not

Do not design, copy, or ticket features that pull the product toward:

- A generic AI chatbot
- A therapy, diagnosis, or clinical mental-health app
- Just another workout tracker
- A generic AI workout generator
- A social network or accountability-circle product (Phase 1)
- A badge / gamification product (Phase 1)

Language in the product and docs should prefer **wellbeing** and **performance** over **mental health treatment**. The app does not diagnose conditions.

---

# Locked product decisions

Change these here if they change; do not contradict them in a slice README.

1. **The weekly loop is a subjective check-in plus a structured coach report.** The check-in is Slice 2. The report is Slice 5, not the next implementation task. [ADR-013](./ARCHITECTURE_DECISIONS.md) amends [ADR-005](./ARCHITECTURE_DECISIONS.md).
2. **Deterministic systems** store data, validate, calculate metrics/trends, and detect explicit rule-based patterns. **Probabilistic systems** interpret, summarize, explain possible relationships, retrieve evidence, and generate reflections and suggestions.
3. **The LLM must not calculate core user metrics.** It receives a versioned analytics snapshot.
4. **Coach output is structured** so the UI can render sections reliably. Open-ended chat is not the primary AI UX.
5. **RAG is retained** as an **evidence / knowledge layer for the coach**, not as a standalone product feature and not as “search my journals” in Phase 1.
6. **The exercise library is application data** (canonical exercises, aliases, muscles). It is not the RAG corpus.
7. **Wellbeing is peer to fitness** — journal, scores, and mind trends are in Phase 1; they are not a sidebar.
8. **Social, circles, and achievements are out of Phase 1.**
9. **AI Workout Import (text PDF) is a follow-on to manual workouts** (Slice 3.1). Human review is mandatory. Screenshots/OCR are later.
10. **Slice 1.5 (measurements) is done. Slice 2 is the current slice.** Journal and check-in screens are not built yet. Profiles stay identity and preferences; measurements stay time-series.
11. **Low-friction capture:** optional daily journal; weekly check-in is the subjective ritual; workouts and weigh-ins when they happen.
12. **Safety:** no medical or psychiatric diagnosis; cautious language; crisis content is not “coached.”

---

# Target users

### Primary

- Adults who already train (or are starting) and care about how they feel and live, not only about PRs
- People who want **self-awareness over time**, not a therapist-in-an-app or a social feed

### Secondary (later)

- Personal trainers who may share programs (ingestion is post–Slice 3)
- Accountability groups — **not a Phase 1 bet**

---

# Core product loop

```text
Ongoing capture (when it happens)
  • Log workout
  • Log weight / waist
  • Optional journal entry (mood, reflection, optional one-line win and gratitude, up to three domain tags)
        ↓
Weekly check-in (Slice 2, ~2–5 minutes) — [ADR-013](./ARCHITECTURE_DECISIONS.md)
  • Stress, energy, life-domain scores
  • Last intention’s outcome, and one intention for the new week
  • Optional notes
        ↓
Analytics engine (deterministic)
  • Training volume, consistency, performance trends
  • Measurement trends
  • Wellbeing averages and deltas
  • Explicit rule-based pattern flags
        ↓
Coach report (Slice 5, probabilistic, structured)
  • Reads the snapshot and the stored check-in
  • May retrieve cited evidence (after RAG ships)
  • Few actionable suggestions + one reflection question
        ↓
Review in the Weekly Coach UI / Insights
        ↓
Next week’s history is richer
```

---

# Feature hierarchy

Do not treat later rows as current work. Sequencing: [LAUNCH_PLAN.md](./LAUNCH_PLAN.md).

### Core MVP (Phase 1)

- Authentication and profile (Slice 1 — **done**)
- Measurements: weight, waist (Slice 1.5 — **done**)
- Journal (mood, reflection, optional daily stress and energy, optional one-line win and gratitude, up to three domain tags) and the weekly check-in (Slice 2 — **current**; screens not built yet). [ADR-013](./ARCHITECTURE_DECISIONS.md)
- Manual workout logging, history, and basic performance/volume (Slice 3)
- Deterministic Insights (Slice 4)
- Weekly coach report (Slice 5) — reads the Slice 2 check-in. [ADR-013](./ARCHITECTURE_DECISIONS.md)

### Near-term (Phase 1.5)

- Canonical exercise library UX beyond what Slice 3 needs to log
- AI Workout Import, text PDF (Slice 3.1)
- Evidence RAG for the coach (Slice 5.5)
- Coach agent tools (Slice 6)
- Wins and life-event records (Slice 7). Structured dated rows (`wins`, `life_events`). Not the optional one-line win on the Slice 2 journal entry.

### Later (Phase 2)

- Adaptive reflection questions
- Journal theme extraction with inspectable entries
- Personal timeline
- Cross-domain overlay charts
- Image / screenshot / spreadsheet program ingestion
- Optional light achievements

### Future / experimental

- Wearables
- Predictive “risk” scores
- Habit-stack builder
- Community, marketplace, paid tiers
- Embedding the user’s own journals as a retrieval corpus (privacy-heavy; not the default RAG)

---

# Feature requirements

Status tags: **Done** · **Current** · **Phase 1** · **Follow-on** · **Later**

---

## 1. Authentication and user profiles — Done (Slice 1)

### Functional requirements

- Email / OAuth login via Supabase Auth
- Profile setup and edit
- Persistence across sessions
- Owner-scoped reads/writes

### Profile data

- Display name
- Fitness goal (free text; stays). Edited only on the profile. Shown read-only on the weekly check-in. Not on the Fitness Overview.
- Wellness goal (free text; stays). Same rule as the fitness goal.
- Experience level
- Domain priorities
- Sharing preference field may exist for later use; **accountability circles are not Phase 1**
- Structured goals are specified, not built: a weight goal and a waist goal are each a target number plus a deadline, plus a weekly workout count. Spec: [`docs/vertical_slices/nov_16_2026_decisions/`](./vertical_slices/nov_16_2026_decisions/README.md). Lift goals and model-written goal suggestions are later.

---

## 1.5 Baseline measurements — Done (Slice 1.5)

Users log lightweight body metrics as time-series data, separate from profile preferences.

### In scope

- Weight (`lb` / `kg`)
- Waist (`in` / `cm`)
- Create, list, and (follow-up tickets) update / soft-delete, owner-scoped
- Simple weight trend/history view
- Values stored as entered; **no unit conversion in this slice**

### Explicitly deferred

- Progress photos (front / side / back)
- Physique tape measurements (chest, arms, legs, etc.)
- Body fat percentage / wearable vitals

### Design notes

- `profiles` = stable identity and preferences
- `measurements` = metric history for analytics and later coaching
- Feed future analytics snapshots; do not block Slice 1.5 on coach work

Slice spec: [`docs/vertical_slices/slice_1_5_measurements/`](./vertical_slices/slice_1_5_measurements/).

---

## 2. Wellbeing journaling and life domains — Phase 1 (Slice 2)

### Purpose

Give the mental / wellbeing side **equal standing** with fitness: a short daily note and a weekly look at life domains, without becoming a clinical journal product.

Behavior for this slice is specified once, in [`docs/vertical_slices/slice_2_journaling_life_domains/README.md`](./vertical_slices/slice_2_journaling_life_domains/README.md). This section is the product summary. The decision record is [ADR-013](./ARCHITECTURE_DECISIONS.md).

### Life domains

Option B (Peterson / Future Authoring), not the SAMHSA wellness wheel. Canonical order:

- Physical health
- Mental health
- Family & relationships
- Social
- Career
- Learning
- Leisure
- Habits (optional on the weekly check-in)

“Mental health” is a life-domain label for how that part of the week felt, not a clinical claim ([ADR-011](./ARCHITECTURE_DECISIONS.md), [ADR-013](./ARCHITECTURE_DECISIONS.md)).

Profile focus areas use these same slugs. Saved wellness-wheel priorities are mapped onto this set ([ADR-013](./ARCHITECTURE_DECISIONS.md)). The wheel slugs are not valid beside it.

### Journal entry (Slice 2)

- Optional daily entry; **not required every day**. One row per calendar day.
- Mood (1–10) and a written reflection
- Up to three domain tags from the list above
- Optional one-line “One win today” and “Grateful for”. Both are skippable. Empty, omitted, or whitespace-only stores null. Neither blocks saving the entry. Each is at most 200 characters.
- Optional daily stress and energy (1–10), added 2026-11-21 for correlation in Insights
- No sleep or domain scores on the entry

“One win today” is a lightweight field on the journal row (`journal_entries.win`). It is not the Slice 7 `wins` table. Structured dated wins and life-event records stay Slice 7, in the near-term list above. Gratitude is this optional journal field (`journal_entries.grateful_for`). It is not a separate record type. Behavior stays in the [Slice 2 README](./vertical_slices/slice_2_journaling_life_domains/README.md).

### UX

- Fast entry (about a minute)
- History on the Mind page

### Not in Slice 2

- Context-aware AI prompts
- Weekly AI summaries (those belong to the Slice 5 coach report)
- Diagnosis, sentiment-as-clinical-label, or “mental exercises” prescribed as treatment

---

## 2.5 Weekly check-in and coach report — Phase 1

The weekly subjective check-in is **Slice 2**. The structured coach report is **Slice 5**. [ADR-013](./ARCHITECTURE_DECISIONS.md) amends [ADR-005](./ARCHITECTURE_DECISIONS.md): Slice 5 reads the stored check-in. It does not collect the form.

The check-in screen is specified in the [Slice 2 README](./vertical_slices/slice_2_journaling_life_domains/README.md). What Slice 2 stores:

- Stress and energy (1–10)
- Seven required life-domain scores, plus optional Habits
- The outcome of last week’s one intention, when that intention exists
- Exactly one intention for the new week, in `weekly_intentions`, not as columns on the check-in. The domain locks once set. The text stays editable for 3 calendar days on the server.
- Optional notes (the owner’s memory of the week, at most 1000 characters). Empty stores null. Nothing replies.

The check-in does **not** store a second mood score, sleep / recovery, motivation, nutrition adherence, or life-event text. Sleep and motivation are later. Nutrition adherence is not built. Life events are Slice 7. Notes are not a message to a coach.

### Combined automatically when the coach report runs (Slice 5)

**Fitness:** workouts completed, training volume, exercise performance, muscle-group volume (when exercise library supports it), consistency, strength trends.

**Physical:** weight, waist, measurement trends.

**Wellbeing:** journal mood, daily journal stress and energy when rated, check-in stress and energy, journal volume, check-in domain scores.

**Context:** goals from profile; check-in notes; later structured wins and life events (Slice 7), and journal themes. The Slice 2 journal lines are not those Slice 7 records.

### Coach report (structured UI)

The UI renders sections from a validated schema, for example:

- Weekly performance
- Weekly wellbeing
- Patterns / observations
- What changed
- Possible contributing factors (hypotheses, not facts)
- Suggested focus (few items)
- Reflection question
- Citations (empty until RAG)

### Guardrails

- Interpret patterns; do not diagnose medical or mental-health conditions
- Do not present probabilistic observations as medical facts
- If snapshot metrics and model text disagree, **show the snapshot numbers**
- Fallback: template/report from snapshot only if the model fails validation

---

## 3. Workout tracking — Phase 1 (Slice 3)

### Phase 1 capabilities

- Log completed workouts (date, exercises, sets, reps, load, optional RPE/RIR, rest, notes)
- Workout history
- Basic progress (e.g. estimated volume, simple PR detection on a lift)
- Reusable session templates as needed so logging is not painful
- Program templates with ordered sessions — **include in the data model** if it does not delay logging; a full program-builder UX can trail the log/history path inside Slice 3

### Exercise library (application data)

Slice 3 should not rely on forever-free-text names as the only identity.

Minimum for Phase 1 logging:

- Canonical exercise row (`slug` / id)
- Display name
- Aliases (for search and later import normalization)
- Primary muscles (and secondary if cheap)
- Equipment (optional)

Plan in the schema (even if UI is thin): movement pattern, difficulty, short instructions, substitutions.

**Do not** store exercise science papers in this table. That is RAG.

### Later workout capabilities

- Suggested progression recommendations (rules, then coach)
- Muscle-group volume analytics
- Prescription vs execution vs performance (needs programs + logs + canonical exercises)

---

## 3.1 AI Workout Import — Follow-on (Slice 3.1)

Users can upload an existing **text-based** workout PDF and use AI to create a structured, editable workout or program-template draft.

This is a follow-on to the manual workout/template foundation. It uses the same canonical data model, validation, editor concepts, and save path as manually created templates.

**Not a Phase 1 beta dependency.**

### Functional requirements

- Entry point in the Workouts tab
- Dedicated `/dashboard/workouts/import` flow
- One text-based PDF per import (maximum 10 MB and 30 pages)
- Private temporary upload and server-side text extraction
- Durable queued AI extraction with visible status/failure states
- Single-workout and ordered multi-session program support
- Optional week/day labels
- Set-level reps/ranges, load, rest, RPE/RIR, tempo, and notes
- Editable supersets/circuits/giant-set groupings
- Explicit warnings and `needs_review` flags for ambiguity
- Resumable human review before save
- User-confirmed atomic save as reusable templates
- Duplicate warning, configurable five-new-import rolling 24-hour limit, and one user-initiated extraction retry
- Bounded parsing/provider input (10 MB, 30 pages, 200,000 extracted characters, configurable token ceiling)
- Automatic transient-content deletion on confirm/cancel and seven-day expiry

### AI safety and fidelity

- AI must not invent missing workout information
- Missing or ambiguous values remain `null`
- Model output is validated against a strict, versioned schema
- AI output never writes directly to canonical workout tables
- Numeric confidence percentages are not shown
- The user must confirm the reviewed draft before canonical data is created
- Exercise names should be **normalized against the exercise library at confirm time** (alias → canonical). If matching is uncertain, keep `needs_review` rather than guessing

### Privacy and storage

- PDFs and extracted text are private and owner-scoped
- The pre-upload notice names the configured provider, states that extracted document content is sent to it, and links to provider data-use/retention information
- Only server-extracted, page-delimited text is sent to the AI provider
- Source PDF, extracted text, editable import draft, excerpts, source-derived warning text, and raw AI response are transient
- Minimal audit provenance remains after cleanup

### Explicitly deferred (later than 3.1)

- Scanned PDF OCR
- Image/screenshot, spreadsheet, DOCX, URL, and email import
- Automatic video matching
- Automatic scheduling or progression generation
- Wearable integration
- Saving imports directly as completed workout history
- Fully automated save without human review

Detailed spec: [`docs/vertical_slices/slice_3_1_ai_workout_import/`](./vertical_slices/slice_3_1_ai_workout_import/).

---

## 4. Deterministic analytics and Insights — Phase 1 (Slice 4)

### Purpose

Calculate **reproducible** metrics and trends. Surface them on Insights and pass the same snapshot to the coach.

Insights copy must not imply proven causation. Prefer “together with,” “while,” and “compared with last week,” not “this caused.”

### Analytics engine (examples)

- Training volume and week-over-week change
- Training consistency (sessions, and the one activity streak in [ADR-014](./ARCHITECTURE_DECISIONS.md) — not a separate journal streak and a separate workout streak)
- Exercise performance / plateau flags (rule-based)
- Weight and waist deltas over a window
- Average journal mood, daily journal stress / energy, check-in stress / energy, and their deltas ([ADR-013](./ARCHITECTURE_DECISIONS.md))
- Sleep / recovery is later. It is not a Slice 2 check-in field.

### Visualizations (Phase 1)

- Weight trend (already started in Slice 1.5)
- Workout frequency / volume
- Mood, stress, and energy over time (daily journal ratings, plus weekly check-in ratings once check-ins exist)
- Daily correlations: mood, stress, and energy against each other and against training days
- Simple domain snapshot from check-in scores when they exist

### Not Slice 4

- LLM-written insights as the only engine
- Predictive burnout scores
- Social graphs

---

## 5. Coaching agent — Phase 1 v1 (thin); tools later (Slice 6)

### v1 (Slice 5)

- Server assembles: profile goals, date-range analytics snapshot, the stored Slice 2 check-in ([ADR-013](./ARCHITECTURE_DECISIONS.md)), truncated recent journal text. Slice 5 does not collect the check-in form.
- One model call behind a provider-neutral adapter
- Zod-validated structured output persisted as a `coach_reports` row
- No user-facing tool loop

### Later tools (server-side only; LLM never gets raw DB credentials)

Illustrative set — implement when Slice 6 starts, not before:

- `getUserProfile()`
- `getRecentWorkouts()` / `getWorkoutHistory()`
- `getMeasurementTrends()`
- `getWellbeingTrends()`
- `getJournalEntries()`
- `getLifeDomainScores()`
- `getRecentCheckIns()`
- `calculateTrainingVolume()`
- `calculatePerformanceTrends()`
- `detectRelevantPatterns()` (rules; may already live in analytics)
- `searchKnowledgeBase()`

The agent combines structured user data, deterministic analytics, user context, retrieved evidence, and goals. It still **must not** recompute canonical metrics inside the prompt if the snapshot already contains them.

---

## 6. Evidence RAG — Follow-on (Slice 5.5)

RAG is **not** removed. It is **not** a Phase 1 standalone feature and **not** “embed the user’s journals.”

### Belongs in the knowledge base

- Systematic reviews, meta-analyses, peer-reviewed and open-access research
- Authoritative guidelines
- Topics: resistance training, hypertrophy, strength, volume, recovery, sleep, nutrition, exercise and wellbeing, stress, habit formation, general wellness / self-awareness
- Sources with licenses that permit the intended commercial use

### Does not belong there

- Random commercial fitness websites scraped because they are reachable
- The exercise library
- User journals, workouts, or check-ins as the default corpus
- Diagnostic or treatment protocols presented as personal medical advice

### Strategy (when Slice 5.5 starts)

- Prefer a **small curated corpus** over thousands of low-quality documents
- Preserve source metadata and citations
- Chunk with topic tags and document id
- Coach retrieval is triggered by **snapshot pattern types**, not by a blank chat box
- Citations appear on suggestions, not as a separate “RAG product” screen

User-history retrieval (“find my old entries about work stress”) is a **later, privacy-sensitive** capability and is not the RAG MVP.

---

## 7. Mind / wellbeing product (how pieces fit)

| Piece | Role | When |
|-------|------|------|
| Journal | Mood, reflection, optional one-line win and gratitude, up to three domain tags | Slice 2 |
| Life domains | Option B tags on the journal; scores on the weekly check-in ([ADR-013](./ARCHITECTURE_DECISIONS.md)) | Slice 2 |
| Weekly check-in | Recurring subjective ritual | Slice 2 |
| Mind trends | Charts for mood, stress, energy, and domains | Slice 2–4 |
| Themes | Tag counts first; LLM extraction later | Near-term / Phase 2 |
| Wins | Structured dated records. Not the Slice 2 journal line. | Slice 7 |
| Life events | Context for variance (job, injury, travel) | Slice 7 |
| Timeline | Unified longitudinal story | Phase 2 |
| Coach | Interprets wellbeing **with** training/body data. Reads the stored check-in. | Slice 5 |

Users should be able to inspect underlying journal entries when themes ship.

---

## 8. Social accountability — Later

Out of Phase 1. If revisited: privacy-first, support rather than competition, no requirement to share journals. Do not staff navbar Community as a Phase 1 engagement bet.

### Community and sharing (future)

Long-term vision: a community feed where people share wins, PRs, and workouts, to build community. It might start with a Share button on a PR badge or a finished workout. This is future — not Phase 1, not Slice 3. No UI, tables, or tickets now. It is not trainer program sharing; that stays post–Slice 3 ingestion. Profile `sharing_preferences` already exists for later use and is unchanged here.

When it is specced later:

- Opt-in sharing, with visibility controls.
- Journal and mind data are never shared by default and never auto-included.
- Moderation and reporting.
- It builds on the existing deterministic PR flag and workout records, so no Slice 3 data-model change is needed.

---

## 9. Achievements and badges — Later

Out of Phase 1. A future rule-based layer can reuse analytics (streaks, first workout) without a rarity/badge catalog blocking the coach loop.

---

# Database design

Physical names are finalized in slice migrations. This section is the **logical** model. **Implemented today:** `profiles`, `measurements` (see `supabase/migrations`).

Auth users live in Supabase Auth (`auth.users`). Application tables use `user_id` → `auth.users(id)` with RLS.

### Implemented

**profiles** — `user_id`, `display_name`, `fitness_goal`, `wellness_goal`, `experience_level`, `sharing_preferences`, `domain_priorities`, timestamps. `domain_priorities` uses the Option B slugs in [ADR-013](./ARCHITECTURE_DECISIONS.md). Saved wellness-wheel values are mapped onto that set. Structured goals (weight, waist, weekly workout count) are not extra columns on this row. They are specified in [`docs/vertical_slices/nov_16_2026_decisions/tickets.md`](./vertical_slices/nov_16_2026_decisions/tickets.md) (ticket G.1) and are not migrated yet.

**measurements** — `user_id`, `measurement_type` (`weight` | `waist`), `value`, `unit`, `measured_on` (calendar date), `measured_at` (UTC midnight of that date), `notes`, timestamps; soft-delete via `deleted_at` per Slice 1.5 follow-up tickets.

### Phase 1 planned

**journal_entries** — one mood and reflection per user per calendar day, plus optional nullable `win` and `grateful_for` (one line each, at most 200 characters; empty stores null). Optional nullable `stress` and `energy` (1–10). No domain-score columns. Slice 2. [ADR-013](./ARCHITECTURE_DECISIONS.md).

**journal_entry_domains** — zero to three domain tags on an entry. Not a scores table.

There is no `life_domains` lookup table and no `journal_domain_scores` table. Physical columns are in the [Slice 2 README](./vertical_slices/slice_2_journaling_life_domains/README.md) and land in ticket 2.1. They are not migrated yet.

**exercises** — canonical library (`slug`, name, aliases, primary/secondary muscles, equipment, optional pattern/difficulty/instructions).

**workout logs** — completed sessions and set rows referencing `exercise_id` (not free text alone). Separate from templates.

**workout / program templates** — canonical logical hierarchy (physical names in Slice 3):

```text
ProgramTemplate
  SessionTemplate[] (position, optional week_label / day_label)
    ExerciseGroup[] (optional)
    ExerciseTemplate[] → exercise_id, notes
      SetPrescription[] (reps, load, rest, rpe/rir, tempo, notes)
```

Completed workout logs remain separate from reusable prescriptions.

**weekly_check_ins** — one row per user per week: stress, energy, seven required domain scores, optional habits, optional notes. No second mood score, sleep, motivation, nutrition adherence, or life-event text. Slice 2. [ADR-013](./ARCHITECTURE_DECISIONS.md).

**weekly_intentions** — exactly one intention per user per week, separate from the check-in. Slice 2. [ADR-013](./ARCHITECTURE_DECISIONS.md).

**coach_reports** — `user_id`, period bounds, `analytics_snapshot` JSON, `analytics_snapshot_version`, `structured_output` JSON, model/provider ids, timestamps.

### Follow-on planned

**workout_imports** — as specified in Slice 3.1 (status, hash, draft, expiry, provenance). Transient artifacts off the public schema.

**wins**, **life_events** — dated user context. Separate from `journal_entries.win` and `journal_entries.grateful_for`, which are optional Slice 2 journal lines, not these tables.

**knowledge_documents**, **knowledge_chunks** — evidence corpus + embeddings (Slice 5.5). Prefer pgvector on Postgres when that slice starts.

### Later / not Phase 1 schema

`posts`, `circles`, `circle_members`, `achievements`, `user_achievements`.

---

# Structured vs unstructured vs deterministic vs AI

| Kind | Examples |
|------|----------|
| Structured | Measurements, set rows, check-in scores, domain scores, exercise ids, analytics snapshots, coach report JSON |
| Unstructured | Journal body, optional win and gratitude lines, check-in notes, life-event notes |
| Deterministic | Volume, deltas, streaks, PR flags, theme **counts** from tags |
| AI-generated | Interpretation, hypotheses, suggestions, reflection questions, PDF extraction drafts, later theme labels |

---

# Security and privacy

Phase 1 bar (do not substitute slogans for this):

- RLS on exposed application tables; owner-scoped access (`auth.uid()`)
- Journals, check-ins, measurements, and coach reports are **private by default**
- No end-to-end encryption in Phase 1 (would change the architecture); do not advertise E2E until it exists
- AI: send **minimum necessary** context; do not log raw journal text in application logs
- Name the provider and retention when user content leaves the app (same pattern as Slice 3.1)
- Export/delete: plan for GDPR-style user export/delete; implement when accounts leave private beta, not as a Slice 1.5 blocker
- Crisis / self-harm language: do not have the coach “treat” it; show help resources and stop coaching that turn (document copy in Slice 5)

---

# Platform

- Mobile-first responsive web (Next.js)
- Progressive onboarding (Slice 1)
- Offline drafts — future

---

# Tech stack

### Frontend

- Next.js (App Router), React, TypeScript, Tailwind CSS

### Backend

- Supabase Postgres + Auth + Storage
- `supabase-js` / `@supabase/ssr`
- SQL migrations in `supabase/migrations`
- Zod validation
- Server actions / route handlers for business logic
- **The app does not use Prisma**
- Supabase Edge Functions when Slice 3.1’s async import worker starts

### AI

- Provider-neutral server adapter; OpenAI as the initial configured provider
- Used for structured coach output (Slice 5) and import extraction (Slice 3.1)
- pgvector only when Evidence RAG starts

---

# Testing

- Unit tests (Vitest) for validation, analytics snapshot functions, and coach-output schema
- Component tests where UI logic is non-trivial
- Playwright for critical auth and capture flows
- Slice 5: golden snapshots (synthetic weeks) so the model cannot silently change metrics
- No production user journals in fixtures

---

# Risks and constraints

- Sensitive wellbeing data — minimize collection, access, and logging
- AI hallucination — schema validation, snapshot-grounded numbers, human review for imports
- Solo-developer scope — Phase 1 must stay slice-shaped
- Provider cost and outages — core logging must work without AI
- Legal/safety — not a medical device; no diagnosis

---

# Definition of Done (Phase 1 MVP)

Users can:

- Register, sign in, and maintain a profile
- Log weight and waist and see a simple weight trend
- Log a journal entry (mood, reflection, optional one-line win and gratitude, optional domain tags) and complete a weekly check-in ([ADR-013](./ARCHITECTURE_DECISIONS.md))
- Log workouts and view history
- View deterministic insights across training, body, and wellbeing
- See a **structured** coach report grounded in an analytics snapshot and the stored Slice 2 check-in

Users are **not** required to share posts, unlock badges, import PDFs, or chat with an unconstrained agent for Phase 1 to be done.
