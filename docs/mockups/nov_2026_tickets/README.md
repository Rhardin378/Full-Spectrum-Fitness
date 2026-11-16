# Nov 16, 2026 — decision mockups

UI references for the product decisions Ryan locked on 2026-11-16. Specs: [`docs/vertical_slices/nov_16_2026_decisions/`](../../vertical_slices/nov_16_2026_decisions/README.md). Tickets: [`tickets.md`](../../vertical_slices/nov_16_2026_decisions/tickets.md).

Numbers, the name “Alex Sample”, dates, and any “Mockup — proposed” or “Example data” pill are **sample content**. Do not ship the pill or those hard-coded values.

Chrome (charcoal bar, coral welcome band, warm page, coral primary buttons) matches `docs/brand_style_guide.md`. Reuse existing tokens. The positive-change green is `#4ADE80` as a pill fill with charcoal text, not as green text on white. See the brand guide.

| File | What it is |
|------|------------|
| `A-dashboard-overview.png` | **Earlier proposal, not the approved Overview.** Decision record for the weight card (including the empty state) and for layouts that were not chosen. Do not build this screen. |
| `B-checkin-journal.png` | **Decision record, not a new screen.** The journal and check-in layouts stay the Slice 2 mockups. The callout that would preselect the profile’s top focus area was **rejected**. |
| `C-profile.png` | Profile reference for structured goals and the small cleanup. The PNG’s “optional” target date is **superseded** for weight and waist: those deadlines are required. |
| `D-mind-home.png` | Layout reference for the single-page Mind home. The PNG label “Journal streak” is **superseded** by Activity streak ([ADR-014](../../ARCHITECTURE_DECISIONS.md)). |
| `E-mind-layout-compare.png` | **Decision record.** Option A (single page) is chosen. Do not build Option B (tabs). The compact Mind row at the bottom is a later idea, not part of the Fitness Overview ticket. |
| `F-fitness-overview.png` | **Approved Fitness Overview** for desktop and mobile. The tab stays off until the workouts slice. The card marked LATER (compact Mind row) is not part of that ticket. |
| `G-checkin-goals-reminder.png` | **Pending.** Not in the repo. Ryan described a muted “Your goals” bar on the weekly check-in, above the domain scores. Ticket 2.4 is the spec until the file is added. Do not treat `checkin-desktop.png` as including that bar. |

## How to read A

A is the earlier Overview proposal. It is useful for:

- The **Weight now** card and its empty state (“No weight logged yet”).
- Seeing the **rejected** Overview contents: a Goal progress panel, a separate journal streak, a PRs / consistency card, and Mind stat cards sitting on the Fitness page.

The approved Overview is **F**. Issue #56 is the old epic for turning Fitness tabs on. It is not edited by these specs. Mapping: [`README.md`](../../vertical_slices/nov_16_2026_decisions/README.md).

## How to read B

Slice 2 already defaults the next intention to the **lowest** check-in score ([ADR-013](../../ARCHITECTURE_DECISIONS.md)). B shows that rule and a proposal to preselect the user’s top-ranked profile focus area instead (the example says Career). Ryan rejected the proposal on 2026-11-16. ADR-013 is unchanged. The check-in still lets the user pick a different domain before submit.

Build the check-in from [`docs/mockups/slice_2_journal_checkin/checkin-desktop.png`](../slice_2_journal_checkin/checkin-desktop.png), not from the proposal callout on B.

## How to read G

`G-checkin-goals-reminder.png` was named with the Nov 16 answers and is not in this folder. The bar is read-only free-text fitness and wellness goals, directly above the life-domain scores, with an “Edit in profile” link and no inputs. Build ticket 2.4 from that description.

## How to read C

Goals are set on the profile, in addition to the existing free-text fitness and wellness goals. The PNG shows one row per type (target weight, target waist, workouts per week), a start date, a target date, and an active toggle.

Written decision, where it disagrees with the PNG caption: a weight or waist goal is a **target number plus a deadline**. The deadline is required. The weekly workout count is a standing target that resets each Monday; the PNG’s blank target date on that row matches the spec. Ryan confirmed the 1–14 cap and the missing deadline. Lift goals are not on this form.

The PNG’s “Shown on the dashboard Overview” lines on the free-text goals are superseded. Those goals show read-only on the weekly check-in, and they stay editable only on the profile.

The life-domain list on C is the Option B set from ADR-013, ranked, not the wellness-wheel add/remove rows in the app today. Sharing preference is shown inactive because social is not Phase 1.

## How to read D and E

E Option A is the Mind home: one page, no tab bar. D is that page at full size. Order: stat row, 7-day mood, this week’s intention, recent entries (5, then Show more). The check-in due card is on this page when it is due; it is not in the PNG. Ticket 2.6 places it under the stat row.

The first stat is the **activity streak** (one streak: journal or workout, one grace day per week). D still says “Journal streak” and “rules are not decided yet.” Those words are sample notes from before ADR-014.

E Option B (Overview / Journal / Check-ins tabs) is not built. The bottom of E, “Optional later: compact Mind card on Fitness Overview,” waits. It is not part of F’s first Overview.

## How to read F

Fixture date printed on the art is Thursday, Nov 12, 2026. Weekly workout goal in the sample is 4. Those numbers are not a test fixture.

Overview content when the tab turns on:

- Hero: weekly workout goal, progress ring, Monday–Sunday dots, “resets Monday”, Edit goal.
- Activity streak card (same streak as Mind).
- Weight now card.
- Recent activity mixing workouts and measurements, with links to those tabs.
- Welcome-band buttons: primary **+ Log workout**, secondary **+ Log measurement**.

The Mind block labeled LATER is the future compact card. PRs are not on this screen.
