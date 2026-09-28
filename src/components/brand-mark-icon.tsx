type BrandMarkIconProps = {
  className?: string;
  title?: string;
};

/**
 * Official FSF line mark (left profile + brain). Three strokes + closed brain;
 * `currentColor` stroke — use `text-brand-coral` on the navbar.
 */
export function BrandMarkIcon({ className = "h-9 w-9", title }: BrandMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Front neck, face, and crown (open at bottom-left) */}
      <path
        d="M 8.5 52.75 H 17.75
           M 17.75 52.75 V 44.5
           C 17.75 41.25, 16 39, 14.25 38
           C 12.75 35.5, 13 32.25, 14.5 29.75
           C 16 27, 18.75 24.25, 22.5 22.25
           C 27 20, 32.5 19, 38 19.75
           C 43 20.5, 47 23, 49 26.5"
      />
      {/* Back of head, neck, and right base (open at bottom-right) */}
      <path
        d="M 49 26.5
           C 51.5 30, 52.25 34.5, 51.25 39
           C 50.25 42.5, 47.5 45, 44.25 46.25
           V 52.75 H 55.5"
      />
      {/* Brain */}
      <path
        d="M 27.5 29.5
           C 25 29.5, 23.25 31.75, 23.5 34.25
           C 23.75 37, 26.25 39, 29.75 39.25
           C 33.75 39.5, 37.25 37.25, 37.75 34
           C 38.25 30.75, 35.75 28, 32.25 27.75
           C 29.75 27.5, 27.5 28.25, 27.5 29.5 Z"
      />
    </svg>
  );
}
