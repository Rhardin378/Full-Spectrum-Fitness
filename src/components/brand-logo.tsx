import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  showWordmark?: boolean;
  className?: string;
};

export function BrandLogo({ showWordmark = true, className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        priority
      />
      {showWordmark ? (
        <span className="text-sm font-semibold text-text-on-dark sm:text-base">
          Full Spectrum Fitness
        </span>
      ) : null}
    </Link>
  );
}
