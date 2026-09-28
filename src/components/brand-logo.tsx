import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  showWordmark?: boolean;
  className?: string;
  /** Navbar / dark chrome: coral mark + wordmark per theme-preview v2 */
  variant?: "on-dark" | "default";
};

export function BrandLogo({
  showWordmark = true,
  className = "",
  variant = "default",
}: BrandLogoProps) {
  const wordmarkClassName =
    variant === "on-dark"
      ? "text-sm font-semibold text-brand-coral sm:text-base"
      : "text-sm font-semibold text-text-on-dark sm:text-base";

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/brand-mark.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain"
        priority
      />
      {showWordmark ? (
        <span className={wordmarkClassName}>Full Spectrum Fitness</span>
      ) : null}
    </Link>
  );
}
