# Full Spectrum Fitness — Brand & Style Guide

This document is the **canonical reference** for visual design, typography, color usage, iconography, and voice for the product UI. It mirrors the brand direction used on the marketing site and the Phase 1 vertical-slice implementation plan.

For system architecture, see [systemDesign.md](./systemDesign.md). For product scope, see [PRD.md](./PRD.md) and [launch_plan.md](./launch_plan.md).

---

## Brand essence

Full Spectrum Fitness connects **mental** and **physical** wellness: research-backed, holistic, and focused on **self-awareness** rather than performance flexing or influencer hype. Messaging should feel like **bridging mind and body**—supportive, grounded, and authentic.

---

## Alignment with the current landing page

### Current strengths

- **Color**: Blue-to-purple gradients already support a **deep indigo / navy** direction.
- **Typography**: Existing choices support a **clean, accessible** aesthetic.
- **Voice & tone**: Copy reads **supportive and motivating** without feeling clinical.
- **Visual hierarchy**: Layout emphasizes a **holistic** view across wellness domains.
- **Social proof**: Testimonials with real professional voices steer away from typical fitness-influencer aesthetics.

### Implementation suggestions (from brand review)

- **Mission**: Keep messaging anchored in **research-backed mind–body integration** (not generic “grind” culture).
- **Color evolution**: Use **coral / orange** for **call-to-action** buttons and **success** states; use **wellness green** for **achievements** and **positive milestones**.
- **Iconography**: Hero **heart** and **brain** motifs reinforce mind–body connection; extend **circular, soft-edged** icons through the app for a **safe and whole** feeling.
- **Typography refinement**: **Poppins** for headlines and **Inter** for body text to improve readability while staying modern and approachable.
- **Visual mood**: Prefer **authentic** user-adjacent stories and calm layouts over hype-driven fitness marketing.

---

## Design & brand alignment (all app slices)

Apply these rules consistently across **every** Phase 1 surface (auth, profile, journal, workouts, dashboard, achievements, AI, minimal social).

### Color

- **Base**: Deep **indigo / navy** with **blue–purple** gradients (aligned with the landing page).
- **Accent**: **Coral / orange** for **primary CTAs** and **success** states (e.g. saved, completed, confirmed).
- **Positive milestones**: **Wellness green** for achievements, streaks, and “things went well” emphasis—**not** generic neon gamification.

### Typography

- **Headlines**: **Poppins** (or an equivalent geometric sans) for clear hierarchy and warmth.
- **Body**: **Inter** for readability and accessibility at small sizes.

### Iconography and shape language

- Prefer **soft, circular, rounded** icons and containers to reinforce **safe and whole**.
- Reuse **mind–body** metaphors (e.g. heart / brain) where they clarify holistic value without cluttering dense data views.

### Voice and tone

- **Supportive and motivating**; never clinical or shaming.
- Errors, empty states, and insights should read like a **thoughtful coach**, not a lab report.

### Visual hierarchy and positioning

- Emphasize **holistic life domains** and **self-awareness** over competition or vanity metrics.
- Avoid influencer-style hype in layouts and microcopy.

---

## Phase 1 — feature-specific UI notes

These items correspond to vertical slices in the Phase 1 plan; they are **UI requirements**, not full product specs.

### Achievements and badges (Slice 5)

- **Unlocked / earned**: **Wellness green** and **soft circular** badge frames.
- **Locked**: **Subdued** indigo or neutral treatment—clearly secondary, not punitive.

### Weekly AI summary and prompts (Slice 6)

- Frame AI output with **supportive, non-clinical** copy (section titles, short disclaimers, regenerate affordances).
- **Primary actions** on the summary card use **coral / orange** CTA styling.

### Minimal personal feed (Slice 6)

- Keep feed visuals **calm** and consistent with base gradients; treat shares as **reflection**, not flex posts.

---

## Engineering checklist (tokens and reuse)

When implementing UI in code:

1. Define **semantic color tokens** (e.g. `primary`, `accent`, `success`, `achievement`, `surface`, `muted`) rather than hard-coding hex values in components.
2. Load **Poppins** and **Inter** once at the app layout level; use consistent type scales for headings vs body.
3. Reuse **rounded** radii and **circular** icon wrappers for domain chips, badges, and key CTAs where appropriate.
4. Review new screens against **Voice and tone** above before shipping copy-heavy flows.

---

## Document maintenance

Update this file when brand decisions change (e.g. new accent color, font swap). Implementation plans in external tools should stay aligned with this document.
