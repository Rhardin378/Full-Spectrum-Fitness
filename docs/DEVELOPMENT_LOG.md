# Full Spectrum Fitness Development Log

**Role:** chronological record of what actually happened — human or agent, does not matter.

Append a dated section after every meaningful session (ship, decision, incident, or handoff). Newest entry at the **top**. Do not rewrite history; add a correction note if an older entry was wrong.

Template:

```markdown
## YYYY-MM-DD

### Completed
-

### Decisions
- (If locked, also add/update `ARCHITECTURE_DECISIONS.md` and the PRD / system design / launch plan.)

### Issues
-

### Next
-

### AI Notes
- Who (Cursor Grok, human, other) and what they recommended or shipped.
```

Handoff pack: [README.md](./README.md).

---

## 2026-11-04 — Check-in notes and weight link (docs only, [PR #59](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/59))

### Completed

- Ticket 2.1: optional nullable `notes` on `weekly_check_ins`, max 1000 characters, database check constraint, owner RLS. Zod validation is ticket 2.2.
- Ticket 2.4: optional final notes field with the approved prompt. Notes show in check-in history. Nothing replies. Slice 5 reads notes as context later (ADR-004) with no new data model.
- Ticket 2.7: secondary link “Log this week’s weight” to the existing `/dashboard` measurements log. No new feature.
- ADR-013 consequences and the Slice 2 README note the field. Future ideas, not built: diet adherence / appetite tracking, and coach Q&A replies to notes. Progress photos stay backlog #54.
- Tickets 2.2, 2.8, and 2.10 record empty notes, the length limit, and RLS ownership. No application code.

### Decisions

- Notes are the owner’s memory of the week, not a message to a coach.

### Issues

- None new. The handoff pack is still ticket 2.9.

### Next

- Review PR #59.

### AI Notes

- Cursor Grok: docs only, on the existing PR branch.

---

## 2026-11-04 — ADR-013 proposed (docs only, [PR #59](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/59))

### Completed

- Added ADR-013 (Proposed) to `docs/ARCHITECTURE_DECISIONS.md`. It records Option B life domains (Peterson / Future Authoring, not the SAMHSA wellness wheel), stress and energy on the weekly check-in, that check-in moving from Slice 5 into Slice 2, and exactly one `weekly_intentions` row per week.
- Noted the proposal on ADR-005 without changing its Accepted status or deleting it. Slice 5’s coach report reads the stored check-in later.
- Pointed the Slice 2 README and ticket 2.9 at ADR-013. Ticket 2.9 now requires the PRD, system design, ADR-005, `navigation-ia.md`, `tracking_setup.md`, and `DOMAIN_FOCUS_AREAS` to align with and link to it, including a mapping or migration for saved profile domain values.
- Did not change application code, the PRD, system design, or the launch plan.

### Decisions

- ADR-013 stays Proposed until ticket 2.9 accepts it into the handoff pack. ADR-005 stays Accepted until that update. One intention per week is the rule; a list is a later idea. Copy stays wellbeing language, not therapy (ADR-011).

### Issues

- The pack files named in ticket 2.9 still describe the wellness wheel and a Slice 5 check-in. `DOMAIN_FOCUS_AREAS` is still the seven wheel slugs.

### Next

- Review PR #59. Ticket 2.9 is the pack alignment, including the profile-domain mapping or migration. It is not this commit.

### AI Notes

- Cursor Grok: docs only. Next free number after ADR-012.

---

## 2026-11-03 — Slice 2 tickets and cleanup backlog (docs only)

### Completed

- Added `docs/vertical_slices/slice_2_journaling_life_domains/` (brief + tickets 2.1–2.10) and approved mockups under `docs/mockups/slice_2_journal_checkin/`.
- Added `docs/vertical_slices/cleanup_backlog/` after checking `main`: Next.js is still 16.1.6, there is still no GitHub Actions workflow, password reset is still absent, draft PR #19 is still open, and issues #54–#56 are still labeled `slice-1.5`.
- Did not change application code. Did not edit PRD, system design, launch plan, or ADRs. Those disagreements are ticket 2.9 so they land together.

