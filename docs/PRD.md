# Full Spectrum Fitness — Product Requirements Document (PRD)

## 📌 Product Overview

**Full Spectrum Fitness** is a holistic wellness SaaS platform that integrates fitness tracking, structured mental health journaling, and behavioral trend insights into a single user-friendly experience.

The platform helps users understand how their mental state, lifestyle factors, and workouts influence overall growth across multiple life domains.

---

## 🎯 Product Vision

Enable users to build sustainable physical and mental growth habits by revealing patterns between lifestyle behaviors and performance outcomes.

---

## 🌍 Mission Statement

To empower individuals to take control of their mental and physical health through a holistic, AI-assisted platform that fosters self-awareness, growth, and meaningful accountability.

---

## 🧍 Target Users

### Primary Audience

- Millennials and Gen Z (22–40)
- Fitness-minded individuals interested in mental wellness
- Users experiencing burnout, stress, or lifestyle transitions
- Users interested in self-improvement tracking

### Secondary Audience

- Personal trainers
- Mental wellness advocates
- Accountability groups
- Recovery-focused communities

---

## 🚀 MVP Scope (Phase 1)

### Core Features

1. Authentication & User Profiles
2. Baseline Measurements (weight, waist)
3. Mental Health Journaling Across Life Domains
4. Workout Tracking System
5. Trend Analysis Dashboard
6. Social Accountability Feed (Privacy-First)
7. Basic AI Coaching Prompt Engine
8. Achievement System & Badges

### MVP+ Follow-on (not a beta-launch dependency)

- AI Workout Import (Slice 3.1, after manual workout templates)

---

## 📊 Success Metrics (KPIs)

| Metric                             | Target       |
| ---------------------------------- | ------------ |
| Daily Active Users                 | 30%+         |
| Weekly Journal Completion          | 40%+         |
| Workout Logging Retention (30-day) | 35%+         |
| Free → Paid Conversion             | 2–5%         |
| Social Feature Engagement          | 25% of users |

---

## 🧱 Feature Requirements

---

# 1️⃣ Authentication & User Profiles

### Functional Requirements

- Email / OAuth Login
- Profile setup wizard
- User goal tracking
- Privacy settings
- Accountability circle management

### Profile Data Includes

- Fitness goals
- Wellness goals
- Domain priorities
- Experience level
- Social sharing preferences

---

# 1.5️⃣ Baseline Measurements (Slice 1.5)

### Overview

Users log lightweight body metrics as time-series data, separate from profile preferences.

### In Scope

- Weight (`lb` / `kg`)
- Waist (`in` / `cm`)
- Create + list history, owner-scoped
- Simple weight trend/history view

### Explicitly Deferred

- Progress photos (optional front / side / back for visual tracking)
- Hardcore physique measurements (chest, arms, legs, etc.)
- Body fat percentage / wearable vitals

### Design Notes

- `profiles` = stable identity and preferences
- `measurements` = metric history and trends
- Values stored as entered; no unit conversion in this phase

---

# 2️⃣ Mental Health Journaling System

## Overview

Users log structured reflections across multiple life domains.

---

## Supported Life Domains

- Emotional
- Physical Well-being
- Social / Relationships
- Environmental
- Financial
- Occupational
- Spiritual / Purpose

---

## Functional Requirements

### Journal Entry Creation

- Daily or optional entries
- Domain selection
- Free-text reflection
- Mood scoring (1–10 scale)
- Stress / Energy scoring
- Tagging system

### AI Assisted Prompting

- Context-aware reflection prompts
- Pattern-based journaling nudges
- Weekly reflection summaries

---

## UX Requirements

- Fast entry flow (≤ 60 seconds)
- Optional guided prompts
- Save partial entries
- Historical trend visualization

---

# 3️⃣ Workout Tracking System

## Supported Features

- Exercise logging
- Individual set prescriptions (reps/ranges, load, rest, RPE/RIR, tempo)
- RPE tracking
- Workout categorization
- PR detection
- Reusable single-workout templates
- Program templates with ordered sessions
- Optional exercise groupings (supersets, circuits, giant sets)

---

## Functional Requirements

- Manual workout logging
- Manual workout/program template creation and editing
- Historical workout comparison
- Progress charts
- Suggested progression recommendations

---

# 3.1️⃣ AI Workout Import

## Overview

Users can upload an existing text-based workout PDF and use AI to create a structured, editable workout or program-template draft.

AI Workout Import is a follow-on to the manual workout/template foundation. It uses the same canonical data model, validation, editor concepts, and save path as manually created templates.

## Functional Requirements

- Entry point in the dashboard Workouts tab
- Dedicated `/dashboard/workouts/import` flow
- One text-based PDF per import (maximum 10 MB and 30 pages)
- Private temporary upload and server-side text extraction
- Durable queued AI extraction with visible status/failure states
- Single-workout and ordered multi-session program support
- Optional week/day labels
- Set-level reps/ranges, load, rest, RPE/RIR, tempo, and notes
- Editable supersets/circuits/giant-set groupings
- Explicit warnings and `needs_review` flags for ambiguity
- Resumable human review before save
- User-confirmed atomic save as reusable templates
- Duplicate warning, configurable five-new-import rolling 24-hour limit, and one user-initiated extraction retry
- Bounded parsing/provider input (10 MB, 30 pages, 200,000 extracted characters, configurable token ceiling)
- Automatic transient-content deletion on confirm/cancel and seven-day expiry

