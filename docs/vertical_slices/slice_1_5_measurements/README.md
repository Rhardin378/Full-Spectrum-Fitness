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

Measurements ship inside a **light dashboard shell** on `/dashboard`, not as a standalone top-level route. See `references/README.md` and `references/fsf-dashboard-header-stats-tabs.png` for the target layout.

### In scope (this slice)

- **Light shell:** indigo/navy brand header with welcome copy; tab bar below the header; **Measurements** as the default active tab and functional home for this slice.
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

## Done Criteria

- User can create weight and waist measurement entries from the dashboard Measurements tab.
- User can view recent entries for their account only.
- Data persists across sessions and remains scoped by authenticated user.
- Weight has a simple trend/history view within the Measurements tab (waist reuses list/filter patterns).
- Empty, loading, success, and error states are handled in the Measurements tab.
- Dashboard presents the light shell (header + tab bar + Measurements content) without requiring stat cards or other functional tabs.

## Notes

- `profiles` remains the source for stable user preferences/identity data.
- `measurements` is the source of truth for metric history and trend calculations.
- Schema may stay easy to extend later; UI for this slice only exposes weight and waist.
- Brand: indigo/navy + coral CTA; supportive copy — not teal sports-tracker chrome (see `references/README.md`).