### Decisions

- Ryan locked Slice 2: journal is mood + reflection and up to two Option B domain tags; stress, energy, and domain scores move to a weekly check-in that is now Slice 2, not Slice 5. One intention per week. Slice 5 remains the coach report.
- The handoff pack still describes the wellness wheel and a Slice 5 check-in. Ticket 2.9 is the pack update. Slice 2 build work follows the new slice README until that ticket merges.
- Slice 1.5 stays the current build in the launch plan. These tickets do not start the slice.

### Issues

- Pack vs approved spec is listed in ticket 2.9 (domains, journal fields, check-in slice, navigation IA, profile `DOMAIN_FOCUS_AREAS`, tracking milestones).
- `docs/AI_ENGINEERING_CONTEXT.md` is still the 2026-10-05 audit. It was not rewritten.

### Next

- Review the docs PR. File GitHub issues from the ticket files when the slice is allowed to start. Cleanup tickets CU.1–CU.6 can proceed without waiting for Slice 2.

### AI Notes

- Cursor Grok: docs only, grounded in migrations, auth routes, middleware, `package.json`, and GitHub issue/PR state. No app code.

---

## 2026-11-03 — Weight trend range toggle ([PR #58](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/58))

### Completed

- Measurements weight trend card has a 30D / 90D / 6M / 1Y / All control. 90D is the default.
- The chart, subtitle, change, and weigh-in count follow the selected range. The recent history list does not.
- Range changes filter measurements already loaded in the browser. The card still uses `listMeasurements` and does not add a query, migration, or server action.
- On viewports below the `lg` breakpoint the chart sits above recent history. From `lg` up, history stays on the left and the chart on the right.

### Decisions

- Windows are inclusive calendar days on `measured_on` (YYYY-MM-DD), compared as dates rather than timestamps, so a UTC midnight cannot shift a logged day.
- 30D and 90D are today plus the previous 29 or 89 days. 6M and 1Y step calendar months and clamp short months (Mar 31 back 6 months starts Sep 30). All keeps every loaded weigh-in.
- The card pages through existing weight results (page size 100) once per refresh, then filters locally.

### Issues

- A very long history stops after 50 pages (5,000 weigh-ins) and charts what was loaded.

### Next

- Review the segmented control on a phone-width measurements tab.

### AI Notes

- Cursor Grok: client-side range filter in `src/lib/measurements/trend-range.ts`, toggle on the weight trend card, Vitest coverage for boundaries and toggle behavior.

---

## 2026-10-21 — Recent history window (5 rows, Show more) ([PR #52](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/52))

### Completed

- Recent history renders the 5 newest loaded rows by default, with a count such as “Showing 5 of 23”.
- Show more reveals 10 more rows per click. Show less collapses back to 5. A control is hidden when it would not change the list.
- The window is client-side only. Edit, delete, and focus return to the history heading are unchanged. Refresh keeps the expanded window and the rendered count clamps to the rows that remain.

### Decisions

- No inner scroll region, and no change to list page size, server actions, or schema. The window applies to rows already loaded for the card (page size 25).

### Issues

- Show more cannot reveal entries past that loaded page.

### Next

- Review the history window on a phone-width measurements tab.

### AI Notes

- Cursor Grok: client-side history window in `MeasurementsTabPanel`, with Vitest/RTL coverage.

---

## 2026-10-21 — 1.5.10 history edit/delete review fixes (PR #51)

### Completed

