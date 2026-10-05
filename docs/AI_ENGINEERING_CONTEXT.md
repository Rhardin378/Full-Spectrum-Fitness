# AI Engineering Context

> **Status:** Recommendations and findings from FSF Senior Engineer audits.  
> **Not approved architecture.** Ryan's approved decisions live in `ARCHITECTURE_DECISIONS.md`. Do not treat anything here as a requirement until Ryan promotes it.

**Last updated:** 2026-10-05  
**Audited commit:** `eac09b8` on `main`  
**Live site:** https://full-spectrum-fitness-liard.vercel.app

## How to use this document

- Treat PRD / system design / launch plan / ARCHITECTURE_DECISIONS as product and architecture sources of truth.
- Use this file for current engineering health, known bugs, and recommended next steps.
- When code conflicts with docs, call out the conflict before a major change.
- Keep Phase 1 MVP scope tight; do not introduce new tech or speculative features without justification and Ryan's approval.

## Actual stack (as implemented)

- Next.js 16.1.6 (App Router), React 19.2.3, TypeScript, Tailwind v4
- `@supabase/ssr` + `supabase-js`, Zod 4, Vitest 4
- Database: raw SQL migrations under `supabase/migrations/` (4 migrations). **No Prisma** (systemDesign.md already notes this; README still wrongly lists Prisma).
- **Not present:** Prisma, shadcn/ui, AI SDK, Playwright, CI workflows, LICENSE, `.env.example`

## What is shipped

- Email auth (client-side sign-in/sign-up), profile CRUD via server actions, measurements create/list/filter + 30-day weight trend on `/dashboard`
- RLS on `profiles` (select/insert/update own) and `measurements` (select/insert own; update/delete revoked)
- Middleware session refresh + route redirects; pages re-check `getUser()`

## Phase 1 status vs `docs/PRD.md`

| Feature | Status |
| --- | --- |
| Email auth | Partially complete (no `/auth/callback`, no password reset, weak min length 6) |
| OAuth | Missing |
| Profile setup wizard | Partially complete (single optional `/profile` form) |
| Goals / domain priorities / experience | Goals free-text stored; priorities + experience complete; no progress tracking |
| Privacy / accountability circles | Preference stored but unused; circles missing |
| Baseline measurements (weight, waist) | Partially complete; **date display broken for US timezones** |
| Journaling (7 domains) | Missing |
| Workout tracking | Missing ("coming soon" tab) |
| Trend dashboard | Missing (only weight trend card) |
| Social feed | Missing |
| Light AI coaching | Missing (no AI code in `src/`) |
| Achievements / badges | Missing |

**Doc conflicts to resolve with Ryan (not auto-fixed):**

- PRD Phase 1 includes social + light AI + achievements; `systemDesign.md` treats social as Optional MVP+ and AI as optional; `launch_plan.md` includes all but says avoid heavy gamification; README puts AI in Phase 2 and still claims Prisma/shadcn/MIT license.
- Draft `navigation-ia.md` routes (`/fitness`, `/mind`) do not match code (`/dashboard`).

## Critical / high findings

1. **Critical — Next.js 16.1.6 advisories** (npm audit: range through 16.3.2; fix ≥16.3.3, suggested 16.3.8). Includes middleware bypasses, Server Actions CSRF null-origin bypass, DoS, and image-optimizer RCE when AVIF used. Mitigating: pages re-check auth and RLS still applies.
2. **High — measurement date bug:** `measured_at` stored as UTC midnight (`validation.ts`) but displayed local (`display.ts`). America/Chicago shows Oct 4 as Oct 3; after ~7 PM CT date picker defaults to tomorrow. Existing Vitest assertions encode UTC behavior.
3. **High — no CI** (`.github/` only has copilot-instructions). Lint/tsc/79 tests/build pass locally but merges are unchecked.
4. **High — stale ProfileProvider:** root layout seeds `useState(initialProfile)`; client-side auth redirect to `/dashboard` likely leaves header signed-out until hard reload (inferred from code, not browser-reproduced).
5. **High — `getOrCreateProfile()` in root layout** runs on every route including marketing; page renders can write DB; blocks caching; duplicates `getUser()` calls.

## Security notes (summary)

- No secrets in git history (scanned). No service-role key in app code. Anon + user JWT only.
- Raw Postgres errors returned to UI / `/api/profile`.
- `profiles` grants likely still include DELETE/TRUNCATE for `authenticated` (unlike measurements revoke migration). Production Supabase state **unverifiable** from repo.
- Zod validation can be bypassed via Supabase Data API for own rows; DB should eventually enforce same rules.
- Missing CSP / frame / nosniff headers; `x-powered-by` present on live site.

## Testing gaps

- 79 Vitest unit tests with mocked Supabase; **0 component (.tsx) tests**; **0 Playwright/e2e**; **0 real RLS/DB integration tests**.
- Coverage % overstated (only files loaded by tests).
- No non-UTC timezone tests.

## Recommended next steps (priority)

1. **Ryan personally:** end-to-end measurement calendar-date fix (`measured_on date` column + local date helpers + cursor bump + TZ-aware tests). Highest user-visible bug on the only shipped feature; strong portfolio/interview story.
2. **Parallel / agent:** security + delivery baseline — upgrade `next`/`eslint-config-next` to 16.3.x, `npm audit fix`, GitHub Actions (lint/tsc/test/build), security headers, generic error messages. Open PR; do not merge without Ryan review.
3. Close Slice 1.5: soft delete/edit (tickets 1.5.9–1.5.11), history "load more", component tests (#30, frontend half of #17), QA (#9, #18), close shipped-open issues #15/#16.
4. Auth cleanup: `/auth/callback`, password reset, stronger password min, move profile bootstrap off root layout.
5. **Product decision needed:** trim Phase 1 (suggested: workouts → journaling → rule-based trends; defer social/badges/AI prompts) so PRD / systemDesign / launch_plan / README agree.
6. Then build next MVP slice (launch_plan prefers workouts first; product thesis leans journaling—confirm with Ryan).
7. Real test pyramid: Playwright smoke + two-user RLS tests against local Supabase + component tests.

## Suggested approach for the date fix (recommendation only)

- Migration: add `measured_on date`, backfill from `(measured_at at time zone 'UTC')::date`, NOT NULL + future-date check + index `(user_id, measured_on desc, created_at desc, id desc)`.
- Zod: strict `YYYY-MM-DD`; reject dates >1 day past UTC today.
- Shared helpers: `todayLocalISODate()`, `formatCalendarDate()` with `timeZone: "UTC"` so display never shifts.
- Bump pagination cursor version to use `measured_on`.
- Verify under `TZ=America/Chicago`, `Pacific/Auckland`, `UTC` with `vi.setSystemTime`; browser check after 7 PM CT.

## Explicitly out of scope / future

AI Workout Import (Slice 3.1, MVP+), RAG/pgvector, progress photos, multi-OAuth, full social/circles, journal encryption, GDPR export, wearables, Stripe, notifications, `/fitness`+`/mind` nav split.

## Unverifiable from the repository

- Whether production Supabase has all migrations/RLS/grants applied (`npm run db:push` is manual).
- Production Auth settings (email confirmation, password policy, redirect allowlist).
- Vercel env vars and whether live deploy matches `main`.
- Real user behavior; ProfileProvider stale-state bug not browser-reproduced.
