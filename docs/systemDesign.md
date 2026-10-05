# Full Spectrum Fitness — System Design

**Role:** architecture source of truth — *how the system is layered, what is implemented, and what not to overbuild*.

Read this with:

- [`docs/PRD.md`](./PRD.md) — product requirements and data model
- [`docs/launch_plan.md`](./launch_plan.md) — current slice and build order

This document exists to prevent architecture sprawl. Prefer a boring, correct layer over a new service.

---

# 1. Purpose

This document defines:

- What the system is
- What technologies are actually being used
- How layers connect
- What is in scope **right now** versus planned
- Where AI fits without becoming the product

---

# 2. What we are building

FSF is a web application for **longitudinal personal performance and wellbeing**.

**Thesis:** help the user understand the relationship between how they train, how they feel, and how they live.

**Phase 1 destination** (not all shipped): account, measurements, journal, workouts, deterministic insights, Weekly Coach Check-In with a structured report.

**Implemented today:**

1. Sign up / sign in (Supabase Auth)
2. Profile create/update
3. Weight and waist measurements with an in-dashboard trend (Slice 1.5)

**Not yet implemented (do not pretend otherwise):** workouts, journal, insights app, weekly coach, RAG, social, achievements.

It is **not**:

- A marketplace
- A wearable integration engine
- A predictive clinical or diagnostic system
- A generic chatbot
- A social network
- A native mobile app

---

# 3. Target architecture

```text
Frontend (Next.js)
        ↓
Backend / API (server actions, route handlers)
        ↓
Structured database (Supabase Postgres + RLS)
        ↓
Deterministic analytics engine
        ↓
AI orchestration / Coaching Agent (when Slice 5+)
        ↓
Tools + evidence RAG (later)
        ↓
Structured AI output (Zod)
        ↓
Dashboard / Weekly Coach UI
```

### Deterministic systems

- Store data
- Validate data
- Calculate metrics and trends
- Detect explicit statistical or rule-based patterns

### Probabilistic systems

- Interpret patterns
- Summarize journal / check-in context
- Explain *possible* relationships
- Retrieve relevant evidence
- Generate reflections and recommendations

The LLM is **not** responsible for calculating core user metrics. If the model is unavailable, capture and charts still work.

---

# 4. High-level architecture (current)

```text
Frontend → Backend logic → Database → (AI only when a slice explicitly needs it)
```

Do not add a mesh of extra backends, queues, or vector stores for Slice 1.5–4.

---

# 5. Technology stack (current)

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

Purpose: UI, forms, charts, dashboard shells.

## Authentication

- Supabase Auth

Purpose: signup, login, session, JWTs.

Supabase Auth is **only** authentication. It is not an ORM and not the business-logic layer.

## Database

- Supabase Postgres
- Row Level Security on exposed application tables

Purpose: structured relational storage for owner-scoped application data.

## Data access and migrations

- `supabase-js` / `@supabase/ssr`
- SQL files in `supabase/migrations`
- Zod domain/input validation

The implemented application **does not use Prisma**. Application logic lives in server actions/routes and `src/lib/*` domain modules.

## Storage

- Supabase Storage when a slice needs private files (Slice 3.1 import PDFs). Not used for Slice 1.5 numeric measurements.

## AI (planned; not wired as product infrastructure today)

- Provider-neutral server adapter
- OpenAI as the initial configured provider
- Supabase Edge Functions for the Slice 3.1 asynchronous import worker **when that slice starts**

AI may:

- Produce a **structured** weekly coach report from a provided snapshot
- Extract a **reviewable** workout draft from server-extracted PDF text (Slice 3.1)

AI must not:

- Store canonical application data
- Replace the analytics engine
- Write workout or coach tables without validation (and imports require human confirm)
- Diagnose medical or mental-health conditions

---

# 6. Layer responsibilities

| Layer | Owns | Does not own |
|--------|------|----------------|
| Frontend | Forms, charts, rendering of structured coach sections | Metric formulas, RLS |
| Backend | AuthZ checks, Zod validation, orchestration, calling analytics then AI | Inventing SQL in the client |
| Database | Truth, relationships, indexes, RLS | Interpretation |
| Analytics (`src/lib/analytics` when Slice 4) | Versioned snapshots, aggregates, rule flags | Natural-language coaching |
| Coach orchestration (`src/lib/coach` when Slice 5) | Prompt assembly, schema validation, persistence of reports | Recalculating volume from raw sets inside the LLM |
| RAG (Slice 5.5) | Curated evidence chunks + citations | User PHI as the default corpus |
| Exercise library | Canonical movements for logging/analytics/import | Scientific papers |

---

# 7. Database ownership model

Supabase provides:

- Auth users
- Postgres
- Private Storage
- RLS and Data API
- Edge Functions

The repository owns:

- SQL migrations and relational schema
- Zod/domain validation
- Server actions/routes and business logic
- Storage lifecycle and AI orchestration when those slices exist

Authentication, Storage, and application tables share one owner identity (`auth.uid()`), with **separate** policies per layer.

Logical schema (implemented vs planned): [`docs/PRD.md`](./PRD.md) database section.

---

# 8. System flows

## User registration (implemented)

User → Supabase Auth → `auth.users` id → `profiles` row (get-or-create) owner-scoped.

