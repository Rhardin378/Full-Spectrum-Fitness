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

## Ticket 1.5.3b: Logged-in navbar avatar menu (prep for 1.5.4)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `frontend`, `ui`  
**GitHub:** #33

### Description

Align the authenticated global navbar with locked v2 mockups and [navigation-ia.md](../../navigation-ia.md) before the dashboard / Fitness shell (ticket 1.5.4 / #21).

**Canonical mockup:** `docs/mockups/theme-preview-v2/theme-preview-navbar-logged-in-v2.png`.

### Scope

- Replace top-level Profile text link with avatar initials + display name (name hidden on small screens).
- Update navbar logo lockup to match `theme-preview-navbar-logged-in-v2.png` (coral SVG head mark via `BrandMarkIcon` + coral wordmark).
- Dropdown: Profile, Achievements (coming soon), Settings (coming soon), Sign out.
- Mobile: hamburger menu for domain links (charcoal panel, coral active state) + avatar menu; desktop keeps inline domain nav.
- Remove duplicate Sign out from `/dashboard` page body.

### Acceptance Criteria

- Logged-in users can open the menu and reach Profile or Sign out.
- Disabled items are visibly non-actionable.
- Reasonable keyboard support (Escape closes menu).
- Blocks nothing for measurements API; unblocks dashboard shell work.

### Dependencies

- Slice 1 auth/profile foundation

---

## Ticket 1.5.4: Build light dashboard shell (Measurements home)

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `ui`, `dashboard`

### Description

Replace the Slice 1 dashboard placeholder with a light dashboard shell that makes **Measurements** the default home for this slice.

**Canonical mockups (required):** [`docs/mockups/theme-preview-v2/`](../../mockups/theme-preview-v2/README.md)

| File | Use for #21 |
|------|-------------|
| `theme-preview-fitness-shell-v2.png` | **Primary** — welcome band, in-domain tab bar, Measurements-forward shell layout |
| `theme-preview-navbar-logged-in-v2.png` | Global charcoal navbar + coral active states |
| `theme-preview-dashboard-v2.png` | Current `/dashboard` route — warm page + card surfaces while shell ships |

Also see `docs/brand_style_guide.md` and `docs/navigation-ia.md` (Fitness tabs). Legacy layout refs in `references/` are optional inspiration only.

### Scope

- Evolve `/dashboard` into a light shell that **matches the locked v2 mockups above** (not retired indigo/navy chrome from older PNGs):
  - **Welcome band** below the global nav using the locked **coral welcome gradient** and personalized copy (profile display name when available). Warm `surface-page` body; `surface-card` panels; `brand-coral` CTAs.
  - **Tab-aware welcome CTAs (Option B):** one primary band CTA per active Fitness tab — see `navigation-ia.md` Layer 2. **Slice 1.5:** show **only** `+ Log measurement` when **Measurements** is active; **no** dual fixed `+ Log workout` / `+ Log measurement` pair on every tab. Other tabs: no band log buttons until their slices ship.
  - **Fitness-domain tab bar** below the welcome band per `navigation-ia.md`; **Measurements** is the default active tab for this slice. Welcome band and tab bar share active-tab state.
  - Measurements tab panel layout ready for history + trend content (card regions as shown in `theme-preview-fitness-shell-v2.png`).
- Other Fitness tabs (Overview, Workouts, Library):
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
- Shell visually aligns with `theme-preview-fitness-shell-v2.png` and `theme-preview-navbar-logged-in-v2.png` (charcoal nav, coral welcome gradient, warm page, coral CTAs) — not indigo/navy or teal sports-tracker styling.
- Welcome band follows **tab-aware CTA** rules (Measurements tab only for log CTA in Slice 1.5).
- No fake stat-card data or functional non-Measurements tabs are required to ship.

### Dependencies

- Slice 1 auth/profile foundation complete
- Ticket 1.5.3b (#33)

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
- Wire the **welcome-band** `+ Log measurement` (visible only when Measurements tab is active per `navigation-ia.md`) to the **same** log modal/drawer — one flow, two entry points.
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
