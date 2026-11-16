# Cleanup backlog tickets (copy to GitHub issues)

Each ticket is open work verified on 2026-11-03. Do not redo the items listed as already done in [`README.md`](./README.md).

Repo-governance originals: [`../repo_governance/tickets.md`](../repo_governance/tickets.md). **CU.1** replaces the 16.3.x pin in **RG.3**. **CU.2** is **RG.2** with the scripts that exist today. **CU.6** is the still-open **RG.1** sit-down. **CU.7** is timed for just before beta testers get access; do not start it earlier.

---

## Ticket CU.1: Upgrade Next.js to the latest patched 16.x

**Status:** Done on 2026-11-05. `next` and `eslint-config-next` are 16.4.5. Do not re-open unless a newer 16.x security release exists. Re-check `npm view next version` before any further bump.

**Type:** chore  
**Priority:** P0  
**Labels:** `security`, `backend`

### Problem

The app is on Next.js 16.1.6. That release is inside published security advisories, including a Server Actions denial-of-service fixed only in 16.4.1, and this codebase’s writes go through Server Actions. A later November 2026 release (16.4.5) is the current patched 16.x line. Repo-governance ticket RG.3 still says “patched 16.3.x” and “suggested 16.3.8”. That pin is stale and must not be the upgrade target.

### Evidence

