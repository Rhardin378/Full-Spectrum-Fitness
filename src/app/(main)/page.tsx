import Link from "next/link";
import { FounderTeaser } from "@/components/founder-teaser";

const stats = [
  { value: "NASM-CPT", label: "Certified Trainer" },
  { value: "Research", label: "Exercise & Mental Health" },
  { value: "Psychology", label: "King University" },
  { value: "Free", label: "To Get Started" },
];

const trustBadges = [
  "Free Forever",
  "No Credit Card Required",
  "Get Started in 30 Seconds",
];

const features = [
  {
    title: "Fitness Tracking",
    description:
      "Log workouts, track progress, and achieve your fitness goals with our comprehensive tracking system.",
    bullets: ["Workout log", "Progress analytics", "Personal records"],
  },
  {
    title: "Mental Health Journal",
    description:
      "Track moods, journal thoughts, and nurture your mental wellness with AI-powered insights.",
    bullets: ["Mood tracking", "Daily prompts", "Wellness insights"],
  },
  {
    title: "Wellness Insights",
    description:
      "AI-powered insights to help you understand your patterns and optimize your health journey.",
    bullets: ["Pattern recognition", "Personalized tips", "Progress reports"],
  },
  {
    title: "Progress Analytics",
    description:
      "Visualize your journey with comprehensive charts and metrics that show your improvement.",
    bullets: ["Visual charts", "Goal tracking", "Trend analysis"],
  },
  {
    title: "Community Support",
    description:
      "Connect with others on similar wellness journeys and share your achievements.",
    bullets: ["Community forums", "Shared goals", "Motivation feed"],
  },
  {
    title: "Achievement System",
    description:
      "Celebrate milestones and stay motivated with our comprehensive reward system.",
    bullets: ["Milestone tracking", "Reward system", "Motivation boost"],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-welcome px-6 py-20 text-center text-text-on-dark sm:px-10 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Strength of body and mind.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/95 sm:text-xl">
            The complete platform for fitness tracking and mental wellness.
            Start your transformation today — completely free.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-white/80 sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-surface-card px-6 py-3 text-sm font-semibold text-brand-coral-deep transition hover:bg-white/90 sm:text-base"
            >
              Start Your Fitness Journey →
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/80 px-6 py-3 text-sm font-semibold text-text-on-dark transition hover:bg-white/10 sm:text-base"
            >
              Begin Mental Wellness →
            </Link>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-white/90 sm:flex-row sm:gap-8">
            {trustBadges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2">
                <CheckIcon className="h-4 w-4 shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-page px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Everything You Need for Complete Wellness
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Comprehensive tools designed to support every aspect of your health
            and happiness journey.
          </p>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-black/5 bg-surface-card p-6 text-left shadow-sm"
              >
                <h3 className="text-lg font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {feature.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2 text-sm text-text-primary"
                    >
                      <CheckIcon className="h-4 w-4 shrink-0 text-brand-coral" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FounderTeaser />

      <section className="bg-gradient-welcome px-6 py-20 text-center text-text-on-dark sm:px-10 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Start Your Transformation?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/95 sm:text-lg">
            Built by a trainer, researcher, and engineer who understands both
            sides of wellness. Start your journey today — completely free.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-surface-card px-6 py-3 text-sm font-semibold text-brand-coral-deep transition hover:bg-white/90 sm:text-base"
            >
              Start Fitness Tracking →
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-surface-card px-6 py-3 text-sm font-semibold text-brand-coral-deep transition hover:bg-white/90 sm:text-base"
            >
              Begin Mental Wellness →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
