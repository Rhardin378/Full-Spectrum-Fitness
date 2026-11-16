# Full Spectrum Fitness — Launch Plan

**Role:** sequencing source of truth — *what to build, in what order, and what not to start yet*.

Handoff pack: [docs/README.md](./README.md).

Read this with:

- [PRD.md](./PRD.md) — *what* the product is and must do
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) — *how* the system is layered
- [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) — locked why
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — what actually shipped

If a later idea conflicts with this document, update the handoff pack **before** starting a new slice.

---

## How to use this document

| Question | Answer |
|----------|--------|
| What am I building **this week**? | The **current slice** below |
| What is Phase 1 allowed to include? | **Phase 1 — Proof of Value** |
| Can I start AI, RAG, social, or PDF import now? | **No** — see [Do not start yet](#do-not-start-yet) |
| Where does Weekly Coach enter? | After capture + deterministic analytics exist (Slice 5) |

---

## You are here

| Slice | Status |
|-------|--------|
| Slice 1 — Authentication & Profile Setup | **Done** |
| Slice 1.5 — Measurements & Baseline Tracking | **Done** (closed 2026-11-16) |
| **Slice 2 — Journaling & Life Domains** | **Current work** |
| Slice 3+ | Planned — do not start |

Ticket-level work for the current slice lives in [`docs/vertical_slices/slice_2_journaling_life_domains/`](./vertical_slices/slice_2_journaling_life_domains/). Start with ticket **2.9** (align this handoff pack with ADR-013 and map saved `profiles.domain_priorities` to the new domains), then **2.1** (schema). Where the slice folder and this pack disagree, the slice folder is what to build until 2.9 lands.

**Cleanup backlog:** CU.1–CU.6 are done ([`docs/vertical_slices/cleanup_backlog/`](./vertical_slices/cleanup_backlog/)). CU.7 (invite-only beta sign-up) waits for “Before beta launch” below.

**Repo governance:** every change to `main` goes through a pull request. The “Protect main” ruleset blocks deletion and force-push and requires the CI check `lint-typecheck-test-build` (RG.1 / CU.6).

---

## Product thesis (locked)

FSF is a **longitudinal personal performance and wellbeing** product.

**Central question:** *Help me understand the relationship between how I train, how I feel, and how I live.*

It is **not**:

- A generic AI chatbot
- A therapy or diagnosis app
- Just another workout tracker
- A generic AI workout generator
- An app that requires enormous manual data entry

The product should get **more useful as the user accumulates history**. The recurring close of the loop is the **Weekly Coach Check-In**, not a social feed and not open-ended chat.

---

## Guiding principles

- Build **real capture and deterministic insight** before AI complexity
- Ship **one vertical slice at a time**
- Keep scope realistic for a **solo developer**
- Prefer **small, structured inputs** (weekly check-in + existing logs) over daily questionnaires
- **Analytics calculate; AI interprets**
- If AI is down, logging, history, and charts must still work
- Do not add gamification or social features to “complete” an MVP that has not yet proven the coach loop

---

## Locked sequencing decisions

These are product decisions, not suggestions. Change them here if they change.

1. **Finish Slice 1.5** before journaling, workouts, insights, or coaching work. (Done 2026-11-16.)
2. **Capture before coach.** Weekly Coach is the Phase 1 *destination*, not the next coding task. It needs workouts, journal/check-in scores, measurements, and a deterministic analytics snapshot first.
3. **Journal (Slice 2) before workouts (Slice 3)** is acceptable and preferred: wellbeing capture is as important as fitness, and Slice 2 is smaller than a full workout model. Do not reverse this without updating this file.
4. **Manual workout logging before AI import.** Slice 3.1 (text PDF) starts only after Slice 3’s canonical model and editor path exist.
5. **Deterministic Insights (Slice 4) before Weekly Coach (Slice 5).** The coach consumes a versioned analytics snapshot; the LLM must not invent core metrics.
6. **Weekly Coach v1 is a structured report, not an agent platform.** Tool-calling coach and evidence RAG come *after* a working check-in + snapshot + validated report.
7. **Social feed, accountability circles, and achievement/badge catalogs are out of Phase 1.** They are post-validation, optional, and must not delay the coach loop.
8. **Evidence RAG is planned, not current.** Do not embed user journals as the knowledge base. Do not scrape commercial fitness sites.
9. **Screenshot/spreadsheet program ingestion is later than Slice 3.1.** Reuse the same human-review pattern; do not pull it into Phase 1.
10. **Personal timeline, wins, and life events** are near-term *after* Phase 1, not blockers for the first coach report (optional free-text on the weekly check-in covers context for v1).
11. **After Slice 2’s capture work, a small Slice 2.5 polish, then goals, then Fitness Overview with the workouts slice.** Overview stays off until workouts exist. Mind home is one page (no Mind tab bar). The activity streak, the Weight now card, and structured goals are specified in [`docs/vertical_slices/nov_16_2026_decisions/`](./vertical_slices/nov_16_2026_decisions/README.md). Slice 2 is already the current slice. CU.3 is merged in [PR #64](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/64), including the hosted Supabase settings. **NAV.1** (same folder) can start now. It moves the Fitness shell from `/dashboard` to `/fitness` before Overview. `/dashboard` permanently redirects to `/fitness`.

---

## Core product loop (target)

```text
Capture (ongoing, low friction)
  workouts · measurements · optional journal
        ↓
Weekly Coach Check-In (small subjective input)
        ↓
Deterministic analytics snapshot
        ↓
Structured coach report (AI interprets the snapshot)
        ↓
User reviews, adjusts, continues logging
        ↓
History makes the next week more useful
```

Daily journaling is **optional**. The loop can close on **workouts + measurements + one weekly check-in**.

---

## Phase 1 — Proof of Value (Core MVP)

**Goal:** A user can accumulate training, body, and wellbeing data and receive a **weekly, structured interpretation** of what changed — without social features, badges, RAG, or program import.

**Phase 1 is complete when** the Definition of Done in the PRD is met — not when every idea in the backlog exists.

### In Phase 1

| Capability | Slice | Notes |
|------------|-------|--------|
| Auth & profile | 1 (done) | Goals and domain priorities live on the profile; circles are not implemented |
| Weight & waist time-series | 1.5 (done) | Deterministic weight trend in-tab; no unit conversion |
| Journal + life domains + mood/stress/energy | 2 (current) | Fast entry; AI prompts are **not** required in Slice 2 |
| Manual workout logging + history | 3 | Canonical exercise identity from the start (see PRD); templates as needed to log and reuse sessions |
| Deterministic insights | 4 | Charts + rule-based statements from an analytics snapshot |
| Weekly Coach Check-In v1 | 5 | Scores + optional reflection; server-built snapshot; Zod-validated report UI |

### Explicitly not Phase 1

- Social feed, friends, accountability circles
- Achievement / badge system
- Evidence RAG / pgvector
- Coaching **agent tools** (beyond one server-assembled prompt)
- AI Workout Import (Slice 3.1)
- Image/screenshot/spreadsheet ingestion
- Personal timeline, wins, and life-event objects (free-text context on the check-in is enough)
- Wearables, Stripe, marketplace, native apps, notifications
- Therapy, diagnosis, or clinical claims

### Phase 1 success metrics (keep small)

Track behavior that proves the thesis — not vanity or social KPIs.

- Users who log **both** training (or measurements) **and** a weekly check-in
- Weekly check-in completion among active users
- 7-day retention among users who completed onboarding
- Users who open a coach report or insights view after a check-in

Do not use free→paid conversion or social engagement as Phase 1 targets.

---

## Before beta launch

Do these just before the first beta testers get access, not earlier.

- [ ] **Beta application form.** Create the Google Form and its sheet from [`BETA_PLAN.md`](./BETA_PLAN.md). It can be shared before CU.7 is built.
- [ ] **Invite-only sign-up (CU.7).** Turn off public sign-up in Supabase, invite beta testers from the dashboard, and replace the Sign Up tab with a request-access panel that links to the beta form. Spec: [`docs/vertical_slices/cleanup_backlog/tickets.md`](./vertical_slices/cleanup_backlog/tickets.md) ticket CU.7.
- [ ] **Weekly feedback form** and a Feedback link in the app, also in `BETA_PLAN.md`.

---

## After MVP launch — operations

Settings to revisit once real users are signing up. These are hosted dashboard settings, not code.

- [ ] **Auth email rate limits and SMTP.** Supabase's built-in email sender only allows a few auth emails per hour, which is fine for testing but will block sign-up confirmations and password resets with real traffic. Set up a custom SMTP provider (Authentication → Emails → SMTP Settings), then raise the email limits in [Rate Limits](https://supabase.com/dashboard/project/argiyojdnvhsmuyzzath/auth/rate-limits). The sign-in form already shows a rate-limit message on 429s (CU.3), so this is a capacity fix, not a UX fix.

---

## Phase 1.5 — Enrichment (after the coach loop works)

Start only after Phase 1 DoD is met (or a slice is unblocked and does not steal focus from Slice 1.5 → 5).

| Slice | Purpose |
|-------|---------|
| 3.1 AI Workout Import (text PDF) | Faster template creation; human review required |
| 5.5 Evidence RAG | Small curated corpus; citations on coach suggestions |
| 6 Coach agent tools | Server-side tools wrapping analytics and reads |
| 7 Wins & life events | Structured context for later weeks |
| Exercise library UX | Aliases, substitutions, muscle metadata (schema starts in Slice 3) |

---

## Phase 2 — Longitudinal depth

- Adaptive (context-aware) reflection questions
- Journal theme surfacing with inspectable source entries
- Cross-domain overlays (e.g. volume vs energy)
- Personal timeline
- Image/screenshot program ingestion (same review/save path as 3.1)
- Optional light achievements **if** they reinforce the loop without becoming the product

---

## Phase 3 — Scale (only with real users)

- Wearables
- Predictive / risk-style scores (treat as experimental; never as diagnosis)
- Habit-stack builder
- Community / coach marketplace
- Paid tiers

---

## Vertical-slice build order

Issue tracking: [`docs/vertical_slices/tracking_setup.md`](./vertical_slices/tracking_setup.md).

| Order | Slice | User value | Depends on | Deliberately deferred |
|-------|-------|------------|------------|------------------------|
| 1 | Auth & Profile | Account and goals | — | Circles, social privacy product |
| 1.5 | Measurements | Body baseline over time | Slice 1 | Photos, extra tape measurements |
| **2** | **Journaling & Life Domains** | Wellbeing capture | Slice 1 | LLM prompts, theme extraction |
| 3 | Workouts | Training history and volume | Slice 1 | AI import, screenshot ingest |
| 4 | Deterministic Analytics & Insights | “What changed?” without AI | 1.5, 2, 3 | ML correlations presented as facts |
| 5 | Weekly Coach Check-In | Recurring coach experience | Slice 4 | Tool-calling agent, RAG |
| 3.1 | AI Workout Import | Import a text PDF as templates | Slice 3 | OCR, images, auto-save |
| 5.5 | Evidence RAG | Cited training/recovery context | Slice 5 | Large crawled corpora |
| 6 | Coach agent tools | Deeper, testable AI layer | 5, 5.5 | Client-side agents |
| 7+ | Wins, events, timeline | Richer longitudinal story | Phase 1 | — |

**MVP+ (non-blocking for Phase 1 beta):** Slice 3.1. It must not start before Slice 3 is stable. It is not required to call Phase 1 done.

---

## Do not start yet

Until Slice 2 is done, do not implement:

- Workout schemas “while journaling is finishing,” unless a tiny shared foundation is required
- AI provider integration
- RAG / embeddings
- Social or achievements
- PDF import

Until Slice 5 exists, do not implement:

- A chatbot UI as the primary AI surface
- Agent tool registries
- Knowledge-base ingestion pipelines

---

## Positioning

Not fitness tracking.  
Not journaling.  
Not social.  
Not a chatbot.

**The product is longitudinal intelligence:** structured history + deterministic analytics + a weekly coach that interprets — it does not invent — the numbers.

---

## Final note

Shipping Slice 2 with discipline matters more than designing Slice 6.

- One slice in active execution
- Update this file if the order changes
- Do not grow Phase 1 to absorb Phase 2 ideas
