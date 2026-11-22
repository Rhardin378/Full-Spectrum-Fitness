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

## 2026-11-22 — Fitness shell at `/fitness` (NAV.1)

### Completed

- Canonical Fitness URLs: `/fitness`, `/fitness/measurements`, `/fitness/workouts`, `/fitness/library`. Until OV.1, `/fitness` selects Measurements.
- `/dashboard` (and under it) permanently redirects to `/fitness` with the query string kept (middleware 308 + next.config).
- Sign-in landing, navbar Fitness link, profile back link, and auth redirects use `/fitness`. Protected path is `/fitness`.

### Next

- Slice 2 ticket 2.7 (check-in due card can link to `/fitness/measurements`).

### AI Notes

- Cursor agent. Required before ticket 2.7.

---

## 2026-11-22 — Activity streak on Mind (ticket 2.5.1)

### Completed

- Pure `computeActivityStreak` / `unionActivityHitDates` (ADR-014): one grace miss per Monday–Sunday week, recomputed from calendar dates.
- Server `getActivityStreak` loads the session user’s journal `entry_on` dates (no workout hits until that slice stores a calendar day).
- `/mind` shows **Activity streak** as the first stat (days + grace line + “Journal counts”; empty copy when 0). Not “Journal streak” or “N of 7”.
- ADR-014 marked Accepted.

### Next

- Ticket 2.7 (check-in due card + Sunday week-math). Ticket 2.5.2 (Weight now). **OV.1** reuses the same streak function.

### AI Notes

- Cursor agent. Fixture row for mid-week start corrected to grace `1` to match ADR’s earliest filter (days before the first hit are outside the streak).

---

## 2026-11-22 — Sunday check-in week decision (ticket 2.7, docs only)

### Decisions

- Ryan, 2026-11-22. A check-in submitted on Sunday closes the Monday–Sunday week ending that day (recap covers that week) and creates the intention for the following Monday’s week. Monday–Saturday check-ins keep closing the last completed week. Recorded under ticket 2.7 and the slice README; implement with the due-card work (helper, `submit_weekly_check_in` week args, `cappedEditableUntil`, tests including `TZ=America/Chicago` late Sunday). Not coded yet.

### Next

- Ticket 2.7 implements the due card and this Sunday week-math change together.

### AI Notes

- Cursor agent. Docs-only note on the 2.5 PR at Ryan’s request.

---

## 2026-11-22 — Weekly intention line and Mind card (ticket 2.5)

### Completed

- Journal shows “This week’s intention” above the form (coral bar); Mind shows a card under the mood trend with domain label and read-only outcome when set.
- Body edits call `updateIntentionText` while `today <= editable_until`; after that both surfaces show text only. No intention → render nothing. Domain is never a control.

### Next

- Ticket 2.7 (check-in due card). Ticket 2.5.1 (activity streak) shipped separately.

### AI Notes

- Cursor agent. Circled back to 2.5 after 2.6 merged.

---

## 2026-11-22 — Mind page (ticket 2.6)

### Completed

- Expanded `/mind` beyond the #91 stub: welcome + journal CTA (New / Edit today’s entry), rolling 7-day stats (avg mood, domains touched, last entry; no streak until 2.5.1), mood trend sparkline, and Recent entries history cards with Mood / optional Stress & Energy pills, Show more / Show less.
- Successful journal save redirects to `/mind?saved=1` with a one-shot “Entry saved.” banner (query stripped in-memory; gone on reload).
- Intention card (2.5) and check-in due card (2.7) left as mount points for later tickets.

### Next

- Ticket 2.5 (intention line + Mind card) and 2.7 (due card).

### AI Notes

- Cursor agent. Built on the #91 Mind stub after Ryan chose 2.6 before circling back to 2.5.

---

## 2026-11-22 — Weekly check-in screen (ticket 2.4) and Mind stub

### Completed

