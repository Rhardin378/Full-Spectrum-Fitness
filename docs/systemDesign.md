# Full Spectrum Fitness

## System Design Document (Current Scope)

---

# 1. Purpose of This Document

This document defines:

- What the system is
- What technologies are actually being used
- How they connect
- What is in scope right now
- What is not in scope
- Where AI fits (without overcomplicating it)

This is a grounding document to prevent architecture sprawl.

---

# 2. What We Are Building (MVP Reality)

Full Spectrum Fitness is a web application that allows users to:

1. Create an account
2. Log workouts
3. Log structured mental health journal entries
4. Associate journal entries with life domains
5. View trend insights over time
6. (Optional MVP+) Share selected updates socially

That’s it.

It is NOT yet:

- A marketplace
- A wearable integration engine
- A predictive AI health system
- A social network competitor
- A mobile native app

---

# 3. High-Level Architecture

Frontend → Backend Logic → Database → (Optional AI Layer)

---

# 4. Technology Stack (Current)

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

Purpose:

- UI rendering
- Client interactions
- Forms
- Charts
- Dashboard views

---

## Authentication

- Supabase Auth

Purpose:

- Handles login / signup
- Manages user identity
- Issues JWT tokens

Important:
Supabase Auth is ONLY for authentication.
It is not your ORM.
It is not your business logic layer.

---

## Database

- Supabase Postgres

Purpose:

- Stores application data
- Structured relational storage
- Secured with Row Level Security on exposed application tables

---

## Data Access and Migrations

- `supabase-js` / `@supabase/ssr`
- Supabase SQL migrations
- Zod domain/input validation

Purpose:

- Authenticated server-side data access
- Relationship modeling in Postgres
- Migration management through `supabase/migrations`
- Owner-scoped access enforced with Row Level Security

Important:
The implemented application does not use Prisma. Supabase manages Auth, Postgres, Storage, and the Data API; application business logic remains in server actions/routes and domain modules.

---

## AI Layer (Optional for MVP)

- Provider-neutral server adapter
- OpenAI as the initial configured provider
- Supabase Edge Functions for asynchronous AI Workout Import processing

Purpose:

- Generate weekly summaries
- Generate reflection prompts
- Summarize journal entries
- Extract structured, reviewable workout drafts from server-extracted PDF text

AI does NOT:

- Store data
- Control logic
- Replace analytics
- Save imported workouts without human confirmation

It is just a service you call.

---

## Achievement Tracking (Gamification Layer)

- Rule-based achievement detection
- Badge state management
- User achievement progress tracking

Purpose:

- Track milestone accomplishments
- Unlock badges on criteria met
- Display achievements in user profile
- Optional social sharing of badges

How it works:

- After each workout or journal entry
- Server runs achievement checks
- Criteria: X workouts, Y day streaks, Z milestone PRs
- If met, create user_achievement record
- Trigger notification to user
- Badge appears in profile

---

## Achievement Detection Flow

User logs workout / journal entry
↓
Server action processes input
↓
Supabase Postgres stores data
↓
**Achievement system evaluates criteria**

- Check streak counts
- Check total counts
- Check PR detection
- Check domain coverage
  ↓
  If criteria met:
- Create user_achievement record
- Trigger unlock notification
- Mark as available for social sharing
  ↓
  Badge appears in profile

# 5. System Flow

## User Registration

User → Supabase Auth → returns user ID → stored in database

You store the Supabase user ID in owner-scoped Postgres tables.

---

## Logging a Journal Entry

Frontend form  
↓  
Server action / API route  
↓  
Supabase data access creates:

- journal_entry
- journal_domain_scores
  ↓  
  Stored in Postgres

---

## Logging a Workout

Frontend form  
↓  
Server action  
↓  
Supabase data access creates:

- workout
- exercises
  ↓  
  **Achievement system checks criteria** (4 consecutive workouts? PR? etc.)
  ↓  
  If criteria met, unlock achievement  
  ↓  
  Stored in Postgres

