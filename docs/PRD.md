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
| Current implementation | Slice 1 done; **Slice 1.5 in progress** |
| Phase 1 destination | Capture + deterministic insights + Weekly Coach Check-In v1 |
| Last planning alignment | Weekly Coach as the recurring experience; RAG as evidence layer; social/achievements out of Phase 1 |

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

1. **Weekly Coach Check-In is the central recurring experience** — planned as Slice 5, not the next implementation task.
2. **Deterministic systems** store data, validate, calculate metrics/trends, and detect explicit rule-based patterns. **Probabilistic systems** interpret, summarize, explain possible relationships, retrieve evidence, and generate reflections and suggestions.
3. **The LLM must not calculate core user metrics.** It receives a versioned analytics snapshot.
4. **Coach output is structured** so the UI can render sections reliably. Open-ended chat is not the primary AI UX.
5. **RAG is retained** as an **evidence / knowledge layer for the coach**, not as a standalone product feature and not as “search my journals” in Phase 1.
6. **The exercise library is application data** (canonical exercises, aliases, muscles). It is not the RAG corpus.
7. **Wellbeing is peer to fitness** — journal, scores, and mind trends are in Phase 1; they are not a sidebar.
8. **Social, circles, and achievements are out of Phase 1.**
9. **AI Workout Import (text PDF) is a follow-on to manual workouts** (Slice 3.1). Human review is mandatory. Screenshots/OCR are later.
10. **Slice 1.5 (measurements) remains the current slice.** Profiles stay identity/preferences; measurements stay time-series.
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
  • Optional journal entry
        ↓
Weekly Coach Check-In (~2–5 minutes)
  • Mood, stress, energy, sleep/recovery, motivation
  • Optional nutrition adherence, life-domain scores
  • Significant context + optional free-form reflection
        ↓
Analytics engine (deterministic)
  • Training volume, consistency, performance trends
  • Measurement trends
  • Wellbeing averages and deltas
  • Explicit rule-based pattern flags
        ↓
Coach (probabilistic, structured)
  • Interprets the snapshot + check-in
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
- Measurements: weight, waist (Slice 1.5 — **current**)
- Journal entries with mood / stress / energy and life-domain scores (Slice 2)
- Manual workout logging, history, and basic performance/volume (Slice 3)
- Deterministic Insights (Slice 4)
- Weekly Coach Check-In v1 + structured report (Slice 5)

### Near-term (Phase 1.5)

- Canonical exercise library UX beyond what Slice 3 needs to log
- AI Workout Import, text PDF (Slice 3.1)
- Evidence RAG for the coach (Slice 5.5)
- Coach agent tools (Slice 6)
- Wins and life-event records (Slice 7)

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
- Fitness goal
- Wellness goal
- Experience level
- Domain priorities
- Sharing preference field may exist for later use; **accountability circles are not Phase 1**

---

## 1.5 Baseline measurements — Current (Slice 1.5)

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

Give the mental / wellbeing side **equal standing** with fitness: structured scores plus optional narrative, without becoming a clinical journal product.

### Life domains

- Emotional
- Physical well-being
- Social / relationships
- Environmental
- Financial
- Occupational
- Spiritual / purpose

### Journal entry (Phase 1)

- Optional daily (or ad hoc) entries; **not required every day**
- Free-text reflection
- Mood, stress, energy (1–10)
- Optional sleep quality and motivation on the entry **or** reserved for the weekly check-in (prefer **weekly check-in** for sleep/motivation if it reduces duplicate entry — Slice 2 should not invent a second full questionnaire)
- Optional domain scores
- Optional user tags (themes later can aggregate tags; no LLM theme extraction in Slice 2)

### UX

- Fast entry (about a minute)
- Save complete entries; partial drafts are nice-to-have, not Slice 2 blockers
- History and simple score trends on Mind surfaces

### Not in Slice 2

- Context-aware AI prompts
- Weekly AI summaries (those belong to Slice 5 coach)
- Diagnosis, sentiment-as-clinical-label, or “mental exercises” prescribed as treatment

---

## 2.5 Weekly Coach Check-In — Phase 1 destination (Slice 5)

The user periodically provides a **small** amount of subjective information. FSF combines it with structured data already logged.

### Subjective input (v1)

- Mood
- Stress
- Energy
- Sleep / recovery
- Motivation
- Nutrition / diet adherence (optional)
- Significant life events / context (short text)
- Optional free-form reflection
- Optional life-domain scores (if not already captured that week)

Do not turn the check-in into a long form. Prefer defaults, last-week carry-forward of optional fields, and skip-able extras.

