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

## Core Scope

- Create `measurements` model/table linked to authenticated user.
- Support core fields: `measurement_type`, `value`, `unit`, `measured_at`, optional `notes`.
- Constrain allowed types to `weight` and `waist`, with matching units above.
- Build owner-scoped create and list backend actions/endpoints.
- Add a simple UI to log a measurement and view recent measurement history.
- Include basic validation (allowed types, valid units, positive numeric values, valid date).

## Done Criteria

- User can create weight and waist measurement entries.
- User can view recent entries for their account only.
- Data persists across sessions and remains scoped by authenticated user.
- Weight has a simple trend/history view (waist may reuse the same list/filter patterns).

## Notes

- `profiles` remains the source for stable user preferences/identity data.
- `measurements` is the source of truth for metric history and trend calculations.
- Schema may stay easy to extend later; UI for this slice only exposes weight and waist.