- Built `/mind/check-in` (ticket 2.4): week recap, last-intention outcome (hidden on first check-in), required stress/energy with daily averages as reference, Your goals reminder, canonical domain scores, next-week intention (defaults to lowest score), optional notes, history, redirect to `/mind` on success.
- Landed a minimal `/mind` stub (`MindHome`) and wired the Mind navbar link (desktop + mobile) so the check-in redirect has a destination. Ticket 2.6 builds on that stub.
- Follow-up cleanup on #91: shared `RatingScale`, copy/a11y fixes, submit stays disabled after success.

### Decisions

- Ryan accepted the early Mind stub + live navbar link in the 2.4 PR so submit can redirect without waiting on the full Mind home.

### Next

- Ticket 2.6 expands `MindHome` (stats, mood trend, intention card, history, journal-save confirmation and redirect).

### AI Notes

- Cursor agent. Ticket 2.4 UI plus the Mind stub, then Ryan’s cleanup pass on the same PR.

---

## 2026-11-21 — Mind history card design (ticket 2.6)

### Completed

- Added [`H-mind-history-entry-cards.png`](./mockups/nov_2026_tickets/H-mind-history-entry-cards.png): Recent entries on `/mind`, desktop and phone, five entries and Show more.
- Ticket 2.6 scope and acceptance criteria, ticket 2.8 tests, the 2.10 QA walk, the slice README, and the mockups README now describe the card.

### Decisions

- Ryan, 2026-11-21. Recent entries are one soft card per day with rating pills on the date line: Mood always (coral), Stress and Energy only when rated. A skipped rating renders nothing. Compared against a columns layout, a timeline, mini meters, and cards with meters; picked pills because the card is the same on desktop and phone and a mood-only day stays clean. Supersedes the history rows on `D-mind-home.png`.

---

## 2026-11-21 — Optional daily stress and energy on the journal

### Completed

- Migration `20261122030500_journal_entry_stress_energy.sql` adds nullable `stress` and `energy` (1–10) to `journal_entries` and grants update on both.
- Zod, `saveJournalEntry`, `listJournalEntries`, and the normalizer carry the two ratings. Omitted means null.
- `buildWeekRecap` returns `averageStress` and `averageEnergy`, averaged only over entries that rated each one (null when none did), with the same rounding as mood.
- The journal form has “Stress today” and “Energy today” rows after mood, both marked optional. Pressing the selected value again clears it. Mood, stress, and energy share one `RatingScale` component.

### Decisions

- Ryan, 2026-11-21. Stress and energy are also captured daily, optional, so Insights can correlate mood, stress, energy, and training at a daily grain. Weekly values alone gave about four points a month. Mood stays the only required rating to keep the journal fast.
- Ryan, 2026-11-21. The weekly check-in keeps its required stress and energy as the overall week rating. Its recap shows the week’s daily averages beside those inputs as a reference, without prefilling them. ADR-013 notes the change.

### Next

- Apply the migration to hosted: `npm run db:push`.
- Ticket 2.4 renders the daily averages in the check-in recap.

---

## 2026-11-21 — Daily journal screen (ticket 2.3) and three domain tags

### Completed

- Built `/mind/journal` (ticket 2.3): mood 1–10, required reflection, optional “One win today” and “Grateful for”, domain chips, “Save entry”. The server loads the caller’s rows for UTC today ±1 day; the browser picks local today’s row. Saving stays on the page and shows “Entry saved.” A slot under the date is left for the intention line (ticket 2.5).
- `/mind` is now a protected prefix in the middleware.
- Raised the journal tag cap from two to three: migration `20261122022543_journal_entry_domains_limit_three.sql` replaces the trigger, Zod allows three, the form allows three. Copy is “What was today mostly about? Pick up to three.”

### Decisions

- Ryan, 2026-11-21. Up to three domain tags per journal entry. A real day often spans three areas; a cap still keeps tags meaning “mostly about.” The check-in recap still shows the top two tagged domains. ADR-013 notes the change.
- Ryan, 2026-11-21. A successful journal save goes to `/mind`, which shows “Entry saved” and the entry first in history. This replaces the 2026-11-17 “journal save stays on `/mind/journal`” decision. Ticket 2.6 ships it; until then the journal stays on its page. The Mind primary action reads “Edit today’s entry” once today has a row.

