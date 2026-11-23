# Slice 3 — Competitive research brief

**Status:** Research for the Nov 23, 2026 lock. Ryan locked the Slice 3 table in [`README.md`](./README.md). This brief is not a license to copy competitor UX wholesale, and it does not reopen a locked row. FSF stays longitudinal wellbeing + training history, not “just another workout tracker” ([PRD](../../PRD.md), [LAUNCH_PLAN](../../LAUNCH_PLAN.md)).

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
| Live session or workout stopwatch as the log | Locked D1. FitNotes-style single screen. Each set saves as you tick it. No live session state. The rest timer is a separate client-side pill (D13), not a session clock. |
| AI session planner (Fitbod) | Conflicts with “analytics calculate; AI interprets” and Phase 1 scope |
| Auto progressive overload | Slice 4/5 territory, not capture |
| Watch / Wear OS | Later |
| Body-part photo / AR | Not Phase 1 |
| Free-tier caps as product design | Irrelevant; FSF is invite beta |

## Implications for FSF product locks

Locked with [`README.md`](./README.md) on Nov 23, 2026. Where this table and the README differ, the README wins.

| Decision | Locked | Competitor signal |
|----------|--------|-------------------|
| Primary capture | **FitNotes-style single log** (D1). Date defaults to today and is editable. Each set saves as you tick it. No live session or stopwatch. Phone-width is required. | Strong/Hevy are live-timer first because they are gym-phone apps. FSF’s Phase 1 surface is the Fitness web shell. |
| Start path | **+ Log workout** opens today’s empty log. No start chooser (D15). Start from a template lives on the Workouts tab. | Both apps expose empty + routine. FSF keeps the band to one tap. |
| Set model | One row per set; reps + nullable load + unit; optional RPE; optional notes at exercise or session. Dumbbell load is per dumbbell. The hint says “per dumbbell”. Volume does not double it (D10). Template exercise notes show as an info popover on a log started from that template (D22). | Matches both on rows. Doubling dumbbells would invent load. |
| Previous performance | A small **per-exercise history view**, from the log or the picker, shows past sets and the PR badge (D16). Not a forced prefill and not a Library page. | Table stakes; adapted for a post-hoc log. |
| PRs | Deterministic badge: heaviest numeric load, excluding warm-ups and non-numeric load (D11). No PR board or e1RM. | Strong/Hevy ship richer PR boards. Those stay Slice 4. |
| Exercise identity | About **120–150** curated global exercises plus owner custom exercises. Logs use `exercise_id`. Custom create shows a fuzzy-duplicate warning, and **Create anyway** stays (D19). **Create as variant** is out (D20). | Both ship library + custom. A parent link is a later data-model change. |
| Warm-up / drop / failure | Warm-up flag optional. Warm-ups stay out of volume and out of the PR flag. | Strong excludes warm-ups from charts. |
| Supersets | In **template** model for Slice 3.1 contract; completed-log groupings can trail. | Both have them; 3.1 needs groups on templates. |
| Rest timer | **In Slice 3** (D13, revised Nov 23). Client-side pill in the sticky bar. Starts on tick. Uses the template prescription rest seconds, otherwise 90s. +30s and Skip. Visual cue at zero, plus vibration where the browser supports it. Page-open only. Rest stays on template prescriptions, not on completed sets. | Strong is per-set; Hevy is per-exercise. FSF reads the existing prescription and does not add a table. |
| Log chrome | Normal nav stays on the log and finish screens. Sticky save/finish bar on phone. No focus mode (D21). | Gym apps often hide chrome. FSF does not. |
| Library tab | Stays coming soon. The picker search sheet is the only library UI in Slice 3 (D16). | Hevy/Strong have a library home. FSF’s is Slice 3.1. |
| Program builder UX | Schema yes; full builder trails log/history. | Hevy routines/folders are deeper than FSF needs for v1. |
| Social / sharing | Out. Quiet history like Strong’s product posture. | Hevy feed is a different product. |

## Mobile note

Beta form already asks “Phone / Computer / Both.” Slice 3 requires a phone-width log (D1) and keeps the normal nav, with a sticky save/finish bar (D21). The rest timer is the client-side pill in that bar (D13). It is not a native gym-floor session, and it does not run in the background.

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
