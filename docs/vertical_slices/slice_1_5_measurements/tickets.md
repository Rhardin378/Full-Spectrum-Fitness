# Slice 1.5 Tickets (Copy to GitHub Issues)

Use each section below as one GitHub issue for the measurements slice.

---

## Ticket 1.5.1: Create measurements data model and migration

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `database`, `backend`

### Description

Create the `measurements` model/table as time-series data linked to authenticated users.

### Scope

- Add `measurements` schema/table with fields:
  - `id`
  - `user_id`
  - `measurement_type`
  - `value` (prefer Postgres `numeric`, positive only)
  - `unit`
  - `measured_at`
  - `notes` (optional)
  - timestamps
- Constrain allowed types and units for this slice:
  - `weight` → `lb` | `kg`
  - `waist` → `in` | `cm`
- Add indexes for efficient lookups by user/type/date (e.g. `(user_id, measurement_type, measured_at DESC)`).
- Enable RLS with owner-scoped select/insert policies (`auth.uid() = user_id`).
- Add migration and verify local/dev schema update.
- Do **not** include progress-photo storage in this migration (deferred follow-up).

### Acceptance Criteria

- Schema exists with required fields.
- `user_id` relationship is enforced.
- Allowed measurement types/units are constrained in schema and/or app validation.
- Migration runs successfully in local/dev.
- Querying by user + date range is performant.

### Dependencies

- Slice 1 auth/profile foundation complete

---

## Ticket 1.5.2: Build create measurement backend action with validation

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `backend`, `api`, `validation`

### Description

Implement owner-scoped measurement creation endpoint/action with strict input validation.

### Scope

- Add create measurement endpoint/server action.
- Enforce authenticated user ownership.
- Validate:
  - Allowed `measurement_type`: `weight` | `waist`
  - Positive numeric `value`
  - Valid `unit` for selected type (`weight`: `lb`/`kg`; `waist`: `in`/`cm`)
  - Valid `measured_at` date
- Return normalized created payload.

### Acceptance Criteria

- Authenticated user can create valid weight and waist measurements.
- Invalid type/unit/value/date returns clear validation errors.
- Unauthenticated requests are rejected.
- No cross-user writes are possible.

### Dependencies

- Ticket 1.5.1

---

## Ticket 1.5.3: Build list measurements backend action (type/date filters)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `backend`, `api`

### Description

Implement endpoint/action to return a user’s measurements with optional filtering and sensible ordering.

### Scope

- Add list measurements endpoint/server action.
- Owner-scoped data access by authenticated user.
- Support optional filters:
  - `measurement_type`
  - start/end date
- Sort newest first by default.

### Acceptance Criteria

- User can fetch only their measurements.
- Filters return correct subsets.
- Unauthenticated requests are rejected.

### Dependencies

- Ticket 1.5.1

---

## Ticket 1.5.4: Build light dashboard shell (Measurements home)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `ui`, `dashboard`

### Description

Replace the Slice 1 dashboard placeholder with a light dashboard shell that makes **Measurements** the default home for this slice.

Reference: `references/README.md`, `references/fsf-dashboard-header-stats-tabs.png`, `references/fsf-measurements-tabbed-dashboard.png`.

### Scope

- Evolve `/dashboard` into a light shell:
  - Indigo/navy brand header with welcome copy (use profile display name when available).
  - Tab bar below the header with **Measurements** as the default active tab.
  - Measurements tab panel layout ready for history + trend content (two-column card layout per mockups).
- Non-Measurements tabs (Overview, Journal, Workouts, Insights, Achievements):
  - May render as disabled “Coming soon” placeholders, **or** be omitted until future slices.
  - Must **not** require backend data or navigation to unfinished features.
- **Do not** build in this ticket:
  - Summary stat cards above the tab bar (deferred).
  - Progress Photos sub-tab or upload UI (deferred).
  - Standalone `/measurements` route.
- Follow brand style and supportive copy guidelines.

### Acceptance Criteria

- Authenticated user sees the light dashboard shell on `/dashboard`.
- Measurements is the default/active tab and clear home for measurement workflows.
- Shell matches brand direction (indigo/navy header, coral primary actions) without teal sports-tracker styling.
- No fake stat-card data or functional non-Measurements tabs are required to ship.