### Issues

- Journal save is still separate writes for the entry and its tags (ticket 2.2), not one database function.

### Next

- Ticket 2.4 (check-in) or 2.6 (Mind page, which adds the navbar link to the journal).

### AI Notes

- Cursor Claude. Journal screen and the tag-cap change, after Ryan tested the screen.

---

## 2026-11-21 — Hero copy, MIT license, sticky navbar

### Completed

- Landing page copy now matches issue #84: early-access language, Weekly AI Coach, Wellbeing Journal, Start Your Journal (still `/auth`), and a visible Coming later tag on Community Support and Achievement System. The headline and founder section are unchanged.
- Added a standard MIT `LICENSE` at the repo root, copyright 2026 Ryan Hardin.
- The shared app header is `sticky top-0 z-50` with a solid background. It is rendered once from the root layout, so it stays on landing, auth, profile, dashboard, and every other page. Measurement dialogs use `z-[60]` so they paint above it.

### Decisions

- Ryan, 2026-11-21. The header sticks on every route, like an app header, from the one shared layout rather than per page.

### Issues

- Closes #84.

### Next

- Ticket 2.1. NAV.1 must merge before ticket 2.7.

### AI Notes

- Cursor Grok. Copy, license, and sticky header from issue #84, including the follow-up that the header sticks on every route.

---

## 2026-11-18 — Hiring-manager README

### Completed

- Rewrote the root `README.md` so a reader can see the product, what ships, and what is still a design. Docs only. No application code.
- Added live-app screenshots of the demo account Alex Rivera under `docs/screenshots/` (`dashboard-measurements.png` is the README hero).
- Corrected the local-run block: real clone URL, `.env.local`, and the env vars the app and `npm run db:push` actually read.

### Decisions

- No product decision. README status matches `docs/LAUNCH_PLAN.md`: Slice 1 and Slice 1.5 are done, Slice 2 is current, and its screens are not built.

### Issues

- The repo has no `LICENSE` file. The README states MIT, which is what the previous README claimed, and does not link a missing file.

### Next

- Ticket 2.1. NAV.1 must merge before ticket 2.7.

### AI Notes

- Cursor Grok. Docs only. Screenshot files were copied in unchanged from the supplied `readme-shots` set.
- Restored the vision section after Ryan's review.

---

## 2026-11-17 — One shared life-domain list

### Completed

- Specified that ticket 2.2 creates `src/lib/life-domains/` as the single source for the eight Option B slugs, their canonical order, the labels, and the `LifeDomain` type. Docs only. No application code.
- Moved `DOMAIN_FOCUS_AREAS` and `DOMAIN_FOCUS_LABELS` out of `src/lib/types/profile.ts` in that ticket’s spec. Profile imports them. The ADR-013 wheel-slug map stays profile-only and uses the shared list.
- Pointed the slice README and ADR-013 at `src/lib/life-domains/` after ticket 2.2. `docs/navigation-ia.md` and `docs/vertical_slices/tracking_setup.md` do not name `profile.ts` as the list, so they stay as written.

### Decisions

- Ryan, 2026-11-17. Profile, journal, check-in, and Mind share one life-domain list. No change to the profile UI, saved data, or the database. No new table. Ticket 2.1’s SQL checks still spell out the slugs. Profile focus-area priorities still do not reorder or preselect the check-in or journal. That stays a gate-D idea from Nov 16.

### Issues

- Closes the open question in the earlier 2026-11-17 screen-decisions entry, which left `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts`.

### Next

- Ticket 2.1. NAV.1 must merge before ticket 2.7.

### AI Notes

- Cursor Grok. Docs only, from Ryan’s 2026-11-17 decision.

---

## 2026-11-17 — Slice 2 screen decisions folded into the tickets

### Completed

