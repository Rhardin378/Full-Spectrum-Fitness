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

There is no **E** item in this set. The rejected “preselect my top focus area” suggestion is not parked as a future idea. Later ways focus areas might show up are Future ideas (gate D), and they are not Slice 2.

## Sequence

Do not start a later row before the earlier one is underway. Hard dependencies are also on each ticket. Slice 2 is the current slice in [`docs/LAUNCH_PLAN.md`](../../LAUNCH_PLAN.md) (Slice 1.5 closed 2026-11-16). This sequence does not start workouts or Overview before Slice 2’s capture tickets.

| Order | Work | Tickets |
|-------|------|---------|
| 1 | **Slice 2** (current) | CU.3 is merged in [#64](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/64), including the hosted Supabase settings. Slice 2 tickets are [`slice_2_journaling_life_domains/tickets.md`](../slice_2_journaling_life_domains/tickets.md). Ticket **2.9** aligned the pack and mapped saved domain priorities. Next is **2.1**. Ticket **2.6** is the single Mind page. Ticket **2.4** includes the read-only Your goals reminder. |
| Alongside Slice 2, before Overview | **NAV.1** Fitness URLs | CU.3 is merged, so this can start now. Required before **OV.1** and before Slice 2 ticket **2.7**. Can run beside Slice 2, 2.5, or goals. |
| 2 | **Slice 2.5** polish | **2.5.1** activity streak, **2.5.2** Weight now card (top of Measurements until OV.1) |
| 3 | **Goals** | **G.1** structured goals, then **G.2** progress on the surfaces that already show the metric, and **G.3** profile cleanup |
| 4 | **Fitness Overview with the workouts slice** | **OV.1**, after **NAV.1** and after workouts exist. Not during Slice 1.5 or Slice 2. |

Slice 2’s check-in recap still shows days journaled as “N of 7”. That number is not the activity streak. Do not remove it when 2.5.1 lands.

## What was locked

1. **Weekly intention.** The suggested domain stays the lowest check-in score. ADR-013 is unchanged. A proposal to suggest the user’s top-ranked profile focus area was rejected. Profile focus areas do not affect the check-in for now. The user can still change the domain before submit.
2. **One activity streak.** A calendar day counts when the user logged a journal entry or a workout. One missed day per Monday–Sunday week does not break it. Server-computed, from calendar dates, unit-tested. Until workouts exist, journal entries are the only input. ADR-014.
3. **Mind home is one page.** `/mind` has no tab bar. This confirms Slice 2 tickets 2.6 and 2.9. Stats: activity streak (this replaces “days journaled, N of 7”), 7-day average mood, domains touched, last entry. Then the 7-day mood strip, this week’s intention, recent entries (5, then Show more), and the check-in due card when it is due.
4. **Fitness Overview turns on with the workouts slice.** Contents are the F mockup: weekly workout goal hero, activity streak, Weight now, recent activity (workouts and measurements), primary **+ Log workout**, secondary **+ Log measurement**. The shell’s canonical URLs are `/fitness`, `/fitness/measurements`, `/fitness/workouts`, and later `/fitness/library` (**NAV.1**). `/dashboard` permanently redirects to `/fitness`.
5. **Structured goals.** Minimum for a body-metric goal: one target number and a deadline. Weight and waist first. A weekly workout count feeds the Overview hero. Lift goals wait until workouts exist. A rule-based realism warning may suggest a later date; the user can keep theirs. Copy stays supportive and non-medical ([ADR-011](../../ARCHITECTURE_DECISIONS.md)). An LLM does not write the warning or the goal ([ADR-004](../../ARCHITECTURE_DECISIONS.md)). Goals are edited on the profile.
6. **Weight now.** Relative calendar time (“Logged 2 days ago”), change over 30 days, and “X lb to goal” when a weight goal exists. The card sits at the top of the Measurements tab until **OV.1**, then only on Overview.
7. **Positive-change green** is brand `#4ADE80`, as a pill or background with charcoal text. It is not green text on white.
8. **Goal progress** on the surfaces that already show that metric, and a **small profile cleanup**, are their own tickets. Free-text fitness and wellness goals also appear as a read-only reminder on the weekly check-in (ticket 2.4). They are not edited there and they are not on Overview.

## Rejected

- Preselecting the weekly intention from the top-ranked profile focus area. Recorded on [`B-checkin-journal.png`](../../mockups/nov_2026_tickets/B-checkin-journal.png). ADR-013 still preselects the lowest score. Ties still use the Slice 2 canonical order. Habits still count only when the user scored them. Focus-area rank also does not reorder the check-in, change its copy, or feed this slice’s form. Later ideas are gate D in the tickets file.
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
| Weight now | **2.5.2**. Top of Measurements until **OV.1**, then only on Overview. |
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

## Resolved Nov 16

Ryan answered these on 2026-11-16. Nothing from this list is still open.

1. **Focus areas and the check-in.** Profile focus areas do not affect the check-in for now. They do not pick the intention domain, reorder the score rows, or change the copy. Later, and not in Slice 2: a priority-versus-score callout in the recap, ordering the domain rows by priority, and passing priorities to the Slice 5 coach. Those are Future ideas (gate D).
2. **Weekly workout count.** Standing weekly target. No deadline. Cap is 1–14. Confirmed.
3. **Realism thresholds.** Weight warns above 1% of the latest body weight per week (`0.01`). Waist warns above 0.5% of the latest waist per week (`0.005`). The warning does not block save. Confirmed.
4. **Pace anchor.** Pace is from the latest matching measurement to the deadline, not from the goal’s start date. Confirmed.
5. **Weight now placement.** Top of the Measurements tab until **OV.1**. Then the same card moves to Overview and leaves Measurements. One place only. Not in the welcome band. Confirmed.
6. **Free-text goals.** A read-only “Your goals” reminder on the Slice 2 weekly check-in (ticket 2.4). It sits after the week recap and last week’s intention, directly above the life-domain scores. It shows the profile’s free-text fitness and wellness goals, with an “Edit in profile” link and no inputs. If both are empty, hide the card or show a quiet “Add goals in your profile” link. Long text clamps. Editing stays on the profile. Not on Overview. Layout: [`G-checkin-goals-reminder.png`](../../mockups/nov_2026_tickets/G-checkin-goals-reminder.png). That PNG is the filled bar only. The empty state and the three-line clamp are spec-only; ticket 2.4 governs them.
7. **Check-in due card.** On `/mind`, under the stat cards and above the 7-day mood strip. Confirmed.
8. **Fitness URL.** `/fitness` is canonical: `/fitness`, `/fitness/measurements`, `/fitness/workouts`, and later `/fitness/library`. `/dashboard` permanently redirects to `/fitness` and keeps the query string. Ticket **NAV.1** does the move. It is scope gate B. CU.3 is merged in #64, so NAV.1 can start now. It lands before OV.1 and before Slice 2 ticket 2.7.
