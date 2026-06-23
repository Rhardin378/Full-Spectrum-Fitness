"use client";

import Link from "next/link";
import { useProfile } from "@/components/profile/profile-provider";

export default function AppHeader() {
  const { profile, isLoading } = useProfile();

  const displayName = profile?.display_name?.trim() || "Athlete";

  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-slate-900 sm:text-base">
          Full Spectrum Fitness
        </Link>

        <nav className="flex items-center gap-3 text-xs font-medium text-slate-700 sm:gap-4 sm:text-sm">
          <Link href="/dashboard" className="transition hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/profile" className="transition hover:text-slate-900">
            Profile
          </Link>
          <Link href="/about" className="transition hover:text-slate-900">
            About
          </Link>
          <span className="hidden rounded-full bg-slate-900 px-3 py-1 text-xs text-white sm:inline-flex">
            {isLoading ? "Refreshing..." : `Hi, ${displayName}`}
          </span>
        </nav>
      </div>
    </header>
  );
}
