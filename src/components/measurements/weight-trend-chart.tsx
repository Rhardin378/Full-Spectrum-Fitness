import type { WeightTrendPoint } from "@/lib/measurements/trend";

type WeightTrendChartProps = {
  points: WeightTrendPoint[];
};

const WIDTH = 320;
const HEIGHT = 120;
const PAD_X = 14;
const PAD_Y = 16;

export function WeightTrendChart({ points }: WeightTrendChartProps) {
  if (points.length === 0) {
    return null;
  }

  const values = points.map((point) => point.value);
  const timestamps = points.map((point) => point.timestamp);
  const minT = Math.min(...timestamps);
  const maxT = Math.max(...timestamps);
  let minV = Math.min(...values);
  let maxV = Math.max(...values);

  if (minV === maxV) {
    minV -= 1;
    maxV += 1;
  }

  const coords = points.map((point) => {
    const xRatio =
      maxT === minT ? 0.5 : (point.timestamp - minT) / (maxT - minT);
    const yRatio = (point.value - minV) / (maxV - minV);
    return {
      x: PAD_X + xRatio * (WIDTH - PAD_X * 2),
      y: PAD_Y + (1 - yRatio) * (HEIGHT - PAD_Y * 2),
    };
  });

  const linePoints =
    coords.length >= 2
      ? coords.map((coord) => `${coord.x},${coord.y}`).join(" ")
      : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mt-4 h-32 w-full text-brand-coral"
      role="img"
      aria-label="Weight trend line chart for the last 30 days"
    >
      {linePoints ? (
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />
      ) : null}
      {coords.map((coord, index) => (
        <circle
          key={points[index].id}
          cx={coord.x}
          cy={coord.y}
          r="4.5"
          fill="currentColor"
          stroke="#ffffff"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
