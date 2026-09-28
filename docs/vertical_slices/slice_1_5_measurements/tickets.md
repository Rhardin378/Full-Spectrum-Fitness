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

**Canonical log modal (v2 theme):** [`docs/mockups/slice_1_5_measurements/log-measurement-modal-v2.png`](../../mockups/slice_1_5_measurements/log-measurement-modal-v2.png) (+ `log-measurement-modal-v2.html` for regeneration). Use **charcoal + coral** tokens — not indigo/lavender from legacy refs.

**Layout / history inspiration:** `references/fsf-measurements-ideal-mockup.png`, `references/ref-empty-history.png`, `references/ref-log-measurements-modal.png` (structure only; weight + waist scope).

### Scope

- Add “+ Log measurement” CTA in the Measurements tab (header and/or trend card per mockups).
- Wire the **welcome-band** `+ Log measurement` (visible only when Measurements tab is active per `navigation-ia.md`) to the **same** log modal/drawer — one flow, two entry points.
- Build entry form in a modal or drawer matching **log-measurement-modal-v2** (segmented type, value + unit, date, optional notes; coral primary CTA; coral-light selected type state).
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
- Log modal visual treatment aligns with `log-measurement-modal-v2.png` and `docs/brand_style_guide.md`.

### Dependencies

- Ticket 1.5.2
- Ticket 1.5.3
- Ticket 1.5.4 (#21)

---

## Ticket 1.5.6: Add simple trend view for one measurement type

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `analytics`  
**GitHub:** #16

### Description

Provide a minimal **weight** trend visualization in the Measurements tab **Weight trend** card (right column, paired with Recent history). Waist continues to use list/filter patterns only — no separate waist chart in this ticket.

**Canonical mockup (fitness shell with graph):**

- Folder: [`docs/mockups/theme-preview-v2/`](../../mockups/theme-preview-v2/README.md)  
  GitHub: <https://github.com/Rhardin378/Full-Spectrum-Fitness/tree/main/docs/mockups/theme-preview-v2>
- **Primary screenshot for #16:** [`theme-preview-fitness-shell-v2.png`](../../mockups/theme-preview-v2/theme-preview-fitness-shell-v2.png) — use the **Weight trend · 30 days** card on the right: headline current weight (e.g. `182.4 lb`), delta line (e.g. `-0.7 lb vs 30 days` with success/muted coloring), and a **simple coral line chart** with point markers over the window. Charcoal + coral v2 tokens only (`docs/brand_style_guide.md`).

Shell chrome, welcome band, and stat cards in that PNG are **#21 / future slices**; this ticket only implements the **trend card content** inside the existing two-column Measurements layout shipped in #15.

### Scope

- Replace the #15 **Weight trend** placeholder in `MeasurementsTabPanel` with a data-driven card aligned to `theme-preview-fitness-shell-v2.png`.
- Data: weight entries only, **last 30 days** (by `measured_at`), from `listMeasurements` (or a focused query/filter).
- UI: current value (latest weight in window), **delta vs start of window** (or vs 30 days ago — document choice in PR), up/down/flat styling using `success` / muted tokens where appropriate.
- Chart: minimal SVG or CSS — **no new heavy chart library** unless already in the stack; match mockup (smooth-ish line, coral stroke, dot markers).
- **Empty state** when no weight entries in the window (supportive copy; no fake chart).
- **Loading / error** states consistent with Recent history card.

### Acceptance Criteria

- User sees weight trend on `/dashboard` → Measurements tab matching the **right-hand card** in `theme-preview-fitness-shell-v2.png` in structure and theme (not indigo/legacy refs).
- Trend values match persisted weight measurements for the selected 30-day window.
- Empty, loading, and error states are clear when there is no or failed data.
- Waist is not required to have a chart in this ticket.

### Dependencies

- Ticket 1.5.3
- Ticket 1.5.5 (#15)

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
- Manual test (when **1.5.10** ships): edit an entry and confirm list/trend reflect changes; soft-delete an entry and confirm it no longer appears in history.
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

---

## Ticket 1.5.9: Measurement update and soft delete (backend)

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `database`, `backend`, `api`

### Description

Let owners **correct mistakes** and **remove entries** without hard-deleting rows. Add owner-scoped **update** and **soft delete** (`deleted_at`) on `measurements`, plus server actions used by the history UI.

**Product choice:** **soft delete only** in this follow-up (no `DELETE` grant / hard delete). Deleted rows are hidden from list and trend queries; support or admin purge can be a later concern.

### Scope

- **Migration**
  - Add `deleted_at timestamptz null` to `public.measurements` (null = active).
  - Partial index for active rows, e.g. `(user_id, measurement_type, measured_at desc) WHERE deleted_at IS NULL` (adjust if an existing index should be replaced or complemented).
  - `GRANT UPDATE` on `measurements` to `authenticated` (still no hard `DELETE` for app role).
  - RLS policy **`measurements_update_own`**: authenticated user may `UPDATE` only their rows (`auth.uid() = user_id`). Optionally restrict which columns change in app layer; DB still enforces ownership.
  - **Select policy:** either keep current select-own (deleted rows still readable by owner) **or** document that list actions filter `deleted_at IS NULL` only — prefer **list/trend exclude soft-deleted** in application queries even if RLS allows select.
- **`updateMeasurement(id, input)`** server action:
  - Same validation rules as create (`createMeasurementSchema` fields; `id` UUID).
  - Reject if row missing, not owned, or `deleted_at` is set.
  - Return normalized measurement payload.
- **`softDeleteMeasurement(id)`** server action:
  - Set `deleted_at = now()` for owner row; idempotent if already deleted (return success or clear “already removed” — pick one and test).
  - Reject unauthenticated / cross-user.
- **`listMeasurements`** (and any future trend query):
  - Default: **only** rows where `deleted_at IS NULL`.
  - Do not expose soft-deleted rows in Recent history or #16 trend.
- **Types:** extend `Measurement` (or row type) with `deleted_at: string | null` if selected from DB; optional for API responses if never returned after delete.
- **Tests:** happy paths, validation, unauthorized, wrong owner, update/delete on soft-deleted row, list omits deleted.

### Acceptance Criteria

- Owner can update value, unit, `measured_at`, notes, and `measurement_type` (with unit rules) on an active entry.
- Owner can soft-delete an entry; it disappears from `listMeasurements` results.
- Another user cannot update or soft-delete a row they do not own.
- Unauthenticated calls fail with the same error shape as create/list.
- Migration applies cleanly in local/dev; RLS and grants match the above.

### Dependencies

- Ticket 1.5.1
- Ticket 1.5.2
- Ticket 1.5.3
- Ticket 1.5.5 shipped (log + history UI) — recommended before UI ticket, but backend can land first

### Suggested GitHub title

`feat(measurements): update and soft-delete backend (#1.5.9)`

---

## Ticket 1.5.10: Measurement history edit and delete UI

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `frontend`, `ui`

### Description

Add **Edit** and **Delete** affordances on Recent history rows in the Measurements tab, wired to ticket **1.5.9** actions. Reuse the v2 log modal for edit; use a lightweight confirm step for delete.

**Canonical styling:** same charcoal + coral tokens as `log-measurement-modal-v2` and history card in `theme-preview-fitness-shell-v2.png` (text buttons or icon+label; keep touch targets and contrast).

### Scope

- **History list** (`MeasurementsTabPanel` or child):
  - Per row: **Edit** and **Delete** (visible on row hover/focus on desktop; always available on mobile — avoid hover-only-only UX).
  - Delete opens **confirm dialog** (not the log modal): short copy, Cancel + destructive confirm (coral-outline or muted destructive per brand guide).
  - On successful delete: refresh list + brief success/status message (same pattern as post-create banner).
- **Edit flow:**
  - Reuse `LogMeasurementModal` in **edit mode** (title e.g. “Edit measurement”, primary CTA “Save changes”) **or** shared `MeasurementFormModal` with `mode: 'create' | 'edit'`.
  - Pre-fill type, value, unit, date, notes from selected row; submit calls `updateMeasurement`.
  - On success: close modal, refresh list, optional success message.
- **Loading / error:** disable actions while submit in flight; show field/server errors in modal or inline on delete failure.
- **Accessibility:** dialog labels, focus trap on confirm modal, keyboard activation for row actions, `aria-live` for errors/success where appropriate.
- **Out of scope:** bulk delete, undo restore, admin hard purge UI.

### Acceptance Criteria

- User can edit an existing weight or waist entry from Recent history; changes persist and list re-renders.
- User can soft-delete an entry after confirmation; it no longer appears in history (any tab filter).
- Welcome-band and in-tab **+ Log measurement** still open **create** flow only (not edit).
- Empty, loading, and error states still behave after integrating row actions.
- Visual treatment matches existing Measurements tab and log modal (v2 coral theme).

### Dependencies

- Ticket 1.5.9 (backend must be merged or available in dev)
- Ticket 1.5.5

### Suggested GitHub title

`feat(measurements): edit and delete in history UI (#1.5.10)`

---

## Ticket 1.5.11: Tests for measurement update and soft delete

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1.5`, `measurements`, `tests`, `quality`

### Description

Automated coverage for the edit/delete follow-up so regressions do not slip in before or after #16 trend work.

### Scope

- Extend backend tests for `updateMeasurement` and `softDeleteMeasurement` (mirror create/list test style).
- Extend list tests to assert soft-deleted rows are excluded.
- Frontend tests (if project adds component tests for measurements): edit modal pre-fill + submit mock; delete confirm invokes soft delete and refreshes list — **optional** if Slice 1.5.7 component scope is still open; otherwise include minimally here.

### Acceptance Criteria

- `npm test` passes with new cases for update, soft delete, and list exclusion.
- No reduction in coverage for existing create/list paths.

### Dependencies

- Ticket 1.5.9
- Ticket 1.5.10 (for any UI tests)

### Suggested GitHub title

`test(measurements): update and soft-delete coverage (#1.5.11)`