### Dependencies

- Slice 1 auth/profile foundation complete

---

## Ticket 1.5.5: Build measurements UI (entry modal + recent history)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `ui`

### Description

Create the Measurements tab content: log flow and recent history inside the light dashboard shell.

Reference: `references/fsf-measurements-ideal-mockup.png`, `references/ref-empty-history.png`, `references/ref-log-measurements-modal.png` (weight + waist only).

### Scope

- Add “+ Log measurement” CTA in the Measurements tab (header and/or trend card per mockups).
- Build entry form in a modal or drawer with type (`weight` / `waist`), value, unit, date, and optional notes.
- Unit options update based on selected type.
- Submit form to create measurement action/API.
- Build **Recent history** card (most recent first), with optional All / Weight / Waist filter.
- Show loading, success, and error states.
- Empty state when no measurements exist (supportive copy + CTA to log first entry).
- Do not include progress-photo upload UI in this ticket.

### Acceptance Criteria

- User can open the log flow from the Measurements tab and submit weight and waist measurements.
- New entry appears in recent history after save.
- Empty, loading, and error states are visible and understandable.
- Basic accessibility supported (labels, keyboard submit, modal focus trap if using modal).

### Dependencies

- Ticket 1.5.2
- Ticket 1.5.3
- Ticket 1.5.4

---

## Ticket 1.5.6: Add simple trend view for one measurement type

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `analytics`

### Description

Provide a minimal trend visualization for weight (primary) inside the Measurements tab. Waist may reuse the same list/filter patterns without a separate chart requirement.

### Scope

- Add **Weight trend** card in the Measurements tab (paired with Recent history per mockups).
- Use recent time window (for example last 30 days).
- Show current value and directional trend context (up/down/flat).
- Keep visualization minimal (list + delta is enough; avoid heavy chart libraries unless already in stack).
- Empty trend state when no weight entries exist.

### Acceptance Criteria

- User can view weight trend/history from the Measurements tab on `/dashboard`.
- Trend reflects persisted measurement data accurately.
- Empty state handled gracefully when no data exists.

### Dependencies

- Ticket 1.5.3
- Ticket 1.5.5

---

## Ticket 1.5.7: Add automated tests for measurements critical path

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `tests`, `quality`

### Description

Add tests for validation, ownership, and core UI behavior in the measurements flow within the light dashboard shell.

### Scope

- Backend tests:
  - Create measurement happy path.
  - Validation failures (invalid type/unit/value/date).
  - Owner-only constraints and unauthenticated rejection.
  - List filtering by type/date.
- Frontend tests:
  - Dashboard shell renders with Measurements as default/active tab.
  - Log modal/drawer submit happy path.
  - Validation/error display path.
  - Recent history render after create.
  - Empty state when no measurements exist.

### Acceptance Criteria

- Tests run locally and pass.
- Core measurement flow has reliable automated coverage.
- No regressions in existing test suites.

### Dependencies

- Ticket 1.5.2
- Ticket 1.5.3
- Ticket 1.5.4
- Ticket 1.5.5

---

## Ticket 1.5.8: Slice 1.5 QA and release checklist

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `qa`, `release`

### Description

Verify end-to-end behavior for measurements and the light dashboard shell; capture any follow-up issues.

### Scope

- Manual test: authenticated user lands on `/dashboard` with Measurements as the working home.
- Manual test: create multiple weight and waist measurements across dates via the log modal/drawer.
- Manual test: filters by type/date return expected results in Recent history.
- Manual test: unauthenticated access to `/dashboard` is blocked.
- Manual test: weight trend card reflects entries; empty states render when no data.
- Confirm deferred items are **not** required to ship: stat cards, functional non-Measurements tabs, Progress Photos.
- Document known gaps and create follow-up issues, including deferred progress photos (front/side/back, private Storage) and full dashboard tabs/stat cards.

### Acceptance Criteria

- Core done criteria in slice brief are verified.
- Light dashboard shell ships without fake stat-card data or unfinished tab features.
- Follow-up issues created for non-blocking gaps (progress photos, stat cards, other dashboard tabs).
- Slice 1.5 marked ready for merge/release.

### Dependencies

- Ticket 1.5.6
- Ticket 1.5.7