- Folded Ryan’s 2026-11-17 Slice 2 decisions into the slice tickets and README. They had lived only in the footers of GitHub issues #71–#79. Docs only. No application code.
- Noted the same build order on NAV.1, the Nov 16 sequence, `docs/navigation-ia.md`, and the launch plan: ticket 2.9 landed in PR #68, implementation starts at 2.1, and NAV.1 (issue #80) merges before ticket 2.7.

### Decisions

- Ryan, 2026-11-17. Check-in intention label, exact: “Intention for the week of {Mon}–{Sun}” for the intention week. First check-in hides the last-intention block entirely. Check-in does not save a draft and redirects to `/mind` after a successful submit. Journal save stays on `/mind/journal`. Mind history entries are read-only: date, mood, tags, reflection clamped to about 2–3 lines, plus the win and gratitude lines when present. Intention text is editable from the Mind card and the journal inside the existing edit window. Domain slugs and labels for schema checks, validation, and UI live in `src/lib/life-domains/`.
- Already in the docs, left as written: no journal RPC in ticket 2.1 (the save is the ticket 2.2 server action). Before ticket 2.5.1 merges, the Mind stat row omits the streak card.

### Issues

- Open question, in the pull request: ticket 2.9 left `DOMAIN_FOCUS_AREAS` in `src/lib/types/profile.ts`. This entry does not move that profile list into `src/lib/life-domains/`.

### Next

- Ticket 2.1. NAV.1 must merge before ticket 2.7.

### AI Notes

- Cursor Grok. Docs only, from Ryan’s 2026-11-17 decisions on issues #71–#79.

---

## 2026-11-17 — Optional journal lines: one win, grateful for

### Completed

- Specified two optional one-line fields on the Slice 2 journal entry, “One win today” (`win`) and “Grateful for” (`grateful_for`). Docs only. No application code.
- Folded them into tickets 2.1, 2.2, 2.3, 2.6, 2.8, and 2.10, and into the slice README. Removed wins and gratitude from the Slice 2 deferred lists. Life events stay deferred with Slice 7.
- Noted in the PRD, launch plan, system design, and ADR-013 that these lines are not the Slice 7 `wins` and `life_events` tables. That Slice 7 plan is unchanged. Gratitude is now in the PRD journal description.

### Decisions

- Ryan, 2026-11-17. Both fields are skippable, never required, and never block saving the entry. Nullable text, at most 200 characters, same empty-to-null rule as check-in notes. Same day rule as the reflection (today’s row only). Shown on the Mind history entry when present. No wins page, wins table, feed, insights, AI, or reminders.

### Issues

- Open questions are in the pull request. This entry does not decide whether Slice 5 later reads the lines, or whether the journal mockups should be redrawn.

### Next

- Ticket 2.1 remains next. The new columns are part of that migration.

### AI Notes

- Cursor Grok. Docs only, from Ryan’s 2026-11-17 decision.

---

## 2026-11-17 — Ticket 2.9: handoff pack matches Option B

### Completed

- Accepted [ADR-013](./ARCHITECTURE_DECISIONS.md) and amended ADR-005 so the weekly check-in is Slice 2 and the coach report stays Slice 5.
- Aligned `docs/PRD.md`, `docs/SYSTEM_DESIGN.md`, `docs/LAUNCH_PLAN.md`, `docs/navigation-ia.md`, and `docs/vertical_slices/tracking_setup.md` with that decision. Slice 2 screen behavior stays in the slice README.
- Switched `DOMAIN_FOCUS_AREAS` to the eight Option B slugs. Saved wellness-wheel priorities keep their rank and change slug by the map in ADR-013 (`mapStoredDomainPriorities`, migration `20261117170000_map_domain_priorities_to_option_b.sql`).
- Profile focus-area dropdown shows the new labels. The fixed eight-row ranker is still a later ticket.

### Decisions

- ADR-013 is Accepted. `financial` and `occupational` both prefer `career`. The better rank keeps `career`. The other row keeps its rank and takes `learning` when that slot is free. Habits is not a preferred target. The three weaker pairs (`environmental` → `family_relationships`, `financial` → `career`, `spiritual` → `leisure`) are written in the ADR so the rewrite is not silent.

