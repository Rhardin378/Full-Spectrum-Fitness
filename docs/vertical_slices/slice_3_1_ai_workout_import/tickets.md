# Slice 3.1 Tickets: AI Workout Import

Copy each section into a GitHub issue after the Slice 3 workout/template foundation is complete.

---

## Ticket 3.1.1: Lock the canonical workout-template import contract

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `validation`

### Description

Define the versioned domain input that both the manual workout editor and AI import confirmation use to create workout/program templates.

### Scope

- Confirm that Slice 3 supports:
  - Program templates with ordered sessions
  - Optional week/day labels
  - Ordered exercises
  - One row per prescribed set
  - Nullable reps/ranges, load, rest, RPE/RIR, tempo, and notes
  - Numeric `lb` / `kg` load plus nonstandard load text
  - Editable superset/circuit/giant-set groupings
- Create one strict, versioned Zod/domain input for canonical template creation.
- Ensure the manual editor uses the same validation and save path.
- Define atomic save and idempotency behavior.
- Document translation rules from an import draft to the canonical input.

### Acceptance Criteria

- There is one canonical creation contract for manual and imported templates.
- A single workout and a multi-session program use the same contract.
- Unknown optional prescription values can remain `null`.
- AI output cannot write directly to canonical workout tables.
- Contract tests cover single-session and multi-session templates.

### Dependencies

- Slice 3 workout template schema and manual editor

---

## Ticket 3.1.2: Create import staging schema, private Storage, and RLS

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `database`, `backend`, `security`

### Description

Create owner-scoped staging infrastructure for temporary PDFs, extracted text, structured drafts, status, and minimal audit provenance.

### Scope

- Add `workout_imports` (and supporting table(s), if needed) with:
  - Owner
  - Status state machine
  - File metadata/hash
  - Provider/model and schema version
  - Structured draft and draft version
  - Warnings and retry count
  - Run/lease token, provider-call count, cancellation/expiry flags
  - Immutable seven-day `expires_at`
  - Cleanup status
  - Created template IDs
  - Lifecycle timestamps
- Add a non-exposed private-schema artifact record for internal Storage paths, raw provider responses, and provider request identifiers.
- Expose browser-safe import data only through explicit server-action projections.
- Create a private Supabase Storage bucket.
- Create a private Supabase Queue for durable extraction jobs.
- Use owner-scoped object paths.
- Enable RLS and owner policies for required operations.
- Add status, owner/date, hash, and expiry indexes.
- Add database constraints for legal statuses/transitions where practical.
- Add an idempotent server-only lifecycle cleanup primitive used by confirm, cancel, and expiry.
- Do not grant browser access to service-role operations.

### Acceptance Criteria

- Migration applies successfully.
- Users cannot read or mutate another user’s imports or objects.
- Bucket is private and object-path policies are owner-scoped.
- Raw responses and internal object paths are not exposed through the Data API.
- Extraction messages survive consumer downtime in a durable queue.
- Import statuses and retry counts are constrained.
- Queries for active, expired, and same-hash imports are indexed.

### Dependencies

- Ticket 3.1.1

---

## Ticket 3.1.3: Build secure PDF intake and server-side text extraction

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `api`, `validation`

### Description

Validate one text-based PDF, extract page-delimited text server-side, and stage private source objects for asynchronous processing.

### Scope

- Require authentication.
- Perform a cheap authenticated limit precheck before parsing.
- Enforce a separate configurable intake throttle (default: 10 upload/parser attempts per user and IP per 15 minutes), including rejected files.
- Validate:
  - One file
  - `.pdf` extension
  - PDF MIME type and file signature
  - Maximum 10 MB
  - Maximum 30 pages
- Reject encrypted/password-protected, malformed, or parser-timeout PDFs.
- Compute SHA-256 and warn on a prior same-user import without blocking it.
- Extract text by page on the server.
- Reject textless/scanned PDFs with helpful guidance.
- Reject more than 200,000 extracted characters or the configured provider-input token ceiling.
- Upload PDF and extracted text to owner-scoped private Storage.
- After validation, use one Postgres transaction/RPC with a per-user transaction-level advisory lock to enforce/reserve against five new imports per rolling 24 hours, insert import metadata with immutable `expires_at`, transition `uploaded → queued`, and enqueue the import ID in Supabase Queues.
- Count only successfully queued new imports; rejected files, schema-repair calls, and the one allowed retry do not consume another slot.
- Clean up staged objects if intake fails partway through.

