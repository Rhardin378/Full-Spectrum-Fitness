# Navbar concept mockups

Static concept images for the app navbar, updated to use the **official Full Spectrum Fitness logo** and a palette derived from its coral + charcoal identity.

## Files

| File | State | Notes |
|------|--------|--------|
| `dashboard-shell-dark-navbar-v2.png` | **Hybrid** | Dark navbar + "Welcome back, Alex" + stat cards above tabs + Slice 1.5 indigo/orange colors |
| `dashboard-shell-charcoal-coral-v2.png` | **Logo-aligned (preferred)** | Charcoal + coral; light cream welcome band (distinct from dark navbar) |
| `dashboard-shell-comparison-side-by-side.png` | Comparison | Logo-aligned v2 vs Hybrid v2 side by side |
| `dashboard-shell-charcoal-coral-v1.png` | Logo-aligned v1 | Charcoal welcome band (superseded — too close to navbar) |
| `dashboard-shell-dark-navbar-v1.png` | Hybrid v1 | Dark navbar over Slice 1.5 shell (brand title in gradient band) |
| `dashboard-shell-concept-v1.png` | Dashboard shell (v1 layout) | Full logged-in dashboard — logo-aligned charcoal + coral, tabs above stat cards |
| `navbar-concept-logged-in-v2.png` | Authenticated | Profile avatar + dropdown; Measurements active with coral underline |
| `navbar-concept-logged-out-v2.png` | Visitor | Sign in link + coral **Get started** CTA |
| `assets/fsf-logo.png` | Source logo | Reference asset used for mockup generation |
| `navbar-concept-logged-in.png` | v1 (superseded) | Pre-logo concept — indigo gradient mark |
| `navbar-concept-logged-out.png` | v1 (superseded) | Pre-logo concept |

---

## Logo usage in the navbar

The attached logo is a **circular mark** (head profile + brain) in coral on charcoal. For the navbar, use a **compact horizontal lockup**:

| Placement | Recommendation |
|-----------|----------------|
| **Icon** | Circular logo mark only (~32–36px), linked to home |
| **Wordmark** | “Full Spectrum Fitness” in white beside the icon — omit the tagline in the bar to save space |
| **Tagline** | “Strength of body and mind” belongs on marketing hero / about — not in the navbar |

On mobile, collapse to icon-only or icon + abbreviated “FSF” if space is tight.

---

## Suggested color palette (from logo)

Extract these semantic tokens from the logo and use them consistently across the app shell:

| Token | Suggested value | Source / use |
|-------|-----------------|--------------|
| `surface-header` | `#1E1E1E` | Logo background — navbar, dark chrome |
| `surface-page` | `#F5F3F0` | Warm off-white page body (pairs with coral, avoids cold gray) |
| `surface-card` | `#FFFFFF` | Cards on warm page background |
| `brand-coral` | `#E85A4F` | Logo stroke + wordmark coral — **primary accent** |
| `brand-coral-hover` | `#D14A40` | CTA hover / pressed |
| `brand-coral-muted` | `#E85A4F20` | Active tab pill backgrounds, subtle highlights |
| `text-on-dark` | `#FFFFFF` | Brand wordmark, active nav on dark header |
| `text-on-dark-muted` | `#A3A3A3` | Inactive nav links on dark header |
| `text-on-light` | `#1A1A1A` | Body copy on light surfaces |
| `text-on-light-muted` | `#6B6560` | Secondary labels (warm gray, not blue-gray) |

### What to retire or reduce

The logo makes the current **indigo / purple gradient** and **teal landing-page gradients** feel off-brand. Suggested shifts:

1. **Navbar** — charcoal header + coral accents (as in v2 mockups), not navy/indigo.
2. **Primary CTAs** — coral pill buttons (already in brand guide; now anchored to logo hex).
3. **Active nav state** — coral underline or coral bottom border instead of white-only.
4. **Landing hero** — optional subtle charcoal → warm-dark gradient with coral CTA; drop teal-to-cyan sweeps.
5. **Success / achievements** — keep **wellness green** (`#4ADE80` range) as a secondary positive color so coral stays reserved for brand + CTAs.

---

## Style recommendations to flow around the icon

### Shape language

- The logo is **circular with thin strokes** — echo that with rounded-full avatars, pill CTAs, and soft circular icon wrappers (not sharp squares).
- Use **1px coral borders** sparingly for focus rings and selected states (mirrors the logo ring).

### Typography

- **Headlines / brand**: geometric sans (Poppins or similar) — matches the logo’s bold caps feel.
- **Body / nav**: Inter for readability at small sizes.
- Avoid mixing too many weights in the navbar; keep nav links at `font-medium`.

### Header vs dashboard shell

The Slice 1.5 reference uses a **two-tier shell**: dark top navbar + white tab bar below. With the new palette:

| Tier | Background | Accent |
|------|------------|--------|
| Top navbar | `#1E1E1E` | Coral active underline; profile corner |
| Welcome band | `#EDE9E4` (light cream) | Dark charcoal text; coral CTAs — **keep lighter than navbar** |
| Tab bar (dashboard) | `#FFFFFF` | Coral underline on active tab (Measurements, etc.) |
| Page body | `#F5F3F0` | Coral primary buttons; green for positive trends |

### Profile corner (logged in)

- Circular avatar with a subtle `ring-2 ring-white/20` (matches logo ring language).
- Dropdown chevron in muted gray — menu items on white card with warm shadow.

### Logged-out corner

- **Sign in** — ghost/text only on dark header.
- **Get started** — coral filled pill; highest contrast action on the bar.

---

## Implementation checklist (when building for real)

- [ ] Add logo SVG/PNG to `public/` and reference in navbar component
- [ ] Define CSS/Tailwind tokens for `brand-coral`, `surface-header`, `surface-page`
- [ ] Replace gradient logo placeholder in `AppHeader`
- [ ] Active nav: coral underline on dark header
- [ ] Profile menu dropdown for logged-in state
- [ ] Audit landing page hero gradient against new charcoal + coral direction

---

## Navigation IA

Navbar vs in-domain tabs, domain split (Fitness / Mind), and resolved placement decisions are documented in **[navigation-ia.md](../navigation-ia.md)**.

## Reference

- Layout inspiration: `docs/vertical_slices/slice_1_5_measurements/references/fsf-measurements-tabbed-dashboard.png`
- Brand guide: `docs/brand_style_guide.md` (coral CTA already aligned — update base colors from indigo toward charcoal)
