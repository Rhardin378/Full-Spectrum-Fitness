type MoodSparklineProps = {
  values: Array<number | null>;
  className?: string;
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

/** Line chart for weekly mood; hollow points when the day has no entry. */
export function MoodSparkline({ values, className }: MoodSparklineProps) {
  const width = 280;
  const height = 72;
  const padX = 12;
  const padY = 10;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2 - 14;
  const min = 1;
  const max = 10;

  const points = values.map((value, index) => {
    const x =
      values.length <= 1
        ? padX + chartW / 2
        : padX + (index / (values.length - 1)) * chartW;
    const y =
      value == null
        ? null
        : padY + chartH - ((value - min) / (max - min)) * chartH;
    return { x, y, value, index };
  });

  const linePath = points
    .filter((point) => point.y != null)
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Mood sparkline for the check-in week"
        className="h-20 w-full max-w-sm"
      >
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand-coral-deep"
          />
        ) : null}
        {points.map((point) => {
          if (point.y == null) {
            const hollowY = padY + chartH / 2;
            return (
              <circle
                key={point.index}
                cx={point.x}
                cy={hollowY}
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-brand-coral-deep"
              />
            );
          }

          return (
            <circle
              key={point.index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-brand-coral-deep"
            />
          );
        })}
        {DAY_LABELS.map((label, index) => {
          const x =
            values.length <= 1
              ? padX + chartW / 2
              : padX + (index / (DAY_LABELS.length - 1)) * chartW;
          return (
            <text
              key={`${label}-${index}`}
              x={x}
              y={height - 2}
              textAnchor="middle"
              className="fill-text-muted text-[10px]"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <p className="mt-1 text-xs text-text-muted">
        Mood, last 7 days (hollow = no entry)
      </p>
    </div>
  );
}