---

## Viewing Dashboard

Server query via `supabase-js`
↓  
Aggregate mood scores  
↓  
Aggregate workout frequency  
↓  
Send structured data to frontend  
↓  
Charts render

No AI required.

---

## AI Weekly Summary (Optional)

Server job runs  
↓  
Server-side Supabase client fetches last 7 days of data
↓  
Constructs prompt  
↓  
Calls OpenAI  
↓  
Stores AI summary in database  
↓  
Displays to user

AI is an enhancement, not core infrastructure.

---

## AI Workout Import (Slice 3.1)

```text
Authenticated upload
  → Private Supabase Storage + owner-scoped import record
  → Server validates the PDF and extracts page-delimited text
  → Supabase Edge Function calls the configured AI adapter
  → Zod validates a structured, resumable review draft
  → User edits and explicitly confirms
  → Canonical manual-workout save path atomically creates reusable templates
  → Transient PDF/text/model content is deleted
```

The AI provider never writes workout tables directly. If import processing is unavailable, manual workout creation remains fully functional.

---

# 6. Database Ownership Model

Supabase provides:

- Authentication users
- Postgres database
- Private Storage
- Row Level Security and Data API
- Edge Functions

The repository owns:

- SQL migrations and relational schema
- Zod/domain validation
- Server actions/routes and business logic
- Storage lifecycle and AI orchestration

Authentication, Storage, and application tables share one owner identity (`auth.uid()`), but each layer has separate access policies.

---

# 7. Clear Layer Separation

Frontend:

- UI
- Forms
- Display logic

Backend:

- Business logic
- Validation
- Aggregation
- AI prompt construction

Database:

- Pure data storage
- Relationships
- Indexing

AI:

- Structured generation behind validated server boundaries

Keep these mentally separate.

---

# 8. Current Feature Scope (Grounded)

You are currently building:

- Authentication
- Profile setup
- Baseline measurements (`weight`, `waist` time-series)
- Journal entries
- Life domain scoring
- Workout logging
- Manual workout/program templates
- Dashboard trends

That is Phase 1.

MVP+ follow-on after the manual workout foundation:

- AI Workout Import (Slice 3.1; not a beta-launch dependency)

---

# 9. What Is NOT Being Built Right Now

- RAG
- Vector databases
- Predictive modeling
- Wearable integrations
- Progress photos (front/side/back visual tracking — deferred after Slice 1.5)
- Scanned/image workout import and fully automated AI workout saving
- Hardcore body measurements (chest, arms, legs, etc.)
- Group challenges
- Stripe subscriptions
- Coaching marketplace
- Push notification engine

Those are future layers.

Not today.

---

# 10. Folder Structure (Recommended)

app/
dashboard/
journal/
workouts/
social/
api/

lib/
supabase/
profile/
workouts/
workout-imports/
ai.ts
analytics.ts

supabase/
migrations/
functions/

components/
charts/
forms/
ui/

Keep provider-specific AI logic behind a server-only adapter. Keep canonical workout persistence independent from AI extraction.

---

# 11. Mental Model Simplified

You are building:

A structured habit + reflection tracker with relational analytics.

Not:
An AI company.
Not:
A mental health platform replacement.
Not:
A fitness wearable competitor.

It is a behavioral tracking SaaS.

---

# 12. Architecture Philosophy

Build stable layers.

1. Database must be correct.
2. Business logic must be predictable.
3. UI must be simple.
4. AI must be optional.

If AI breaks, the product should still function.

That is good architecture.

---

# 13. Scaling Strategy (Future)

When needed:

- Add pgvector for embeddings
- Expand background jobs beyond the Slice 3.1 import worker
- Add caching
- Add rate limiting
- Add Stripe

But only after:
Users exist.

---

# 14. Final Grounding Statement

Right now you are building:

A structured journaling + workout tracking web app
with relational analytics
using:
Next.js + Supabase

That is manageable.
That is clear.
That is shippable.

Everything else is expansion.

---
