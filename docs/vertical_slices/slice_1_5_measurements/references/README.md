# Slice 1.5 UI references

Inspiration screenshots and an ideal Full Spectrum Fitness mockup for measurements.

## Files

| File | Role |
|------|------|
| `ref-empty-history.png` | Empty state + history shell + Measurements / Progress Photos tabs |
| `ref-log-measurements-modal.png` | Modal entry pattern (too many metrics for our scope) |
| `ref-coach-circumference-form.png` | Coach CRM multi-circumference form (out of scope) |
| `ref-header-stats-above-tabs.png` | Inspiration: brand header + 4 summary cards above tab bar |
| `fsf-measurements-ideal-mockup.png` | Standalone Measurements page + log modal |
| `fsf-measurements-tabbed-dashboard.png` | Measurements inside a 6-tab Dashboard shell |
| `fsf-dashboard-header-stats-tabs.png` | **Preferred shell:** header + summary cards above tabs + Measurements content |

## Product decision (Slice 1.5)

- **Ship:** weight + waist only; date; optional notes; recent history; simple weight trend.
- **Dashboard home:** `/dashboard` with a **light shell** — indigo header + tab bar; **Measurements** is the default active tab and functional home for this slice.
- **Shell content (Measurements tab):** Recent history card + Weight trend card + “+ Log measurement” CTA; modal (or drawer) for entry.
- **Defer (not Slice 1.5):** summary stat cards above tabs; functional Overview/Journal/Workouts/Insights/Achievements tabs; Progress Photos sub-tab; standalone `/measurements` route.
- **Borrow:** empty state + CTA patterns from refs above; modal layout from `fsf-measurements-ideal-mockup.png` (weight + waist only).
- **Skip:** body-fat %, chest/hips/arms/thighs grids, 1/16th inch inputs, coaching CRM sidebars.
- **Brand:** indigo/navy + coral CTA; supportive copy; not teal sports-tracker chrome.

See slice brief (`../README.md`) and tickets (`../tickets.md`) for full scope and ticket breakdown.
