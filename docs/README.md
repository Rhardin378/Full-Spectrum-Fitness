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

Beta access and feedback process (Google Form, invite waves, weekly survey): [BETA_PLAN.md](./BETA_PLAN.md).

Slice tickets, mockups, and brand live beside this pack. They do not override it.

**Git workflow:** branch + PR into `main` (no direct pushes). Deferred GitHub ruleset/CI tickets: [vertical_slices/repo_governance/](./vertical_slices/repo_governance/). Hardening backlog (CU.1–CU.6 done; CU.7 waits for the beta): [vertical_slices/cleanup_backlog/](./vertical_slices/cleanup_backlog/).

**Slice tickets:** Slice 2 (current build; Option B domains, journal mood + reflection, weekly check-in moved out of Slice 5) is [vertical_slices/slice_2_journaling_life_domains/](./vertical_slices/slice_2_journaling_life_domains/). Measurements (Slice 1.5, done) live in [vertical_slices/slice_1_5_measurements/](./vertical_slices/slice_1_5_measurements/). Ticket 2.9 updates this pack to match before implementation. Until that lands, do not build the wellness-wheel journal in PRD §2.

**Nov 16, 2026 decisions** (activity streak, single-page Mind, structured goals, when Fitness Overview turns on): [vertical_slices/nov_16_2026_decisions/](./vertical_slices/nov_16_2026_decisions/README.md). Ryan opens the GitHub issues from those specs. The streak rule is [ADR-014](./ARCHITECTURE_DECISIONS.md) (Proposed). ADR-013’s lowest-score intention is unchanged.

**Rule:** If code, a chat, or a slice README disagrees with the pack, update the pack (and log the change) before continuing implementation.
