"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";

type MobileNavMenuProps = {
  isFitness: boolean;
  isMind: boolean;
};

type MobileNavItemProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  muted?: boolean;
  badge?: string;
  onNavigate: () => void;
};

function MobileNavItem({
  href,
  children,
  active,
  muted,
  badge,
  onNavigate,
}: MobileNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition ${
        active
          ? "bg-brand-coral/15 text-brand-coral ring-1 ring-brand-coral/40"
          : muted
            ? "text-text-on-dark-muted/60"
            : "text-text-on-dark hover:bg-white/5"
      }`}
      aria-disabled={muted}
    >
      <span>{children}</span>
      {badge ? (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-on-dark-muted">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <span
        className={`absolute left-0 block h-0.5 w-5 rounded-full bg-text-on-dark transition ${
          open ? "top-2 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-2 block h-0.5 w-5 rounded-full bg-text-on-dark transition ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-5 rounded-full bg-text-on-dark transition ${
          open ? "top-2 -rotate-45" : "top-4"
        }`}
      />
    </span>
  );
}

export default function MobileNavMenu({
  isFitness,
  isMind,
}: MobileNavMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeMenu]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-controls={`${menuId}-panel`}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-on-dark transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-coral/60"
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon open={open} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden"
            onClick={closeMenu}
          />
          <nav
            id={`${menuId}-panel`}
            aria-labelledby={`${menuId}-trigger`}
            className="fixed inset-x-0 top-14 z-50 border-b border-white/10 bg-surface-header px-4 py-4 shadow-lg md:hidden"
          >
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-text-on-dark-muted">
              Navigate
            </p>
            <div className="flex flex-col gap-2">
              <MobileNavItem
                href="/dashboard"
                active={isFitness && !isMind}
                onNavigate={closeMenu}
              >
                Fitness
              </MobileNavItem>
              <MobileNavItem
                href="/dashboard"
                muted
                onNavigate={closeMenu}
              >
                Mind
              </MobileNavItem>
              <MobileNavItem
                href="/dashboard"
                muted
                onNavigate={closeMenu}
              >
                Insights
              </MobileNavItem>
              <MobileNavItem
                href="/dashboard"
                muted
                badge="Soon"
                onNavigate={closeMenu}
              >
                Community
              </MobileNavItem>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