### Acceptance Criteria

- Valid text PDFs become queued imports.
- Invalid, oversized, over-page-limit, or textless PDFs do not call AI.
- Duplicate PDFs show a warning but may continue.
- Only page-delimited extracted text is prepared for the AI provider.
- Concurrent upload attempts cannot exceed the rolling-window allowance.
- Repeated rejected/malformed files are constrained by the short-window intake throttle.
- Partial failures do not leave untracked private objects.

### Dependencies

- Ticket 3.1.2

---

## Ticket 3.1.4: Implement the versioned AI extraction adapter and schema

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `validation`

### Description

Implement a provider-neutral server adapter with OpenAI as the first provider and strict structured-output validation.

### Scope

- Define a versioned extraction schema for:
  - Name
  - Ordered sessions and optional week/day labels
  - Exercise order and groupings
  - Individual set rows
  - Reps/ranges, load/unit/text, rest, RPE/RIR, tempo, and notes
  - Review flags, warnings, and source excerpts
- Require `null` for missing or ambiguous values.
- Explicitly prohibit invented prescriptions and names.
- Preserve source units and nonstandard load text.
- Build provider-neutral adapter interface.
- Add OpenAI implementation selected by server configuration.
- Keep model choice configurable with a documented default.
- Validate all responses with Zod.
- Allow one controlled schema-repair call only when the extraction run still has an unreserved provider-call attempt.
- Keep this repair budget separate from the single user-initiated extraction retry: at most two extraction runs and two provider calls per run.
- Treat document text as untrusted data, not prompt instructions.

### Acceptance Criteria

- Provider output cannot bypass schema validation.
- Missing values remain `null`.
- Ambiguous values receive review flags/warnings.
- Invalid output is repaired once or fails clearly.
- Tests cover malformed output, prompt-injection-like source text, and representative workout structures.

### Dependencies

- Ticket 3.1.1

---

## Ticket 3.1.5: Build asynchronous extraction worker and import state machine

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `supabase`

### Description

Consume durable Supabase Queue messages through a trusted Edge Function and persist a review-ready draft or actionable failure.

### Scope

- Add a scheduled/internal Edge Function consumer for the private import queue.
- Treat an immediate worker trigger as an optional latency optimization, not the durability mechanism.
- Claim queue messages and queued imports idempotently with an extraction-run ID, lease token, and processing lease.
- Implement legal transitions:
  - `uploaded → queued → processing → review_ready`
  - `processing → failed`
  - `failed → queued` for one retry
- Read extracted text from private Storage.
- Atomically reserve one of at most two provider-call attempts for the run, then call the configured AI adapter.
- Persist raw responses and internal paths only in the server-only artifact store.
- Persist the normalized draft, sanitized warnings, provider/model, and schema version in browser-safe owner data.
- Persist safe failure categories without logging workout content.
- Allow one retry without re-upload while source objects remain.
- Archive/delete a queue message only after the result is durable.
- Recover visibility-timeout redelivery and stale processing leases; a lost response may cause another call only when an attempt remains.
- Publish results through a conditional transaction requiring the matching run/lease token, no cancellation/expiry request, and unexpired `expires_at`.
- If cancellation/expiry is requested while processing, discard the model result, transition to the requested terminal state, and invoke cleanup.

### Acceptance Criteria

- UI requests do not remain open for AI processing.
- Consumer downtime leaves work durably queued.
- Repeated delivery and stale-lease recovery cannot publish duplicate results or exceed two reserved provider calls per run.
- Success produces a schema-valid review draft.
- Failure produces a useful retryable/non-retryable reason.
- A user cannot retry more than once.
- Raw responses/internal paths are not browser-readable; secrets and source content do not appear in client bundles or logs.

### Dependencies

- Ticket 3.1.2
- Ticket 3.1.3
- Ticket 3.1.4

---

