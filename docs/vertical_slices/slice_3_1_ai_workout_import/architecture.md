# Slice 3.1 Architecture: AI Workout Import

## Architecture Goal

Treat AI as an untrusted parser that creates an editable draft—not as a persistence layer.

The import pipeline is:

```text
Private PDF
  → deterministic validation and text extraction
  → asynchronous AI extraction
  → schema-validated review draft
  → user edits and confirms
  → canonical workout template save path
```

If AI is unavailable, manual workout/template creation must continue to work.

## Current Stack

- Next.js App Router + React + TypeScript
- Supabase Auth
- Supabase Postgres and `supabase-js`
- Supabase Storage
- Supabase Edge Functions for asynchronous extraction work
- Zod for application and AI-output validation
- OpenAI as the first provider behind a server-only adapter
- Vitest for unit/component tests

This slice follows the implemented Supabase migration/server-action patterns. Historical Prisma plans are not the implementation source of truth.

## Dependency Contract with Slice 3

Slice 3 owns the canonical workout/template model. Before Slice 3.1 starts, it must expose a versioned domain input accepted by both manual creation and import confirmation.

Logical entities required from Slice 3:

```text
ProgramTemplate
  └─ ordered SessionTemplate[]
       ├─ ordered ExerciseGroup[] (optional)
       └─ ordered ExerciseTemplate[]
            └─ ordered SetPrescription[]
```

Required prescription capabilities:

- Per-set reps or rep range
- Nullable numeric load and `lb` / `kg`
- Nullable free-text load description
- Nullable rest duration
- Nullable RPE and RIR
- Nullable tempo
- Notes

A single workout is represented through the same domain contract with one session. Physical table names may be finalized by Slice 3, but Slice 3.1 must not write those tables directly from model output.

## Components

### 1. Upload boundary (Next.js server)

Responsibilities:

- Authenticate with `auth.getUser()`.
- Perform a cheap authenticated rolling-window precheck before parsing.
- Enforce a separate short-window intake throttle (default: 10 upload/parser attempts per user and IP per 15 minutes), including rejected files.
- Accept one file and validate declared type, PDF signature, size, page count, encryption, and parser deadline.
- Compute a SHA-256 file hash and look for prior user-owned imports.
- Extract page-delimited text using a server-side PDF parser.
- Reject files with no meaningful text, more than 200,000 extracted characters, or more than the configured provider token ceiling.
- Explain that scanned and password-protected PDFs are not supported.
- Upload the PDF and extracted text to owner-scoped private Storage paths.
- After validation, call one Postgres transaction/RPC that takes a per-user transaction-level advisory lock, rechecks/reserves one of five new-import slots in the rolling 24-hour window, inserts import metadata with immutable `expires_at = created_at + 7 days`, transitions it to `queued`, and enqueues the import ID in Supabase Queues.
- A failed transaction or enqueue triggers cleanup of staged objects.

Only extracted text—not the PDF binary—is sent to OpenAI.

Only successfully queued new imports consume a usage slot. Rejected files, provider schema-repair calls, and the one allowed retry do not consume another slot.

### 2. Durable queue and import worker (Supabase Queues + Edge Function)

Responsibilities:

- Use a private Postgres-native Supabase Queue as the durable source of work.
- Run a scheduled/internal Edge Function consumer that drains queued messages; an optional best-effort immediate trigger may reduce latency but is not the durability mechanism.
- Claim a queue message and the matching `queued` import idempotently, recording an extraction-run ID, lease token, and processing lease.
- Transition `queued → processing` only after a successful claim.
- Read the extracted text from private Storage.
- Atomically reserve a provider-call attempt before calling the configured AI adapter.
- Validate the response with Zod.
- If output is invalid and a second provider-call attempt remains, reserve it for one controlled schema-repair call.
- Store raw responses and object paths only in a server-only artifact record. Store the normalized editable draft and sanitized review warnings in the owner-readable import record.
- Transition `processing → review_ready` or `failed`.
- Publish success/failure through a conditional transaction that requires the matching run ID/lease token and checks cancellation/expiry.
- Archive/delete the queue message only after the result is durably recorded.
- Allow visibility-timeout redelivery and recover stale processing leases. A provider call whose response was lost during a crash may be repeated, but every call is pre-reserved and remains inside the two-call-per-run ceiling.

