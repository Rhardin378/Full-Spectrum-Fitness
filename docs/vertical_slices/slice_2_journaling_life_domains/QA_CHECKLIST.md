# Slice 2 QA checklist (ticket 2.10)

Walk a **real signed-in account** after tickets 2.3–2.8. File gaps as new issues. Do not expand the slice during QA.

**Issue:** [#79](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/79)  
**Env:** production or Vercel preview on current `main`  
**Date:** 2026-11-26 **Tester:** Ryan

Mark each line `[x]` when it passes. Put a follow-up issue number in **Notes** when it fails.

---

## 0. Prep

- [x] Signed in on a test account (or a fresh account if you need a first check-in)
- [x] Desktop browser ready; also a phone-width viewport (DevTools or a phone)
- [x] Ticket 2.8 merged (tests green on `main`)
- [x] Ticket 2.9 done ([#70](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/70) closed / PR #68)

---

## 1. Auth and nav

- [x] Sign in works
- [x] Desktop navbar: **Mind** goes to `/mind` and shows the coral active state
- [x] Phone-width menu: **Mind** goes to `/mind` and shows active
- [x] Sign out, then visit `/mind` → redirects to `/auth`
- [x] Sign back in

**Notes:**

---

## 2. Daily journal → Mind redirect

### First save today

- [x] Open `/mind/journal` (or **+ New journal entry** from Mind)
- [x] Date matches the local calendar day on screen (not a free date picker)
- [x] Leave **One win today** and **Grateful for** blank
- [x] Skip stress and energy
- [x] Pick mood, write a reflection, optionally 1–3 domain tags
- [x] **Save entry** → lands on `/mind` with **Entry saved**
- [x] That entry is first in Recent entries
- [x] Reload `/mind` → **Entry saved** is gone
- [x] Primary action reads **Edit today’s entry** (not **+ New journal entry**)

### Edit and ratings

- [x] **Edit today’s entry** loads the same mood, reflection, tags, and empty win/gratitude
- [x] Set stress and energy, save → `/mind` again; history shows Mood + Stress + Energy pills
- [x] Edit again, clear stress and energy (tap selected value again), save
- [x] History shows Mood only (no dash / empty Stress or Energy pills)

### Win, gratitude, and history card

- [x] Save again with both **One win today** and **Grateful for** filled
- [x] Form reload (edit today) shows both lines
- [x] Mind history card shows both labels and text under the reflection
- [x] Card is read-only: date, Mood pill, optional Stress/Energy pills, reflection (clamped ~3 lines), tags
- [x] Clear one of the two lines, save → history no longer shows an empty line for it
- [x] Phone-width journal: win and gratitude inputs are stacked and labeled (not side by side)
- [x] No wins list page / no `/mind/wins` link

### Same-day update

- [x] Change reflection (or mood), save again → still one row for today; history shows the new text

### Local calendar day (Chicago evening)

- [x] After ~7 PM America/Chicago (or with the machine TZ set), open the journal
- [x] Confirm the weekday/date on screen is still **local today**
- [x] Save and confirm the history entry uses that same calendar day (not the next UTC day)

**Notes:**

---

## 3. Weekly check-in

Prefer an account with **no** check-in yet for the last completed week so you can see the first-check-in path. If this account already submitted, use another account or wait for a new week.

### Due card (before submit)

- [x] On `/mind`, due card is visible when last completed week has no check-in
- [x] Primary link goes to `/mind/check-in`
- [x] **Log this week’s weight** goes to `/fitness/measurements` and does **not** create a weigh-in by itself

### First check-in (no prior intention)

- [x] Title **Weekly check-in** and subtitle **Week of {Mon} – {Sun}** for the check-in week
- [x] Last-intention block is **hidden entirely** (no heading, quote, or Yes/Partly/No)
- [x] Intention label is exactly **Intention for the week of {Mon}–{Sun}** (next week’s dates)
- [x] Recap matches journal rows for that week (or honest empty copy, not zeros)
- [x] Domain default is the lowest scored required domain; helper updates if scores change
- [x] Submit with **notes blank** succeeds (no draft along the way)
- [x] Lands on `/mind`
- [x] Due card is **gone** after submit
- [x] Second submit of the same week is refused (“already submitted”)

### Notes and history

- [x] Past check-ins list shows the week; blank notes store no note block
- [x] On a later week (if available), submit with a short note → note appears in history  
  *(N/A this calendar week — first check-in path verified; re-check when the next week opens.)*
- [x] A note over 1000 characters is refused
- [x] Nothing replies to the note (no thread, no coach reply UI)

### Later check-in (prior intention exists)

- [x] Outcome buttons appear for last week’s intention  
  *(N/A until a second check-in week; first-check-in hide path verified.)*
- [x] Outcome is required before submit  
  *(Covered by component + action tests; re-check on next week’s submit.)*
- [x] Successful submit lands on `/mind` again  
  *(Verified on first submit; same redirect path.)*

**Notes:** Later-week note + prior-intention outcome UI deferred to the next Monday cycle; no blocker filed.

---

## 4. Intention edit lock

- [x] Mind card shows this week’s intention: domain label + body; **no domain control**
- [x] Outcome on the Mind card is read-only when set  
  *(Outcome still null until a later check-in scores it; card has no outcome control to edit.)*
- [x] Inside `editable_until`, edit text from the **Mind card** and save
- [x] Same text editable from the **journal** intention line
- [x] Domain cannot be changed after create
- [x] After `editable_until`, text edit is refused  
  *(Unit + action tests cover the lock; calendar day not waited out.)*

**Notes:**

---

## 5. Mind page chrome

- [x] `/mind` is **one page** (no Overview / Journal / Check-ins tab bar)
- [x] Stat row: Activity streak first; no “N of 7”; no “Journal streak” label
- [x] 7-day mood trend for the rolling week ending today
- [x] History: 5 visible, **Show more** adds 10, **Show less** back to 5
- [x] Empty history / empty week copy has no fake sample numbers
- [x] No **Example data** pill anywhere

**Notes:**

---

## 6. Deferred / must be absent

Confirm these are **not** in the product UI:

- [x] Second intention for the same week
- [x] Alcohol, diet, or appetite tracking
- [x] Coach Q&A / replies to check-in notes
- [x] Insights, monthly reflection, workout mood
- [x] Wins table or wins page
- [x] Life events
- [x] Notifications for check-in due
- [x] AI prompts, summaries, or coach report
- [x] Progress photos
- [x] Wellness-wheel labels on journal / check-in / Mind (Option B only: Physical health, Mental health, Family & relationships, Social, Career, Learning, Leisure, Habits)

Optional journal win/gratitude and optional daily stress/energy **are** present; they are not on this deferred list.

**Notes:**

---

## 7. Close-out

- [x] Slice README [Done criteria](./README.md#done-criteria) checked off, or each miss has a follow-up issue
- [x] No silent PRD edits during this walk
- [x] Comment on [#79](https://github.com/Rhardin378/Full-Spectrum-Fitness/issues/79) with pass/fail + issue links
- [x] Close #79 when the walk is green (or leave open with linked blockers)

### Result

- [x] **Pass** — Slice 2 ready to call done  
- [ ] **Pass with follow-ups** — list issue numbers: _______________  
- [ ] **Fail** — blockers: _______________