## AI Safety and Fidelity

- AI must not invent missing workout information.
- Missing or ambiguous values remain `null`.
- Model output is validated against a strict, versioned schema.
- AI output never writes directly to canonical workout tables.
- Numeric confidence percentages are not shown; actionable review flags and source excerpts are used instead.
- The user must confirm the reviewed draft before canonical data is created.

## Privacy and Storage

- PDFs and extracted text are private and owner-scoped.
- The pre-upload notice names the configured provider, states that extracted document content is sent to it, and links to current provider data-use/retention information.
- Only server-extracted, page-delimited text is sent to the AI provider.
- Source PDF, extracted text, editable import draft, excerpts, source-derived warning text, and raw AI response are transient.
- Minimal audit provenance remains after cleanup; source content does not.

## Explicitly Deferred

- Scanned PDF OCR
- Image/screenshot, spreadsheet, DOCX, URL, and email import
- Automatic exercise-library or video matching
- Automatic scheduling or progression generation
- Wearable integration and recommendations
- Saving imports directly as completed workout history
- Fully automated save without human review

## Detailed Specification

See `docs/vertical_slices/slice_3_1_ai_workout_import/`.

---

# 4️⃣ Trend Analysis Dashboard

## Purpose

Surface correlations between mental health, workouts, and life domains.

---

## Example Insights

- Mood improvement after resistance training
- Stress correlation with missed workouts
- Social domain impact on workout consistency

---

## Data Visualizations

- Mood vs Workout frequency
- Domain health radar charts
- Weekly wellness score
- Habit consistency graphs

---

# 5️⃣ Social Accountability Feed

## Core Philosophy

Encourage support and reflection, not performance competition.

---

## Post Types

- Workout milestones
- Journal insights
- Weekly wellness summaries
- AI coaching reflections

---

## Privacy Controls

- Private
- Friends only
- Accountability Circle
- Public (optional)

---

# 6️⃣ AI Coaching Prompt Engine (MVP Lite)

## Capabilities

- Weekly summaries
- Reflection prompts
- Pattern flagging
- Motivational nudges

---

## Example Output

"You tend to report lower anxiety on days following strength workouts."

---

# 7️⃣ Achievement System & Badges

## Purpose

Gameify user engagement through milestone recognition and progress celebration.

---

## Achievement Categories

### Workout Achievements

- **First Steps**: Log your first workout
- **Strength Seeker**: Log your first strength workout
- **Cardio Crusader**: Log your first cardio workout
- **Consistency King**: 4 workouts in a row
- **Weekly Warrior**: Complete 5 workouts in one week
- **PR Crusher**: Set your first personal record
- **Century Club**: Log 100 total workouts

### Journal Achievements

- **Reflection Rookie**: Complete your first journal entry
- **Domain Explorer**: Log entries across all 7 life domains
- **Streak Starter**: 3 consecutive days of journaling
- **Mindful Month**: Journal for 30 days
- **Insight Seeker**: Complete 100 total journal entries

### Trend Achievements

- **Pattern Spotter**: View your first trend insight
- **Data Detective**: Check dashboard 7 days in a row
- **Growth Tracker**: Compare month-over-month progress

### Social Achievements

- **Community Member**: Join your first accountability circle
- **Supporter**: Give encouragement to 10 posts
- **Inspiration**: Receive 25 reactions on your posts

---

## Badge System

### Visual Design

- Clean, minimal badge icons
- Progress indicators for multi-level achievements
- Earned vs. locked state visualization

### Badge Metadata

- Achievement name and description
- Unlock date/time
- Rarity indicator (Common, Uncommon, Rare)
- Progress toward next level

---

## Functional Requirements

### Achievement Tracking

- Automatic achievement detection
- Real-time progress updates
- Achievement unlock notifications
- Badge collection view in profile

### Social Integration

- Optional achievement sharing to feed
- Achievement-based profile showcases
- Friend achievement visibility

---

# 🗄️ Database Design (Supabase SQL)

---

## Core Tables

### Users

users

id (uuid)

email

created_at

onboarding_complete

---

### Profiles

profiles

id

user_id (FK)

display_name

fitness_goal

wellness_goal

sharing_preferences

---

### Measurements

measurements

id

user_id (FK)

measurement_type (`weight` | `waist`)

value

unit (`lb`/`kg` for weight; `in`/`cm` for waist)

measured_at

notes (optional)

created_at

updated_at

---

### Life Domains

life_domains

id

name

description

---

### Journal Entries

journal_entries

id

user_id (FK)

entry_date

mood_score

stress_score

energy_score

reflection_text

created_at

---

### Journal Domain Scores

