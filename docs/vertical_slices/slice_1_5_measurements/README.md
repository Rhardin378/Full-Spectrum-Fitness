# Slice 1.5: Measurements and Baseline Tracking

## Feature Brief

This slice introduces user-linked measurement tracking as time-series data so users can log baseline metrics and monitor progress over time.

## Goal

Enable authenticated users to add and review body measurements without overloading the profile model. Scope stays holistic and lightweight — not physique-contest or hardcore tape measuring.

## Metric Scope

### In scope (this slice)

| Type | Units | Notes |
|------|--------|--------|
| `weight` | `lb`, `kg` | Primary metric; required for trend view |
| `waist` | `in`, `cm` | Secondary circumference; better composition signal than scale alone |

Store values as entered. Do not auto-convert between unit systems in this slice.

### Out of scope (this slice)

- Chest, arms, legs, calves, neck, or other hardcore physique measurements
- Body fat percentage
- BMI as a logged metric (may be derived later from height + weight if needed)
- Wearable-synced vitals (resting HR, sleep, etc.)

### Deferred: progress photos

Optional front / side / back photos for visual tracking are intentional product follow-up, **not** part of Slice 1.5.

- Own storage model (e.g. Supabase Storage + a `progress_photos` table), not a `measurement_type`
- Private by default with owner-scoped access
- Infrequent capture (e.g. monthly), not every weigh-in
- Capture as a separate ticket/slice after numeric measurements ship

## UI / Dashboard home

Measurements ship inside a **light dashboard shell** on `/dashboard`, not as a standalone top-level route. **Canonical UI reference:** [`docs/mockups/theme-preview-v2/`](../../mockups/theme-preview-v2/README.md) — especially `theme-preview-fitness-shell-v2.png` and `theme-preview-navbar-logged-in-v2.png`. Older PNGs under `references/` are optional layout inspiration only.

### In scope (this slice)

- **Light shell:** coral welcome gradient band + warm page chrome (see `docs/brand_style_guide.md`); tab bar below the welcome band; **Measurements** as the default active tab and functional home for this slice.
- **Welcome-band CTAs:** **tab-aware** (one primary CTA per active Fitness tab — `navigation-ia.md`). Slice 1.5: band shows `+ Log measurement` only on the Measurements tab, not a permanent workout + measurement button pair.
- **Measurements tab content:** recent history card, weight trend card, “+ Log measurement” CTA, and empty state when no entries exist.
- **Entry pattern:** modal or drawer for log flow (borrow layout/copy from `references/fsf-measurements-ideal-mockup.png` and `references/ref-log-measurements-modal.png`; scope stays weight + waist only).
- **Type filter:** optional All / Weight / Waist filter above tab content (as shown in mockups).

### Deferred in shell (future slices)

- Summary stat cards above the tab bar (check-ins, streak, consistency, etc.) — requires Journal/Workouts data not built yet.
- Functional non-Measurements tabs (Overview, Journal, Workouts, Insights, Achievements).
- Progress Photos sub-tab or upload UI.
- Standalone `/measurements` route (may be added later only if product routing changes).

Non-Measurements tabs may appear as disabled placeholders (“Coming soon”) or be omitted until their slices land; either is acceptable for Slice 1.5 as long as Measurements is the clear home.

## Core Scope

- Create `measurements` model/table linked to authenticated user.
- Support core fields: `measurement_type`, `value`, `unit`, `measured_at`, optional `notes`.
- Constrain allowed types to `weight` and `waist`, with matching units above.
- Build owner-scoped create and list backend actions/endpoints.
- Evolve `/dashboard` from the Slice 1 placeholder into the light shell above, with Measurements as the working tab.
- Add UI to log a measurement (modal/drawer) and view recent measurement history inside the Measurements tab.
- Include basic validation (allowed types, valid units, positive numeric values, valid date).

## Follow-up after core Slice 1.5 (create + list + shell)

Tracked in [`tickets.md`](./tickets.md):

| Ticket | Summary |
|--------|---------|
| **1.5.9** | Backend: `updateMeasurement`, `softDeleteMeasurement`, `deleted_at` migration, RLS `UPDATE`, list excludes deleted |
| **1.5.10** | UI: Edit / Delete on Recent history; edit via log modal; delete confirm dialog |
| **1.5.11** | Automated tests for update, soft delete, and list behavior |

Hard delete is intentionally out of scope; soft delete preserves auditability and simplifies RLS (update-only).

## Done Criteria

- User can create weight and waist measurement entries from the dashboard Measurements tab.
- User can view recent entries for their account only.
- Data persists across sessions and remains scoped by authenticated user.
- Weight has a simple trend/history view within the Measurements tab (waist reuses list/filter patterns).
- Empty, loading, success, and error states are handled in the Measurements tab.
- Dashboard presents the light shell (header + tab bar + Measurements content) without requiring stat cards or other functional tabs.

## Notes

- Product sources of truth: [`docs/PRD.md`](../../PRD.md), [`docs/SYSTEM_DESIGN.md`](../../SYSTEM_DESIGN.md), [`docs/LAUNCH_PLAN.md`](../../LAUNCH_PLAN.md). This slice stays measurements-only.
- `profiles` remains the source for stable user preferences/identity data.
- `measurements` is the source of truth for metric history and trend calculations. Later analytics/coach slices will read this table; do not build those slices here.
- Schema may stay easy to extend later; UI for this slice only exposes weight and waist.
- Brand: locked charcoal + coral v2 theme; supportive copy — not indigo/navy or teal sports-tracker chrome (see `references/README.md`, `docs/mockups/theme-preview-v2/`).
