# GitHub Tracking Setup (Slices)

Use this as your default project-tracking structure in GitHub.

## Milestones

Create one milestone per vertical slice:

- `Slice 1 - Auth & Profile Setup`
- `Slice 1.5 - Measurements & Baseline Tracking`
- `Slice 2 - Journaling & Life Domains`
- `Slice 3 - Workouts`
- `Slice 3.1 - AI Workout Import`
- `Slice 4 - Dashboard Insights`
- `Slice 5 - Achievements`
- `Slice 6 - AI + Social Lite`

Suggested due date pattern:

- Set each milestone due date 1-2 weeks apart (or your preferred sprint cadence).

## Labels

Use a small, consistent set of labels:

- `slice-1`, `slice-1.5`, `slice-2`, `slice-3`, `slice-3.1`, `slice-4`, `slice-5`, `slice-6`
- `backend`
- `frontend`
- `database`
- `api`
- `auth`
- `measurements`
- `workouts`
- `ai`
- `security`
- `supabase`
- `validation`
- `ui`
- `tests`
- `quality`
- `qa`
- `release`
- `chore`
- `bug`
- `blocked`
- `priority/p0`
- `priority/p1`

## Recommended Workflow

- Create issues from the matching slice tickets file under `docs/vertical_slices/`.
- Assign issues to the matching slice milestone.
- Add one `slice-*` label and the relevant scope labels (`backend`, `frontend`, `security`, etc.).
- Keep only one issue in active execution at a time if solo.
- When blocked, add `blocked` and open a small unblocker issue.

## Issue Naming Convention

Use predictable issue titles:

- `[Slice 1] Set up authentication foundation`
- `[Slice 1] Create profile data model and migration`
- `[Slice 1.5] Create measurements data model and migration`
- `[Slice 1.5] Build create measurement backend action`
- `[Slice 3.1] Build secure PDF intake and server-side text extraction`
- `[Slice 3.1] Build resumable editable import review`

## Definition of Done (Issue-Level)

Before closing an issue:

- Acceptance criteria are met.
- Tests/checks pass (or manual QA documented).
- Notes added on what was shipped and what was deferred.
- Any follow-ups created as separate issues.