The provider API key and service-role credentials exist only in server/Edge Function secrets.

Retry budgets are separate and explicit:

- Each extraction run allows at most two provider calls. The second may recover a lost/timed-out response or repair schema-invalid output.
- A user may initiate one new extraction run after failure.
- Maximum: two extraction runs, with at most two provider calls per run.

### 3. Review actions (Next.js server actions)

Responsibilities:

- Fetch only the authenticated user’s import/draft.
- Update the draft with optimistic concurrency (for example, `draft_version`).
- Validate every edit with the same versioned draft schema.
- Retry one failed extraction while the retained PDF/text still exists; the retry atomically queues a new extraction run.
- Cancel an uploaded/queued/failed/review-ready import and invoke immediate cleanup.
- For processing imports, atomically set `cancel_requested`; the worker’s conditional publication transaction cannot publish a draft after that flag is set.
- Confirm the import through the canonical Slice 3 save operation.

### 4. Confirmation boundary (Postgres transaction)

Confirmation must be atomic and idempotent.

Recommended shape:

- A narrowly granted, `SECURITY INVOKER` Postgres function/RPC.
- Revoke execution from `PUBLIC` and `anon`; grant only to `authenticated`.
- Verify `auth.uid()` ownership of the import.
- Require `review_ready`, `expires_at > now()`, the expected draft version, and minimum structural fields.
- Revalidate/translate the draft into the canonical Slice 3 input.
- Create the program/workout template and all children in one transaction.
- Record created template IDs and set status to `confirmed`.
- Return the canonical identifiers.

The RPC must use owner-scoped RLS and must not accept a caller-supplied `user_id`.

Storage cleanup happens immediately after the transaction succeeds. If object deletion temporarily fails, canonical data remains valid and cleanup is retried.

### 5. Lifecycle cleanup service

An idempotent server-only cleanup operation:

- Deletes the private PDF and extracted-text objects.
- Deletes raw provider responses and server-only artifact records.
- Removes the editable import draft, original filename, source excerpts, and source-derived warning text from browser-safe rows.
- Retains only approved content-free audit fields.
- Can be invoked after confirmation, cancellation, or expiry.
- Records cleanup state so object-deletion failures can be retried without changing the terminal import result.

### 6. Retention worker

A scheduled Supabase Edge Function:

- Finds imports whose immutable `expires_at` has passed; autosaves and retries never extend this timestamp.
- Uses a row lock/conditional transition. For processing imports it sets `expiry_requested`; for other active imports it marks `expired`.
- The worker’s publication transaction checks `expiry_requested` and `expires_at`, discards late results, and completes expiry instead of publishing a draft.
- Invokes the lifecycle cleanup service for expired and terminal imports still awaiting cleanup.
- Is idempotent so partial cleanup can safely retry.

## Proposed Import Data

### `workout_imports`

| Field | Purpose |
|---|---|
| `id` | Import identifier |
| `user_id` | Owner; derived from auth |
| `status` | Import state enum |
| `original_filename` | Display only while draft is active; scrub on cleanup |
| `file_hash` | Per-user duplicate warning |
| `file_size_bytes` | Validation/audit |
| `page_count` | Validation/audit |
| `provider` / `model` | Extraction provenance |
| `schema_version` | Extraction contract version |
| `draft` | Validated editable JSON draft |
| `draft_version` | Optimistic concurrency |
| `review_warnings` | Sanitized owner-visible warnings; source-derived text is scrubbed on cleanup |
| `warning_codes` / `warning_count` | Content-free audit after cleanup |
| `retry_count` | Maximum one extraction retry |
| `extraction_run_id` / `lease_token` | Conditional result publication |
| `provider_call_count` | Atomically reserved; maximum two per run |
| `processing_lease_expires_at` | Queue redelivery/recovery |
| `cancel_requested` | Coordinates cancellation during processing |
| `expiry_requested` | Coordinates expiry during processing |
| `expires_at` | Immutable `created_at + 7 days` |
| `cleanup_status` | Idempotent artifact cleanup |
| `created_template_ids` | Confirmation result |
| timestamps | Uploaded/started/reviewed/confirmed/expired |

