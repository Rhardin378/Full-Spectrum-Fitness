import Image from "next/image";
import Link from "next/link";

export function FounderTeaser() {
  return (
    <section className="bg-surface-page px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:items-start">
        <Image
          src="/founder.jpg"
          alt="Ryan Hardin, founder of Full Spectrum Fitness"
          width={353}
          height={307}
          className="w-48 shrink-0 rounded-2xl object-cover shadow-md sm:w-56"
        />
        <div className="text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-coral">
            Built at the intersection of science, training, and technology
          </p>
          <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
            Ryan Hardin, NASM-CPT
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-muted sm:text-lg">
            Full Spectrum Fitness was created by Ryan Hardin — a psychology
            graduate from King University who presented research on the positive
            effects exercise has on mental health, a NASM-certified personal
            trainer, and a software engineer. Research-backed, trainer-informed,
            and purpose-built for whole-person wellness.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center text-sm font-semibold text-brand-coral transition hover:text-brand-coral-deep"
          >
            Learn more about the founder →
          </Link>
        </div>
      </div>
    </section>
  );
}
