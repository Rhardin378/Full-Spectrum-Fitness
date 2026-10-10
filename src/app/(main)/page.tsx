import Image from "next/image";
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
      <section className="bg-gradient-hero text-center text-text-on-dark">
        <div className="mx-auto max-w-6xl px-6 py-6 sm:px-10 sm:py-10 lg:py-12">
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-10">
            <div className="order-2 w-full lg:order-1 lg:w-[55%] lg:text-left">
              <h1 className="mx-auto w-full max-w-[9.6em] text-3xl font-bold leading-tight sm:text-4xl lg:mx-0 lg:text-5xl">
                Strength of body and mind.
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-white/95 sm:text-xl lg:mt-5">
                The complete platform for fitness tracking and mental wellness.
                Start your transformation today — completely free.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 lg:mt-8 lg:flex-row lg:items-center lg:justify-start">
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

              <div className="mt-5 flex flex-col items-center gap-3 text-sm text-white/90 lg:mt-6 lg:flex-row lg:justify-start lg:gap-6">
                {trustBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 shrink-0" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="order-1 flex w-full justify-center lg:order-2 lg:w-[45%]">
              <div className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-full bg-surface-header shadow-[0_14px_36px_rgba(30,30,30,0.35)] lg:h-[320px] lg:w-[320px]">
                <Image
                  src="/brand/hero-badge.svg"
                  alt="Full Spectrum Fitness — Strength of body and mind"
                  fill
                  unoptimized
                  priority
                  sizes="(min-width: 1024px) 320px, 150px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/15 px-6 py-5 sm:px-10 sm:py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center lg:grid-cols-4 lg:gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-white/80 sm:text-base">
                  {stat.label}
                </p>
              </div>
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