This row contains only browser-safe owner data. Client code does not query it directly; server actions return explicit projections.

### Server-only import artifacts

Store the following in a non-exposed private schema and/or private Storage, reachable only by trusted server/worker code:

- PDF and extracted-text Storage paths
- Raw provider response
- Provider request identifiers
- Full source excerpts when not embedded in the active editable draft
- Cleanup/recovery details that reveal internal object locations

RLS alone is not column-level protection. Raw responses, internal paths, and extracted text must never share a browser-readable Data API projection.

### Draft contract (logical)

```text
ImportDraft
  name: string | null
  sessions: [
    {
      name: string | null
      weekLabel: string | null
      dayLabel: string | null
      position: number
      groups: [
        {
          localId: string
          type: "superset" | "circuit" | "giant_set"
          label: string | null
        }
      ]
      exercises: [
        {
          localId: string
          name: string | null
          position: number
          groupLocalId: string | null
          notes: string | null
          sets: [
            {
              position: number
              repsMin: number | null
              repsMax: number | null
              repsText: string | null
              loadValue: number | null
              loadUnit: "lb" | "kg" | null
              loadText: string | null
              restSeconds: number | null
              rpe: number | null
              rir: number | null
              tempo: string | null
              notes: string | null
            }
          ]
        }
      ]
    }
  ]
  reviewFlags: [...]
  sourceExcerpts: [...]
```

The exact schema is versioned. Unknown source values are `null`; an empty string is not a substitute for unknown.

## State Machine

```text
uploaded → queued → processing → review_ready → confirmed
                    │                │
                    └→ failed ─retry─┘

uploaded/queued/failed/review_ready → cancelled
processing → cancel_requested → cancelled (conditional publication discards result)
any active import at immutable expires_at → expired/expiry_requested
```

Rules:

- A durable queue consumer claims only `queued` work and records a processing lease.
- Queue redelivery recovers a stale lease. It may repeat a lost provider call only after atomically reserving an available call attempt; it cannot publish twice.
- Confirmation accepts only `review_ready`.
- Retry accepts only `failed` with `retry_count < 1` and retained source objects.
- Cancellation/expiry wins any race with a provider result: one row-locking/compare-and-set transaction publishes only when the lease token matches, cancellation/expiry is not requested, and `expires_at` is still in the future.
- Terminal states cannot transition back to active states.
- Repeated worker or confirmation calls return the existing result rather than duplicating templates.

## Extraction Prompt Contract

The system prompt must:

- State that source fidelity is more important than completeness.
- Require `null` when the document does not provide a value.
- Prohibit inferred weights, reps, rest, names, and progression.
- Preserve source units and text.
- Distinguish exercise notes from set prescriptions.
- Preserve order.
- Mark uncertainty and include a short source excerpt.
- Return only the versioned structured response.

Model output is always parsed and validated before use.

## Security and Privacy

- Enable RLS on every exposed import table.
- Owner policies use `(select auth.uid()) = user_id` for select/insert/update/delete as needed.
- Update policies include both `USING` and `WITH CHECK`.
- Storage policies enforce an owner-scoped first path segment.
- Do not authorize from user-editable JWT metadata.
- Never expose service-role or OpenAI keys to the client.
- Do not render or execute embedded PDF content.
- Treat filenames, extracted text, source excerpts, and prompts as sensitive user data.
- Log import IDs and error categories, not workout text or raw prompts.
- Keep raw responses, internal object paths, and provider request identifiers in a non-exposed server-only artifact store.
- Name the configured provider in the pre-upload notice and link to current provider data-use/retention information.
- Document provider-side retention separately from app-side retention and select API data controls appropriate for private content.

