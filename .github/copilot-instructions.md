# Full Spectrum Fitness — GitHub workflow (required)

- **Never push commits directly to `main`.** Use a feature branch and open a pull request; merge via GitHub.
- Branch naming: `cursor/<short-topic>` or `feature/<short-topic>`.
- Before opening a PR: `npm test` (and lint/build when CI exists).
- Database: migrations live in `supabase/migrations/`; applying to remote is **manual** (`npm run db:push` or Supabase dashboard) — not run by GitHub merge.
- Deferred hardening: [docs/vertical_slices/repo_governance/tickets.md](../docs/vertical_slices/repo_governance/tickets.md) (**RG.1** ruleset sit-down, **RG.2** CI).

Product and architecture sources of truth: `docs/README.md` (handoff pack). Current slice: **1.5 measurements** per `docs/LAUNCH_PLAN.md`.

---

# React + TypeScript + Shadcn UI Copilot Instructions

## General Guidelines

Produce clear, readable React and TypeScript code using the latest stable versions of TypeScript, JavaScript, React, Node.js, Next.js App Router, Shadcn UI, and Tailwind CSS.
Always implement all requested features fully; do not leave out code.

## Naming Conventions

Use PascalCase for component names.
Use camelCase for variable and function names.
Follow standard TypeScript and JavaScript naming conventions.

## TypeScript Usage

Use TypeScript's features for type safety.
Prefer interfaces over types for object shapes.
Use generics for reusable components and functions.
Enforce strict typing; avoid 'any' type.

## Performance Optimization

Optimize React rendering with memoization (e.g., React.memo).
Avoid unnecessary re-renders.
Lazy load components and images when possible.
Use efficient data structures and algorithms.

## UI & Styling

Use Tailwind CSS utility classes for styling.
Follow Shadcn UI component guidelines and best practices.
Ensure UI is responsive and accessible.
