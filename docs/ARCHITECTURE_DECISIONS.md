# Architecture and product decisions

**Role:** durable record of *locked* choices. Do not re-argue these in a slice ticket.

Related:

- [PRD.md](./PRD.md) — full product requirements
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — layers and constraints
- [LAUNCH_PLAN.md](./LAUNCH_PLAN.md) — sequencing
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — when something shipped or changed

Status: `Accepted` | `Superseded` | `Proposed`

To change an accepted decision: mark it superseded, add a new ADR, log the change in `DEVELOPMENT_LOG.md`, and update PRD / system design / launch plan so they stay aligned.

---

## ADR-001 — Handoff documentation pack

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** The working set is `PRD.md`, `SYSTEM_DESIGN.md`, `LAUNCH_PLAN.md`, `ARCHITECTURE_DECISIONS.md`, `DEVELOPMENT_LOG.md`, and `AI_ENGINEERING_CONTEXT.md`.
- **Why:** Product intent, architecture, sequence, decisions, chronology, and engineering health were split across chats and overlapping docs. Agents and humans need the same pack regardless of who last touched the repo.
- **Consequence:** `systemDesign.md` and `launch_plan.md` were renamed to `SYSTEM_DESIGN.md` and `LAUNCH_PLAN.md`. `DEVELOPMENT_LOG.md` is appended every meaningful session.

---

## ADR-002 — Profiles vs measurements

- **Date:** 2026-09-15 (slice 1.5 lock-in); restated 2026-10-05
- **Status:** Accepted
- **Decision:** `profiles` holds stable identity and preferences. `measurements` holds time-series body metrics (`weight`, `waist` for Slice 1.5).
- **Why:** Mixing weigh-ins into the profile row destroys history and blocks later analytics/coach snapshots.
- **Consequence:** No `current_weight` on `profiles`. Values stored as entered; no unit conversion in Slice 1.5. Physique tape measurements and progress photos are deferred.

---

## ADR-003 — No Prisma; Supabase SQL + server domain modules

- **Date:** 2026-06-23 (implementation); documented 2026-10-05
- **Status:** Accepted
- **Decision:** Schema lives in `supabase/migrations`. Access via `supabase-js` / `@supabase/ssr`, Zod, and server actions. The app does not use Prisma.
- **Why:** One database owner (Supabase), RLS as the access model, less ORM drift.
- **Consequence:** README and older PRD mentions of Prisma are wrong if they reappear. Do not add Prisma “for types.”

---

## ADR-004 — Deterministic analytics vs probabilistic AI

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Deterministic code stores, validates, calculates metrics/trends, and applies explicit rules. The LLM interprets, summarizes, hypothesizes, retrieves evidence, and generates reflections/suggestions. The LLM must not calculate core user metrics.
- **Why:** Longitudinal trust, testability, and safety. Hallucinated numbers would undermine the product thesis.
- **Consequence:** Slice 4 produces a versioned analytics snapshot. Slice 5 coach consumes that snapshot. Product must still work if the model is down.

---

## ADR-005 — Weekly Coach Check-In is the recurring experience, not the next slice

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** The central user loop closes on a weekly check-in plus a **structured** coach report. Implementation order is still: finish Slice 1.5, then journal, workouts, analytics, then coach (Slice 5). Coach v1 is one server-assembled, Zod-validated report — not a chatbot and not a tool-calling agent.
- **Why:** The product is longitudinal intelligence, not a tracker with a chat box bolted on. The coach cannot interpret data that does not exist yet.
- **Consequence:** Do not start `src/lib/coach` or a chat UI during Slice 1.5–4. Agent tools and RAG wait until after v1.

---

## ADR-006 — Slice 2 (journal) before Slice 3 (workouts)

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** After measurements, build journaling and life domains, then workouts.
- **Why:** Wellbeing is peer to fitness in the thesis. Slice 2 is a smaller capture surface than a canonical workout + exercise model.
- **Consequence:** Launch plan order is 1.5 → 2 → 3 → 4 → 5. Reverse only by superseding this ADR.

---

## ADR-007 — Phase 1 does not include social, achievements, or RAG

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Phase 1 = auth, measurements, journal, workouts, deterministic insights, weekly coach v1. Social feed, circles, badge catalogs, pgvector, and PDF import are out of Phase 1 (import is Slice 3.1 follow-on after manual workouts).
- **Why:** Those features compete with the coach loop and were the main source of doc/code drift.
- **Consequence:** Navbar “Community” and achievement menus are not Phase 1 build work.

---

## ADR-008 — RAG is an evidence layer, not user-history search

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Keep RAG. When it ships (Slice 5.5), it is a small curated corpus of licensed research/guidelines for the coach to cite. It is not embedding the user’s journals as the default knowledge base, and not scraping commercial fitness sites.
- **Why:** Citations need provenance. User journals are private structured/unstructured app data, not a public corpus.
- **Consequence:** Exercise library ≠ knowledge base. Personal “search my old entries” is a later, privacy-sensitive feature.

---

## ADR-009 — Canonical exercise library is application data

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Slice 3 workout logs reference a canonical `exercises` identity (aliases allowed). This table is not the RAG corpus.
- **Why:** Volume, PRs, coaching, and later import normalization all require stable exercise identity.
- **Consequence:** Do not ship Slice 3 with free-text `exercise_name` as the only identity.

---

## ADR-010 — AI workout import requires human review

- **Date:** 2026-09-21
- **Status:** Accepted
- **Decision:** Text-PDF import (Slice 3.1) produces a draft; the user must edit and confirm. AI never writes canonical workout tables directly. Manual logging works if AI is down. Images/OCR/spreadsheets are later than 3.1.
- **Why:** Extraction is lossy; invented loads/reps are unacceptable.
- **Consequence:** Slice 3.1 is not a Phase 1 beta blocker and must not start before Slice 3’s canonical save path exists.

---

## ADR-011 — Wellbeing language, not therapy

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Product copy and coach output use wellbeing / performance language. No diagnosis, no treatment claims, no clinical labels from the model.
- **Why:** Safety, scope, and honest positioning.
- **Consequence:** Slice 5 must include crisis/non-treatment copy. Journal Slice 2 must not prescribe “mental exercises” as care.

---

## ADR-012 — Measurements are private by default

- **Date:** 2026-10-05
- **Status:** Accepted
- **Decision:** Body measurements are owner-scoped (RLS) and are not part of any public or social surface. Social sharing is out of Phase 1 anyway.
- **Why:** Body data is sensitive; the old social-first MVP would have created pressure to share it.
- **Consequence:** No measurement posts, public profiles with weight, or feed cards in Phase 1.