- Review follow-up on the Recent history Edit/Delete UI ([PR #51](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/51)).
- Thrown `updateMeasurement` / `softDeleteMeasurement` calls show a generic error and always clear the submitting state, so Escape, the backdrop, and Cancel stay usable.
- `not_found` closes the edit modal or delete dialog, refreshes history, and shows a status message instead of leaving a stale row.
- Row Edit/Delete targets are at least 44px, stay visible on devices that cannot hover, and have distinct names such as “Edit Weight on Oct 4, 2026”.
- Component tests cover prefill, confirm/cancel/escape, refresh, thrown actions, and `not_found`.

### Decisions

- No undo, optimistic updates, or new product copy beyond the error and missing-row messages.
- Hide row actions with `can-hover` (`@media (hover: hover)`) rather than the `sm` breakpoint, so touch tablets are not hover-only.

### Issues

- Phone preview of edit/delete on the Vercel deployment is still manual.
- Edit/delete against hosted data still depends on the 1.5.9 migration being applied there.

### Next

- Review/merge PR #51, then 1.5.8 QA (edit and soft-delete on a real account, including a US timezone).

### AI Notes

- Cursor Grok: review fixes on `cursor/measurements-edit-delete-ui-fa4a`. UI half of ticket 1.5.11 (history component tests) is included here; backend update/delete tests remain from #50.

---

## 2026-10-19 — 1.5.9 update/soft-delete backend (PR #50)

### Completed

- Backend for measurement **update** and **soft delete**: `deleted_at`, column-level `GRANT UPDATE`, RLS `measurements_update_own` on active rows, `updateMeasurement` / `softDeleteMeasurement`.
- List (and trend) hide `deleted_at IS NULL`. Calendar date stays `measured_on`.
- Update Zod uses the same `.strict()` + unit-vs-type refine as create (not `.and()`).

### Decisions

- Soft delete only; no `DELETE` grant.
- Policy `USING` requires `deleted_at is null`; `WITH CHECK` does not, so setting `deleted_at` is allowed. Select stays unfiltered for lookup/RETURNING.
- Authenticated may update only measurement fields + `deleted_at` (not `user_id` / `created_at`).

### Issues

- Migration not applied to hosted Supabase until after merge (`db:push` from desktop bash).
- 1.5.10 UI not started.

### Next

- Review/merge PR #50, apply migration, then 1.5.10 history Edit/Delete UI.

### AI Notes

- Cursor Grok: ticket 1.5.9 on `cursor/measurements-soft-delete-fa4a`. Review feedback (schema `.and()` drop, grant/policy tightness, empty write → `not_found`) applied before merge.

---

## 2026-10-10 — Test branch `test/new-logo`: navbar mark v3 and home hero badge (draft PR, do not merge).

## 2026-10-10 — PR-only workflow + deferred ruleset ticket

### Completed

- Documented **branch → PR → merge** for `main` (README, docs index, `.github/copilot-instructions.md`, launch plan).
- Added [`docs/vertical_slices/repo_governance/`](./vertical_slices/repo_governance/) with ticket **RG.1** (ruleset sit-down after next few 1.5 tickets), **RG.2** (CI), **RG.3** (security baseline).

### Decisions

- Do not push directly to `main`; agents and humans use feature branches and PRs.
- Full ruleset configuration (required checks, bypass list) waits until after **1.5.9–1.5.11** / QA or until **RG.2** CI exists — avoid requiring checks that do not exist yet.

### Issues

- GitHub may already require PRs; align required status checks with CI when **RG.2** lands.

### Next

- Production smoke test for 1.5.12; then 1.5.9 edit/soft-delete on a branch + PR.

### AI Notes

- Cursor: governance docs only; no GitHub settings changed from repo.

---

## 2026-10-09 — measurement calendar-date fix (1.5.12)

### Completed

- Added `measured_on date` (backfill from UTC `measured_at`) so history, filters, and the date picker keep the calendar day the user chose.
- Create/list/trend now read and write `measured_on`. Pagination cursors are version 2.
- Future-date limit stays in Zod (no `current_date` CHECK). Tests cover Chicago, Auckland, and UTC calendar conversion.

### Decisions

- Calendar date is the product field. `measured_at` remains UTC midnight of that date for compatibility.
- Date-only input only (`YYYY-MM-DD`); ISO date-times are rejected on create/list filters.

### Issues

- Migration must be applied to the linked Supabase project (`npm run db:push` via pooler if IPv6 is blocked).
- Edit/soft-delete (1.5.9–1.5.11) still not started.

### Next

- Apply the `measured_on` migration in dev, then 1.5.9 update/soft-delete.

### AI Notes

- Cursor Grok implemented ticket 1.5.12 only (option B). Next.js upgrade still deferred.


## 2026-10-05 — audit context closeout

### Completed

- Added `docs/AI_ENGINEERING_CONTEXT.md` only: FSF Senior Engineer audit of `eac09b8` on `main` (stack, shipped Slice 1 / 1.5 behavior, Phase 1 gaps, security notes, test gaps, recommended date-fix approach).
- Opened [PR #43](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/43); merged as `ac6d2e9`. No other files in that diff.

### Decisions

- Audit notes stay recommendations. This session did not lock architecture and did not create or edit `ARCHITECTURE_DECISIONS.md`, the PRD, system design, or launch plan.
- No application code, migrations, config, or dependency changes.
- Product decisions locked later the same day are in the handoff-pack entry below (PR #44). This entry does not change them.

### Issues

- Not fixed here: measurement dates stored as UTC midnight and shown in local time; Next.js 16.1.6 advisories; no CI; ProfileProvider stale after client auth redirect (not browser-reproduced); `getOrCreateProfile()` on the root layout; auth callback, password reset, and password length still incomplete.
- Production Supabase grants/RLS, Auth settings, and Vercel env vs `main` remain unverifiable from the repo.

### Next

- Close Slice 1.5. First user-visible item is the measurement calendar-date fix (`measured_on` plus timezone-aware tests). Do not start journal, workouts, or AI until 1.5 is closed (`LAUNCH_PLAN.md`).

### AI Notes

- Cursor Grok (cloud). Docs-only. The file below this entry already records the later handoff pack; it is not rewritten here.

---

## 2026-10-05

### Completed

- Product/architecture docs aligned as a handoff pack:
  - `docs/PRD.md` — thesis, Phase 1 vs later, weekly coach, data model
  - `docs/SYSTEM_DESIGN.md` (renamed from `systemDesign.md`)
  - `docs/LAUNCH_PLAN.md` (renamed from `launch_plan.md`) — **you are here: Slice 1.5**
  - `docs/ARCHITECTURE_DECISIONS.md` — ADRs 001–012
  - this log
- Senior Engineer audit captured in `docs/AI_ENGINEERING_CONTEXT.md` (engineering health only; not approved architecture).
- README, navigation IA, and slice tracking updated so they do not still list social/achievements/Prisma as Phase 1.

### Decisions

- FSF is a longitudinal personal performance and wellbeing product (train / feel / live).
- Weekly Coach Check-In is the Phase 1 *destination*, not the next implementation slice.
- Finish Slice 1.5 before journal, workouts, insights, or coaching.
- Journal (Slice 2) before workouts (Slice 3).
- Analytics calculate; the LLM interprets. No core metrics from the model.
- Social, achievements, RAG, PDF import, and agent tools are out of Phase 1.
- RAG kept as a later curated evidence layer (not user-journal embeddings).
- Measurements stay off any social/public surface (ADR-012).
- See `ARCHITECTURE_DECISIONS.md` for the durable forms of these.

### Issues

- Slice 1.5 is **not done**. Create/list/history UI and a 30-day weight trend exist; edit/soft-delete (tickets 1.5.9–1.5.11), QA, and some tests remain.
- Measurement calendar dates: `measured_at` stored as UTC midnight and shown in local time — US timezones can display the wrong day (see `AI_ENGINEERING_CONTEXT.md`).
- Next.js 16.1.6 advisories; no CI; ProfileProvider/layout profile bootstrap concerns (audit, not fixed in this docs session).
- Draft nav IA (`/fitness`, `/mind`) still does not match implemented `/dashboard`.

### Next

- Stay on Slice 1.5: date semantics, edit/soft-delete, remaining tickets/QA.
- Do **not** start journal, workouts, AI, RAG, or social until 1.5 is closed.
- After 1.5: Slice 2 (journaling & life domains).

### AI Notes

- Cursor Grok (cloud): planning review, then source-of-truth rewrite, then this handoff pack. No application code in these commits.
- Audit file recommended a Phase 1 trim and journal-vs-workouts call; those product decisions are now locked in the pack rather than left as “ask Ryan.”
- Weight trend visualization is already in the app (30-day card). Do not treat “add history visualization” as the next net-new feature; polish/date-correct it as part of closing 1.5.

---

## 2026-09-28

### Completed

- Slice 1.5 UI on `/dashboard`: Fitness shell, tab-aware welcome CTA, log measurement modal, recent history list (#15, #21).
- 30-day weight trend card/chart (#16).
- Logged-in avatar menu, mobile header/hamburger, SVG brand mark.
- Tickets 1.5.9–1.5.11 written for update + soft-delete (not implemented in this day’s merges).

### Decisions

- Welcome-band CTAs follow the active Fitness tab (Option B): Measurements shows `+ Log measurement` only.
- Canonical UI is charcoal + coral v2 mockups, not older indigo/sports-tracker references.

### Issues

- Edit/delete not in UI yet.
- Date timezone display bug latent (documented 2026-10-05).

### Next

- Close remaining Slice 1.5 tickets (edit/soft-delete, tests, QA).

### AI Notes

- Mixed human + Cursor agent PRs on measurements UI, dashboard shell, and brand.

---

## 2026-09-23

### Completed

- `measurements` table migrations (type/unit constraints, RLS select/insert, later extra-grant revoke + user/date index).
- Create measurement server action + Zod validation + tests.
- Filtered list + cursor pagination.

### Decisions

- Measurement types limited to `weight` and `waist` for this slice.
- Owner-scoped RLS; values stored as entered (no conversion).

### Issues

- No update/soft-delete policies yet (insert/select only at this point).

### Next

- Dashboard shell and log UI (landed 2026-09-28).

### AI Notes

- Cursor agents implemented migration and create/list actions against Slice 1.5 tickets.

---

## 2026-09-21

### Completed

- Slice 3.1 AI Workout Import specified (architecture, tickets, human-review rules). Planning only.
- Slice 1.5 dashboard-shell product notes (measurements as `/dashboard` home).

### Decisions

- AI import is a follow-on after manual workouts; AI must not invent sets or auto-save (ADR-010).

### Issues

- None in code (docs-only).

### Next

- Continue Slice 1.5 implementation, not Slice 3.1.

### AI Notes

- Import slice documented so later work reuses the canonical workout model; it is still not current work.

---

## 2026-09-15

### Completed

- Slice 1.5 scope locked in docs: weight + waist only; progress photos deferred.
- Measurement UI references / tabbed dashboard plan.

### Decisions

- Hardcore physique measurements and photos are out of Slice 1.5 (ADR-002).

### Next

- Measurements schema and backend.

### AI Notes

- Product lock-in for a lightweight baseline, not a physique-contest tracker.

---

## 2026-06-23

### Completed

- Slice 1: authentication, profile get-or-create, profile form, global profile state, protected routing, tests.

### Decisions

- Supabase Auth + `profiles` row keyed by `auth.users` id (ADR-003).
- Profile fields: display name, fitness/wellness goals, experience, sharing preference, domain priorities.

### Issues

- OAuth, password reset, and `/auth/callback` still incomplete as of 2026-10-05 audit.
- Sharing preference stored; circles never implemented (later taken out of Phase 1).

### Next

- Slice 1.5 measurements.

### AI Notes

- Slice 1 treated as the first vertical slice and the auth foundation for everything after.

---

## 2026-05-07 and earlier

### Completed

- Initial PRD, launch, and app planning docs in the repo (2026-05-07).
- README / Phase 1 drafts (2026-02-19). Those drafts included social, achievements, and Prisma — **superseded 2026-10-05**.

### Decisions

- (Historical) Holistic wellness SaaS linking journaling and training. Later refined to longitudinal coach loop.

### Next

- At the time: implement Slice 1 (done 2026-06-23).

### AI Notes

- Early docs over-scoped Phase 1. Trust current `LAUNCH_PLAN.md` over this era’s README.
