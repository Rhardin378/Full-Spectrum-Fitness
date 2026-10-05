Full Spectrum Fitness – Project Rules (React + TypeScript + shadcn/ui)

## Scope

- These rules apply to all frontend work in this repo.
- Tech stack: **React**, **TypeScript**, **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**.

## General Guidelines

- Produce **clear, readable, maintainable** code.
- Implement **all requested features fully**; avoid stubs or partial implementations.
- Prefer **simple, boring solutions** over clever but hard-to-read code.

## Naming Conventions

- Use **PascalCase** for React components and types/interfaces.
- Use **camelCase** for variables, functions, and hooks.
- Follow standard **TypeScript/JavaScript** naming conventions (no abbreviations unless widely known).

## TypeScript Usage

- Use **strict typing** everywhere; avoid `any` whenever possible.
- If `any` is truly needed, **isolate and comment** why.
- Prefer **interfaces** over type aliases for object shapes and props.
- Use **generics** for reusable components and utility functions.
- Add **explicit return types** for exported functions, hooks, and components.

## React / Performance

- Structure components as **small, focused** units with clear responsibilities.
- Use **`React.memo`**, `useMemo`, and `useCallback` where they give a real benefit (avoid over-optimizing).
- Avoid unnecessary re-renders by:
  - Keeping state as **localized** as possible.
  - Avoiding creating new objects/arrays in JSX when not needed.
- Use **lazy loading** for heavy components and images when it benefits UX.

## UI & Styling

- Use **Tailwind CSS** utility classes for styling; avoid inline styles except when necessary.
- Prefer **shadcn/ui** components as the baseline for UI primitives.
- Ensure all pages are:
  - **Responsive** (mobile-first).
  - **Accessible** (proper semantics, labels, focus states, ARIA where needed).
- Keep styling **consistent** with existing design tokens and patterns.

## Misc

- Keep files **focused**: avoid “god components” and giant utility files.
- Add comments only for **non-obvious intent, trade-offs, or constraints**, not for trivial code.

## Documentation handoff

Product and sequencing live in `docs/` (see `docs/README.md`):

- `LAUNCH_PLAN.md` — current slice; do not start later slices early
- `PRD.md` / `SYSTEM_DESIGN.md` / `ARCHITECTURE_DECISIONS.md` — what and why
- `DEVELOPMENT_LOG.md` — **append** a dated entry after every meaningful session (human or agent)
- `AI_ENGINEERING_CONTEXT.md` — bugs and audit notes; not product law

If a change locks a decision, update the ADR file and the matching source-of-truth doc in the same session as the log entry.