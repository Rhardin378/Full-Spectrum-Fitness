# Slice 3 — Competitive research brief

**Status:** Draft research for product locking (2026-11-23). Not a license to copy competitor UX wholesale. FSF stays longitudinal wellbeing + training history, not “just another workout tracker” ([PRD](../../PRD.md), [LAUNCH_PLAN](../../LAUNCH_PLAN.md)).

**Also:** paste-ready ask for the FSF social bot is at the bottom. This agent run has no Slack send tool, so that message was not posted automatically.

## Market frame

Comparisons in 2025–2026 keep sorting apps into three jobs:

| Job | Apps | Who decides next weight |
|-----|------|-------------------------|
| Fast logger | Strong, Hevy (core) | User |
| Rule-based progression | Hevy Trainer, Pocket Fit-style | App, with a readable rule |
| Opaque planner | Fitbod | App model; reasoning not shown |

FSF Phase 1 is the **fast logger** lane, plus history that feeds Slice 4 analytics and Slice 5 coach. Do not ship Fitbod-style “today’s workout appears for you” or Trainer-style auto progression in Slice 3.

Sources sampled (public comparison and vendor help pages, Nov 2026): best-app.io workout tracker roundup; Protokl Fitbod vs Hevy vs Strong; Hevy vs Strong help/feature pages; Strong first-workout help; Top Sets logging-detail comparison.

## What market leaders treat as table stakes

These show up across Strong and Hevy. Treat as the bar users will expect, then decide what FSF ships in Slice 3 vs later.

1. **Empty workout and template/routine start.** Both paths exist. Empty for improvisation; template for repeats.
2. **Set-by-set rows** with weight + reps. One row per set.
3. **Previous numbers visible** while logging (or prefilled from last time). Biggest retention hook for gym-floor apps.
4. **Exercise library + custom exercises.** Search, muscle/equipment filters, create-your-own.
5. **Finish → history.** Edit after the fact is expected.
6. **Save workout as template.** After a good session, promote it.
7. **Optional RPE** (typically 6–10 scale with half steps in Strong).
8. **Supersets / circuits** on routines; some carry into live logs.
9. **Set tags:** warm-up, drop, failure (Strong excludes warm-ups from some charts).
10. **Rest timer** on mobile. Strong: per-set rest. Hevy: per-exercise default.
11. **Duration** from a session timer, editable on finish.
12. **Social feed** (Hevy home) vs quiet log (Strong). FSF already rejected social for Phase 1.

## What FSF should deliberately not copy in Slice 3

| Competitor pattern | Why not for Slice 3 |
|--------------------|---------------------|
| Social feed / friend workouts | Out of Phase 1 |
| Live rest timer as primary UX | FSF is web-first now; timer belongs with mobile/watch later |
| AI session planner (Fitbod) | Conflicts with “analytics calculate; AI interprets” and Phase 1 scope |
| Auto progressive overload | Slice 4/5 territory, not capture |
| Watch / Wear OS | Later |
| Body-part photo / AR | Not Phase 1 |
| Free-tier caps as product design | Irrelevant; FSF is invite beta |

## Implications for FSF product locks

Recommended stance going into [`README.md`](./README.md):

| Decision | Recommended lock | Competitor signal |
|----------|------------------|-------------------|
| Primary capture | **Post-hoc log** on web (date + duration minutes). Optional “in progress” later. | Strong/Hevy are live-timer first because they are gym-phone apps. FSF’s Phase 1 surface is the Fitness web shell. |
| Start path | **Empty log first**; templates as soon as “save as template” exists. Start-from-template in the same slice if thin. | Both apps expose empty + routine. |
| Set model | One row per set; reps + nullable load + unit; optional RPE; optional notes at exercise or session. | Matches both. |
| Previous performance | When adding an exercise, show **last logged sets** as reference (not forced prefill of a live timer state). | Table stakes; adapt for post-hoc. |
| Exercise identity | Seeded global library + owner custom exercises; logs always use `exercise_id`. | Both; ADR-009 already requires this. |
| Warm-up / drop / failure | Schema flag optional; **warm-up exclude from volume** if tagged. UI can be minimal. | Strong excludes warm-ups from charts. |
| Supersets | In **template** model for Slice 3.1 contract; completed-log groupings can trail. | Both have them; 3.1 needs groups on templates. |
| Rest timer | Deferred. Optional rest-seconds field on prescriptions only. | Mobile-native pattern. |
| Program builder UX | Schema yes; full builder trails log/history. | Hevy routines/folders are deeper than FSF needs for v1. |
| Social / sharing | Out. Quiet history like Strong’s product posture. | Hevy feed is a different product. |

## Mobile note

Beta form already asks “Phone / Computer / Both.” Many users will still expect phone logging later. Slice 3 mockups must work at phone width, but do not block Slice 3 on a native gym-floor timer experience. Responsive web log + history is enough for Phase 1 proof of value.

## Paste for FSF social bot

Copy into Slack (or wherever the bot lives):

```text
@fsf-social-bot research request for Full Spectrum Fitness Slice 3 (manual workout logging)

Context: We are locking product decisions and mockups for Slice 3 Workouts. Phase 1 is web-first, invite beta, no social feed, no AI workout planner. We need competitive insight, not feature envy.

Please research and summarize (with sources):

1. Top workout trackers overall and top mobile gym loggers in 2025–2026 (Strong, Hevy, Fitbod, JEFIT, and any strong newcomers).
2. For each: primary job (logger vs planner), empty workout vs templates, set logging UX, previous-set display, RPE/RIR, supersets, warm-up tags, rest timer, exercise library + custom exercises, web vs mobile vs watch.
3. What feels table-stakes for a 2026 strength logger on phone vs on desktop/web.
4. Patterns we should steal for FSF vs patterns we should reject because FSF is longitudinal (training + measurements + journal/check-in → weekly coach), not a social gym feed and not an AI session generator.
5. Mobile-specific friction: what makes logging fail in the gym (taps per set, screen lock, timer, offline).

Deliverable: a short comparison table + 8–12 concrete UX recommendations for our Slice 3 log + history + exercise picker. Flag anything that would conflict with “canonical exercise identity” and “templates separate from completed logs.”

Reply in this thread when ready. We will fold useful bits into docs/vertical_slices/slice_3_workouts/.
```
