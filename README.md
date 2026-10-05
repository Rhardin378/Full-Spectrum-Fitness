# Full Spectrum Fitness

**Full Spectrum Fitness (FSF)** is a longitudinal personal performance and wellbeing product. It helps you understand the relationship between **how you train, how you feel, and how you live**.

**Sources of truth (read these before adding features):**

- [`docs/README.md`](./docs/README.md) — handoff pack index
- [`docs/PRD.md`](./docs/PRD.md) — what the product is and must do
- [`docs/SYSTEM_DESIGN.md`](./docs/SYSTEM_DESIGN.md) — architecture layers
- [`docs/LAUNCH_PLAN.md`](./docs/LAUNCH_PLAN.md) — current slice, Phase 1 vs later
- [`docs/ARCHITECTURE_DECISIONS.md`](./docs/ARCHITECTURE_DECISIONS.md) — locked decisions
- [`docs/DEVELOPMENT_LOG.md`](./docs/DEVELOPMENT_LOG.md) — chronological record (append after sessions)
- [`docs/AI_ENGINEERING_CONTEXT.md`](./docs/AI_ENGINEERING_CONTEXT.md) — bugs/audit notes, not product law

**Current work:** Slice 1 (auth/profile) is done. **Slice 1.5 (measurements)** is in progress. Do not start journaling, workouts, AI, RAG, or social until the launch plan says so.

---

## 🌟 Direction (summary)

The recurring experience is a **Weekly Coach Check-In** that combines a little subjective input with workouts, measurements, and journal data. **Analytics calculate metrics; AI interprets them.** RAG is an evidence layer for the coach, not a chatbot feature.

Phase 1 is capture + deterministic insights + weekly coach v1. Social feed and achievements are **not** Phase 1. Details live in the PRD and launch plan.

---

## 🚀 Product Vision

Help users see how training, body metrics, mood, and life context change together over time — without turning FSF into a therapy app, a generic chatbot, or just another workout logger.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS** (Shadcn UI components)

### Backend

- **Supabase** (PostgreSQL + Auth + Storage)
- SQL migrations in `supabase/migrations` (this repo does **not** use Prisma)
- Server actions / route handlers + Zod validation

### AI Layer

- Provider-neutral server adapter (when Slice 5 / 3.1 start)
- Structured coach output; LLM does not calculate core metrics

---

## 📅 Development Roadmap

Follow [`docs/LAUNCH_PLAN.md`](./docs/LAUNCH_PLAN.md). Short version:

### Phase 1 — Proof of value

- Auth & profiles (done)
- Measurements (current)
- Journaling & life domains
- Workout logging
- Deterministic insights
- Weekly Coach Check-In v1

### After Phase 1

- Evidence RAG, coach tools, PDF import, wins/life events
- Timeline, optional social/achievements
- Wearables and marketplace only with real users

---

## 📊 Success Metrics

See the launch plan. Phase 1 cares about weekly check-ins plus training/measurement capture — not social engagement or paid conversion.

---

## 🧑‍💻 Developer Notes

### Folder Structure

- `src/app/` — Next.js app directory
- `src/components/` — reusable UI
- `src/lib/` — domain modules (profile, measurements; analytics/coach later)
- `supabase/migrations/` — Postgres schema
- `docs/` — handoff pack (PRD, SYSTEM_DESIGN, LAUNCH_PLAN, ARCHITECTURE_DECISIONS, DEVELOPMENT_LOG, AI_ENGINEERING_CONTEXT)

### Key Principles

- **Responsive Design:** Mobile-first, accessible UI.
- **Strict Typing:** TypeScript for type safety.
- **Performance Optimization:** Lazy loading, memoization, and efficient data handling.
- **Privacy-First:** Granular privacy controls for sensitive data.

---

## 🧭 How to Run Locally

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/full-spectrum-fitness.git
   cd full-spectrum-fitness
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add your Supabase credentials and other environment variables.

4. **Run the Development Server:**

   ```bash
   npm run dev
   ```

5. **Access the App:**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description.

---

## 💡 Final Note

Full Spectrum Fitness is designed to grow with its users. Track training, log how you feel, and let weekly coaching interpret the history you already have — not a mountain of extra forms.
