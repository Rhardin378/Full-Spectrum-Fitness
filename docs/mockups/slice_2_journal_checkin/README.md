# Slice 2 — Journal, weekly check-in, domain choice

Approved UI references for [`docs/vertical_slices/slice_2_journaling_life_domains/`](../../vertical_slices/slice_2_journaling_life_domains/README.md). Product owner: Ryan, 2026-11-03. Numbers, names, and the “Example data” pills in the PNGs are **sample content**. Do not ship that pill or those hard-coded values.

| File | Use |
|------|-----|
| `journal-desktop.png` | Daily journal. Mood 1–10, reflection, optional domain tags (one or two), this week’s intention as a line. No stress or energy on this screen. The PNG does not show the optional “One win today” and “Grateful for” inputs added 2026-11-17. Ticket 2.3 adds them. Do not leave them out because they are missing from this file. |
| `checkin-desktop.png` | Weekly check-in order: week recap, last intention outcome, stress and energy, life-domain scores, next intention. The next-intention domain still defaults to the lowest score ([ADR-013](../../ARCHITECTURE_DECISIONS.md)). A later composite, [`docs/mockups/nov_2026_tickets/B-checkin-journal.png`](../nov_2026_tickets/B-checkin-journal.png), includes a rejected idea (preselect the top profile focus area). Do not build that callout. |
| `domains-compare-desktop.png` | Decision record only. **Option B is approved.** Do not build this comparison screen. |

Option A in the comparison PNG is the old SAMHSA-style wellness wheel. Option B (Peterson / Future Authoring inspired) is the set for journal tags and check-in scores. Ticket **2.9** aligned the handoff pack with Option B ([ADR-013](../../ARCHITECTURE_DECISIONS.md)). Slice 2 build work follows Option B.

Chrome in the PNGs (charcoal bar, coral active states, warm page, coral primary buttons) matches `docs/brand_style_guide.md` and the v2 measurements UI. Copy the layout and the approved strings. Reuse existing tokens; do not introduce a new palette.
