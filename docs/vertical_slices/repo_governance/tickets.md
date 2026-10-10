# Repo governance tickets (copy to GitHub issues)

Use when you are ready to harden the repo. **Workflow policy is already in effect** (branch + PR); **RG.1** is the scheduled “sit down and configure GitHub” session.

---

## Ticket RG.1: Configure GitHub ruleset for `main` (deferred)

**Type:** chore  
**Priority:** P1 (after next few Slice 1.5 tickets)  
**Labels:** `governance`, `github`, `security`  
**When to pick up:** After **1.5.9–1.5.11** (edit/soft-delete) and **1.5.8 / #18 QA**, or immediately before adding **CI (RG.2)** — whichever comes first. Do not block feature work on this ticket.

### Description

Protect `default` branch (`main`) with a **repository ruleset** (or classic branch protection) so merges always go through a PR and unsafe operations are blocked. You already require PRs in GitHub; this ticket is to **review and finish** the ruleset (required checks, bypass lists, force-push policy) in one focused session.

### Current state (2026-10-10)

- PR-before-merge behavior is **on** (ruleset or protection enabled).
- **No GitHub Actions CI** in repo yet — do not require status checks until **RG.2** exists, or PRs will never merge.
- **1.5.12** landed once via direct push to `main` before PR-only workflow was documented; going forward use branches only.

### Scope (checklist for your sit-down)

Review [GitHub docs: rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rules-to-protect-your-branches/managing-rulesets-for-a-repository) and decide:

1. **Target branch:** `main` (default).
2. **Require a pull request before merging**
   - Allow squash merge? (match what you use today)
   - Dismiss stale reviews? (optional for solo)
   - Required approvals: **0 or 1** for solo dev (avoid blocking yourself unless you want a deliberate “review later” habit)
3. **Block force pushes** to `main`.
4. **Block branch deletion** of `main` (optional).
5. **Require linear history** (optional; squash merges often make this moot).
6. **Require status checks** — **only after RG.2** (e.g. `lint`, `test`, `build`). List exact job names from workflow YAML.
7. **Restrict who can push** — nobody pushes directly to `main`; merges via PR only.
8. **Bypass actors** — document who can bypass (e.g. repo admin for emergencies) and keep the list minimal.
9. **Signed commits** — optional; skip unless you want GPG/SSH signing everywhere.
10. **Document** final choices in this file (short “Locked ruleset” subsection) and a line in `DEVELOPMENT_LOG.md`.

### Out of scope (separate tickets)

- Vercel preview vs production branch rules
- Supabase migration process (still manual `db:push` / SQL editor)
- CODEOWNERS file (optional later)

### Acceptance criteria

- `main` cannot be updated except by **merged PR** (verify with a test branch).
- Force push to `main` fails (or is allowed only for documented bypass role you accept).
- Required status checks match **existing** CI jobs, or none until RG.2 ships.
- README + `.github/copilot-instructions.md` still describe branch → PR workflow.
- You have a written note (here or ADR) of bypass list and why.

### Dependencies

- None for basic PR + block force push.
- **RG.2** before “required checks” that gate merge.

### Suggested GitHub title

`[Governance] Configure ruleset and branch protection for main (#RG.1)`

---

## Ticket RG.2: GitHub Actions CI (lint, typecheck, test, build)

**Type:** chore  
**Priority:** P1  
**Labels:** `governance`, `ci`, `github`  
**Owner:** Often agent-opened PR; human review before merge (see AI_ENGINEERING_CONTEXT).

### Description

Add `.github/workflows/ci.yml` (or similar) running on PRs to `main`: `npm run lint`, `tsc --noEmit` (if not in lint), `npm test`, `npm run build`. Then enable those checks in **RG.1** ruleset.

### Acceptance criteria

- PRs to `main` show green/red checks.
- Ruleset **RG.1** updated to require those check names.
- No secrets in workflow except public env; Supabase not needed for unit tests.

### Dependencies

- Recommended after Slice 1.5 core feature tickets; can parallel Next.js security upgrade PR.

### Suggested GitHub title

`[Governance] Add CI workflow for PRs (#RG.2)`

---

## Ticket RG.3: Next.js / npm audit security baseline

**Type:** chore  
**Priority:** P1  
**Labels:** `governance`, `security`, `dependencies`

### Description

Upgrade Next.js / eslint-config-next to patched 16.3.x, run `npm audit fix` where safe, security headers, generic API error messages. **Always via PR**, never direct to `main`.

### Dependencies

- RG.2 nice-to-have on same PR or follow-up.

### Suggested GitHub title

`[Governance] Security and dependency baseline (#RG.3)`

See [AI_ENGINEERING_CONTEXT.md](../../AI_ENGINEERING_CONTEXT.md) for findings.
