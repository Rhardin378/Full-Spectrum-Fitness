type BrandMarkIconProps = {
  className?: string;
  title?: string;
};

/**
 * Line-art head + brain mark (left profile).
 * Stroke uses `currentColor` — pair with `text-brand-coral` on dark chrome.
 */
export function BrandMarkIcon({ className = "h-9 w-9", title }: BrandMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Neck base + left-facing profile */}
      <path
        d="M 9 53.5 H 20.5 V 44.5
           C 20.5 41.5, 18.5 39, 16.5 38
           C 14.5 35.5, 14 32, 16 29.5
           C 17.5 26.5, 21 22.5, 26.5 20
           C 32 17.5, 39 17.5, 44.5 20.5
           C 49.5 23.5, 52 28.5, 51.5 33.5
           C 51 38, 48 41.5, 44 43.5
           V 53.5 H 55"
      />
      {/* Simplified brain (single lobed shape) */}
      <path
        d="M 29.5 27
           C 26.5 27, 24.5 29.5, 25 32.5
           C 25.5 35.5, 28.5 37.5, 32.5 37.5
           C 37 37.5, 40.5 35, 41 31.5
           C 41.5 28.5, 39 25.5, 35.5 25
           C 33 25, 30.5 25.5, 29.5 27 Z"
      />
    </svg>
  );
}
