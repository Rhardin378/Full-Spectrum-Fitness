# Slice 3 — Workouts mockups

UI references for [`docs/vertical_slices/slice_3_workouts/`](../../vertical_slices/slice_3_workouts/README.md). Numbers, names, and any “Mockup” labels are **sample content**. Do not ship those hard-coded values.

Chrome (charcoal bar, coral welcome band, warm page, coral primary buttons) matches `docs/brand_style_guide.md`. Fitness Overview content remains [`../nov_2026_tickets/F-fitness-overview.png`](../nov_2026_tickets/F-fitness-overview.png) (OV.1).

These images are the pre-lock frames from 2026-11-23. **Updated mockups are coming from a separate design pass.** Do not edit the image files. Until that pass lands, the Slice 3 README wins.

The locked log is **Option B**: a day view plus a per-exercise Track screen (D1, changed Nov 23, 2026). Ryan reviewed the Option B mockups in chat that day. The committed images still show the earlier inline layout. They also do not show cardio Track or the day-view cards.

| File | What it is |
|------|------------|
| `workouts-tab-desktop.jpg` | Pre-lock Workouts tab: history list + this-week progress, welcome band **+ Log workout**. |
| `log-workout-desktop.jpg` | Pre-lock log form: session name, date, duration, set tables, Save workout. No live session clock, which still matches D1. It does not yet show tick-to-save, the rest pill, the per-dumbbell hint, the notes info button, the PR badge, or the sticky save/finish bar. |
| `exercise-picker-desktop.jpg` | Pre-lock Add exercise modal: search, muscle chips, create custom. It does not yet show the fuzzy-duplicate warning or **Create anyway**. |

## How to read these

1. **Capture is Option B** (D1, changed Nov 23, 2026): day view, then Track at `?exercise=`. Save set still saves immediately. No live session or stopwatch. The committed `log-workout-desktop.jpg` is the older inline form.
2. **+ Log workout** opens a new log for today. No start chooser (D15).
3. The Library tab stays coming soon. The picker search sheet is the only library UI. The per-exercise history view (past sets and the PR badge) is not a Library page (D16).
4. The Workouts tab mock may still show Overview as a tab; Overview content stays off until OV.1 with this slice.
5. Written README wins when it disagrees with a JPG.

## Still needed from the design pass

- Phone-width frames for the log, the finish summary, and history.
- Per-dumbbell hint, duplicate warning with Create anyway, PR badge, per-exercise history view, rest pill (+30s, Skip), and the template-notes info button.
- Template list / start-from-template frame when ticket 3.6 is specified.
- Empty-state Workouts tab frame (honest empty, no sample rows).