journal_domain_scores

id

journal_entry_id (FK)

domain_id (FK)

score

---

### Workout Templates and Programs

Canonical logical hierarchy (physical table names finalized in Slice 3):

```text
ProgramTemplate
  id
  user_id
  name

  SessionTemplate[]
    id
    position
    name
    week_label (optional)
    day_label (optional)

    ExerciseGroup[] (optional)
      id
      type
      label

    ExerciseTemplate[]
      id
      position
      exercise_name
      group_id (optional)
      notes (optional)

      SetPrescription[]
        id
        position
        reps_min / reps_max / reps_text (optional)
        load_value / load_unit / load_text (optional)
        rest_seconds (optional)
        rpe / rir (optional)
        tempo (optional)
        notes (optional)
```

Completed workout logs/instances remain separate from reusable prescriptions so imported plans are not mistaken for completed history.

---

### AI Workout Imports

`workout_imports`

- `id`
- `user_id`
- `status`
- file hash/size/page count
- provider/model/schema version
- editable structured draft + version
- warnings/retry count
- immutable `expires_at`
- created template IDs
- lifecycle timestamps

Internal object paths and raw provider data live in a non-exposed server-only artifact record. PDFs, extracted text, editable drafts, source excerpts, source-derived warning text, and raw model output are transient and are removed on confirmation, cancellation, or immutable seven-day expiry.

---

### Social Posts

posts

id

user_id

post_type

content

privacy_level

created_at

---

### Accountability Circles

circles

id

name

owner_id

---

### Circle Membership

circle_members

id

circle_id

user_id

---

### Achievements

achievements

id

name

description

category

rarity

criteria_type

criteria_value

badge_icon

---

### User Achievements

user_achievements

id

user_id (FK)

achievement_id (FK)

unlocked_at

progress_value

---

---

# 🔐 Security Requirements

- Supabase Row Level Security (RLS)
- End-to-end encryption for journal data
- GDPR compliant data export/delete
- Granular privacy post controls

---

# 📱 Platform Requirements

- Mobile-first responsive web app
- Progressive onboarding
- Offline draft journaling (future)

---

# ⚙️ Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind

### Backend

- Supabase (PostgreSQL + Auth + Storage)
- Supabase Edge Functions (required for the Slice 3.1 asynchronous import worker)

### AI Layer

- Provider-neutral server adapter with OpenAI as the initial configured provider
- Vector storage (Future RAG)

---

---

# 🧭 Product Roadmap

## Phase 1 — MVP

- Authentication
- Journaling
- Workout tracking and reusable templates
- Dashboard Insights
- Social Feed (basic)
- AI Prompts (Lite)

---

## MVP+ Follow-on

- AI Workout Import (Slice 3.1, after manual workout templates)

---

## Phase 2

- Advanced AI trend insights
- Group challenges
- Notification engine

---

## Phase 3

- Wearable integrations
- Coaching marketplace
- Gamification layer

---

---

# 🧠 ADDENDUM — RAG Implementation (Optional / Time Permitting)

---

## Purpose

Enhance AI coaching with personalized, context-aware insights using historical user data.

---

## RAG Goals

- Provide deeper behavioral coaching
- Enable longitudinal pattern recognition
- Deliver hyper-personalized reflection prompts

---

## RAG Architecture

### Step 1: Data Preparation

- Extract journal entries
- Extract workout summaries
- Convert to embeddings

---

### Step 2: Vector Storage

Potential options:

- Supabase pgvector
- Pinecone
- Vertex AI Matching Engine

---

### Step 3: Retrieval Pipeline

User Query / Scheduled Coaching Trigger
↓
Similarity Search
↓
Relevant Past Entries Retrieved
↓
Prompt Construction
↓
LLM Coaching Response

---

## Example Use Case

User writes:

> "I've felt burned out lately."

RAG retrieves:

- Past burnout entries
- Workout gaps
- Sleep or stress patterns

AI Response:

> "Over the last 6 weeks, burnout reports increased during reduced resistance training periods..."

---

## RAG MVP Scope

- Weekly coaching summary
- Insight generation
- Reflection prompt enrichment

---

## RAG Future Expansion

- Predictive burnout detection
- Adaptive training suggestions
- Goal planning assistance

---

---

# 🧪 Testing Requirements

- Unit and component tests (Vitest)
- End-to-end tests (Playwright)
- AI response evaluation benchmarks
- Security penetration testing

---

# ⚠️ Risks & Constraints

- Sensitive mental health data handling
- AI hallucination risk
- AI workout extraction may omit or misread prescriptions; imports require explicit human review
- Uploaded workout documents require private storage, short retention, and owner-scoped access
- Provider cost, latency, rate limits, and availability must not affect manual workout creation
- Solo developer resource limits
- Social moderation complexity

---

---

# ✅ Definition of Done (MVP)

- Users can:
  - Register
  - Log journal entries
  - Track workouts
  - View wellness trends
  - Share posts privately
  - Receive AI prompts
  - Unlock and view achievements
  - Collect badges for milestones

---
