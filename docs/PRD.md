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
2. Mental Health Journaling Across Life Domains
3. Workout Tracking System
4. Trend Analysis Dashboard
5. Social Accountability Feed (Privacy-First)
6. Basic AI Coaching Prompt Engine
7. Achievement System & Badges

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
- Sets / reps / weight
- RPE tracking
- Workout categorization
- PR detection
- Workout templates

---

## Functional Requirements

- Manual workout logging
- Historical workout comparison
- Progress charts
- Suggested progression recommendations

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

### Workouts

workouts

id

user_id

workout_date

workout_type

notes

---

### Exercises

exercises

id

workout_id (FK)

exercise_name

sets

reps

weight

rpe

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
- React Query / TanStack

### Backend

- Supabase (PostgreSQL + Auth + Storage)
- Edge Functions (optional)

### AI Layer

- OpenAI / Vertex AI (MVP)
- Vector storage (Future RAG)

---

---

# 🧭 Product Roadmap

## Phase 1 — MVP

- Authentication
- Journaling
- Workout Tracking
- Dashboard Insights
- Social Feed (basic)
- AI Prompts (Lite)

---

## Phase 2

- Workout templates
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

- Unit tests (Jest)
- End-to-end tests (Playwright)
- AI response evaluation benchmarks
- Security penetration testing

---

# ⚠️ Risks & Constraints

- Sensitive mental health data handling
- AI hallucination risk
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
