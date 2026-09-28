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
      className={`relative shrink-0 whitespace-nowrap py-2 text-sm font-medium transition-colors ${
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
          className="absolute inset-x-0 bottom-0.5 h-0.5 rounded-full bg-brand-coral"
        />
      ) : null}
    </Link>
  );
}

function DomainNav({
  isFitness,
  isMind,
  className = "",
}: {
  isFitness: boolean;
  isMind: boolean;
  className?: string;
}) {
  return (
    <nav aria-label="Main" className={className}>
      <div className="flex items-center gap-5 md:gap-6 lg:gap-7">
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
      </div>
    </nav>
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 md:h-16">
          <BrandLogo variant="on-dark" compactOnMobile className="shrink-0" />

          {isAuthenticated ? (
            <DomainNav
              isFitness={isFitness}
              isMind={isMind}
              className="hidden min-w-0 flex-1 justify-center md:flex"
            />
          ) : (
            <div className="hidden flex-1 md:block" />
          )}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
                  className="inline-flex rounded-full bg-brand-coral px-3 py-2 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep sm:px-4"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        {isAuthenticated ? (
          <DomainNav
            isFitness={isFitness}
            isMind={isMind}
            className="md:hidden overflow-x-auto border-t border-white/10 pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        ) : null}
      </div>
    </header>
  );
}
