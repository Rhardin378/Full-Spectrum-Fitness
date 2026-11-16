# Navigation & Information Architecture

Design notes for app navigation: global navbar, domain switcher, in-domain tabs, and cross-cutting features.

**Sources of truth** for product and sequencing: [PRD](./PRD.md), [system design](./SYSTEM_DESIGN.md), [launch plan](./LAUNCH_PLAN.md). This file is a **draft IA**, not a license to build Community, Achievements, or AI prompts in Phase 1.

**Status:** Draft — Fitness measurements shell is in progress (Slice 1.5). Mind is a single page with no tab bar (decided 2026-11-16). The Fitness Overview tab stays off until the workouts slice. Domain switcher and Insights routes are not implemented yet.

**Phase 1 nav implication:** Fitness | Mind | Insights are the real destinations. Community stays omitted or “Coming soon” and **must not** become a Phase 1 build. Achievements stay out of the navbar. The subjective weekly check-in is Slice 2 (`/mind/check-in` and the due card on `/mind`). The Slice 5 coach report reads that check-in later ([ADR-013](./ARCHITECTURE_DECISIONS.md)). Do not add a Prompts tab. Mind has no tab bar.

---

## Product structure

The app splits into two primary **domains**. Fitness has a tab bar. Mind does not.

| Domain | Purpose | PRD reference |
|--------|---------|---------------|
| **Fitness** | Workouts, measurements, templates, progress | §1.5, §3, §3.1 |
| **Mind** | Journal, life domains, weekly check-in. One page at `/mind` (no tab bar). The check-in form is `/mind/check-in` (Slice 2, [ADR-013](./ARCHITECTURE_DECISIONS.md)). | PRD §2, §2.5 |

