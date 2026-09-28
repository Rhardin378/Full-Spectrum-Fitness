"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import ProfileMenu from "@/components/profile/profile-menu";
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
      className={`relative shrink-0 pb-0.5 text-sm font-medium transition-colors ${
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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <BrandLogo variant="on-dark" className="shrink-0" />

        {isAuthenticated ? (
          <nav
            aria-label="Main"
            className="flex min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:gap-5 lg:gap-6 [&::-webkit-scrollbar]:hidden"
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
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <ProfileMenu />
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