## Logging a measurement (implemented)

Frontend modal  
→ server action  
→ Zod validation  
→ `measurements` insert (RLS)  
→ list + deterministic weight trend in `src/lib/measurements/trend.ts`

No AI.

## Logging a journal entry (Slice 2 — planned)

Frontend form  
→ server action  
→ `journal_entries` + `journal_domain_scores`  
→ stored in Postgres  
No AI required to save.

## Logging a workout (Slice 3 — planned)

Frontend form  
→ server action  
→ workout + set rows referencing `exercises`  
→ stored in Postgres  
Achievements are **not** in this flow for Phase 1.

## Viewing Insights (Slice 4 — planned)

Server loads owner data  
→ analytics module builds a snapshot (pure functions + SQL aggregates)  
→ frontend charts render snapshot fields  

No AI required.

## Weekly Coach Check-In (Slice 5 — planned)

User submits check-in  
→ persist `weekly_check_ins`  
→ build analytics snapshot for the week  
→ (optional) retrieve evidence chunks  
→ LLM returns JSON  
→ Zod validate  
→ persist `coach_reports`  
→ UI renders sections  

If the model fails: show snapshot-only summary, keep the check-in.

## AI Workout Import (Slice 3.1 — planned follow-on)

```text
Authenticated upload
  → Private Storage + owner-scoped import record
  → Server validates PDF and extracts page-delimited text
  → Edge Function / worker calls AI adapter
  → Zod validates a structured, resumable review draft
  → User edits and explicitly confirms
  → Same canonical save path as manual templates
  → Alias match to exercise library where possible
  → Transient PDF/text/model content deleted
```

The AI provider never writes workout tables directly. Manual logging remains available if import is down.

---

# 9. Current feature scope (grounded)

**You are currently building Slice 1.5:**

- Authentication (done)
- Profile setup (done)
- Baseline measurements (`weight`, `waist` time-series)
- Light Fitness dashboard shell with Measurements as the working tab

That is **now**. That is not the whole Phase 1 product.

**Phase 1 remaining slices (do not start until 1.5 is done):**

- Journal + life domains
- Workout logging + exercise identity
- Deterministic analytics / Insights
- Weekly Coach Check-In v1

**Follow-on, not beta-blocking:**

- AI Workout Import (Slice 3.1)

---

# 10. What is not being built right now

Do not introduce these while Slice 1.5 is open:

- RAG / pgvector / document ingest
- Coaching agent tool registry
- Chat UI as the primary AI surface
- Social feed, circles, posts
- Achievements / badges / notifications
- Stripe
- Wearables
- Progress photos
- Extra body measurements
- Scanned/image workout import
- Predictive modeling
- Coaching marketplace

Those are later layers. **Not today.**

---

# 11. Folder structure

**Present (keep growing by domain, not by layer soup):**

```text
src/app/           # App Router
src/components/    # UI
src/lib/supabase/  # clients, middleware
src/lib/profile/
src/lib/measurements/
supabase/migrations/
```

**Add when the matching slice starts** (not before):

```text
src/lib/journal/
src/lib/workouts/
src/lib/exercises/
src/lib/analytics/    # snapshot + rules; no LLM
src/lib/coach/        # orchestration + output schema
src/lib/ai/           # provider adapter only
src/lib/workout-imports/
supabase/functions/   # Slice 3.1 worker
```

Keep provider-specific AI behind a server-only adapter. Keep canonical workout persistence independent from AI extraction. Do not put analytics formulas inside prompt strings.

Avoid a `/social` tree until a later phase explicitly revives social.

---

# 12. Mental model

You are building:

**A structured capture system with a deterministic analytics layer and an optional, schema-bound coach.**

Not:

- An AI company
- A mental-health treatment platform
- A wearable competitor
- A gamified social fitness network

---

# 13. Architecture philosophy

Build stable layers in order:

1. Database must be correct
2. Business logic must be predictable
3. UI must be simple
4. Analytics must be testable without a model
5. AI must be optional and validated

If AI breaks, the product still functions.

Do not overengineer the MVP: one Postgres, one Next.js app, RLS, slices. Add pgvector, extra workers, and Stripe **after** the coach loop exists and users exist.

---

# 14. Scaling (future, after users)

When needed:

- pgvector for evidence chunks
- Background jobs beyond the Slice 3.1 import worker
- Caching, rate limiting
- Stripe

Not because the architecture diagram looks more impressive.

---

# 15. Safety notes (architecture)

- Owner-scoped RLS on journals, measurements, check-ins, reports
- Coach prompt assembly happens on the server
- Analytics snapshot is the numeric source of truth in the coach prompt
- Do not log raw wellbeing text
- Import path: private storage, short retention, human confirm (Slice 3.1)
- Exercise library ≠ knowledge base

---

# 16. Grounding statement

**Right now** you are finishing **measurements on Next.js + Supabase**.

**Next** you will add journal and workouts as ordinary CRUD + RLS.

**Then** you will compute snapshots in code.

**Then** you will add a weekly check-in and a structured coach report.

Everything else is expansion. If a new idea does not fit this order, change [`docs/launch_plan.md`](./launch_plan.md) first — do not sneak it into the current slice.
