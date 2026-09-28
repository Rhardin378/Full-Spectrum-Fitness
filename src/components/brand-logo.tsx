import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  showWordmark?: boolean;
  className?: string;
  /** Navbar / dark chrome: coral mark + wordmark per theme-preview v2 */
  variant?: "on-dark" | "default";
  /** Hide wordmark below `md` to save horizontal space (navbar mobile) */
  compactOnMobile?: boolean;
};

export function BrandLogo({
  showWordmark = true,
  className = "",
  variant = "default",
  compactOnMobile = false,
}: BrandLogoProps) {
  const wordmarkClassName =
    variant === "on-dark"
      ? "text-sm font-semibold text-brand-coral md:text-base"
      : "text-sm font-semibold text-text-on-dark md:text-base";

  const wordmarkVisibility = compactOnMobile ? "hidden md:inline" : "";

  return (
    <Link
      href="/"
      className={`flex min-w-0 items-center gap-2 md:gap-2.5 ${className}`}
    >
      <Image
        src="/brand-mark.png"
        alt=""
        width={36}
        height={36}
        className="h-8 w-8 shrink-0 object-contain md:h-9 md:w-9"
        priority
      />
      {showWordmark ? (
        <span className={`${wordmarkClassName} ${wordmarkVisibility} truncate`}>
          Full Spectrum Fitness
        </span>
      ) : null}
    </Link>
  );
}
