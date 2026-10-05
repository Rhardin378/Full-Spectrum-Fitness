# Navigation & Information Architecture

Design notes for app navigation: global navbar, domain switcher, in-domain tabs, and cross-cutting features.

**Sources of truth** for product and sequencing: [PRD](./PRD.md), [system design](./systemDesign.md), [launch plan](./launch_plan.md). This file is a **draft IA**, not a license to build Community, Achievements, or AI prompts in Phase 1.

**Status:** Draft — Fitness measurements shell is in progress (Slice 1.5). Domain switcher, Mind tabs, and Insights routes are not implemented yet.

**Phase 1 nav implication:** Fitness | Mind | Insights are the real destinations. Community stays omitted or “Coming soon” and **must not** become a Phase 1 build. Achievements stay out of the navbar. Weekly Coach Check-In (Slice 5) should become a prominent Mind (or cross-domain) entry when that slice starts — prefer that over a Prompts tab.

---

## Product structure

The app splits into two primary **domains**, each with its own tab bar:

| Domain | Purpose | PRD reference |
|--------|---------|---------------|
| **Fitness** | Workouts, measurements, templates, progress | §1.5, §3, §3.1 |
| **Mind** | Wellbeing journaling, life domains, weekly check-in (Slice 5) | PRD §2, §2.5 |

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

Same shell layout as dashboard mockups; **greeting + subtitle change by domain** (Fitness vs Mind). **Stat cards** change by domain when those slices ship.

**Welcome-band CTAs (product decision):** use **one primary CTA that follows the active in-domain tab** (Option B). Do **not** show two fixed log buttons on every tab. Static mockups may show dual CTAs for layout exploration; implementation follows this table.

#### Fitness welcome band

- **Subtitle (all Fitness tabs):** “Track training and baseline progress”
- **Primary CTA by active Fitness tab:**

| Active tab | Primary CTA | Notes |
|------------|-------------|--------|
| Overview | **+ Log workout** (when workouts slice ships) | Optional secondary **+ Log measurement** only when both flows are live |
| Workouts | **+ Log workout** | — |
| Measurements | **+ Log measurement** | Slice 1.5; same action as in-tab “+ Log measurement” in #15 |
| Library | None or muted “Coming soon” | Until Slice 3.1 / library ships |

- **Slice 1.5:** only the **Measurements** tab shows a welcome-band CTA (`+ Log measurement`). Other Fitness tabs show **no** log buttons in the band (coming-soon tab panels are fine).
- **Stat cards (deferred):** This week workouts, Streak, Weight now, PRs / consistency — not required for Slice 1.5 shell.

#### Mind welcome band (future)

- Subtitle example: “Reflect across your life domains”
- CTAs follow **Mind tabs** the same way (e.g. Journal → **+ New journal entry**), not Fitness CTAs.
- Stat cards: Journal streak, Avg mood (7d), Domains touched, Last entry

**Visual:** Coral linear gradient welcome band (`docs/brand_style_guide.md` / theme-preview v2) below charcoal navbar — see `docs/mockups/navbar/README.md`.

**Implementation note:** Welcome band + Fitness tab bar share **active tab state** (client shell or URL). Band primary CTA must re-render when the tab changes.

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

## Mockups

- **Fitness domain shell:** `docs/mockups/navbar/fitness-domain-shell-v1.png` — implements this IA (Fitness active, Measurements tab, Community “Soon”)

---

## Related docs

- [PRD](./PRD.md) — feature scope
- [launch_plan.md](./launch_plan.md) — phased delivery
- [docs/mockups/navbar/README.md](./mockups/navbar/README.md) — visual shell and color tokens
- [Slice 1.5 dashboard shell](./vertical_slices/slice_1_5_measurements/README.md) — Measurements tab (Fitness domain)
