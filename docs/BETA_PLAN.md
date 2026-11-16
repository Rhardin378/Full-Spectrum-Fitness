# Beta plan

How people get into the beta and how the beta runs. The sign-up block itself is ticket CU.7 in [`vertical_slices/cleanup_backlog/tickets.md`](./vertical_slices/cleanup_backlog/tickets.md). Timing is in [`LAUNCH_PLAN.md`](./LAUNCH_PLAN.md) under “Before beta launch”.

## Approach

- Public sign-up is off in Supabase. Accounts exist only for people who are invited.
- People apply through a Google Form. Responses go to a Google Sheet, which is the waitlist.
- Ryan picks testers from the sheet and invites them from Supabase (Authentication → Users → **Invite user**).
- The form link is on the landing page and on `/auth` (CU.7, `NEXT_PUBLIC_BETA_FORM_URL`).

The form can be shared before CU.7 is built. Nobody can be invited until CU.7's Supabase settings are done.

## Google Form

**Title:** Full Spectrum Fitness — Beta access

**Description:**

> Full Spectrum Fitness helps you see how your training, how you feel, and how you live connect over time. We are opening a small private beta. Tell us a little about you and we will invite people in small groups.
>
> We use your answers only to choose beta testers and to contact you about the beta. We do not share them.

**Settings:** collect email addresses (verified), one response per person, and send responders a copy. Link the form to a new Google Sheet.

**Questions** (required unless marked optional):

1. **Name** — short answer.
2. **How do you train right now?** — checkboxes: Gym, Home workouts, Running or cardio, Sport or class, Not training right now, Other.
3. **How many days a week do you usually train?** — multiple choice: 0, 1–2, 3–4, 5+.
4. **What do you track today?** — checkboxes: Workouts, Body weight or measurements, Mood or stress, Journal, Sleep, Nothing, Other.
5. **What do you most want help with?** — checkboxes, pick up to two: Consistency, Strength, Body composition or weight, Stress, Energy, Sleep, Other.
6. **Can you use the app at least 3–4 times a week for a month and answer a short weekly feedback survey?** — multiple choice: Yes, Probably, Not sure.
7. **Which device would you mostly use?** — multiple choice: Phone, Computer, Both.
8. **How did you hear about Full Spectrum Fitness?** — short answer, optional.
9. **Anything else we should know?** — paragraph, optional.

Question 6 matters most. A few testers who log and answer every week are worth more than many who sign up once.

## Choosing and inviting testers

1. Add two columns to the sheet: **Invited** (date) and **Wave**.
2. Pick about 10 people per wave. Prefer “Yes” on question 6, and mix training styles and goals so the feedback is not all from one kind of user.
3. Invite each person from Supabase. Fill in the **Invited** date in the sheet.
4. Invite emails count toward the Supabase auth email rate limit. The built-in sender allows only a few per hour, so spread a wave out, or set up custom SMTP first (`LAUNCH_PLAN.md`, “After MVP launch — operations”) if waves get bigger.
5. Start the next wave when the current one is active and feedback is coming in.

## Welcome message

Send this personally (email or text) around the time of the invite, since the Supabase invite email is short:

> Thanks for joining the Full Spectrum Fitness beta. You'll get an email from us with a link to set your password.
>
> What's ready now: logging body measurements and seeing your trend over time. Journaling and a weekly check-in are coming next. Some parts of the app are marked “coming soon”.
>
> What would help most: use it a few times a week, and answer the short survey I'll send each week. If something breaks or confuses you, tell me through the Feedback link in the app or just reply to this message.

Update the “what's ready now” line to match what has shipped when each wave goes out.

## Weekly feedback form

A second Google Form, sent every week and linked from the app as **Feedback**. Keep the questions the same each week so answers can be compared.

1. **How many days did you open the app this week?** — 0, 1–2, 3–4, 5+.
2. **How useful was it this week?** — scale 1–5.
3. **What did you use it for?** — short answer.
4. **What was confusing, broken, or missing?** — paragraph.
5. **What would make you use it more?** — paragraph, optional.
6. **Can we follow up with you about your answers?** — Yes / No.

## When the beta ends

Turning public sign-up back on is the reverse of CU.7: turn on **Allow new users to sign up** in Supabase and set `NEXT_PUBLIC_SIGNUPS_OPEN` to true. Testers' accounts carry over.