## Failure and Recovery

| Failure | User behavior |
|---|---|
| Invalid/oversized/too many pages | Reject before storage with a precise error |
| Password-protected, parser-timeout, or too much extracted text | Reject before AI with a precise error |
| Scanned/textless PDF | Reject with guidance; no AI call |
| Duplicate hash | Warn and allow continuation |
| Consumer unavailable | Durable queue retains work for later delivery |
| Worker crash/lease timeout | Queue redelivery recovers stale processing safely |
| Provider timeout/rate limit | Mark failed with retryable reason |
| Invalid AI schema | Use one repair call only if the run still has an unreserved provider-call attempt; otherwise fail |
| Save validation failure | Return to review with field/row errors |
| Confirmation retry | Return existing template IDs |
| Storage cleanup failure | Keep terminal status and retry cleanup |

## Observability

Capture without source content:

- Import counts by status
- Queue age, processing lease recovery, and consumer failures
- Processing duration
- Provider/model and schema version
- Failure category
- Repair and user retry counts
- Warning count
- Confirmation/cancellation/expiry rate
- User edit count before confirmation
- Cleanup success/failure

These metrics help evaluate extraction quality without retaining sensitive workout documents.

## Testing Strategy

### Unit

- File validation, hashing, page/text thresholds
- Atomic rolling-window rate-limit reservation
- Extracted-character/token ceilings and parser deadline
- Zod extraction/draft schemas
- Provider adapter mapping
- State transitions and idempotency
- Canonical draft translation

### Database and Storage

- RLS owner isolation
- Storage path isolation
- Server-only artifact-store isolation from the Data API
- Durable queue delivery and stale-lease recovery
- Atomic confirmation and duplicate confirmation
- Cleanup scrubbing
- Expiry and retry constraints

### Component/integration

- Upload and disclosure
- Processing status
- Failure/retry
- Mobile review editing/reordering
- Review flags
- Resume review
- Confirm/cancel

### AI evaluation fixtures

Maintain a de-identified fixture set covering:

- Simple single workout
- Multi-day program
- Tables and multi-column text extraction
- Rep ranges and different prescriptions by set
- Bodyweight/bands/machine settings
- RPE, RIR, tempo, and rest
- Supersets/circuits
- Missing and ambiguous values
- Prompt-injection-like text inside a PDF

Evaluation must verify non-invention and schema validity, not only extraction completeness.

## Phased Delivery

### Phase 0 — Slice 3 prerequisite contract

- Canonical workout/program template schema
- Per-set prescriptions and groupings
- Manual editor and owner-scoped save path
- Workouts tab and reusable validation

### Phase 1 — Secure intake and staging

- Import/storage schema and RLS
- Server-only artifact store, lifecycle cleanup primitive, and private Storage
- Upload validation, hashing, bounded text extraction
- AI disclosure, usage limit, duplicate warning
- Status UI and private object lifecycle

### Phase 2 — Asynchronous extraction

- Provider-neutral adapter with OpenAI implementation
- Versioned extraction schema and prompts
- Supabase Queue, scheduled Edge Function consumer, state/lease machine, warnings
- Failure and one-retry behavior

### Phase 3 — Human review

- Resumable multi-session review editor
- Set-level edits, reordering, groups, notes
- Review flags and source excerpts
- Autosave/version conflict handling

### Phase 4 — Canonical confirmation

- Minimum-field validation
- Atomic/idempotent canonical save
- Template provenance and redirect
- Confirm/cancel cleanup

### Phase 5 — Hardening and release

- Seven-day retention worker
- Security/RLS/storage tests
- AI evaluation fixtures
- Accessibility, mobile QA, cost/latency instrumentation
- Operational runbook and release checklist
