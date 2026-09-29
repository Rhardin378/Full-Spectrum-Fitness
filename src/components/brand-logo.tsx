import Link from "next/link";
import { BrandMarkIcon } from "@/components/brand-mark-icon";

type BrandLogoProps = {
  showWordmark?: boolean;
  className?: string;
  /**
   * `navbar` — logged-in mockup: coral mark + coral wordmark.
   * `visitor` — logged-out mockup: ring mark + white wordmark on charcoal header.
   * `default` — light surfaces (e.g. auth card).
   */
  variant?: "navbar" | "visitor" | "default";
  /** Hide wordmark below `md` to save horizontal space (navbar mobile) */
  compactOnMobile?: boolean;
};

export function BrandLogo({
  showWordmark = true,
  className = "",
  variant = "default",
  compactOnMobile = false,
}: BrandLogoProps) {
  const markAppearance = variant === "visitor" ? "ring" : "navbar";

  const wordmarkClassName =
    variant === "navbar"
      ? "text-sm font-semibold text-brand-coral md:text-base"
      : variant === "visitor"
        ? "text-sm font-semibold text-text-on-dark md:text-base"
        : "text-sm font-semibold text-text-on-dark md:text-base";

  const wordmarkVisibility = compactOnMobile ? "hidden md:inline" : "";

  return (
    <Link
      href="/"
      className={`flex min-w-0 items-center gap-2 md:gap-2.5 ${className}`}
    >
      <BrandMarkIcon
        appearance={markAppearance}
        className="h-8 w-8 shrink-0 text-brand-coral md:h-9 md:w-9"
      />
      {showWordmark ? (
        <span className={`${wordmarkClassName} ${wordmarkVisibility} truncate`}>
          Full Spectrum Fitness
        </span>
      ) : null}
    </Link>
  );
}
