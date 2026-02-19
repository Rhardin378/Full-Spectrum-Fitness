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
- Secure via Row Level Security (optional but recommended)

---

## ORM Layer

- Prisma

Purpose:

- Type-safe database queries
- Relationship modeling
- Migration management
- Server-side data access

Important:
Prisma talks directly to Supabase Postgres.
Supabase still manages auth separately.

---

## AI Layer (Optional for MVP)

- OpenAI API (or equivalent)

Purpose:

- Generate weekly summaries
- Generate reflection prompts
- Summarize journal entries

AI does NOT:

- Store data
- Control logic
- Replace analytics
- Run autonomously

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
Prisma stores data
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

You store the Supabase user ID inside Prisma-managed tables.

---

## Logging a Journal Entry

Frontend form  
↓  
Server action / API route  
↓  
Prisma creates:

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
Prisma creates:

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

Server query via Prisma  
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
Prisma fetches last 7 days of data  
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

# 6. Database Ownership Model

Supabase owns:

- Authentication users
- Raw Postgres instance

Prisma owns:

- Schema modeling
- Migrations
- All relational data logic

This is not two databases.
This is one database with two responsibilities.

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

- Text generation only

Keep these mentally separate.

---

# 8. Current Feature Scope (Grounded)

You are currently building:

- Authentication
- Profile setup
- Journal entries
- Life domain scoring
- Workout logging
- Dashboard trends

That is Phase 1.

Nothing more.

---

# 9. What Is NOT Being Built Right Now

- RAG
- Vector databases
- Predictive modeling
- Wearable integrations
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
prisma.ts
auth.ts
ai.ts
analytics.ts

prisma/
schema.prisma
migrations/

components/
charts/
forms/
ui/

Keep AI logic isolated in /lib/ai.ts

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
- Add background jobs
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
Next.js + Supabase + Prisma

That is manageable.
That is clear.
That is shippable.

Everything else is expansion.

---
