# Nov 16, 2026 product decisions

Ryan locked these on 2026-11-16. This folder is the spec. It does not implement anything: no application code, no migration, and no GitHub issue edits. Ryan opens issues from [`tickets.md`](./tickets.md) when he starts each slice.

Mockups: [`docs/mockups/nov_2026_tickets/`](../../mockups/nov_2026_tickets/README.md).

Activity streak rule: [ADR-014](../../ARCHITECTURE_DECISIONS.md) (Proposed). Weekly intention rule: [ADR-013](../../ARCHITECTURE_DECISIONS.md), unchanged.

## Scope gate

Every build ticket has one gate. **D** and **E** are not build tickets. They sit in [Future ideas](./tickets.md#future-ideas).

| Gate | Meaning |
|------|---------|
| **A** | Required for the Phase 1 path as sequenced below |
| **B** | Supporting. Small, and the loop is honest without it, but it is in this sequence |
| **C** | Quality. Tests, copy, or polish that ships with the feature it belongs to |
| **D** | Future. A real later product, not this sequence |
| **E** | Speculative. No commitment and no home slice |

There is no **E** item in this set. The rejected focus-area suggestion is not parked as a future idea.

## Sequence

Do not start a later row before the earlier one is underway. Hard dependencies are also on each ticket. This list does not move the current-slice pointer in [`docs/LAUNCH_PLAN.md`](../../LAUNCH_PLAN.md). Slice 1.5 stays the current slice until that plan says otherwise.

| Order | Work | Tickets |
|-------|------|---------|
| 1 | **CU.3** ([PR #64](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/64)) and **Slice 2** | CU.3 is already specified. Hosted Supabase steps stay in that ticket. Slice 2 is [`slice_2_journaling_life_domains/tickets.md`](../slice_2_journaling_life_domains/tickets.md). Ticket **2.6** is amended here for the single Mind page. Ticket **2.9** still updates the rest of the handoff pack. |
| 2 | **Slice 2.5** polish | **2.5.1** activity streak, **2.5.2** Weight now card |
| 3 | **Goals** | **G.1** structured goals, then **G.2** progress on the surfaces that already show the metric, and **G.3** profile cleanup |
| 4 | **Fitness Overview with the workouts slice** | **OV.1**. Not before workouts exist. Not during Slice 1.5 or Slice 2. |

Slice 2’s check-in recap still shows days journaled as “N of 7”. That number is not the activity streak. Do not remove it when 2.5.1 lands.

## What was locked

1. **Weekly intention.** The suggested domain stays the lowest check-in score. ADR-013 is unchanged. A proposal to suggest the user’s top-ranked profile focus area was rejected. The user can still change the domain before submit.
2. **One activity streak.** A calendar day counts when the user logged a journal entry or a workout. One missed day per Monday–Sunday week does not break it. Server-computed, from calendar dates, unit-tested. Until workouts exist, journal entries are the only input. ADR-014.
3. **Mind home is one page.** `/mind` has no tab bar. This confirms Slice 2 tickets 2.6 and 2.9. Stats: activity streak (this replaces “days journaled, N of 7”), 7-day average mood, domains touched, last entry. Then the 7-day mood strip, this week’s intention, recent entries (5, then Show more), and the check-in due card when it is due.
4. **Fitness Overview turns on with the workouts slice.** Contents are the F mockup: weekly workout goal hero, activity streak, Weight now, recent activity (workouts and measurements), primary **+ Log workout**, secondary **+ Log measurement**.
5. **Structured goals.** Minimum for a body-metric goal: one target number and a deadline. Weight and waist first. A weekly workout count feeds the Overview hero. Lift goals wait until workouts exist. A rule-based realism warning may suggest a later date; the user can keep theirs. Copy stays supportive and non-medical ([ADR-011](../../ARCHITECTURE_DECISIONS.md)). An LLM does not write the warning or the goal ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). Goals are edited on the profile.
6. **Weight now.** Relative calendar time (“Logged 2 days ago”), change over 30 days, and “X lb to goal” when a weight goal exists.
7. **Positive-change green** is brand `#4ADE80`, as a pill or background with charcoal text. It is not green text on white.
8. **Goal progress** on the surfaces that already show that metric, and a **small profile cleanup**, are their own tickets.

## Rejected

- Preselecting the weekly intention from the top-ranked profile focus area. Recorded on [`B-checkin-journal.png`](../../mockups/nov_2026_tickets/B-checkin-journal.png). ADR-013 still preselects the lowest score. Ties still use the Slice 2 canonical order. Habits still count only when the user scored them.
- A separate journal streak and a separate workout streak. There is one activity streak.
- Mind tabs (E, Option B), including Overview / Journal / Check-ins and the older Overview / Journal / Domains / Prompts list.
- Turning the Fitness Overview tab on before the workouts slice.
- Building the earlier Overview in [`A-dashboard-overview.png`](../../mockups/nov_2026_tickets/A-dashboard-overview.png): Goal progress panel, PRs / consistency card, and Mind cards on the Fitness page.
- LLM-written goal text in this sequence. That idea is under Future ideas, for the Coach slice.

## How old issues map

Do not edit #55 or #56. They stay as they are. When Ryan opens the new issues, these specs are the breakdown.

### #55 — Fitness welcome-band summary stat cards

[#55](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/55) asks for stat cards in the Fitness **welcome band**. The F mockup puts the numbers in the **page body**. The welcome band stays the greeting, the subtitle, and the log buttons. That supersedes #55’s band placement for these cards. #55 also said Mind cards are a separate follow-up. That part still holds.

| #55 example | Where it went |
|-------------|---------------|
| This week workouts | **OV.1** hero (“3 of 4 workouts this week”), with the workouts slice. Not a band card, and not before workouts. |
| Streak | **2.5.1** / ADR-014. One activity streak, not a workouts-only streak. |
| Weight now | **2.5.2**. Can render before Overview exists. See the open question on interim placement. |
| PRs / consistency | Not in this sequence. Future ideas. Slice 4 still owns PR-style analytics. |

### #56 — Remaining Fitness dashboard tabs

[#56](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/56) is the epic for replacing “coming soon” tabs. It says not to block Slice 2. That is still the rule.

| #56 item | Where it went |
|----------|---------------|
| Overview | **OV.1**, and only with the workouts slice. Contents are F, not A. |
| Workouts tab | Still the workouts slice. OV.1 reads logged workouts. It does not specify the workout model. |
| Library | Still Slice 3.1, after workouts. Untouched. |
| “Mind shell + Journal tab” in the suggested breakdown | Superseded as a **tab**. Mind is one page (ticket 2.6). The journal is `/mind/journal`. |
| Insights navbar, Community muted | Insights stays Slice 4 (no ticket folder yet). The Community “Soon” item is already in the navbar. The Community product is Unplanned. Owners are in `docs/navigation-ia.md`. |

## Open questions for Ryan

These are unspecified. The tickets do not invent an answer for them. Thresholds that the tickets **propose** are listed here so they are easy to confirm or replace.

1. **Focus areas and the check-in.** The top-ranked profile domain does not become the suggested intention. Is there any other way `domain_priorities` should change the check-in (copy, order of the score rows, anything else)? Nothing else is specified.
2. **Weekly workout-count deadline.** Weight and waist require a deadline. The workout count is specified as a standing weekly target with **no** end date, because the hero resets every Monday and C shows “None” on that row. Confirm that, or give it a deadline too. The ticket caps the count at 1–14. Confirm the cap.
3. **Realism thresholds.** Weight: warn above about **1% of the latest body weight per week**. Waist, proposed: warn above about **0.5% of the latest waist per week**. Both are “confirm with Ryan.” The warning never blocks save.
4. **Pace anchor.** The warning uses the latest measurement and the deadline, not the goal’s start date. Confirm that, or say the pace starts from the start date.
5. **Weight now before Overview exists.** Proposed home: the top of the Measurements tab, then **only** on Overview once OV.1 turns that tab on (not both, and not in the welcome band). Confirm or name a different interim home.
6. **Free-text fitness and wellness goals.** C says they are “Shown on the dashboard Overview,” and A has a Your goals card. F does not include that card, and F is the approved Overview. The cleanup ticket leaves the fields on the profile and does not add the card. Where should that text appear, if anywhere besides the profile form?
7. **Check-in due card position.** Ticket 2.6 places it on `/mind`, under the stat row and above the 7-day mood strip, and only when it is due. Say if it should sit somewhere else on that page.
8. **Fitness URL.** `docs/navigation-ia.md` lists Fitness Overview as `/fitness` (and `/fitness/workouts`, `/fitness/measurements`, `/fitness/library`). The app serves that shell at `/dashboard`. The header treats a `/fitness` prefix as Fitness, and there is no `/fitness` page. The IA does not choose which URL is canonical. OV.1 does not move the route.