## Ticket 3.1.6: Build import entry and processing-status UI

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `frontend`, `ui`

### Description

Add the Workouts-tab entry point and dedicated upload/status flow at `/dashboard/workouts/import`.

### Scope

- Add **Import with AI** to the Workouts tab.
- Show a pre-upload notice naming the configured AI provider, explaining that extracted document content is sent to it, and linking to current provider data-use/retention information.
- Upload action acknowledges the notice.
- Display limits: PDF only, text-based, 10 MB, 30 pages.
- Display duplicate warning without blocking continuation.
- Show uploaded, queued, processing, review-ready, and failed states.
- Provide one-retry action when eligible.
- Explain scanned-PDF deferral and offer a path back to manual creation.
- Use supportive brand copy, mobile-first layout, and accessible progress/status messaging.

### Acceptance Criteria

- Authenticated users can start an import from the Workouts tab.
- Upload validation errors are understandable and accessible.
- Processing may survive navigation/reload.
- Retry eligibility and failures are clear.
- No UI implies that AI output is final or automatically saved.

### Dependencies

- Slice 3 Workouts tab
- Ticket 3.1.3
- Ticket 3.1.5

---

## Ticket 3.1.7: Build resumable editable import review

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `frontend`, `ui`

### Description

Create a mobile-first review editor for correcting the structured extraction before confirmation.

### Scope

- Load and save only the authenticated owner’s draft.
- Allow users to:
  - Edit template/program name
  - Add/remove/reorder sessions
  - Edit week/day labels
  - Add/remove/reorder exercises
  - Add/remove/reorder individual set rows
  - Edit reps/ranges, load/unit/text, rest, RPE/RIR, tempo, and notes
  - Add/change/remove exercise groups
  - Remove incorrectly detected content
- Surface row/field `needs_review` flags, warnings, and source excerpts.
- Do not display fabricated confidence percentages.
- Autosave with draft-version conflict protection.
- Allow users to leave and resume during the seven-day window.
- Provide confirm and cancel actions; cancel uses the server-side cleanup primitive, and processing cancellation requests are resolved by the worker.

### Acceptance Criteria

- Every extracted field is editable or removable.
- Set-level prescriptions and groups can be reordered.
- Ambiguity is visible and understandable.
- Drafts resume across sessions and devices.
- Concurrent/stale updates do not silently overwrite newer edits.
- Cancellation reaches a terminal state and removes transient artifacts, including when requested during processing.
- Keyboard and mobile interactions are accessible.

### Dependencies

- Ticket 3.1.2
- Ticket 3.1.5
- Ticket 3.1.6

---

## Ticket 3.1.8: Confirm imports through atomic canonical template creation

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `database`, `validation`

### Description

Validate a reviewed draft and atomically create reusable canonical templates through the Slice 3 save contract.

### Scope

- Require:
  - User-confirmed name
  - At least one session
  - At least one exercise
- Require `review_ready` and `expires_at > now()` at the transactional confirmation boundary.
- Allow optional prescription values to remain `null`.
- Translate the draft into the versioned Slice 3 canonical input.
- Create all template data in one Postgres transaction.
- Use owner-derived identity; never accept caller-supplied ownership.
- Make confirmation idempotent and safe to retry.
- Save import provenance and created template IDs.
- Never create completed workout history or calendar scheduling.
- Invoke the idempotent lifecycle cleanup primitive after successful confirmation.

### Acceptance Criteria

- Confirmation creates a single-workout or multi-session reusable template.
- The manual and import flows use the same canonical validation/save path.
- Failed confirmation creates no partial canonical data.
- Repeated confirmation returns the same created IDs.
- Cross-user confirmation is blocked.

### Dependencies

- Ticket 3.1.1
- Ticket 3.1.2
- Ticket 3.1.7

---

## Ticket 3.1.9: Implement cancellation, expiry, and privacy cleanup

- **Type:** feature
- **Priority:** P0
- **Labels:** `slice-3.1`, `workouts`, `ai`, `backend`, `security`, `chore`

### Description

Schedule expiry, retry incomplete lifecycle cleanup, and verify transient workout-document removal after every terminal path.

### Scope

