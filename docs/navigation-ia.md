# Navigation & Information Architecture

Design notes for app navigation: global navbar, domain switcher, in-domain tabs, and cross-cutting features. Informed by the [PRD](./PRD.md), [README](../README.md), and dashboard mockups in `docs/mockups/navbar/`.

**Status:** Draft for design review — not yet implemented in code.

---

## Product structure

The app splits into two primary **domains**, each with its own tab bar:

| Domain | Purpose | PRD reference |
|--------|---------|---------------|
| **Fitness** | Workouts, measurements, templates, progress | §1.5, §3, §3.1 |
| **Mind** | Mental health journaling, life domains, prompts | §2, §6 |

**Cross-domain** surfaces (Insights, Community, Achievements) sit outside domain tabs — see [Cross-domain placement](#cross-domain-placement).

---

## Navigation layers

```text
┌─────────────────────────────────────────────────────────────┐
│  Navbar (global) — logo, domain switch, Insights, profile   │
├─────────────────────────────────────────────────────────────┤
│  Welcome band (contextual) — greeting, domain CTAs, stat cards│
├─────────────────────────────────────────────────────────────┤
│  Tab bar (in-domain only) — Fitness OR Mind tabs            │
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

Same shell layout as dashboard mockups; **copy, CTAs, and stat cards change by domain**.

**Fitness**
- Subtitle example: “Track training and baseline progress”
- CTAs: **+ Log workout** · **+ Log measurement**
- Stat cards: This week workouts, Streak, Weight now, PRs / consistency

**Mind**
- Subtitle example: “Reflect across your life domains”
- CTAs: **+ New journal entry** · **View prompts**
- Stat cards: Journal streak, Avg mood (7d), Domains touched, Last entry

**Visual:** Coral linear gradient welcome band (lightened right stop `#FFC4B8`) over charcoal navbar — see `docs/mockups/navbar/README.md`.

### Layer 3 — Tabs (in-domain only)

Do **not** mix Fitness and Mind items in one tab bar (supersedes the early 6-tab dashboard mockup).

#### Fitness tabs

| Tab | MVP | Notes |
|-----|-----|-------|
| Overview | Yes | Domain home — recent activity, quick actions |
| Workouts | Yes | Log, history, templates, programs |
| Measurements | Yes | Weight/waist, trend (Slice 1.5) |
| Library | Later | Templates + AI import entry (Slice 3.1); placeholder OK until then |

#### Mind tabs

| Tab | MVP | Notes |
|-----|-----|-------|
| Overview | Yes | Streak, recent mood, domain snapshot |
| Journal | Yes | New entry, history, domain filters |
| Domains | When ready | 7-domain scores / radar (lite) |
| Prompts | Later | AI lite prompts; may merge into Journal for MVP |

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

/mind                          → Mind Overview
/mind/journal
/mind/domains
/mind/prompts                  → later / placeholder

/insights                      → cross-domain trends

/profile                       → from avatar menu
/achievements                  → from avatar menu
/community                     → from navbar (coming soon → live)
```

---

## Retired from early mockups

| Old pattern | Replacement |
|-------------|-------------|
| Navbar: Dashboard, Profile, Measurements | Domain switch + avatar menu |
| Single tab bar: Overview, Journal, Workouts, Measurements, Insights, Achievements | Split into Fitness tabs + Mind tabs; Insights & Community in navbar |
| Generic stat cards on every view | Domain-specific stat cards in welcome band |

---

## Implementation checklist (future)

- [ ] Domain switcher component in navbar
- [ ] Last-visited domain persistence (cookie or profile preference)
- [ ] Community nav item with disabled / coming-soon state
- [ ] Route groups: `(fitness)`, `(mind)`, `(insights)`
- [ ] Welcome band + stat cards driven by active domain
- [ ] Achievements entry in profile dropdown

---

## Related docs

- [PRD](./PRD.md) — feature scope
- [launch_plan.md](./launch_plan.md) — phased delivery
- [docs/mockups/navbar/README.md](./mockups/navbar/README.md) — visual shell and color tokens
- [Slice 1.5 dashboard shell](./vertical_slices/slice_1_5_measurements/README.md) — Measurements tab (Fitness domain)
