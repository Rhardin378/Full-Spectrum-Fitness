# Cleanup backlog

Cross-cutting hardening that is still open after Slice 1 and Slice 1.5. These tickets do not start Slice 2. They also do not replace [`repo_governance/tickets.md`](../repo_governance/tickets.md): **RG.2** and **RG.3** point here so the version pin and the CI file are not specified twice.

Verified against `main` on 2026-11-03. Tickets: [`tickets.md`](./tickets.md).

## Already done — do not re-open

| Item | Evidence |
|------|----------|
| Slice 1 auth, profile, QA | GitHub issues #1–#9 closed. Profile actions, form, and tests are in `src/lib/profile/` and `src/components/profile/`. |
| Measurements create, list, shell, trend, tests | Issues #12–#18 and #21 closed. Tables in `supabase/migrations/`. UI in `src/components/measurements/`. |
| Calendar dates (`measured_on`) | `supabase/migrations/20261009113530_add_measurements_measured_on.sql`, `src/lib/measurements/calendar-date.ts`. |
| Update and soft delete | `supabase/migrations/20261019123631_add_measurements_deleted_at.sql`, `updateMeasurement` / `softDeleteMeasurement`. Issue trail includes PR #50 and PR #51, now on `main`. |
| History window (5, then Show more) | PR #52. `HISTORY_INITIAL_VISIBLE` / `HISTORY_VISIBLE_STEP` in `src/components/measurements/measurements-tab-panel.tsx`. The 2026-10-21 development log accepts that Show more stops at the loaded page of 25. That is not a new cleanup ticket. |
| Weight trend ranges | PR #58. `src/lib/measurements/trend-range.ts`. |
| Slice 1.5 QA issue | #18 is closed. |
| Password reset, CI, Next.js upgrade | **Not** in this table. They are tickets CU.3, CU.2, and CU.1. |

## Checked and left unticketed

- **Playwright smoke** in `docs/vertical_slices/slice_1_authentication_profile_setup/tickets.md` (section E) was optional. There is still no Playwright setup. `docs/AI_ENGINEERING_CONTEXT.md` also lists it as later test-pyramid work. Not part of this backlog.
- **Slice 3.1** tickets are future work in the launch plan, not unfinished Slice 1.5 work.
- **Progress photos, Fitness stat cards, and the other Fitness tabs** already have open issues #54, #55, and #56. CU.5 only relabels them. It does not rewrite the product scope.
- **`docs/AI_ENGINEERING_CONTEXT.md`** (audited commit `eac09b8`, 2026-10-05) still says the measurement date bug is open, that there are 4 migrations, and that there are 0 component tests. Those statements are stale. The file is an audit snapshot, not the build spec. Ticket 2.9 says not to treat it as the domain list. A full rewrite is not required to start the work in this folder.
- **shadcn/ui** is named in `.cursor/rules/project-rules.md` and `.github/copilot-instructions.md`. It is not a dependency (`package.json`, and the audit note). Slice 2 keeps the current Tailwind tokens. No cleanup ticket.
- **Hosted Supabase and Vercel** (whether every migration was applied, Auth email settings, env vars) are still unverifiable from the repo. Tickets say so where it matters. They do not invent a production status.
