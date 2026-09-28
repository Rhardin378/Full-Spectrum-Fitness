# Slice 1.5 — Log measurement modal (v2 theme)

Static mockups for ticket **#15** using locked **charcoal + coral** tokens (`docs/brand_style_guide.md`). Replaces indigo/lavender selection chrome from earlier references.

| File | Description |
|------|-------------|
| `log-measurement-modal-v2.png` | **Static mockup** — modal on warm page backdrop |
| `log-measurement-modal-v2.html` | Source for regenerating the PNG (open in browser or Playwright screenshot) |

### Theme notes (vs old reference)

- **Selected type (Weight/Waist):** `brand-coral-light` fill (`#FFD4CC`) + coral ring — not purple/lavender
- **Primary CTA:** `brand-coral-deep` (`#D14A40`) with white text
- **Surfaces:** `surface-card` modal on `surface-page` dimmed backdrop
- **Copy:** weight + waist only; units `lb` / `kg` / `in` / `cm` per slice brief

Regenerate PNG:

```bash
npx playwright screenshot \
  "file://$PWD/docs/mockups/slice_1_5_measurements/log-measurement-modal-v2.html" \
  "docs/mockups/slice_1_5_measurements/log-measurement-modal-v2.png" \
  --viewport-size=900,1000
```
