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
- **Consequence:** Slice 4 produces a versioned analytics snapshot. Slice 5 coach consumes that snapshot. Product must still work if the model is down. The activity streak ([ADR-014](#adr-014--one-activity-streak-one-grace-day-per-week)) is one of these deterministic metrics. A model does not compute it.

---

## ADR-005 — Weekly Coach Check-In is the recurring experience, not the next slice

- **Date:** 2026-10-05
- **Status:** Accepted
- **Amended by:** [ADR-013](#adr-013--option-b-life-domains-slice-2-check-in-one-weekly-intention) (accepted 2026-11-17). This ADR stays. Do not delete it.
- **Decision:** The central user loop closes on a weekly subjective check-in plus a **structured** coach report. The check-in (recap, stress, energy, domain scores, one intention) is stored in Slice 2. The coach report is Slice 5. It reads that stored check-in and a deterministic analytics snapshot. It does not collect the form. Implementation order is still: Slice 1.5 (done), then journal and the check-in (Slice 2), workouts, analytics, then the coach report (Slice 5). Coach v1 is one server-assembled, Zod-validated report — not a chatbot and not a tool-calling agent.
- **Why:** The product is longitudinal intelligence, not a tracker with a chat box bolted on. The coach cannot interpret data that does not exist yet.
- **Consequence:** Do not start `src/lib/coach` or a chat UI during Slice 2–4. Agent tools and RAG wait until after v1. Domains, journal fields, and the one weekly intention are [ADR-013](#adr-013--option-b-life-domains-slice-2-check-in-one-weekly-intention).

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

---

## ADR-013 — Option B life domains, Slice 2 check-in, one weekly intention

- **Date:** 2026-11-04 (records the 2026-11-03 Slice 2 lock)
- **Status:** Accepted (2026-11-17, ticket 2.9)
- **Amends:** ADR-005. Does not supersede it. Language stays under ADR-011.
- **Decision:** Switch life domains from the SAMHSA wellness-wheel set to the Peterson / Future Authoring set (Option B): Physical health, Mental health, Family & relationships, Social, Career, Learning, and Leisure, plus optional Habits. Move stress and energy off the daily journal and onto the weekly check-in, and move that check-in from Slice 5 into Slice 2. The Slice 5 coach report reads the stored check-in later; it does not own the form. Store exactly one intention per week in its own `weekly_intentions` table, separate from the check-in, because the intention belongs to next week while the check-in scores last week. The intention is tied to one required domain. The lowest-scoring required domain is preselected (Habits counts only when the user scored it; ties use the canonical domain order). The user may change the domain before submit. Once set, the domain is locked. Intention text stays editable for 3 calendar days, enforced on the server (action plus a database trigger), not only in the client.
- **Why:** Option B is a deliberate, recognizable framework about keeping life domains in balance, and it ties naturally into setting an intention for the week ahead. The wellness wheel (Emotional, Physical well-being, Social / relationships, Environmental, Financial, Occupational, Spiritual / purpose) was what PRD §2 and `DOMAIN_FOCUS_AREAS` named before ticket 2.9. It is not the set Slice 2 scores or aims at. Stress and energy describe the week, not a single journal day; the daily journal stays mood plus a written reflection, with up to two domain tags. One intention, rather than a list, is the rule because a single concrete aim is what a person can hold in mind and still have time to act on. Several intentions in one week would split that focus. More than one intention per week is a future idea, not Slice 2.
- **Language:** Wellbeing and self-awareness, not therapy (ADR-011). Domain scores and the weekly intention are not a diagnosis, a treatment plan, or prescribed mental exercises. “Mental health” is a life-domain label for how that part of the week felt, not a clinical claim. The coach report, when it reads this check-in, stays in the same language.
- **Alternatives considered:**

  - Keep the SAMHSA wheel (Option A, “current” on the domain-comparison mockup) and only relabel the UI. Rejected. Slice 2 scores and intentions use Option B. Two live lists would drift.
  - Leave stress and energy on the daily journal, and leave the weekly check-in in Slice 5 with the coach report (PRD §2 and §2.5, system design, ADR-005 as originally accepted). Rejected. The approved journal does not carry those fields, and Slice 5 is too late to be the first place the week is recorded. The coach still needs the check-in; it reads the Slice 2 row.
  - Store the next intention as columns on the check-in row. Rejected. The check-in is last week’s scores. The intention is next week’s aim and has to stay addressable after that check-in (journal line, Mind card, and a later outcome). Different weeks, different tables.
  - Allow a list of intentions each week. Rejected for this slice. Focus, and time to act, need one aim. A list can be reconsidered later.
  - Enforce the 3-day text window, or the locked domain, only in the client. Rejected. A modified client must not extend the window or retarget the domain. The server rejects both.
- **Consequence:** Accepted into the handoff pack by ticket 2.9 (2026-11-17). The PRD, system design, launch plan, ADR-005, `docs/navigation-ia.md`, and `docs/vertical_slices/tracking_setup.md` match this ADR and link here. Slice 2 behavior stays specified in `docs/vertical_slices/slice_2_journaling_life_domains/README.md`. `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts` is this Option B set. Wheel slugs are not valid beside it.

  Saved `profiles.domain_priorities` keep every ranked row. The slug changes by the map below. The rank number stays. `mapStoredDomainPriorities` applies it on read. Migration `20261117170000_map_domain_priorities_to_option_b.sql` writes the same result. Unknown slugs are dropped.

  | Saved wheel slug | Preferred Option B slug | Why |
  |---|---|---|
  | `emotional` | `mental_health` | Feelings and coping. |
  | `physical` | `physical_health` | Body, sleep, nutrition. |
  | `social` | `social` | Other people. The slug stays `social`. Family & relationships is the new split and has no saved wheel key. |
  | `environmental` | `family_relationships` | Home. No surroundings domain remains. |
  | `financial` | `career` | Livelihood. No money domain remains. |
  | `occupational` | `career` | Work. |
  | `spiritual` | `leisure` | Purpose and meaningful time. No spiritual domain remains. |

  When two saved rows want the same Option B slug, the better rank (lower priority number) keeps it. The other row keeps its rank and takes the first free slug in this order: `learning`, `habits`, then the canonical Option B order. Habits is not a preferred target. A profile that saved all seven wheel domains still has seven rows. `learning` holds whichever of `financial` or `occupational` lost the `career` slot.

  Do not delete ADR-005: keep the “not a chatbot / not the next slice after 1.5” decision, and point it here. Slice 5 still produces the structured coach report after deterministic insights. It does not collect this form. Journal and check-in copy must not prescribe care (ADR-011). Habits is optional on the check-in and is not the preselected intention domain unless it was scored. The check-in may also store optional `notes` (nullable text, at most 1000 characters; empty is allowed and stores null), checked in Zod and in the database. Notes are the owner’s memory of the week, not a message to a coach, and nothing replies. Slice 5 reads `notes` as context later (ADR-004) with no new table or column. Diet adherence / appetite tracking, and coach Q&A replies to notes, are not built. Progress photos stay backlog issue #54.

---

## ADR-014 — One activity streak, one grace day per week

- **Date:** 2026-11-16
- **Status:** Proposed
- **Does not amend:** ADR-013. The weekly intention stays the lowest check-in score. A 2026-11-16 proposal to preselect the top-ranked profile focus area was rejected and is not part of this ADR.
- **Decision:** The product has one activity streak. A calendar day counts when the user logged a journal entry that day or, once a workout has a calendar day, a workout that day. The same day from both sources counts once. One missed day in a Monday–Sunday week does not break the streak. A second missed day in that same week does. The streak is recomputed on the server from those dates. It is not stored, and a model does not calculate it (ADR-004).
- **Why:** Mind and Fitness were about to grow separate streaks (“journal streak”, “workout streak”, “N of 7” on the Mind home). One rule is the number both surfaces show. A single grace day per week keeps a missed day from wiping a long run, and a second miss in that week still ends it, so the number stays meaningful. Calendar dates match journal `entry_on` and measurement `measured_on`, which already exist so a timezone cannot move the day.
- **Week boundary:** The same Monday rule as Slice 2. `week_start` is `mondayOnOrBefore(date)`. Sunday 2026-11-01 belongs to the week of 2026-10-26. Monday 2026-11-02 starts the week of 2026-11-02. The grace day is per that week, not a floating token that rolls forever. A miss on Sunday and a miss on Monday are two different weeks, so each can be the one forgiven day.
- **Inputs:** Journal `entry_on`. Workout calendar day, the same kind of `date`, only after the workouts slice stores one. Until then, journal entries are the only input. Do not invent workout hits. Dates after the validated local `today` are ignored. The loader uses the Slice 2 slack window for `today`. The pure function does not read the clock.
- **Count:** Let hits be the set of counting dates on or before `today`. If that set is empty, the streak is 0 and the grace line is hidden. Otherwise let `earliest` be the oldest hit. Walk backward from `today` when `today` is a hit, or from yesterday when it is not. Today with no log does not add a day and does not use a grace day. For each walked day that is still on or after `earliest`: a hit adds 1; the first miss in that Monday–Sunday week adds 0 and uses that week’s grace; a second miss in that week stops the walk. That stopping day and everything older are outside the streak. Days before `earliest` are not misses and are not walked. Forgiven misses do not add to the count.
- **Grace left:** Shown only when the count is at least 1. Look at this week’s calendar days from `week_start` through yesterday that are on or after `earliest`. No miss in that range: “1 grace day left this week”. Any miss: “No grace day left this week”.
- **Where it shows:** The first stat on `/mind` (ticket 2.5.1, replacing “days journaled, N of 7” from ticket 2.6). The Fitness Overview card (ticket OV.1) uses the same function once that tab turns on with the workouts slice. The check-in recap’s “N of 7” is a different number (journal rows in the check-in week, no grace, no workouts) and stays.
- **Alternatives considered:**

  - A journal streak and a workout streak. Rejected. Two numbers would disagree, and the Mind card would have to pick one.
  - “N of 7” days journaled as the Mind stat. Rejected for that slot. It stays on the check-in recap, where it describes the week being reviewed.
  - A stored counter incremented on save. Rejected. A deleted or skipped day would drift. Recomputing from the dates is the ADR-004 rule and is what the unit tests lock.
  - Forgiving one miss anywhere in the streak, with no week boundary. Rejected. The grace day would be ambiguous across months. The week already has a `week_start`.
  - Treating every empty day before the user started as a miss. Rejected. Those days are before `earliest` and are outside the streak.
  - Computing the streak in the browser from a fetched history. Rejected. The page can format the server result. It does not decide the count.
- **Consequence:** This ADR is Proposed until ticket 2.5.1 lands the function, the tests, and the Mind card. The fixture table for those tests is in [`docs/vertical_slices/nov_16_2026_decisions/tickets.md`](./vertical_slices/nov_16_2026_decisions/tickets.md) (ticket 2.5.1). Overview must not grow a second implementation. Copy stays plain (“N days”, grace left). It does not turn the streak into a badge or a shame state (ADR-007, ADR-011).

