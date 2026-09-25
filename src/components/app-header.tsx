"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { useProfile } from "@/components/profile/profile-provider";

function NavLink({
  href,
  children,
  active,
  muted,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  muted?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative pb-0.5 text-sm font-medium transition-colors ${
        active
          ? "text-text-on-dark"
          : muted
            ? "text-text-on-dark-muted/60"
            : "text-text-on-dark-muted hover:text-text-on-dark"
      }`}
      aria-disabled={muted}
    >
      {children}
      {badge ? (
        <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-on-dark-muted">
          {badge}
        </span>
      ) : null}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-brand-coral"
        />
      ) : null}
    </Link>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const isAuthenticated = profile !== null;

  const isFitness =
    pathname.startsWith("/dashboard") || pathname.startsWith("/fitness");
  const isMind = pathname.startsWith("/mind");

  return (
    <header className="bg-surface-header shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo />

        {isAuthenticated ? (
          <nav
            aria-label="Main"
            className="hidden items-center gap-5 md:flex lg:gap-6"
          >
            <NavLink href="/dashboard" active={isFitness && !isMind}>
              Fitness
            </NavLink>
            <NavLink href="/dashboard" muted>
              Mind
            </NavLink>
            <NavLink href="/dashboard" muted>
              Insights
            </NavLink>
            <NavLink href="/dashboard" muted badge="Soon">
              Community
            </NavLink>
          </nav>
        ) : null}

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/profile"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-text-on-dark-muted transition hover:bg-white/5 hover:text-text-on-dark"
            >
              {profile.display_name?.trim() || "Profile"}
            </Link>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden text-sm font-medium text-text-on-dark-muted transition hover:text-text-on-dark sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="inline-flex rounded-full bg-brand-coral px-4 py-2 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