### Issues

- Journal, check-in, and intention tables are not built. Ticket 2.1 is next.
- `docs/AI_ENGINEERING_CONTEXT.md` is still the 2026-10-05 audit. Ticket 2.9 does not require a refresh.

### Next

- Ticket 2.1: journal, check-in, and intention schema.

### AI Notes

- Cursor Grok. Slice 1.5 was already closed, so “You are here” stays on Slice 2. The screens are called out as not built.

---

## 2026-11-16 — Goals reminder mockup

### Completed

- Added `docs/mockups/nov_2026_tickets/G-checkin-goals-reminder.png` and linked it from ticket 2.4 and the mockup README.
- The PNG is the filled bar only. The empty state and the three-line clamp stay in ticket 2.4.

### AI Notes

- Cursor Grok committed the file Ryan supplied. No application code.

---

## 2026-11-16 — Ryan’s answers on the eight open questions

### Completed

- Moved the eight questions in `docs/vertical_slices/nov_16_2026_decisions/README.md` to “Resolved Nov 16” with his answers.
- Amended Slice 2 ticket 2.4 with a read-only Your goals bar on the weekly check-in, directly above the life-domain scores. The PNG `G-checkin-goals-reminder.png` is not in the repo; the mockup README says so.
- Confirmed the workout-count cap, the realism thresholds, the pace anchor, the Weight now placement, and the due-card spot.
- Added ticket **NAV.1** (scope gate B): `/fitness` is canonical, `/dashboard` permanently redirects and keeps the query string. CU.3 is merged in #64, so NAV.1 can start now and must land before OV.1.
- Recorded three gate-D ideas: a priority-versus-score callout, ordering check-in domains by priority, and passing priorities to the Slice 5 coach. Focus areas still do not affect the Slice 2 check-in.

### Decisions

- Ryan’s. Listed under Resolved Nov 16. No new open questions from this set.

### Next

- Same sequence. CU.3 is merged in #64. NAV.1 can start now and must land before Overview.

### AI Notes

- Cursor Grok updated the specs only. No application code and no GitHub issue edits. The goals-reminder PNG was not on disk.

---

## 2026-11-16 — Navigation IA owners

### Completed

- Gave every item in `docs/navigation-ia.md` an owner: a slice or ticket, **Done** where the code on `main` already does it, or **Unplanned**.
- Recorded the `/fitness` vs `/dashboard` mismatch as an open question. Did not pick a URL.
- Noted that Slice 3, Slice 4, and Slice 5 have no ticket folder. Did not add those tickets.

### Decisions

- None. The URL question is open on purpose.

### Next

- Ryan can answer the Fitness URL question before anyone treats `/fitness` or `/dashboard` as the permanent path.

### AI Notes

- Cursor Grok checked the navbar, profile menu, Fitness tabs, routes, and middleware against the tree, then updated the IA on the Nov 16 specs branch.

---

## 2026-11-16 — Product decisions recorded as ticket specs

### Completed

- Wrote the Nov 16 decision specs in `docs/vertical_slices/nov_16_2026_decisions/` and stored the six mockups under `docs/mockups/nov_2026_tickets/`.
- Added [ADR-014](./ARCHITECTURE_DECISIONS.md) (Proposed): one activity streak, one grace day per Monday–Sunday week, recomputed on the server from calendar dates.
- Amended Slice 2 ticket 2.6 (single Mind page; activity streak replaces “N of 7”) and noted the rejected focus-area intention proposal on ticket 2.4. ADR-013’s lowest-score rule was not changed.
- Updated `docs/navigation-ia.md`, `docs/brand_style_guide.md` (positive-change green is a pill fill with charcoal text), the PRD profile and streak lines, and the launch-plan sequence note.

### Decisions

