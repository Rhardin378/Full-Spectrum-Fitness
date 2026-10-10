# Repo governance (delivery hygiene)

Cross-cutting tickets for **GitHub workflow**, **branch protection / rulesets**, and (later) **CI**. These do not override the handoff pack; they support safe shipping.

**Effective now:** all changes merge to `main` via **feature branch + pull request** — no direct pushes to `main`.

**Deferred:** full GitHub ruleset configuration — see [tickets.md](./tickets.md) ticket **RG.1**. Plan to sit down on that after the next few Slice 1.5 feature tickets (edit/soft-delete, QA), so required checks can align with CI when it exists.

Related audit note: [AI_ENGINEERING_CONTEXT.md](../../AI_ENGINEERING_CONTEXT.md) (security + delivery baseline).
