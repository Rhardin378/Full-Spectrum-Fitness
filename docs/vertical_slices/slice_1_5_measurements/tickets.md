# Slice 1.5 Tickets (Copy to GitHub Issues)

Use each section below as one GitHub issue for the measurements slice.

---

## Ticket 1.5.1: Create measurements data model and migration

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `measurements`, `database`, `backend`

### Description

Create the `measurements` model/table as time-series data linked to authenticated users.

### Scope

- Add `measurements` schema/table with fields:
  - `id`
  - `user_id`
  - `measurement_type`
  - `value`
  - `unit`
  - `measured_at`
  - `notes` (optional)
  - timestamps
- Add indexes for efficient lookups by user/type/date.
- Add migration and verify local/dev schema update.

### Acceptance Criteria

- Schema exists with required fields.
- `user_id` relationship is enforced.
- Migration runs successfully in local/dev.
- Querying by user + date range is performant.

### Dependencies

- Slice 1 auth/profile foundation complete

---

## Ticket 1.5.2: Build create measurement backend action with validation

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `measurements`, `backend`, `api`, `validation`

### Description

Implement owner-scoped measurement creation endpoint/action with strict input validation.

### Scope

- Add create measurement endpoint/server action.
- Enforce authenticated user ownership.
- Validate:
  - Allowed `measurement_type`
  - Positive numeric `value`
  - Valid `unit` for selected type
  - Valid `measured_at` date
- Return normalized created payload.

### Acceptance Criteria

- Authenticated user can create a valid measurement.
- Invalid input returns clear validation errors.
- Unauthenticated requests are rejected.
- No cross-user writes are possible.

### Dependencies

- Ticket 1.5.1

---

## Ticket 1.5.3: Build list measurements backend action (type/date filters)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `measurements`, `backend`, `api`

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

## Ticket 1.5.4: Build measurements UI (entry form + recent history)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `measurements`, `frontend`, `ui`

### Description

Create frontend flow to add measurements and show recent history to the user.

### Scope

- Build entry form with type, value, unit, date, and optional notes.
- Submit form to create measurement action/API.
- Build recent history list (most recent first).
- Show loading, success, and error states.
- Follow brand style and supportive copy guidelines.

### Acceptance Criteria

- User can submit a measurement from UI.
- New entry appears in recent history after save.
- Error states are visible and understandable.
- Basic accessibility supported (labels, keyboard submit).

### Dependencies

- Ticket 1.5.2
- Ticket 1.5.3

---

## Ticket 1.5.5: Add simple trend view for one measurement type

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1`, `measurements`, `frontend`, `analytics`

### Description

Provide a minimal trend visualization for at least one measurement type (weight recommended).

### Scope

- Add simple trend card/chart/list for selected type.
- Use recent time window (for example last 30 days).
- Show current value and directional trend context (up/down/flat).

### Acceptance Criteria

- User can view trend/history for at least one type.
- Trend reflects persisted measurement data accurately.
- Empty state handled gracefully when no data exists.

### Dependencies

- Ticket 1.5.3
- Ticket 1.5.4

---

## Ticket 1.5.6: Add automated tests for measurements critical path

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1`, `measurements`, `tests`, `quality`

### Description

Add tests for validation, ownership, and core UI behavior in the measurements flow.

### Scope

- Backend tests:
  - Create measurement happy path.
  - Validation failures (invalid type/unit/value/date).
  - Owner-only constraints and unauthenticated rejection.
  - List filtering by type/date.
- Frontend tests:
  - Form submit happy path.
  - Validation/error display path.
  - Recent history render after create.

### Acceptance Criteria

- Tests run locally and pass.
- Core measurement flow has reliable automated coverage.
- No regressions in existing test suites.

### Dependencies

- Ticket 1.5.2
- Ticket 1.5.3
- Ticket 1.5.4

---

## Ticket 1.5.7: Slice 1.5 QA and release checklist

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1`, `measurements`, `qa`, `release`

### Description

Verify end-to-end behavior for measurements and capture any follow-up issues.

### Scope

- Manual test: create multiple measurements across dates.
- Manual test: filters by type/date return expected results.
- Manual test: unauthenticated access is blocked.
- Manual test: trend view reflects entries.
- Document known gaps and create follow-up issues.

### Acceptance Criteria

- Core done criteria in slice brief are verified.
- Follow-up issues created for non-blocking gaps.
- Slice 1.5 marked ready for merge/release.

### Dependencies

- Ticket 1.5.5
- Ticket 1.5.6
