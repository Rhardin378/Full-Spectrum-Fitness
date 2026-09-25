# Full Spectrum Fitness — Brand & Style Guide

This document is the **canonical reference** for visual design, typography, color usage, iconography, and voice for the product UI.

For system architecture, see [systemDesign.md](./systemDesign.md). For product scope, see [PRD.md](./PRD.md). For navigation structure, see [navigation-ia.md](./navigation-ia.md). For approved mockups, see [mockups/theme-preview-v2/](./mockups/theme-preview-v2/).

**Theme status:** **Locked in** (charcoal + coral, v2 gradient).

---

## Brand essence

Full Spectrum Fitness connects **mental** and **physical** wellness: research-backed, holistic, and focused on **self-awareness** rather than performance flexing or influencer hype. Messaging should feel like **bridging mind and body**—supportive, grounded, and authentic.

---

## Color palette (locked)

Derived from the official logo (circular head + brain mark on charcoal).

### Semantic tokens

| Token | Hex | Use |
|-------|-----|-----|
| `surface-header` | `#1E1E1E` | Navbar, dark chrome |
| `surface-page` | `#F5F3F0` | App and marketing page body |
| `surface-card` | `#FFFFFF` | Cards, forms, modals |
| `brand-coral` | `#E85A4F` | Primary accent, active indicators |
| `brand-coral-deep` | `#D14A40` | Filled CTAs, hover states |
| `brand-coral-dark` | `#C9453A` | Gradient start (welcome/hero) |
| `brand-coral-light` | `#FFD4CC` | Gradient end (desaturated peach) |
| `text-primary` | `#1A1A1A` | Body copy on light surfaces |
| `text-muted` | `#6B6560` | Secondary labels (warm gray) |
| `text-on-dark` | `#FFFFFF` | Text on charcoal / gradients |
| `text-on-dark-muted` | `#A3A3A3` | Inactive nav on dark header |
| `success` | `#4ADE80` | Positive trends, streaks, achievements |

### Gradients

| Name | Value | Use |
|------|-------|-----|
| Welcome / hero | `linear-gradient(90deg, #C9453A 0%, #E85A4F 50%, #FFD4CC 100%)` | Marketing hero, welcome bands |
| Auth background | `linear-gradient(135deg, #1E1E1E 0%, #3D2520 40%, #E85A4F 70%, #FFD4CC 100%)` | Sign-in page backdrop |

### Retired colors

Do **not** use in new UI:

- Teal / cyan landing gradients
- Indigo / purple auth and dashboard chrome
- Generic blue-gray (`slate-*`) as primary page background

---

## Color usage rules

1. **Coral** — primary CTAs, active tab/nav underlines, progress bars, key chart lines, logo accent.
2. **Charcoal** — navbar only; keep visually separate from welcome bands (use gradient or warm cream, not matching `#1E1E1E`).
3. **Green** — positive deltas and achievements only; do not use for primary actions.
4. **Warm off-white** — default page background; avoid cold `#F8FAFC`-style grays.
5. **Coral text on light backgrounds** — avoid for small body copy (contrast); use coral for fills and underlines.

---

## Typography

- **Headlines**: Poppins (or equivalent geometric sans) — warm, clear hierarchy.
- **Body**: Inter (or Geist Sans in current implementation) — readable at small sizes.
- Load display fonts once at app layout level.

---

## Iconography and shape language

- Prefer **soft, circular, rounded** icons and containers (mirrors logo ring).
- Official mark: circular head profile + brain — use compact lockup in navbar (~36px icon + wordmark).
- Tagline (“Strength of body and mind”) belongs on marketing hero, **not** in the navbar.

---

## Voice and tone

- **Supportive and motivating**; never clinical or shaming.
- Errors, empty states, and insights read like a **thoughtful coach**, not a lab report.
- Emphasize **holistic life domains** and **self-awareness** over competition or vanity metrics.

---

## Navigation chrome

See [navigation-ia.md](./navigation-ia.md) for full structure.

- **Navbar:** charcoal, logo, Fitness | Mind domain switcher, Insights, Community (coming soon), profile menu.
- **Welcome band:** coral gradient, domain-specific copy and CTAs.
- **Tabs:** in-domain only (Fitness tabs ≠ Mind tabs).

---

## Phase 1 — feature-specific UI notes

### Achievements and badges (Slice 5)

- **Unlocked:** wellness green + soft circular badge frames.
- **Locked:** subdued warm gray — secondary, not punitive.

### Weekly AI summary and prompts (Slice 6)

- Supportive, non-clinical copy.
- Primary actions use **brand-coral-deep** CTA styling.

### Minimal personal feed (Slice 6)

- Calm layouts on warm neutrals; shares as **reflection**, not flex posts.

---

## Engineering checklist

1. Use CSS variables in `src/app/globals.css` — do not hard-code hex in new components.
2. TypeScript constants in `src/lib/theme/colors.ts` for non-CSS contexts.
3. Reference mockups in `docs/mockups/theme-preview-v2/` before shipping new surfaces.
4. Review copy against voice guidelines before shipping text-heavy flows.

---

## Document maintenance

Update this file when brand decisions change. Mockups and navigation IA should stay aligned with this document.
