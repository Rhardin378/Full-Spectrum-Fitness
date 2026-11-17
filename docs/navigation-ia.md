# Navigation & Information Architecture

Design notes for app navigation: global navbar, domain switcher, in-domain tabs, and cross-cutting features.

**Sources of truth** for product and sequencing: [PRD](./PRD.md), [system design](./SYSTEM_DESIGN.md), [launch plan](./LAUNCH_PLAN.md). This file is a **draft IA**, not a license to build Community, Achievements, or AI prompts in Phase 1.

**Status:** Draft — Slice 1.5 (measurements) is done. Slice 2 is current; Mind routes are not built yet. Mind is a single page with no tab bar (decided 2026-11-16). The Fitness Overview tab stays off until the workouts slice. Life domains and which slice stores the check-in are [ADR-013](./ARCHITECTURE_DECISIONS.md). Who builds each item is in [Who builds it](#who-builds-it), checked against the code on 2026-11-16.

**Phase 1 nav implication:** Fitness | Mind | Insights are the real destinations. Community stays omitted or “Coming soon” and **must not** become a Phase 1 build. Achievements stay out of the navbar. The subjective weekly check-in is Slice 2 (`/mind/check-in` and the due card on `/mind`). The Slice 5 coach report reads that check-in later ([ADR-013](./ARCHITECTURE_DECISIONS.md)). Do not add a Prompts tab. Mind has no tab bar.

Slice 3 (workouts), Slice 4 (Insights), and Slice 5 (coach report) are in the launch plan and have **no ticket folder** under `docs/vertical_slices/`. This file does not create those tickets. An item owned by one of those slices says so, and says the folder is missing.

---

## Who builds it

Checked against the app on 2026-11-16. **Done** means that behavior is in `main` now. A ticket or slice name is what builds the rest. **Unplanned** means no slice and no ticket owns it.

| Item | Owner | In the app now |
|------|--------|----------------|
| Logo lockup (mark + wordmark) | **Done** — Slice 1.5 ticket 1.5.3b | `src/components/brand-logo.tsx` |
| Logo goes to the last-visited domain home | **Unplanned** | The logo always links to `/` |
| Fitness navbar item, coral active state | Item **Done** — 1.5.3b / 1.5.4. Href change is **NAV.1** | Desktop and mobile. Today `href` is `/dashboard`. **NAV.1** points it at `/fitness` and keeps it active on that tree |
| Mind navbar item | **Ticket 2.6** | Visible, muted, and linked to `/dashboard`. Not `/mind` |
| Domain switcher (Fitness \| Mind, one active) | **Ticket 2.6** finishes it. Fitness half is **Done** | Mind does not switch domains yet |
| Insights navbar item | **Slice 4** — no ticket folder yet | Muted placeholder. Today `href` is `/dashboard`. **NAV.1** must not leave that href on `/dashboard`. No `/insights` page. Ticket 2.6 leaves it muted |
| Community nav item, muted, “Soon” | Chrome **Done** — 1.5.3b. Href cleanup is **NAV.1** | Desktop and mobile. Today the link is `/dashboard`. The product stays **Unplanned** |
| Community product and `/community` | **Unplanned** | Not Slice 6. Slice 6 is coach agent tools. Social is PRD §8, Phase 3 |
| Profile avatar menu: Profile, Sign out | **Done** — 1.5.3b | `src/components/profile/profile-menu.tsx` |
| Achievements row in that menu (disabled, Soon) | **Done** — 1.5.3b | Not a link |
| Achievements product and `/achievements` | **Unplanned** | PRD §9. Out of Phase 1. No achievements milestone |
| Settings row in that menu (disabled, Soon) | **Done** — 1.5.3b | Not a link |
| Settings page | **Unplanned** | No route and no ticket |
| Logged-out Sign in and Get started | **Done** | Both go to `/auth` |
| Navbar must not list Dashboard, Profile, or Measurements | **Done** | Those are not top-level nav items |
| Last-visited domain persistence | **Unplanned** | No cookie and no profile field. **NAV.1** moves the sign-in landing from `/dashboard` to `/fitness`. Remembering the last domain is still unplanned |
| Fitness tab bar | **Done** — ticket 1.5.4 | `src/components/dashboard/fitness-tabs.ts`. Measurements is the default |
| Overview tab content | **OV.1**, with the workouts slice | Coming-soon panel today |
| Workouts tab content | **Slice 3** — no ticket folder yet | Coming-soon panel today |
| Measurements tab | **Done** — Slice 1.5. URL is **NAV.1** | Live today on `/dashboard`. After NAV.1, `/fitness/measurements` |
| Library tab content | **Slice 3.1** tickets, after Slice 3 | Coming-soon panel today. Slice 3.1’s folder exists. Slice 3’s does not |
| Mind tab bar | Not built. **Ticket 2.6** ships the page without one | No Mind route yet |
| Mind home `/mind` | **Ticket 2.6** | No page. Middleware does not protect `/mind` yet (that ticket adds it) |
| `/mind/journal` | **Ticket 2.3** | No page |
| `/mind/check-in` | **Ticket 2.4** | No page |
| Mind welcome band (subtitle, **+ New journal entry**) | **Ticket 2.6** | Not built |
| Mind stat row except the streak | **Ticket 2.6** | Not built |
| Activity streak stat | **Ticket 2.5.1** | Not built |
| Intention card on Mind | **Ticket 2.5** | Not built |
| Check-in due card | **Ticket 2.7** | Not built |
| Fitness welcome band: greeting, subtitle, **+ Log measurement** only on Measurements | **Done** — 1.5.4 | `src/components/dashboard/dashboard-welcome-band.tsx` |
| Overview band: **+ Log workout** and **+ Log measurement** | **OV.1** | Other tabs show no band button today |
| Workouts band: **+ Log workout** | **Slice 3** — no ticket folder yet | No button today |
| Library band button | **Slice 3.1**, when Library ships | No button today, which is the 1.5 rule |
| `/` marketing | **Done** | `src/app/(main)/page.tsx` |
| `/auth` | **Done** | `src/app/auth/page.tsx` |
| `/profile` | **Done** — Slice 1 | `src/app/(main)/profile/page.tsx` |
| `/dashboard` Fitness shell | Shell **Done** — Slice 1.5. Redirect is **NAV.1** | Live today. **NAV.1** permanently redirects it to `/fitness` and keeps the query string |
| `/fitness` | **NAV.1** for the route. **OV.1** for Overview content | No page yet. Until OV.1, opening it selects Measurements |
| `/fitness/measurements` | **NAV.1** | Measurements, already built |
| `/fitness/workouts` | **NAV.1** for the path. **Slice 3** — no ticket folder yet — for the feature | Coming-soon panel |
| `/fitness/library` | **NAV.1** for the path. **Slice 3.1** for the feature | Coming-soon panel. Later than the other three |
| `/insights` | **Slice 4** — no ticket folder yet | No page |
| `/achievements` | **Unplanned** | No page |
| `/community` | **Unplanned** | No page |
| Route groups `(fitness)`, `(mind)`, `(insights)` | **Unplanned** | The app group is `(main)` only |
| Compact Mind card on Fitness Overview | Future idea (D) in the Nov 16 tickets. Not this sequence | Not built |

### Unplanned

Nothing in the launch plan or a ticket folder owns these:

- Logo destination is the last-visited domain home (the logo links to `/` today).
- Last-visited domain persistence. **NAV.1** moves today’s sign-in landing from `/dashboard` to `/fitness`. Remembering the last domain is still unplanned.
- Community product and `/community`. The Soon item in the navbar is Done.
- Achievements product and `/achievements`. The disabled menu row is Done.
- Settings page. The disabled menu row is Done.
- Route groups `(fitness)`, `(mind)`, and `(insights)`.

### Fitness URL — resolved 2026-11-16

`/fitness` is canonical: `/fitness`, `/fitness/measurements`, `/fitness/workouts`, and later `/fitness/library`. `/dashboard` permanently redirects to `/fitness` and keeps the query string. Ticket **NAV.1** does the move. CU.3 is merged in #64, so NAV.1 can start now, and it lands before OV.1. The app still serves the shell at `/dashboard` until that ticket. Sign-in landing becomes `/fitness`. Last-visited domain memory stays unplanned.

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

| Item | MVP | Owner | Notes |
|------|-----|-------|-------|
| Logo | Yes | Lockup **Done**. Destination **Unplanned** | The mark is in the navbar. It links to `/`, not to a last-visited domain home |
| **Fitness \| Mind** | Yes | Fitness link **Done**. Href **NAV.1**. Mind link **ticket 2.6** | Coral active state exists for Fitness. Today both point at `/dashboard`. NAV.1 points Fitness at `/fitness`. Ticket 2.6 points Mind at `/mind` |
| **Insights** | Yes | **Slice 4** — no ticket folder yet | Navbar link, not a domain tab. Placeholder is muted |
| **Community** | Yes (muted) | Chrome **Done**. Product **Unplanned** | “Soon” badge is in the navbar. The product is PRD §8, not Slice 6 |
| Profile avatar + menu | Yes | Profile and Sign out **Done**. Achievements and Settings pages **Unplanned** | Achievements and Settings rows are disabled “Soon” placeholders |

**Logged out:** Sign in + Get started (no domain switcher). **Done.** Both links go to `/auth`.

**Do not put in navbar:** Dashboard, Profile as a top link, Measurements. **Done.** Those labels are not in the navbar. Profile is in the avatar menu. Measurements is a Fitness tab.

### Layer 2 — Welcome band (per domain)

Same shell layout as dashboard mockups; **greeting + subtitle change by domain** (Fitness vs Mind). Domain numbers sit in the page body when their slice ships. They are not a second row inside this band.

**Welcome-band CTAs (product decision):** use **one primary CTA that follows the active Fitness tab** (Option B). Do **not** show two fixed log buttons on every tab. Overview is the exception once workouts are live: primary **+ Log workout** and secondary **+ Log measurement**, as in the table. Mind has no tabs; its primary CTA is **+ New journal entry**.

#### Fitness welcome band

- **Subtitle (all Fitness tabs):** “Track training and baseline progress”
- **Primary CTA by active Fitness tab:**

| Active tab | Primary CTA | Owner | Notes |
|------------|-------------|-------|-------|
| Overview | **+ Log workout** (when the workouts slice turns this tab on) | **OV.1** | Secondary **+ Log measurement** on this tab once both flows are live. Approved layout: [`F-fitness-overview.png`](./mockups/nov_2026_tickets/F-fitness-overview.png). Do not turn the tab on before workouts. |
| Workouts | **+ Log workout** | **Slice 3** — no ticket folder yet | — |
| Measurements | **+ Log measurement** | **Done** — Slice 1.5 | Same action as in-tab “+ Log measurement”. This is the only band button in the app today |
| Library | None until Library ships | **Slice 3.1** | The shell already shows no button here |

- **Slice 1.5:** only the **Measurements** tab shows a welcome-band CTA (`+ Log measurement`). Other Fitness tabs show **no** log buttons in the band (coming-soon tab panels are fine). Overview stays coming soon through Slice 2.
- **Numbers live in the page body, not the welcome band.** The band stays greeting, subtitle, and CTAs. That supersedes the welcome-band stat cards in issue #55 for the cards below. Do not edit #55 from a docs change. Mapping: [`docs/vertical_slices/nov_16_2026_decisions/README.md`](./vertical_slices/nov_16_2026_decisions/README.md).
- **Slice 2.5:** Weight now card and the activity streak ([ADR-014](./ARCHITECTURE_DECISIONS.md)). The card is at the top of Measurements until **OV.1**, then only on Overview. Overview stays coming soon until then.
- **Workouts slice:** Overview turns on ([ticket OV.1](./vertical_slices/nov_16_2026_decisions/tickets.md)). Contents are the F mockup: weekly workout goal, activity streak, Weight now, recent activity. PRs / consistency stay later (Slice 4), not on this tab.

#### Mind welcome band

Mind has no tabs, so the band does not follow a tab. Decided 2026-11-16.

- Subtitle: “Reflect across your life domains”
- Primary CTA: **+ New journal entry** → `/mind/journal`
- Stat row on the page (not a second band): **Activity streak** ([ADR-014](./ARCHITECTURE_DECISIONS.md)), Avg mood (7d), Domains touched, Last entry. Not a separate journal streak, and not “N of 7” in this row. The check-in recap still has its own “N of 7”.
- **Owner:** the band, the journal button, and the three non-streak stats are **ticket 2.6**. The streak number is **ticket 2.5.1**. The intention card is **ticket 2.5**. The due card is **ticket 2.7**.

**Visual:** Coral linear gradient welcome band (`docs/brand_style_guide.md` / theme-preview v2) below charcoal navbar — see `docs/mockups/navbar/README.md`.

**Implementation note:** Welcome band + Fitness tab bar share **active tab state** (client shell or URL). Band primary CTA must re-render when the tab changes.

### Layer 3 — Fitness tabs

Mind has no tab bar. See below.

Do **not** mix Fitness and Mind items in one tab bar (supersedes the early 6-tab dashboard mockup).

#### Fitness tabs

| Tab | MVP | Owner | Notes |
|-----|-----|-------|-------|
| Overview | With the workouts slice | **OV.1** | Off until then (`coming soon`). Domain home per [`F-fitness-overview.png`](./mockups/nov_2026_tickets/F-fitness-overview.png). Not during Slice 1.5 or Slice 2. |
| Workouts | Yes | **Slice 3** — no ticket folder yet | Log, history, templates, programs. Placeholder panel today |
| Measurements | Yes | **Done** — Slice 1.5 | Weight/waist, trend |
| Library | Later | **Slice 3.1** tickets, after Slice 3 | Placeholder OK until then |

#### Mind (no tab bar)

Decided 2026-11-16. [Option A](./mockups/nov_2026_tickets/E-mind-layout-compare.png) is the page. Do not build Option B (Overview / Journal / Check-ins tabs), and do not build the older Overview / Journal / Domains / Prompts bar.

Life domains here are the Option B set in [ADR-013](./ARCHITECTURE_DECISIONS.md): Physical health, Mental health, Family & relationships, Social, Career, Learning, Leisure, and optional Habits. The journal is mood and a reflection, with up to two of those domains as tags, plus optional one-line “One win today” and “Grateful for” fields. Stress and energy are check-in fields, not journal fields. The weekly check-in is Slice 2. The Slice 5 coach report reads it later.

| Surface | Route | Owner | Notes |
|---------|-------|-------|-------|
| Mind home | `/mind` | **Ticket 2.6** | Activity streak is **ticket 2.5.1**. Intention card is **ticket 2.5**. Due card is **ticket 2.7**. |
| Journal | `/mind/journal` | **Ticket 2.3** | Today’s entry. Linked from the welcome band, not a tab. |
| Check-in | `/mind/check-in` | **Ticket 2.4** | Weekly check-in. Not a tab. |

No `/mind/domains`, no `/mind/prompts`, no domain radar, and no wins list page. A compact Mind row on the Fitness Overview is a later idea (bottom of E, LATER block on F). It is not part of the first Overview.

---

## Cross-domain placement

| Feature | Placement | Owner | Decision |
|---------|-----------|-------|----------|
| **Insights** | Navbar link | **Slice 4** — no ticket folder yet | Confirmed — cross-domain (PRD §4). Placeholder is already muted |
| **Achievements** | Profile avatar menu | Menu row **Done**. Product **Unplanned** | Stays out of the navbar (PRD §9). The row is a disabled “Soon” item |
| **Community / Feed** | Navbar link (muted) | Chrome **Done**. Product **Unplanned** | “Soon” styling is in the navbar. The product is PRD §8, Phase 3, not Slice 6 and not PRD §5 |
| **Profile** | Avatar dropdown | **Done** — Slice 1 | Goals and domain priorities. Accountability circles are not Phase 1 |
| **Settings** | Avatar dropdown | Row **Done**. Page **Unplanned** | Disabled “Soon”. No settings ticket |

---

## Resolved open decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Insights — navbar or tab? | **Navbar link** |
| 2 | Achievements — navbar or profile? | **Profile menu** (recommended) |
| 3 | Default landing after login? | **Last visited** domain (Fitness or Mind) when that memory exists. Persistence is **Unplanned**. Until then, sign-in lands on the Fitness home. **NAV.1** moves that home from `/dashboard` to `/fitness` |
| 4 | Community in MVP navbar? | **Yes — visible but dulled / “Coming soon”** until feature ships |

---

## Routes

Do not add `/mind/domains` or `/mind/prompts`.

Ryan resolved the URL on 2026-11-16. See [Fitness URL](#fitness-url--resolved-2026-11-16). Until **NAV.1**, the running app is still `/dashboard`.

| Path | Role | Owner |
|------|------|-------|
| `/` | Marketing | **Done** |
| `/auth` | Sign in and sign up | **Done** |
| `/dashboard` | Old Fitness shell | Shell **Done**. Permanent redirect to `/fitness`, query string kept: **NAV.1** |
| `/fitness` | Fitness home. Overview content when OV.1 lands. Until then, Measurements is the selected tab | Route **NAV.1**. Content **OV.1** |
| `/fitness/workouts` | Workouts | Path **NAV.1**. Feature: **Slice 3** — no ticket folder yet |
| `/fitness/measurements` | Measurements | Path **NAV.1**. Feature **Done** |
| `/fitness/library` | Library | Path **NAV.1**. Feature: **Slice 3.1** after Slice 3 |
| `/mind` | Mind home, no tab bar | **Ticket 2.6** |
| `/mind/journal` | Today’s journal entry | **Ticket 2.3** |
| `/mind/check-in` | Weekly check-in | **Ticket 2.4** |
| `/insights` | Cross-domain trends | **Slice 4** — no ticket folder yet |
| `/profile` | Avatar menu | **Done** |
| `/achievements` | Avatar menu | **Unplanned** |
| `/community` | Navbar, after the Soon state | **Unplanned** |

---

## Retired from early mockups

| Old pattern | Replacement |
|-------------|-------------|
| Navbar: Dashboard, Profile, Measurements | Domain switch + avatar menu |
| Single tab bar: Overview, Journal, Workouts, Measurements, Insights, Achievements | Fitness tabs only. Mind is one page. Insights and Community stay in the navbar. |
| Generic stat cards on every view | Domain-specific numbers in the page body. The welcome band keeps the greeting and CTAs. |
| Mind tabs (Overview, Journal, Domains, Prompts, or Check-ins) | Single Mind page. Journal and check-in are routes, not tabs. |

---

## Implementation checklist

| Item | State | Owner |
|------|-------|-------|
| Domain switcher in the navbar | Fitness link is in and still points at `/dashboard`. Mind does not switch yet | Fitness href **NAV.1**. Mind link **Ticket 2.6** |
| Last-visited domain persistence | Not started | **Unplanned** |
| Community nav item, coming-soon styling | In the navbar (muted, Soon). The link still goes to `/dashboard` until **NAV.1** | **Done** for the chrome. Product **Unplanned** |
| Route groups `(fitness)`, `(mind)`, `(insights)` | Not started. App group is `(main)` | **Unplanned** |
| Welcome band CTAs follow the active Fitness tab | Measurements button only, which is the Slice 1.5 rule | **Done** for Measurements. Overview is **OV.1**. Workouts is **Slice 3** (no ticket folder) |
| Mind welcome band and **+ New journal entry** | Not started | **Ticket 2.6** |
| Achievements entry in the profile dropdown | Disabled Soon row is in the menu | **Done** for the row. Product **Unplanned** |
| Insights route | Not started | **Slice 4** — no ticket folder yet |

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
