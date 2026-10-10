# FSF documentation

## Handoff pack (sources of truth)

| File | Role |
|------|------|
| [PRD.md](./PRD.md) | What the product is and must do |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | How the system is layered; what not to overbuild |
| [LAUNCH_PLAN.md](./LAUNCH_PLAN.md) | Current slice, build order, what not to start |
| [ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md) | Locked decisions (why), dated |
| [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) | **Chronological record** — append after every meaningful session |
| [AI_ENGINEERING_CONTEXT.md](./AI_ENGINEERING_CONTEXT.md) | Engineering health, bugs, audit notes — not approved architecture |

Slice tickets, mockups, and brand live beside this pack. They do not override it.

**Git workflow:** branch + PR into `main` (no direct pushes). Deferred GitHub ruleset/CI tickets: [vertical_slices/repo_governance/](./vertical_slices/repo_governance/).

**Rule:** If code, a chat, or a slice README disagrees with the pack, update the pack (and log the change) before continuing implementation.