- Ryan locked the list in `docs/vertical_slices/nov_16_2026_decisions/README.md`: lowest-score intention stays, one activity streak, Mind is one page, Overview waits for workouts, structured goals are a number plus a deadline, Weight now shows relative time and a 30-day change, `#4ADE80` is a fill not text.
- No GitHub issues were opened or edited. #55 and #56 stay as they are. The README maps them onto the new tickets.

### Issues

- Open questions (thresholds, workout-count deadline, Weight now’s interim home, where free-text goals appear, due-card placement, any other check-in use of focus areas) are in that README. They were not filled in.

### Next

- CU.3 is merged in #64, including the hosted Supabase settings. Slice 2 is current. Then Slice 2.5 (streak and Weight now), then goals, then Fitness Overview with the workouts slice.

### AI Notes

- Cursor Grok wrote the specs from Ryan’s 2026-11-16 decisions and the attached mockups. No application code and no migration.

---

## 2026-11-16 — Cleanup closed; Slice 1.5 done; Slice 2 is current

### Completed

- Cleanup backlog CU.1–CU.6 done. CU.3 merged in #64; Ryan pushed the profiles grant migration and applied the hosted Supabase settings. CU.4: draft PR #19 closed. CU.5: #54, #55, #56 labeled `Backlog` without `slice-1.5`. CU.6: ruleset “Protect main” verified (no deletion or force-push, pull request required, `lint-typecheck-test-build` required, no bypass actors).
- Slice 1.5 closed. All its issues were already closed (last on 2026-11-02); the remaining follow-ups are backlog.
- Moved the current-slice pointer to Slice 2 in `LAUNCH_PLAN.md`, `docs/README.md`, `tracking_setup.md`, and the Slice 2 README.

### Decisions

- Slice 2 starts with ticket 2.9 (handoff pack alignment with ADR-013 and the `profiles.domain_priorities` mapping), then 2.1.

### Issues

- CU.3's hosted Supabase settings and the live reset test are outside git; recorded on Ryan's confirmation.

### Next

- Create the `slice-2` label and the Slice 2 milestone and issues, then build ticket 2.9.

### AI Notes

