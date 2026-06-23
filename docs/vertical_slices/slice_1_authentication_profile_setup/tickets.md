# Slice 1 Tickets (Copy to GitHub Issues)

Use each section below as one GitHub issue. Keep the order so dependencies stay clear.

---

## Ticket 1: Set up authentication foundation

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `auth`, `backend`, `frontend`

### Description

Implement the base authentication flow so users can sign up, sign in, sign out, and maintain a valid session in the app.

### Scope

- Configure auth client and environment variables.
- Add sign-up and sign-in UI flows.
- Add sign-out action.
- Ensure protected routes/pages require an authenticated user.

### Acceptance Criteria

- User can create an account and sign in.
- User can sign out successfully.
- Protected app routes redirect unauthenticated users.
- Session persists across page refresh.

### Dependencies

- None

---

## Ticket 2: Create profile data model and migration

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `profile`, `database`, `backend`

### Description

Create the `profiles` data model linked to auth users to store onboarding and personalization data.

### Scope

- Add `profiles` table/model with `user_id` relationship to auth user.
- Add fields:
  - `display_name`
  - `fitness_goal`
  - `wellness_goal`
  - `experience_level`
  - `sharing_preferences`
  - `domain_priorities` (JSON or structured equivalent)
- Add migration and verify schema locally.

### Acceptance Criteria

- Schema contains required profile fields.
- `user_id` link is enforced.
- Migration runs successfully in local/dev environment.

### Dependencies

- Ticket 1

---

## Ticket 3: Build get-or-create profile backend action

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `profile`, `backend`, `api`

### Description

Implement backend logic that returns the authenticated user profile, creating a default one if none exists.

### Scope

- Add get-or-create profile server action/API route.
- Read current authenticated user ID from session/auth context.
- If profile does not exist, create default record.
- Return normalized profile payload.

### Acceptance Criteria

- Authenticated user receives a profile object.
- First-time authenticated user automatically gets a new profile row.
- Unauthenticated requests are rejected.

### Dependencies

- Ticket 1
- Ticket 2

---

## Ticket 4: Build update profile backend action with validation

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `profile`, `backend`, `validation`

### Description

Implement secure profile update endpoint/action so users can save onboarding/profile form changes.

### Scope

- Add update profile server action/API route.
- Validate payload fields and reject invalid values.
- Enforce owner-only updates using authenticated user ID.
- Return updated profile payload.

### Acceptance Criteria

- Valid profile updates are saved and returned.
- Invalid payloads return clear errors.
- Users cannot update another user profile.
- Unauthenticated requests are rejected.

### Dependencies

- Ticket 3

---

## Ticket 5: Build profile setup and edit UI

**Type:** feature  
**Priority:** P0  
**Labels:** `slice-1`, `profile`, `frontend`, `ui`

### Description

Create profile onboarding/edit form that loads current data and allows users to save updates.

### Scope

- Build profile form UI for all required fields.
- On first load, call get-or-create profile backend.
- Submit updates to update profile backend action.
- Show loading, success confirmation, and error states.
- Match brand voice and style guidance.

### Acceptance Criteria

- User can view existing profile values in form.
- User can edit and save profile values.
- Success and error states are visible and clear.
- Form follows basic accessibility patterns (labels, keyboard submit).

### Dependencies

- Ticket 3
- Ticket 4

---

## Ticket 6: Add profile context/hook for app-wide usage

**Type:** feature  
**Priority:** P1  
**Labels:** `slice-1`, `profile`, `frontend`, `state`

### Description

Add a global profile state layer so key surfaces can render user-specific data without duplicate fetch logic.

### Scope

- Create profile hook/context/provider.
- Load current profile once per authenticated app session.
- Expose profile and refresh method for consuming components.
- Wire into at least one shared UI surface (header or dashboard intro).

### Acceptance Criteria

- Shared components can access current profile data.
- Profile context updates after successful save.
- No duplicate profile fetch loops in normal navigation.

### Dependencies

- Ticket 5

---

## Ticket 7: Add tests for auth-profile critical flow

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1`, `tests`, `quality`

### Description

Add focused tests covering the highest-risk behavior in the auth + profile setup flow.

### Scope

- Test get-or-create profile behavior.
- Test profile update validation and owner checks.
- Add one frontend test for profile form submit happy path.
- Add one frontend test for visible error state.

### Acceptance Criteria

- Tests run locally and pass.
- Core auth-profile flow is covered by automated checks.
- No test regressions in existing suites.

### Dependencies

- Ticket 3
- Ticket 4
- Ticket 5

---

## Ticket 8: Slice 1 QA and release checklist

**Type:** chore  
**Priority:** P1  
**Labels:** `slice-1`, `qa`, `release`

### Description

Run end-to-end verification for Slice 1 and document release readiness.

### Scope

- Manual test: new user sign-up -> profile setup -> re-login -> persisted profile.
- Manual test: invalid form input shows proper error handling.
- Manual test: unauthenticated user blocked from protected pages.
- Document known issues and follow-ups.

### Acceptance Criteria

- Core done criteria from Slice 1 brief verified.
- Any known gaps captured as follow-up issues.
- Slice 1 marked ready for merge/release.

### Dependencies

- Ticket 1
- Ticket 5
- Ticket 7

---

## Additional Automated Test Candidates (Optional but Recommended)

If you want stronger confidence before Slice 2, create these as extra issues or subtasks under Ticket 7.

### A) Contract tests for profile API/actions

- Ensure response shape is stable (all expected profile fields returned).
- Ensure unknown fields are rejected/ignored based on validation rules.
- Ensure idempotency of get-or-create (repeated calls do not create duplicates).

### B) Validation edge-case unit tests

- `display_name` min/max length boundaries.
- `experience_level` invalid enum values rejected.
- `domain_priorities` invalid types/shape rejected.
- Empty-string and null handling for optional vs required fields.

### C) Authorization and security tests

- Cross-user update attempt returns forbidden/unauthorized.
- Missing session/user context returns unauthorized.
- User cannot read profile belonging to another user.

### D) Frontend component tests

- Form pre-fills values from loaded profile.
- Save button disabled while submit is in progress.
- API error renders visible inline error and preserves form inputs.
- Success toast/message appears and profile context refreshes.

### E) Lightweight end-to-end smoke test (Playwright/Cypress)

- Sign up -> complete profile -> sign out -> sign in -> profile persists.
- Unauthenticated navigation to protected page redirects to auth screen.

### Suggested minimum bar for Slice 1

- 4-6 backend tests (validation + auth/ownership + idempotency)
- 2-3 frontend component tests
- 1 end-to-end smoke test for auth/profile happy path
