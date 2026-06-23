import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | Full Spectrum Fitness",
  description:
    "Meet Ryan Hardin — psychology graduate, NASM-certified personal trainer, and software engineer behind Full Spectrum Fitness.",
};

const credentials = [
  {
    title: "Psychology & Research",
    description:
      "B.A. in Psychology from King University. Presented research on the positive effects exercise has on mental health — grounding the platform in evidence, not trends.",
  },
  {
    title: "Certified Personal Trainer",
    description:
      "NASM-certified personal trainer with hands-on experience helping people build sustainable fitness habits and reach their physical goals.",
  },
  {
    title: "Software Engineer",
    description:
      "Professional software engineer who builds the tools that connect fitness tracking and mental wellness into one cohesive experience.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <header
        className="px-6 py-16 text-center text-white sm:px-10 sm:py-20"
        style={{
          background:
            "linear-gradient(90deg, #1e3a5f 0%, #0d9488 55%, #2dd4bf 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-white/80 transition hover:text-white"
          >
            ← Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">About the Founder</h1>
          <p className="mt-4 text-lg text-white/90">
            Why Full Spectrum Fitness exists — and who built it.
          </p>
        </div>
      </header>

      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 md:flex-row md:items-start">
          <Image
            src="/founder.jpg"
            alt="Ryan Hardin, founder of Full Spectrum Fitness"
            width={353}
            height={307}
            className="w-56 shrink-0 rounded-2xl object-cover shadow-md sm:w-64"
            priority
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Ryan Hardin, NASM-CPT
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Fitness and mental health are too often treated as separate
              journeys — but the research tells a different story. After studying
              psychology at King University and presenting research on how
              exercise positively impacts mental health, Ryan saw an opportunity
              to build something that bridges both worlds.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              As a NASM-certified personal trainer and software engineer, Ryan
              brings a rare combination of scientific understanding, real-world
              training experience, and the technical skill to build a platform
              that actually connects how you move with how you feel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Credentials & Expertise
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {credentials.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center sm:px-10 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            The Mission
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Full Spectrum Fitness exists to help people build sustainable
            physical and mental growth habits by revealing the patterns between
            lifestyle behaviors, training, and emotional well-being. It&apos;s
            built by someone who has studied the science, trained in the gym,
            and writes the code — because whole-person wellness deserves a
            whole-person approach.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 sm:text-base"
          >
            Start Your Journey →
          </Link>
        </div>
      </section>
    </main>
  );
}