- Cursor agent checked GitHub state (PR #19, labels, ruleset, CI on `main`) and wrote the close-out docs.

---

## 2026-11-16 — Beta access plan (CU.7, BETA_PLAN)

### Completed

- Added ticket CU.7 (invite-only sign-up for the beta) to `docs/vertical_slices/cleanup_backlog/tickets.md`, timed for just before beta testers get access.
- Added `docs/BETA_PLAN.md`: the Google Form text and questions, how to pick and invite testers in waves, a welcome message, and a weekly feedback form.
- Added “Before beta launch” and “After MVP launch — operations” checklists to `docs/LAUNCH_PLAN.md`.

### Decisions

- Beta is invite-only. The block is the Supabase sign-up toggle, not a hidden tab, because `signUp` is called from the browser with the public anon key.
- The waitlist is a Google Form and its sheet, not an in-app table. CU.7 only links to the form. An in-app waitlist is noted in CU.7 as a later option.
- Custom SMTP and higher auth email limits are post-MVP, unless invite waves outgrow the built-in sender first.

### Next

- Create the beta and feedback forms from `BETA_PLAN.md`. Build CU.7 just before the first wave.

### AI Notes

- Cursor agent wrote the docs; Ryan chose invite-only with a Google Form.

---

## 2026-11-16 — Password reset and auth hardening (CU.3)

### Completed

- Forgot password on the sign-in form (`resetPasswordForEmail` through `/auth/callback?next=/auth/update-password`), a new `/auth/callback` route (code exchange or `token_hash` verify, relative redirects), and `/auth/update-password` (`updateUser`, then `/dashboard`).
- Shared auth Zod schemas in `src/lib/auth/validation.ts`: new passwords 8–72 characters; sign-in accepts any non-empty password so older 6–7 character accounts still work. Redirect helpers and `?reason=` copy in `src/lib/auth/redirect.ts`.
- `/auth` is now a server page using `getUser()`. Middleware never redirects the callback, guards update-password (`reason=reset_expired`), adds `reason=session` when a stale auth cookie is present, copies cookies onto redirects, and matches paths exactly or by `/` prefix.
- Root layout no longer calls `getOrCreateProfile()`, so marketing pages do not insert `profiles` rows. Read-only `getProfile()` feeds the `(main)` layout, whose `ProfileProvider` is keyed by user id and exposes `isAuthenticated` for the header and menu. `GET /api/profile` uses it too.
- Migration revoking `delete, truncate, references, trigger` on `public.profiles` from `authenticated`. Local `supabase/config.toml`: minimum password length 8, callback redirect URLs.
- Tests for all of the above. `npm run lint`, `typecheck`, `test` (225 tests), and `build` with `CI=true` and dummy Supabase values pass.

### Decisions

- Sign-in does not enforce the new minimum, so existing accounts are not locked out. Only new passwords must be 8+.
- The callback redirects with a relative `Location` header because `nextUrl.origin` can be the internal host behind a proxy.

### Issues

- Hosted Supabase settings (password length, redirect allowlist, migration push, optional `token_hash` email templates) are outside git and were not changed. Steps are in the CU.3 status in `docs/vertical_slices/cleanup_backlog/tickets.md`.
- The stale-header bug was not browser-reproduced. The fix is structural: the provider remounts when the server-rendered user id changes, and sign-in calls `router.refresh()`. Covered by an `AppHeader` test.
- On a brand-new account's first `/dashboard` load, the layout may read the profile before the page creates it, so the header menu shows the email-based label until the next navigation. The menu still renders because it keys off `isAuthenticated`.

### Next

- Apply the hosted Supabase steps, then do one live reset on the deployed site.

### AI Notes

- Cursor agent built CU.3 from the ticket spec on `cursor/cu3-password-reset` (the shared bundle from an earlier run was not readable from this VM).

---

## 2026-11-06 — GitHub Actions CI (CU.2)

### Completed

- Added `.github/workflows/ci.yml` for `pull_request` and `push` to `main`. Node 22, `npm ci`, then `lint`, `typecheck`, `test`, `build`. Workflow env sets `CI=true` and dummy `NEXT_PUBLIC_SUPABASE_*` values (no secrets).
- Added `npm run typecheck` (`tsc --noEmit`). Root layout skips `getOrCreateProfile()` when `CI=true` so `next build` does not call Supabase Auth in CI. Local and production behavior unchanged.
- Documented the required check name for RG.1 / CU.6: job **`lint-typecheck-test-build`**, workflow **`CI`**. Marked CU.2 done in cleanup and governance ticket docs.

### Decisions

- One job with four sequential steps keeps a single required status check name for branch rules.

### Issues

- CU.6 still has to turn on the ruleset after merging this workflow.

### Next

- Merge the PR and require `lint-typecheck-test-build` on `main` (CU.6).

### AI Notes

- Cursor Grok. Verified locally with `CI=true` and the same env vars as the workflow.

---

## 2026-11-05 — Next.js 16.4.5 security upgrade (CU.1, [PR #61](https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/61))

### Completed

- Upgraded `next` and `eslint-config-next` from 16.1.6 to 16.4.5, the current patched 16.x line. React stays 19.2.3 because 16.4.5 accepts `^19`.
- Turned off `X-Powered-By`. Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`. No Content-Security-Policy in this change.
- Profile database failures now return a generic message from the server actions and from `GET /api/profile`. Validation messages are unchanged. There is no app logger, so the raw Postgres text is not logged.

### Decisions

- Did not run a broader `npm audit fix`. Remaining findings are in other packages (Vitest, Zod, and transitive ESLint tools), not in Next.js 16.4.5.

### Issues

- Password reset, CI, the stale header after sign-in, draft PR #19, issue labels, and the `main` ruleset are still the open cleanup tickets.

### Next

- CU.2 (CI) can share a later PR. CU.3 is the auth hardening, including the header refresh bug.

### AI Notes

- Cursor Grok. `npm view next version` on 2026-11-05 was 16.4.5, matching the November 2026 security release.

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