- `package.json`: `"next": "16.1.6"` and `"eslint-config-next": "16.1.6"`.
- Server Actions: `src/lib/measurements/actions.ts`, `src/lib/profile/actions.ts` (`"use server"`).
- [Next.js security update, 14 October 2026](https://nextjs.org/blog/nextjs-security-update-october-14-2026): 16.4.1 patches GHSA-p3m5-59mp-jv5r (Server Actions DoS, affected `>=16.0.0 <=16.4.0`) and related critical advisories.
- [November 2026 security release](https://nextjs.org/blog/november-2026-security-release): patched line is 16.4.5.
- `docs/AI_ENGINEERING_CONTEXT.md` (2026-10-05) already flagged 16.1.6 and pointed at RG.3. `docs/DEVELOPMENT_LOG.md` (2026-10-09) says the Next.js upgrade was still deferred after the calendar-date fix.
- `next.config.ts` exports an empty config: no `poweredByHeader: false`, no `headers()`.
- Profile failures return Postgres text: `src/lib/profile/actions.ts` assigns `selectError.message`, `insertError?.message`, and `updateError.message`. `src/app/api/profile/route.ts` sends that string to the client. Measurement actions already use a generic “Unable to save…” string.

### Approach

- On the day of the PR, re-check `npm view next version` and the Next.js security blog. Install the latest **16.x** patch that includes 16.4.5 or newer. Do not stop at 16.3.8 or 16.4.1 if a later 16.x patch exists. Move `eslint-config-next` to that same version. Take the React bump that release requires. No unrelated dependency sweep.
- `poweredByHeader: false`. Add baseline headers (at least `X-Content-Type-Options: nosniff`, a frame-ancestors or `X-Frame-Options` policy, and a referrer policy). If a strict Content-Security-Policy breaks the Supabase auth cookies, ship the other headers and record CSP as a follow-up instead of guessing a policy.
- Profile action and `/api/profile` database failures return a generic message. Keep validation messages. Log the raw error on the server only if a logger already exists; do not add a logging platform.
- `npm test`, `npm run lint`, and `npm run build` pass. Open a PR. Do not push to `main`.

### Acceptance criteria

- `package.json` resolves `next` and `eslint-config-next` to the same patched 16.x, at least 16.4.5, and the lockfile matches.
- The Server Actions DoS range `<=16.4.0` no longer includes the installed version.
- Response headers from `next start` / the preview do not advertise `X-Powered-By`, and the baseline headers above are present.
- A failed profile write does not show a Postgres error string in the UI or in the `/api/profile` JSON.
- Existing tests pass.

### Dependencies

- None. CU.2 on the same PR is fine and not required.

### Suggested GitHub title

`[Cleanup] Upgrade Next.js to the latest patched 16.x`

---

## Ticket CU.2: GitHub Actions CI (lint, typecheck, test, build)

**Status:** Shipped 2026-11-06. Workflow file: `.github/workflows/ci.yml`. **Required check name for RG.1 / CU.6:** GitHub shows a single job; use the job id **`lint-typecheck-test-build`** (workflow name: `CI`). All steps run in that one job.

**Type:** chore  
**Priority:** P1  
**Labels:** `github`, `tests`, `quality`

### Problem

Pull requests to `main` do not run lint, types, tests, or build. The only file under `.github/` is `copilot-instructions.md`. RG.2 already asked for this workflow. It was never added. Branch protection cannot require checks that do not exist (CU.6 / RG.1).

### Evidence

- ~~No `.github/workflows/` directory.~~ Added `.github/workflows/ci.yml` on 2026-11-06.
- `package.json` scripts: `lint` (`eslint`), `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `build` (`next build`).
- `eslint.config.mjs` is Next core-web-vitals plus TypeScript. It does not compile the project.
- `docs/vertical_slices/repo_governance/tickets.md` ticket RG.2. `docs/AI_ENGINEERING_CONTEXT.md` lists “no CI” as a high finding.
- `src/app/layout.tsx` calls `getOrCreateProfile()` on every request except when `CI=true`, so GitHub Actions does not hit Supabase during `next build`. Production and local dev are unchanged.

### Approach

- Add `.github/workflows/ci.yml` on pull requests to `main`.
- Steps: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- No secrets. Dummy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the workflow `env` for any code path that still constructs a client. Do not point CI at the hosted project.
- Root layout: when `process.env.CI === "true"`, skip `getOrCreateProfile()` so the build does not call Auth over the network. Local and Vercel builds are unaffected.
- Node version: **22** LTS in the workflow (`actions/setup-node@v4`). The repo has no `.nvmrc` or `engines` field; CI is the source of truth until one is added.
- After the workflow file is on `main` and the check names are known, CU.6 can require them. This ticket does not click around in ruleset settings.

### Acceptance criteria

- A pull request to `main` shows pass/fail for lint, typecheck, test, and build.
- The workflow file contains no database password, service role key, or live project URL.
- `npm test` in CI does not need Supabase.
- Job names are written down in this file (or in RG.1) so CU.6 can require those exact names.

### Dependencies

- None. Can share a PR with CU.1.

### Suggested GitHub title

`[Cleanup] Add CI for lint, typecheck, test, and build`

---

## Ticket CU.3: Password reset and auth hardening

**Status:** Built 2026-11-16 on branch `cursor/cu3-password-reset`. Code, migration, local `supabase/config.toml`, and tests are in git. The hosted Supabase steps below are **not** done by this branch and cannot be verified from the repo.

What shipped:

- `src/lib/auth/validation.ts`: shared Zod schemas. New passwords (sign-up, update) are 8–72 characters. Sign-in only requires a non-empty password so accounts created under the old 6-character minimum can still log in.
- `src/lib/auth/redirect.ts`: path constants, `?reason=` copy (`session`, `link_invalid`, `reset_expired`), `getSafeNextPath` (single leading `/` only; rejects `//`, backslashes, control characters), and exact-or-`/`-prefix path matching.
- `/auth` is a server page that uses `getUser()` (not `getSession()`), reads `?reason=`, and renders the client `AuthForm` (`signin`, `signup`, `forgot`). Reset emails use `redirectTo = /auth/callback?next=/auth/update-password`. Sign-up `emailRedirectTo` is `/auth/callback`. Supabase 429s show a rate-limit message. Unknown Supabase errors show generic copy.
- `/auth/callback` runs `exchangeCodeForSession(code)` or `verifyOtp(token_hash, type)` and redirects with a **relative** `Location` header (behind a proxy `nextUrl.origin` can read as `localhost`). Failure goes to `/auth?reason=link_invalid`.
- `/auth/update-password` requires a user, then `updateUser({ password })` and on to `/dashboard`. `same_password` and `weak_password` have friendly copy; anything else is generic.
- Middleware never redirects `/auth/callback`. `/auth/update-password` without a user goes to `/auth?reason=reset_expired`. `/dashboard` or `/profile` with an `sb-*-auth-token` cookie but no user adds `?reason=session`. Refreshed cookies are copied onto redirect responses. `/authors` is not `/auth`.
- Root layout no longer calls `getOrCreateProfile()`. New read-only `getProfile()` returns `{ userId, profile | null }` and never inserts. `src/app/(main)/layout.tsx` wraps `AppHeader` and children in `ProfileProvider` keyed by `userId ?? "signed-out"` with `initialIsAuthenticated` (the `CI=true` skip moved there). `AppHeader` and `ProfileMenu` use `isAuthenticated`, not `profile !== null`. `GET /api/profile` uses `getProfile()`. `/dashboard` and `/profile` still call `getOrCreateProfile()`, so a signed-in user's row is still created there.
- Migration `supabase/migrations/20261116160000_revoke_profiles_extra_grants.sql`: revokes `delete, truncate, references, trigger` on `public.profiles` from `authenticated`, then grants `select, insert, update`.
- Local `supabase/config.toml`: `minimum_password_length = 8`; callback URLs with a `**` wildcard in `additional_redirect_urls`.
- Tests: validation, redirect helpers, callback route, `AuthForm`, `UpdatePasswordForm`, middleware cases, `getProfile`, `GET /api/profile`, and an `AppHeader` signed-out → signed-in switch.

**Hosted Supabase steps (manual, outside git):**

1. Authentication → Providers → Email: set **Minimum password length** to 8 so the server matches Zod. Existing shorter passwords keep working for sign-in.
2. Authentication → URL Configuration: keep **Site URL** on the production domain. Add redirect URLs `https://<production-domain>/auth/callback**`, the Vercel preview pattern (for example `https://*-<team>.vercel.app/auth/callback**`), and `http://localhost:3000/auth/callback**`. Without these, Supabase falls back to the Site URL and the reset link lands on `/` instead of the update-password page.
3. Apply the profiles grant migration: `npm run db:push`, then `npm run db:status` to confirm.
4. Optional: the default email templates work with the callback (PKCE `?code=`). That code only exchanges in the browser that requested it. To support opening the link on another device, change the **Reset password** template link to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/update-password` (and the **Confirm signup** template to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`).
5. Check Authentication → Rate Limits for email sends. The built-in SMTP sender is heavily limited; the form shows a rate-limit message on 429 but a custom SMTP provider is needed for real traffic. Deferred until after MVP launch; tracked in [`docs/LAUNCH_PLAN.md`](../../LAUNCH_PLAN.md) under “After MVP launch — operations”.

**Type:** feature  
**Priority:** P1  
**Labels:** `auth`, `security`, `frontend`, `backend`

### Problem

A person who forgets their password cannot recover it in the app. Sign-up and sign-in work. Several surrounding auth gaps from the Slice 1 audit are still in the code: no mail callback route, a 6-character password, session reads that do not revalidate, profile writes on public pages, and profile table grants that were never tightened the way measurements were.

### Evidence

Checked in the tree. None of the missing pieces are hiding under another name.

| Capability | What exists |
|------------|-------------|
| Reset email | No `resetPasswordForEmail` (or any “forgot” copy) under `src/`. Sign-in form: `src/app/auth/page.tsx`. |
| Update-password page | No route besides `src/app/auth/page.tsx` (sign-in / sign-up) and `src/app/(main)/profile/page.tsx` (profile fields, not the auth password). |
| Email confirmation callback | No `src/app/auth/callback`. Sign-up sets `emailRedirectTo` to `${origin}/dashboard` (`src/app/auth/page.tsx`). |
| Session refresh | `src/lib/supabase/middleware.ts` calls `getUser()` and redirects. That part is sound. The auth page also calls `getSession()` (lines 38–41), which does not revalidate the JWT. |
| Expired session UX | Protected pages redirect to `/auth` with no reason. There is no dedicated expired-session screen. |
| Route protection | Middleware `isProtectedPage` is only `/dashboard` and `/profile`. Pages repeat `getUser()` and `redirect("/auth")`. There is no `proxy.ts`. Slice 2 ticket 2.6 must add `/mind` when that route exists; this ticket should not invent Mind. |
| Server-action auth | `getOrCreateProfile`, `updateProfile`, and the measurement actions all call `getUser()` and return `unauthorized` when it fails. Tests cover that pattern. |
| Password length | Client Zod minimum is 6 (`passwordSchema` in `src/app/auth/page.tsx`). Hosted Supabase password policy is not visible in the repo. |
| Profile bootstrap | `src/app/layout.tsx` calls `getOrCreateProfile()` for every route, including marketing pages, so a render can insert a profile row. |
| Stale header after client sign-in | `ProfileProvider` seeds `useState(initialProfile)` and does not refresh unless something calls `refreshProfile`. The 2026-10-05 audit marked this as not browser-reproduced. Still true in code. |
| Grants | `supabase/migrations/20260612003147_create_profiles_table.sql` revokes `anon` and grants `select, insert, update` to `authenticated`. It never revokes `delete` / `truncate` the way `20260923050632_revoke_measurements_extra_grants.sql` does for measurements. Whether hosted defaults still include those privileges cannot be proven from git; the migrations never take them away. |
| Raw errors | Covered in CU.1. If CU.1 has not merged, this ticket still must not add new raw Postgres messages. |

### Approach

- **Forgot password** on the sign-in form. `resetPasswordForEmail` with `redirectTo` on an allowlisted app URL (`/auth/update-password` or similar). Document that the hosted Supabase redirect allowlist has to include that URL; the repo cannot prove the dashboard setting.
- **Update-password page** for the recovery session: new password, confirm, `updateUser`, then on to `/dashboard`. Minimum length at least 8 in Zod. Apply the same minimum to sign-up. State in the PR that the Supabase Auth dashboard policy should match and was or was not changed (it is outside git).
- **Middleware:** a recovery session is a signed-in user. Today any user whose path starts with `/auth` is redirected to `/dashboard`, which would skip the new page. Exempt only the update-password path. Keep sending a normal signed-in user away from the sign-in form.
- **Callback:** add the small `/auth/callback` exchange Supabase expects for confirmation and recovery links, and point `emailRedirectTo` at it (or at the update-password page for recovery only). Do not send recovery links straight at `/dashboard`.
- **Session:** auth page should use `getUser()` rather than `getSession()` for the “already signed in” redirect. Keep middleware on `getUser()`. A query such as `?reason=session` on the sign-in page is enough expired-session copy; do not build a session framework.
- **Profile grants:** a follow-up migration revokes `delete, truncate, references, trigger` on `public.profiles` from `authenticated`, then re-grants `select, insert, update` if needed. Do not grant `delete`.
- **Root layout:** stop calling `getOrCreateProfile()` on every request. Load the profile from the authenticated layout (or the header’s server parent) so marketing routes do not write. Confirm the header still shows the signed-in menu after a client-side sign-in; if the ProfileProvider bug reproduces, call `refreshProfile` after sign-in or navigate with a full load. If it does not reproduce, say so in the PR.
- Tests: Zod length, middleware exemption (extend `src/lib/supabase/middleware.test.ts`), and an unauthorized case if a new action is added. No live inbox test in CI.

### Acceptance criteria

- From the sign-in form, a user can request a reset email and, with a valid recovery link, set a new password and sign in with it.
- A normal signed-in user hitting `/auth` still goes to `/dashboard`. A recovery session can open the update-password page.
- Sign-up rejects passwords shorter than 8 characters.
- Public pages do not insert into `profiles`.
- The new migration’s grants do not include `delete` or `truncate` for `authenticated`.
- Measurement and profile server actions still reject a signed-out caller.
- `/dashboard` and `/profile` stay protected. This ticket does not remove those checks.

### Dependencies

- None. Slice 2’s `/mind` protection stays in ticket 2.6.

### Suggested GitHub title

`[Cleanup] Add password reset and tighten auth`

---

## Ticket CU.4: Close stale draft PR #19

**Type:** chore  
**Priority:** P2  
**Labels:** `github`, `chore`

### Problem

Draft PR #19 has been open and untouched since the minute it was created. It is not a review queue item. Leaving it open makes the PR list look like environment work is in flight.

### Evidence

- https://github.com/Rhardin378/Full-Spectrum-Fitness/pull/19
- Title: `chore(cloud): set up Cloud Agent development environment`
- Author: Rhardin378. Opened 2026-09-18. `isDraft: true`. `updatedAt` equals `createdAt` (2026-09-18T14:30:50Z). No labels.
- Head branch: `cursor/setup-cloud-agent-environment-d4dd`.
- It was the only open pull request on 2026-11-03.
- The PR adds `scripts/cloud/install.sh` and `scripts/cloud/start.sh`. Those paths are not on `main` (no `scripts/cloud/`, no `environment.json` in the repo). The description’s test run is “20/20” tests; the suite is far past that now. Merging it would replay a September environment onto current `main`.

### Approach

- Close PR #19 **without merging**.
- GitHub’s close button is enough. Delete the head branch if it is unused and not protecting anything else.
- Do not revive those scripts in this ticket. If a cloud environment is still wanted, open a new PR against current `main` instead of undrafting #19.

### Acceptance criteria

- PR #19 is closed.
- `main` does not contain that PR’s commits.
- The PR list is not showing #19 as an active draft.

### Dependencies

- None

### Suggested GitHub title

`[Cleanup] Close stale draft PR #19`

---

## Ticket CU.5: Relabel issues #54, #55, and #56 as backlog

**Type:** chore  
**Priority:** P2  
**Labels:** `github`, `chore`

### Problem

Three follow-ups from Slice 1.5 are still labeled `slice-1.5`. That label means current measurements work. The issues are deferred product, not open Slice 1.5 tasks. There is no `backlog` label to move them to.

### Evidence

Open issues on 2026-11-03, and the only open issues:

| Issue | Title | Labels now |
|-------|--------|------------|
| [#54](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/54) | Private progress photos (front / side / back) | `enhancement`, `backend`, `frontend`, `database`, `slice-1.5`, `measurements` |
| [#55](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/55) | Fitness welcome-band summary stat cards | `enhancement`, `frontend`, `UI`, `slice-1.5`, `analytics` |
| [#56](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/56) | Remaining Fitness dashboard tabs and underlying features | `enhancement`, `frontend`, `UI`, `slice-1.5` |

`gh label list` has no `backlog` label. Slice 1.5 QA (#18), which these issues say they came from, is closed. Photos and stat cards are explicitly deferred in `docs/vertical_slices/slice_1_5_measurements/README.md`. #56 maps Overview / Workouts / Library to later slices and says not to block Slice 2.

### Approach

- Create a `backlog` label if it is still missing.
- Add `backlog` to #54, #55, and #56.
- Remove `slice-1.5` from all three so they leave the current-slice filter.
- Keep the other labels (`measurements`, `frontend`, and so on).
- Do not close the issues and do not rewrite their bodies. Mind stat cards in Slice 2 are a different surface (`/mind`); #55 stays the Fitness welcome-band follow-up.

### Acceptance criteria

- Each of #54, #55, and #56 has `backlog` and does not have `slice-1.5`.
- All three stay open.
- No other issues are relabeled by this ticket.

### Dependencies

- None

### Suggested GitHub title

`[Cleanup] Mark issues #54 #55 #56 as backlog`

---

## Ticket CU.6: Finish the GitHub ruleset for `main` (RG.1)

**Type:** chore  
**Priority:** P1  
**Labels:** `github`, `security`

### Problem

Policy says `main` changes only through a pull request. The sit-down that records the ruleset (required checks, force-push, bypass list) is still the open ticket RG.1. Required status checks cannot be turned on until CU.2 has real job names. The original “after 1.5.9–1.5.11” wait is over: those measurement tickets are on `main`.

### Evidence

- Full checklist: `docs/vertical_slices/repo_governance/tickets.md` ticket **RG.1**. This ticket does not replace that checklist.
- `gh api repos/Rhardin378/Full-Spectrum-Fitness/rulesets` returned `[]` on 2026-11-03 (no repository rulesets visible to this token).
- `gh api .../branches/main/protection` returned 403, so classic branch protection could not be read. Do not claim force-push is blocked, and do not claim it is open.
- No CI workflow exists yet (CU.2). RG.1 already says not to require checks that are not there.
- `.github/copilot-instructions.md` and `docs/LAUNCH_PLAN.md` already tell people to use a branch and a PR.

### Approach

- A human with repo admin opens GitHub settings and walks the RG.1 checklist.
- Require the CU.2 check names only after CU.2 is merged and green.
- Write the locked choices (bypass list, who may force-push, exact check names) back into `docs/vertical_slices/repo_governance/tickets.md` and add a line to `docs/DEVELOPMENT_LOG.md`.
- An agent can prepare the note. An agent cannot finish this ticket from git alone.

### Acceptance criteria

- The RG.1 acceptance criteria are met, including a written bypass list.
- If CU.2 has merged, the ruleset requires those job names. If it has not, the ruleset requires no phantom checks.
- The development log says the ruleset was reviewed and what was turned on.

### Dependencies

- CU.2 before required status checks. The rest of RG.1 can happen first.

### Suggested GitHub title

`[Cleanup] Record the main branch ruleset (RG.1)`

---

## Ticket CU.7: Invite-only sign-up for the beta

**Type:** feature  
**Priority:** P1 (at beta)  
**Labels:** `auth`, `security`, `frontend`, `backend`  
**When:** Just before the first beta testers get access. Do not start earlier; listed in `docs/LAUNCH_PLAN.md` under “Before beta launch”.

### Problem

Anyone who finds the site can create an account. For the beta, accounts should exist only for people Ryan invites. Hiding the Sign Up tab is not enough: the browser calls Supabase `signUp` directly with the public anon key, so anyone can make that call from the console or a script. The block has to live in Supabase.

### Evidence

- Sign-up is a client call in `src/components/auth/auth-form.tsx` (`supabase.auth.signUp`). The anon key is public by design.
- `supabase/config.toml` has `enable_signup = true` under `[auth]` and `[auth.email]`. The hosted setting is not visible from the repo.
- CU.3 already handles invite links: `/auth/callback` accepts `token_hash` with `type=invite`, and `/auth/update-password` lets a signed-in user set a password.
- `getOrCreateProfile()` on `/dashboard` and `/profile` creates the profile row on first visit, so invited users need no extra profile step.

### Approach

**Supabase (hosted, manual):**

- Authentication → Sign In / Providers: turn off **Allow new users to sign up**. Admin invites still work with this off.
- Authentication → Email Templates → **Invite user**: set the link to `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/auth/update-password` so the invitee lands on the set-password page.
- Invite testers from Authentication → Users → **Invite user**.
- Invite emails count toward the auth email rate limit. With the built-in sender that is only a few per hour. Invite in small batches, or pull the custom SMTP item forward from “After MVP launch — operations” in `docs/LAUNCH_PLAN.md` if the first wave is more than a handful of people.

**Repo:**

- `supabase/config.toml`: set `enable_signup = false` so local matches hosted. Local invites go through Studio.
- A `NEXT_PUBLIC_SIGNUPS_OPEN` flag (default off). When off, `/auth` shows a “Private beta — request access” panel in place of the Sign Up tab. Reopening sign-up later means flipping this flag and the Supabase toggle, nothing else.
- Request-access form backed by a new `beta_waitlist` table (`email` unique, optional short note, `created_at`, nullable `invited_at`). Insert through a server action with Zod validation. RLS on; no `select`, `update`, or `delete` for `anon` or `authenticated`. A duplicate email returns the same success message, so the form does not reveal who is already on the list. Use a honeypot field instead of a captcha.
- Map Supabase's `signup_disabled` error to friendly copy in `AuthForm`, for anyone on a cached page that still shows the old form.
- `/auth/update-password` heading and copy should read correctly for both a reset and a first-time invite (for example “Set your password”).
- Working the waitlist is manual: read the table in the dashboard, invite, and set `invited_at`. No admin UI in this ticket.

### Acceptance criteria

- A direct `signUp` call with the anon key is rejected by hosted Supabase (checked once with the browser console or `curl` against `/auth/v1/signup`).
- With the flag off, `/auth` shows no sign-up form, and the request-access form stores an email.
- A duplicate request shows the same success message and does not create a second row.
- An invited user can open the email, set a password, land on `/dashboard`, and sign in again later with that password.
- Sign-in and password reset behave as they did after CU.3.
- The development log records the hosted settings that were changed and how to reopen sign-up.

### Tests

- Waitlist action: validation, honeypot, duplicate email, and no raw database errors returned.
- `AuthForm` with the flag off (request-access panel, no sign-up form) and on (current sign-up form).
- `signup_disabled` copy.
- `/auth/callback` with `type=invite` redirecting to `next`.
- No live inbox test in CI.

### Dependencies

- CU.3 (merged in #64). Custom SMTP is optional for a small first wave, required for a larger one.

### Suggested GitHub title

`[Beta] Make sign-up invite-only with a request-access waitlist`
