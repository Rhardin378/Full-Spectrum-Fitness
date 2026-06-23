# Slice 1.5: Measurements and Baseline Tracking

## Feature Brief

This slice introduces user-linked measurement tracking as time-series data so users can log baseline metrics and monitor progress over time.

## Goal

Enable authenticated users to add and review body measurements (starting with weight and extensible types) without overloading the profile model.

## Core Scope

- Create `measurements` model/table linked to authenticated user.
- Support core fields: `measurement_type`, `value`, `unit`, `measured_at`, optional `notes`.
- Build owner-scoped create and list backend actions/endpoints.
- Add a simple UI to log a measurement and view recent measurement history.
- Include basic validation (allowed types, valid units, positive numeric values, valid date).

## Done Criteria

- User can create at least one measurement entry.
- User can view recent entries for their account only.
- Data persists across sessions and remains scoped by authenticated user.
- At least one measurement type (e.g., weight) has a simple trend/history view.

## Notes

- `profiles` remains the source for stable user preferences/identity data.
- `measurements` is the source of truth for metric history and trend calculations.
