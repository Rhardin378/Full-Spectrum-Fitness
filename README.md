# Full Spectrum Fitness

**Full Spectrum Fitness** is a behavior-driven wellness platform that connects mental health journaling with fitness tracking to help users understand how mindset, lifestyle, and training influence overall growth. By combining structured journaling, workout tracking, and trend insights, the platform empowers users to build sustainable habits and achieve holistic personal growth.

---

## 🌟 Key Features

### 1. **Workout Tracking**

- Log exercises, sets, reps, weight, and RPE.
- Track personal records (PRs) and workout history.
- Visualize progress with simple charts.

### 2. **Mental Health Journaling**

- Reflect on your day with structured journal entries.
- Associate reflections with life domains:
  - Emotional, Physical, Social, Environmental, Financial, Occupational, Spiritual.
- Use guided prompts for deeper insights.

### 3. **Trend Insights**

- Discover correlations between workouts, mood, and lifestyle.
- Example insights:
  - "You report better mood after strength training days."
  - "Stress levels spike during skipped workout weeks."

### 4. **Social Accountability (Privacy-First)**

- Share workout milestones, journaling streaks, and weekly summaries.
- Privacy options: Private, Friends Only, Accountability Circles.

### 5. **AI Coaching (Future Phases)**

- Personalized insights and habit recommendations.
- Weekly summaries and reflection prompts.

---

## 🚀 Product Vision

Enable users to build sustainable physical and mental growth habits by revealing patterns between lifestyle behaviors and performance outcomes.

---

## 🛠️ Tech Stack

### Frontend

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS** (Shadcn UI components)

### Backend

- **Supabase** (PostgreSQL + Auth)
- **Prisma** (ORM for type-safe database queries)

### AI Layer (Future)

- **OpenAI API** for generating summaries and insights.

---

## 📅 Development Roadmap

### **Phase 1 — Core MVP**

- Authentication & user profiles.
- Workout logging system.
- Journaling with life domains.
- Rule-based trend insights.
- Social feed (lite).

### **Phase 2 — Smart Coaching**

- AI-powered insights and summaries.
- Advanced journaling intelligence.
- Correlation dashboards.

### **Phase 3 — Ecosystem & Scale**

- Wearable integrations (e.g., Apple Health, Garmin).
- Predictive coaching and habit stack builder.
- Community-driven accountability and coaching.

---

## 📊 Success Metrics

- **Daily Active Users (DAU):** 30%+
- **Weekly Journal Completion:** 40%+
- **Workout Logging Retention (30-day):** 35%+
- **Social Feature Engagement:** 25% of users.

---

## 🧑‍💻 Developer Notes

### Folder Structure

/app/ # Next.js app directory
/components/ # Reusable UI components
/lib/ # Utility functions (e.g., auth, AI, analytics)
/prisma/ # Database schema and migrations
/docs/ # Documentation (PRD, system design, launch plan)

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

Full Spectrum Fitness is designed to grow with its users. Whether you're tracking workouts, reflecting on your mental health, or discovering new insights about yourself, this platform is here to support your journey toward holistic wellness.