### Combined automatically (from existing data)

**Fitness:** workouts completed, training volume, exercise performance, muscle-group volume (when exercise library supports it), consistency, strength trends.

**Physical:** weight, waist, measurement trends.

**Wellbeing:** mood / stress / energy from journals and this check-in, journal volume, domain scores when present.

**Context:** goals from profile; check-in free text; later wins, events, and journal themes.

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
- Training consistency (sessions, streaks)
- Exercise performance / plateau flags (rule-based)
- Weight and waist deltas over a window
- Average mood / stress / energy and deltas
- Sleep/recovery from check-ins when present

### Visualizations (Phase 1)

- Weight trend (already started in Slice 1.5)
- Workout frequency / volume
- Mood, stress, energy over time
- Simple domain snapshot when scores exist

### Not Slice 4

- LLM-written insights as the only engine
- Predictive burnout scores
- Social graphs

---

## 5. Coaching agent — Phase 1 v1 (thin); tools later (Slice 6)

### v1 (Slice 5)

- Server assembles: profile goals, date-range analytics snapshot, latest check-in, truncated recent journal text
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
| Journal | Narrative + optional scores/tags | Slice 2 |
| Life domains | Structured life-area scores | Slice 2 |
| Weekly check-in | Recurring subjective ritual | Slice 5 |
| Mind trends | Charts for mood/stress/energy/domains | Slice 2–4 |
| Themes | Tag counts first; LLM extraction later | Near-term / Phase 2 |
| Wins | Capture progress, not only problems | Slice 7 |
| Life events | Context for variance (job, injury, travel) | Slice 7 |
| Timeline | Unified longitudinal story | Phase 2 |
| Coach | Interprets wellbeing **with** training/body data | Slice 5 |

Users should be able to inspect underlying journal entries when themes ship.

---

## 8. Social accountability — Later

Out of Phase 1. If revisited: privacy-first, support rather than competition, no requirement to share journals. Do not staff navbar Community as a Phase 1 engagement bet.

---

## 9. Achievements and badges — Later

Out of Phase 1. A future rule-based layer can reuse analytics (streaks, first workout) without a rarity/badge catalog blocking the coach loop.

---

# Database design

Physical names are finalized in slice migrations. This section is the **logical** model. **Implemented today:** `profiles`, `measurements` (see `supabase/migrations`).

Auth users live in Supabase Auth (`auth.users`). Application tables use `user_id` → `auth.users(id)` with RLS.

### Implemented

**profiles** — `user_id`, `display_name`, `fitness_goal`, `wellness_goal`, `experience_level`, `sharing_preferences`, `domain_priorities`, timestamps.

**measurements** — `user_id`, `measurement_type` (`weight` | `waist`), `value`, `unit`, `measured_at`, `notes`, timestamps; soft-delete via `deleted_at` per Slice 1.5 follow-up tickets.

### Phase 1 planned

**life_domains** — seeded reference rows.

**journal_entries** — `user_id`, `entry_date`, `mood_score`, `stress_score`, `energy_score`, `reflection_text`, timestamps.

**journal_domain_scores** — `journal_entry_id`, `domain_id`, `score`.

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

**weekly_check_ins** — `user_id`, `week_start`, mood/stress/energy/sleep/motivation, optional nutrition adherence, context text, reflection, timestamps.

**coach_reports** — `user_id`, period bounds, `analytics_snapshot` JSON, `analytics_snapshot_version`, `structured_output` JSON, model/provider ids, timestamps.

### Follow-on planned

**workout_imports** — as specified in Slice 3.1 (status, hash, draft, expiry, provenance). Transient artifacts off the public schema.

**wins**, **life_events** — dated user context.

**knowledge_documents**, **knowledge_chunks** — evidence corpus + embeddings (Slice 5.5). Prefer pgvector on Postgres when that slice starts.

### Later / not Phase 1 schema

`posts`, `circles`, `circle_members`, `achievements`, `user_achievements`.

---

# Structured vs unstructured vs deterministic vs AI

| Kind | Examples |
|------|----------|
| Structured | Measurements, set rows, check-in scores, domain scores, exercise ids, analytics snapshots, coach report JSON |
| Unstructured | Journal body, check-in reflection, life-event notes |
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
- Log journal entries with scores and life domains
- Log workouts and view history
- View deterministic insights across training, body, and wellbeing
- Complete a Weekly Coach Check-In and see a **structured** coach report grounded in an analytics snapshot

Users are **not** required to share posts, unlock badges, import PDFs, or chat with an unconstrained agent for Phase 1 to be done.
