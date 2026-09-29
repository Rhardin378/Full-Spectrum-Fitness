type BrandMarkAppearance = "navbar" | "ring";

type BrandMarkIconProps = {
  className?: string;
  title?: string;
  /**
   * `navbar` — logged-in mockup: head + baseline, no ring.
   * `ring` — logged-out mockup: single ring around the mark.
   */
  appearance?: BrandMarkAppearance;
};

const HEAD_PATH =
  "M 52 56 C 52 48, 46 42, 40 40 C 36 38, 36 35, 37 31 C 39 30, 40 28, 40 26 C 40 24, 38 24, 37 24.5 C 38 20, 36 12, 28 12 C 20 12, 14 17, 14 25 C 14 32, 19 37, 21 41 C 22 43, 22 48, 22 56";

const BRAIN_LOOP_PATH =
  "M 31 18 C 34 18, 36 21, 34 24 C 32 27, 27 26, 26 23 C 25 20, 28 18, 31 18 Z";

const BRAIN_FOLD_PATH = "M 28 26 C 30 29, 28 34, 23 33 C 19 32, 19 27, 22 25";

/** Line-art head + brain — stroke uses `currentColor` (e.g. `text-brand-coral`). */
export function BrandMarkIcon({
  className = "h-9 w-9",
  title,
  appearance = "navbar",
}: BrandMarkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {appearance === "ring" ? <circle cx="32" cy="32" r="29" /> : null}
      {appearance === "navbar" ? (
        <>
          <path d="M6 56 H22" />
          <path d="M52 56 H58" />
        </>
      ) : null}
      <path d={HEAD_PATH} />
      <path d={BRAIN_LOOP_PATH} />
      <path d={BRAIN_FOLD_PATH} />
    </svg>
  );
}
