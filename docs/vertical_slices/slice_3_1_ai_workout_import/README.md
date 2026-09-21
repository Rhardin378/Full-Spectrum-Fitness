# Slice 3.1: AI Workout Import

## Feature Brief

Allow authenticated users to upload an existing text-based workout PDF and use AI to convert it into a structured, editable workout or program template in Full Spectrum Fitness.

The feature removes the friction of recreating plans from trainers, purchased programs, and exported documents while keeping the user in control of every saved value.

## Position in the Roadmap

Slice 3.1 is a follow-on to Slice 3 (Workouts). It must reuse the same canonical template model, validation, editor components, and save path as manually created workouts.

### Prerequisites

- Slice 3 defines and ships the canonical workout template model.
- The model supports programs, ordered sessions, ordered exercises, one row per prescribed set, and editable exercise groupings.
- Manual template creation/editing and owner-scoped persistence work before AI import is enabled.
- The Workouts tab exists on `/dashboard`.

AI import must not establish a competing workout schema or bypass canonical validation.

## Goal

Convert a user-owned PDF into a reviewable draft, clearly surface uncertainty, and save only the user-confirmed result as reusable workout/program templates.

## User Flow

1. User selects **Import with AI** from the Workouts tab.
2. User opens `/dashboard/workouts/import`.
3. Before upload, the UI explains that extracted document content is sent to the configured AI provider.
4. User uploads one text-based PDF (maximum 10 MB and 30 pages).
5. The system validates the file, computes a duplicate-detection hash, extracts page-delimited text server-side, and rejects textless/scanned PDFs.
6. An asynchronous extraction job moves through Uploaded → Processing → Review ready or Failed.
7. AI returns a strict structured draft plus warnings; it does not save a workout.
8. User reviews and edits the result, including sessions, exercises, sets, groupings, and notes.
9. User confirms the draft.
10. The server validates the entire draft and atomically creates canonical workout/program templates through the same domain save path used by manual creation.
11. The source PDF and raw extracted text are deleted. Minimal import provenance remains.

## Extraction Scope

The system should attempt to identify:

- Workout or program name
- Ordered workout sessions
- Optional week/day labels
- Exercise name
- Ordered set rows
- Repetitions or rep ranges
- Numeric load and `lb` / `kg` unit when explicit
- Nonstandard load text (for example bodyweight, bands, or machine settings)
- Rest duration
- RPE or RIR
- Tempo
- Exercise notes and instructions
- Editable groupings such as supersets, circuits, or giant sets

### Non-invention rule

The AI must not invent missing information.

- Unknown or ambiguous values remain `null`.
- Ambiguous rows/fields receive a `needs_review` flag and a human-readable warning.
- Relevant source excerpts may be retained temporarily with the draft to help review.
- Numeric “confidence percentages” are not shown because model-generated confidence is not reliably calibrated.
- Source values and units are preserved; this slice does not auto-convert loads.

## Human Review Requirements

AI-imported drafts are never automatically saved as workout templates.

The review interface must allow users to:

- Edit the workout/program name
- Add, remove, rename, and reorder sessions
- Edit optional week/day labels
- Add, remove, rename, and reorder exercises
- Add, remove, and reorder individual set rows
- Edit reps/ranges, numeric load, load unit, nonstandard load text, rest, RPE/RIR, and tempo
- Add or edit notes
- Create, change, or remove exercise groupings
- Resolve or acknowledge flagged ambiguities
- Remove incorrectly detected content
- Leave and resume the draft during its retention window
- Confirm or cancel the import

### Minimum confirmation requirements

Confirmation is blocked until the draft has:

- A user-confirmed template/program name
- At least one session
- At least one exercise

Optional prescription fields may remain `null`.

## Canonical Save Behavior

- A single-workout import creates a reusable workout template.
- A multi-session import creates a reusable program template with ordered sessions.
- Confirmation does not create completed workout-history records.
- Confirmation does not schedule sessions on a calendar.
- All canonical rows are created atomically; a partial template must not survive a failed save.
- The saved result records the originating import ID for provenance without depending on the original PDF.

## Upload and Processing Rules