**Cross-domain** surfaces (Insights, Community, Achievements) sit outside domain tabs — see [Cross-domain placement](#cross-domain-placement).

---

## Navigation layers

```text
┌─────────────────────────────────────────────────────────────┐
│  Navbar (global) — logo, domain switch, Insights, profile   │
├─────────────────────────────────────────────────────────────┤
│  Welcome band (contextual) — greeting, domain CTAs, stat cards│
├─────────────────────────────────────────────────────────────┤
│  Tab bar (Fitness only) — Mind has no tab bar               │
├─────────────────────────────────────────────────────────────┤
│  Page content                                               │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1 — Navbar (global, stable)

| Item | MVP | Notes |
|------|-----|-------|
| Logo | Yes | Links to default / last-visited domain home |
| **Fitness \| Mind** | Yes | Primary domain switcher; active state with coral underline |
| **Insights** | Yes | Cross-domain trends (mood ↔ workouts); navbar link, not a domain tab |
| **Community** | Yes (muted) | In navbar for MVP but **disabled / “Coming soon”** styling until Slice 6 ships |
| Profile avatar + menu | Yes | Profile, Achievements, Settings, Sign out |

**Logged out:** Sign in + Get started (no domain switcher).

**Do not put in navbar:** Dashboard (replaced by domain home), Profile as a top link (use menu), Measurements (Fitness tab).

### Layer 2 — Welcome band (per domain)

Same shell layout as dashboard mockups; **greeting + subtitle change by domain** (Fitness vs Mind). Domain numbers sit in the page body when their slice ships. They are not a second row inside this band.

**Welcome-band CTAs (product decision):** use **one primary CTA that follows the active Fitness tab** (Option B). Do **not** show two fixed log buttons on every tab. Overview is the exception once workouts are live: primary **+ Log workout** and secondary **+ Log measurement**, as in the table. Mind has no tabs; its primary CTA is **+ New journal entry**.

#### Fitness welcome band

- **Subtitle (all Fitness tabs):** “Track training and baseline progress”
- **Primary CTA by active Fitness tab:**

| Active tab | Primary CTA | Notes |
|------------|-------------|--------|
| Overview | **+ Log workout** (when the workouts slice turns this tab on) | Secondary **+ Log measurement** on this tab once both flows are live. Approved layout: [`docs/mockups/nov_2026_tickets/F-fitness-overview.png`](./mockups/nov_2026_tickets/F-fitness-overview.png). Do not turn the tab on before workouts. |
| Workouts | **+ Log workout** | — |
| Measurements | **+ Log measurement** | Slice 1.5; same action as in-tab “+ Log measurement” in #15 |
| Library | None or muted “Coming soon” | Until Slice 3.1 / library ships |

- **Slice 1.5:** only the **Measurements** tab shows a welcome-band CTA (`+ Log measurement`). Other Fitness tabs show **no** log buttons in the band (coming-soon tab panels are fine). Overview stays coming soon through Slice 2.
- **Numbers live in the page body, not the welcome band.** The band stays greeting, subtitle, and CTAs. That supersedes the welcome-band stat cards in issue #55 for the cards below. Do not edit #55 from a docs change. Mapping: [`docs/vertical_slices/nov_16_2026_decisions/README.md`](./vertical_slices/nov_16_2026_decisions/README.md).
- **Slice 2.5:** Weight now card and the activity streak ([ADR-014](./ARCHITECTURE_DECISIONS.md)). Overview stays coming soon. Where Weight now sits before Overview is an open question in that README. The proposed interim home is the Measurements tab.
- **Workouts slice:** Overview turns on ([ticket OV.1](./vertical_slices/nov_16_2026_decisions/tickets.md)). Contents are the F mockup: weekly workout goal, activity streak, Weight now, recent activity. PRs / consistency stay later (Slice 4), not on this tab.

#### Mind welcome band

Mind has no tabs, so the band does not follow a tab. Decided 2026-11-16.

- Subtitle: “Reflect across your life domains”
- Primary CTA: **+ New journal entry** → `/mind/journal`
- Stat row on the page (not a second band): **Activity streak** ([ADR-014](./ARCHITECTURE_DECISIONS.md)), Avg mood (7d), Domains touched, Last entry. Not a separate journal streak, and not “N of 7” in this row. The check-in recap still has its own “N of 7”.

**Visual:** Coral linear gradient welcome band (`docs/brand_style_guide.md` / theme-preview v2) below charcoal navbar — see `docs/mockups/navbar/README.md`.

**Implementation note:** Welcome band + Fitness tab bar share **active tab state** (client shell or URL). Band primary CTA must re-render when the tab changes.

### Layer 3 — Fitness tabs

Mind has no tab bar. See below.

Do **not** mix Fitness and Mind items in one tab bar (supersedes the early 6-tab dashboard mockup).

#### Fitness tabs

| Tab | MVP | Notes |
|-----|-----|-------|
| Overview | With the workouts slice | Off until then (`coming soon`). Domain home per [`F-fitness-overview.png`](./mockups/nov_2026_tickets/F-fitness-overview.png): weekly workout goal, activity streak, Weight now, recent activity. Not during Slice 1.5 or Slice 2. |
| Workouts | Yes | Log, history, templates, programs |
| Measurements | Yes | Weight/waist, trend (Slice 1.5) |
| Library | Later | Templates + AI import entry (Slice 3.1); placeholder OK until then |

#### Mind (no tab bar)

Decided 2026-11-16. [Option A](./mockups/nov_2026_tickets/E-mind-layout-compare.png) is the page. Do not build Option B (Overview / Journal / Check-ins tabs), and do not build the older Overview / Journal / Domains / Prompts bar.

| Surface | Route | Notes |
|---------|-------|-------|
| Mind home | `/mind` | Activity streak, 7-day mood, this week’s intention, recent entries, check-in due card when due. Ticket 2.6. |
| Journal | `/mind/journal` | Today’s entry. Linked from the welcome band, not a tab. |
| Check-in | `/mind/check-in` | Weekly check-in. Not a tab. |

No `/mind/domains`, no `/mind/prompts`, no domain radar. A compact Mind row on the Fitness Overview is a later idea (bottom of E, LATER block on F). It is not part of the first Overview.

---

## Cross-domain placement

| Feature | Placement | Decision |
|---------|-----------|----------|
| **Insights** | Navbar link | ✅ Confirmed — cross-domain by nature (PRD §4) |
| **Achievements** | Profile avatar menu | ✅ Recommended — spans workout, journal, trend, social badges (PRD §7); keeps navbar uncluttered |
| **Community / Feed** | Navbar link (muted) | ✅ In MVP navbar as disabled / “Coming soon” until social slice ships (PRD §5) |
| **Profile / Settings** | Avatar dropdown | Goals, privacy, accountability circles (PRD §1) |

---

## Resolved open decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Insights — navbar or tab? | **Navbar link** |
| 2 | Achievements — navbar or profile? | **Profile menu** (recommended) |
| 3 | Default landing after login? | **Last visited** domain (Fitness or Mind); persist preference |
| 4 | Community in MVP navbar? | **Yes — visible but dulled / “Coming soon”** until feature ships |

---

## Suggested routes (target)

```text
/                              → marketing
/auth                          → login

/fitness                       → Fitness Overview (default tab)
/fitness/workouts
/fitness/measurements
/fitness/library               → later / placeholder

/mind                          → Mind home (single page, no tab bar)
/mind/journal                  → today’s journal entry
/mind/check-in                 → weekly check-in

/insights                      → cross-domain trends

/profile                       → from avatar menu
/achievements                  → from avatar menu
/community                     → from navbar (coming soon → live)
```

Do not add `/mind/domains` or `/mind/prompts`.

The live Fitness shell is still `/dashboard`. Ticket OV.1 turns the Overview tab on there. The `/fitness/...` paths above are the target IA. Moving the live route is the optional item on issue #56, not part of OV.1.

---

## Retired from early mockups

| Old pattern | Replacement |
|-------------|-------------|
| Navbar: Dashboard, Profile, Measurements | Domain switch + avatar menu |
| Single tab bar: Overview, Journal, Workouts, Measurements, Insights, Achievements | Fitness tabs only. Mind is one page. Insights and Community stay in the navbar. |
| Generic stat cards on every view | Domain-specific numbers in the page body. The welcome band keeps the greeting and CTAs. |
| Mind tabs (Overview, Journal, Domains, Prompts, or Check-ins) | Single Mind page. Journal and check-in are routes, not tabs. |

---

## Implementation checklist (future)

- [ ] Domain switcher component in navbar
- [ ] Last-visited domain persistence (cookie or profile preference)
- [ ] Community nav item with disabled / coming-soon state
- [ ] Route groups: `(fitness)`, `(mind)`, `(insights)`
- [ ] Welcome band CTAs driven by the active Fitness tab. Mind’s band is the journal CTA. Stat numbers stay in the page body, not the band.
- [ ] Achievements entry in profile dropdown

---

## Mockups

- **Fitness domain shell:** `docs/mockups/navbar/fitness-domain-shell-v1.png` — Fitness active, Measurements tab, Community “Soon”
- **Nov 16, 2026 decisions:** [`docs/mockups/nov_2026_tickets/`](./mockups/nov_2026_tickets/README.md) — Mind single page (E, Option A), approved Overview (F), profile goals (C)

---

## Related docs

- [PRD](./PRD.md) — feature scope
- [LAUNCH_PLAN.md](./LAUNCH_PLAN.md) — phased delivery
- [docs/mockups/navbar/README.md](./mockups/navbar/README.md) — visual shell and color tokens
- [Slice 1.5 dashboard shell](./vertical_slices/slice_1_5_measurements/README.md) — Measurements tab (Fitness domain)
- [Nov 16 decisions](./vertical_slices/nov_16_2026_decisions/README.md) — Mind page, activity streak, goals, when Overview turns on
