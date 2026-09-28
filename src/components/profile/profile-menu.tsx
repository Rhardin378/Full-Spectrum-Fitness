"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useProfile } from "@/components/profile/profile-provider";
import {
  getProfileInitials,
  getProfileMenuLabel,
} from "@/lib/profile/display-name";
import { createClient } from "@/lib/supabase/client";

type MenuItemProps = {
  children: React.ReactNode;
  disabled?: boolean;
  badge?: string;
  onSelect?: () => void;
  href?: string;
};

function MenuItem({ children, disabled, badge, onSelect, href }: MenuItemProps) {
  const baseClassName =
    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition";

  if (disabled) {
    return (
      <div
        className={`${baseClassName} cursor-not-allowed text-text-muted opacity-60`}
        aria-disabled="true"
      >
        <span>{children}</span>
        {badge ? (
          <span className="rounded-full bg-surface-page px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            {badge}
          </span>
        ) : null}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClassName} text-text-primary hover:bg-surface-page`}
        onClick={onSelect}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${baseClassName} text-text-primary hover:bg-surface-page`}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

export default function ProfileMenu() {
  const menuId = useId();
  const router = useRouter();
  const { profile } = useProfile();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeMenu]);

  if (!profile) {
    return null;
  }

  const label = getProfileMenuLabel(profile.display_name, email);
  const initials = getProfileInitials(profile.display_name, email);

  async function handleSignOut() {
    setSigningOut(true);
    closeMenu();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-menu`}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-text-on-dark-muted transition hover:bg-white/5 hover:text-text-on-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-coral/60"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-text-on-dark ring-2 ring-white/20"
        >
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{label}</span>
        <svg
          aria-hidden
          className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-black/5 bg-surface-card p-1.5 shadow-lg"
        >
          <MenuItem href="/profile" onSelect={closeMenu}>
            Profile
          </MenuItem>
          <MenuItem disabled badge="Soon">
            Achievements
          </MenuItem>
          <MenuItem disabled badge="Soon">
            Settings
          </MenuItem>
          <div className="my-1 border-t border-black/5" role="separator" />
          <MenuItem onSelect={handleSignOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
}