- One PDF per import
- PDF only; validate extension, MIME type, and file signature
- Maximum file size: 10 MB
- Maximum length: 30 pages
- Text-based PDFs only for MVP
- Server-side text extraction; only page-delimited text is sent to the AI provider
- Scanned/textless PDFs are rejected with guidance; OCR and image import are deferred
- Password-protected, malformed, or parser-timeout PDFs are rejected before AI processing
- Maximum extracted text: 200,000 characters, with a configurable provider-input token ceiling
- Duplicate file hashes produce a warning but do not block the user
- Maximum five new imports per authenticated user per rolling 24 hours (configurable); validation failures, repair calls, and the one allowed retry do not consume another import slot
- A separate configurable intake throttle (default: 10 upload/parser attempts per user and IP per 15 minutes) includes rejected files
- Intake reserves usage atomically so concurrent uploads cannot bypass the limit
- A durable Supabase Queue dispatches extraction work to an Edge Function consumer
- One user-initiated extraction retry is allowed without re-uploading after a failure

## AI Provider Rules

- OpenAI is the initial provider behind a provider-neutral, server-only adapter.
- Provider and model are server configuration, not hard-coded product requirements.
- AI output must conform to a strict versioned schema and pass Zod validation.
- Each extraction run may reserve at most two provider calls total. The second call may recover a lost/timed-out call or repair schema-invalid output. This is separate from the single user-initiated retry, for a maximum of two extraction runs and two provider calls per run.
- Prompts explicitly require source fidelity, `null` for missing data, and warnings for ambiguity.

## Storage, Privacy, and Retention

- PDFs live in a private Supabase Storage bucket.
- Object paths are owner-scoped and protected by Storage policies.
- Browser-safe import metadata and editable drafts are owner-scoped with Postgres RLS.
- Storage paths, extracted text references, and raw provider responses live in a server-only private-schema artifact record that is not exposed through the Data API.
- The browser never receives a service-role key or AI-provider secret.
- The pre-upload notice names the configured AI provider, states that extracted document content is sent to it, and links to current provider data-use/retention information; starting the upload acknowledges the notice.
- Provider configuration must use API data controls appropriate for private user content. Provider-side retention is documented separately from the app’s seven-day retention.
- Active drafts retain the private PDF, extracted text, AI response, source excerpts, and editable structured draft.
- Confirmation or cancellation deletes the PDF, extracted text, editable import draft, source excerpts, source-derived warning text, and raw AI response.
- Every import receives an immutable `expires_at = created_at + 7 days`; autosaves and retries do not extend it.
- Imports that reach `expires_at` receive the same cleanup.
- After cleanup, retain only minimal audit data: status, timestamps, file hash/size/page count, provider/model/schema version, content-free warning codes/count, retry count, and created template IDs.

## Import Statuses

- `uploaded`
- `queued`
- `processing`
- `review_ready`
- `failed`
- `confirmed`
- `cancelled`
- `expired`

Status transitions must be owner-visible, idempotent, and safe to retry.

## UI Placement and Brand

- Entry point: **Import with AI** in the dashboard Workouts tab.
- Dedicated flow: `/dashboard/workouts/import`.
- Review may span multiple sessions and must be mobile-first and keyboard accessible.
- Use the app’s indigo/navy shell, coral primary actions, rounded surfaces, and supportive language.
- AI copy must say “review” and “suggested extraction,” not imply certainty.

## In Scope

- Text-based PDF upload
- Single workout and ordered multi-session program extraction
- Optional week/day labels without a progression engine
- Structured AI extraction
- Resumable editable review
- Explicit ambiguity flags and warnings
- User-confirmed atomic save as reusable templates
- Private temporary storage and automatic cleanup
- Duplicate warning, usage limit, one failure retry
- Tests for ownership, validation, extraction contracts, cleanup, and confirmation

## Deferred

- Scanned PDF OCR
- Image or screenshot import
- Spreadsheet, DOCX, URL, or email import
- Multiple PDFs in one import
- Automatic exercise-library matching
- Exercise video matching
- Automatic scheduling
- Automatic progression generation
- Wearable integration
- Automatic program recommendations
- Saving directly as completed workout history
- Fully automated import without human review

## Done Criteria

- An authenticated user can upload a valid PDF and observe asynchronous processing status.
- Invalid, oversized, over-page-limit, textless, or unsupported files receive clear errors.
- AI output is schema-validated and missing information remains `null`.
- The user can resume and fully edit a review draft.
- Ambiguities are clearly flagged with useful context.
- Confirmation creates canonical templates through the manual workout save path and never creates partial data.
- Cross-user access to files, imports, drafts, and templates is blocked.
- PDFs and transient extraction content are removed on confirm, cancel, or seven-day expiry.
- Rate limits, duplicate warnings, retry behavior, failure states, and empty states work as specified.
- Automated tests and a representative extraction evaluation set pass.

## Architecture

See [architecture.md](./architecture.md) for the phased implementation and data flow.

## Tickets

See [tickets.md](./tickets.md) for GitHub-ready implementation issues.
