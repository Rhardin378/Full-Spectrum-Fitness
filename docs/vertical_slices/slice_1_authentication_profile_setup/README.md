# Slice 1: Authentication and Profile Setup

## Feature Brief

This vertical slice delivers the first end-to-end user flow: a user can sign up or log in, complete a profile, and see that profile persist across sessions.

## Goal

Enable a new authenticated user to enter and save foundational profile data that personalizes their in-app experience.

## Core Scope

- Integrate authentication flow with user session handling.
- Get-or-create profile record linked to authenticated user ID.
- Provide profile form for setup and editing.
- Save and validate profile fields (`display_name`, goals, experience level, sharing preferences, domain priorities).
- Load current profile globally for use in key UI surfaces (for example, dashboard/header).

## Done Criteria

- New user can register and access the app.
- User can complete and submit profile setup.
- Saved profile data appears on later visits after sign-in.
- Profile endpoints/actions enforce authentication and user ownership.

## Notes

- Keep implementation minimal and reliable; defer nonessential UX polish to later slices.
- Match brand voice and visual guidance from `docs/brand_style_guide.md`.