- Add scheduled Supabase cleanup worker.
- Expire against immutable `expires_at = created_at + 7 days`; autosaves and retries do not extend it.
- Use conditional/row-locking transitions so expiry wins races with processing result publication.
- Invoke the shared lifecycle cleanup primitive for expired imports and terminal imports whose prior cleanup was incomplete.
- Delete:
  - PDF
  - Extracted text
  - Editable import draft
  - Original filename
  - Source excerpts
  - Source-derived warning text
  - Raw provider response
- Retain only:
  - Status and lifecycle timestamps
  - File hash, size, and page count
  - Provider/model and schema version
  - Content-free warning codes/count and retry count
  - Created template IDs
- Make cleanup idempotent and retry object-deletion failures.
- Avoid logging source content.

### Acceptance Criteria

- Confirmation, cancellation, and expiry remove all transient source content.
- Abandoned imports become `expired`.
- Cleanup can safely retry after partial failure.
- Minimal audit data remains as specified.
- Tests verify that private objects and transient columns are scrubbed.

### Dependencies

- Ticket 3.1.2
- Ticket 3.1.8

---

## Ticket 3.1.10: Add automated tests and AI extraction evaluations

- **Type:** chore
- **Priority:** P1
- **Labels:** `slice-3.1`, `workouts`, `ai`, `tests`, `quality`

### Description

Cover the critical import path, security boundaries, non-invention behavior, and representative PDF structures.

### Scope

- Unit tests:
  - File limits/signature/page/text validation
  - Parser deadline, extracted-character/token ceilings
  - Hashing, duplicate warning, and atomic rolling-window rate limiting
  - Extraction/draft schemas
  - State transitions and idempotency
  - Provider adapter and canonical translation
- Database/Storage tests:
  - Import and object ownership
  - Server-only artifact isolation from the Data API
  - Durable queue delivery and stale-lease recovery
  - Atomic confirmation
  - Retry constraints
  - Expiry and cleanup
- UI tests:
  - Disclosure/upload
  - Status/failure/retry
  - Review edits and flags
  - Resume, confirm, and cancel
- De-identified AI evaluation fixtures:
  - Single workout and multi-day program
  - Tables/multi-column text
  - Rep ranges and per-set variation
  - Nonstandard loads
  - RPE/RIR/tempo/rest
  - Supersets/circuits
  - Missing/ambiguous fields
  - Prompt-injection-like PDF text
- Score schema validity and non-invention, not only completeness.

### Acceptance Criteria

- Automated suites pass.
- Owner isolation and idempotency have regression coverage.
- Evaluation fixtures show missing data remains `null`.
- Model/provider changes can be compared against the same fixtures.
- No real user PDF or sensitive workout text is committed as a fixture.

### Dependencies

- Tickets 3.1.3–3.1.9

---

## Ticket 3.1.11: Slice 3.1 QA, observability, and release checklist

- **Type:** chore
- **Priority:** P1
- **Labels:** `slice-3.1`, `workouts`, `ai`, `qa`, `release`

### Description

Verify the full AI import workflow, retention/security controls, accessibility, and operational visibility.

### Scope

- Manually test representative valid PDFs.
- Verify all rejection cases and AI/provider failure states.
- Verify duplicate warning, five-new-imports-per-rolling-24-hours limit under concurrency, and one user retry.
- Verify reload/resume across the seven-day window.
- Verify edits, ordering, groupings, warnings, and nullable fields.
- Verify atomic confirmation and no completed workout-history creation.
- Verify cross-user database and Storage isolation.
- Verify confirmation, cancellation, and expiry cleanup.
- Verify mobile and keyboard review flows.
- Confirm metrics capture status/duration/failure/warning/edit/cleanup counts without source content.
- Document model configuration, rollback/disable switch, provider outage behavior, provider-side data retention, and selected API data controls.
- Create follow-ups for all deferred formats and OCR.

### Acceptance Criteria

- Slice brief done criteria are verified.
- Security and retention checks pass.
- AI outage does not affect manual workout creation.
- Import can be disabled without affecting canonical templates.
- Known limitations and deferred follow-ups are documented.
- Slice 3.1 is ready for release.

### Dependencies

- Ticket 3.1.10
