# Slice 2 — Journal, weekly check-in, domain choice

Approved UI references for [`docs/vertical_slices/slice_2_journaling_life_domains/`](../../vertical_slices/slice_2_journaling_life_domains/README.md). Product owner: Ryan, 2026-11-03. Numbers, names, and the “Example data” pills in the PNGs are **sample content**. Do not ship that pill or those hard-coded values.

| File | Use |
|------|-----|
| `journal-desktop.png` | Daily journal. Mood 1–10, reflection, optional domain tags (one or two), this week’s intention as a line. No stress or energy on this screen. |
| `checkin-desktop.png` | Weekly check-in order: week recap, last intention outcome, stress and energy, life-domain scores, next intention. |
| `domains-compare-desktop.png` | Decision record only. **Option B is approved.** Do not build this comparison screen. |

Option A in the comparison PNG is the SAMHSA-style wellness wheel still listed in [`docs/PRD.md`](../../PRD.md) §2. Option B (Peterson / Future Authoring inspired) replaces those names for journal tags and check-in scores. The handoff pack still describes Option A; ticket **2.9** is the pack update. Slice 2 build work follows Option B.

Chrome in the PNGs (charcoal bar, coral active states, warm page, coral primary buttons) matches `docs/brand_style_guide.md` and the v2 measurements UI. Copy the layout and the approved strings. Reuse existing tokens; do not introduce a new palette.
